import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { initCheckoutForm, isIyzicoConfigured, moneyStr } from '@/lib/iyzico';

interface OrderRow {
  id: string;
  user_id: string;
  total_price: number;
  subtotal: number;
  shipping_cost: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  shipping_postal_code: string | null;
  payment_status: 'awaiting' | 'pending' | 'paid' | 'failed' | 'refunded';
  status: string;
  currency: string;
}

interface OrderItemRow {
  product_id: string;
  product_name: string;
  total_price: number;
}

export async function POST(req: NextRequest) {
  try {
    if (!isIyzicoConfigured()) {
      return NextResponse.json(
        { error: 'Ödeme sistemi henüz aktif değil. Lütfen daha sonra tekrar deneyin.' },
        { status: 503 }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { limited, retryAfterMs } = rateLimit(`pay-init:${ip}`, 10, 60_000);
    if (limited) {
      return NextResponse.json(
        { error: 'Çok fazla deneme. Lütfen bekleyin.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    let body: { order_id?: string };
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 }); }

    const orderId = body.order_id?.trim();
    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return NextResponse.json({ error: 'Geçersiz sipariş.' }, { status: 400 });
    }

    // RLS: user can only fetch their own order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, user_id, total_price, subtotal, shipping_cost, shipping_name, shipping_address, shipping_city, shipping_phone, shipping_postal_code, payment_status, status, currency')
      .eq('id', orderId)
      .single<OrderRow>();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 });
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Yetkisiz işlem.' }, { status: 403 });
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Bu sipariş zaten ödenmiş.' }, { status: 409 });
    }
    if (!['awaiting', 'pending', 'failed'].includes(order.payment_status)) {
      return NextResponse.json({ error: 'Sipariş bu aşamada ödeme alamaz.' }, { status: 409 });
    }
    if (order.status === 'cancelled' || order.status === 'refunded') {
      return NextResponse.json({ error: 'Sipariş iptal edilmiş.' }, { status: 409 });
    }
    if (order.currency !== 'TRY') {
      return NextResponse.json({ error: 'Bu para birimi desteklenmiyor.' }, { status: 400 });
    }

    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('product_id, product_name, total_price')
      .eq('order_id', order.id);

    if (itemsErr || !items || items.length === 0) {
      return NextResponse.json({ error: 'Sipariş kalemleri yüklenemedi.' }, { status: 500 });
    }

    const basketItems = (items as OrderItemRow[]).map(it => ({
      id: it.product_id,
      name: it.product_name,
      price: Number(it.total_price),
      category: 'Mobilya',
    }));

    if (Number(order.shipping_cost) > 0) {
      basketItems.push({
        id: `shipping-${order.id}`,
        name: 'Kargo',
        price: Number(order.shipping_cost),
        category: 'Hizmet',
      });
    }

    // Sanity: basketSum === totalPrice (sunucu tarafı doğrulama)
    const basketSum = basketItems.reduce((s, it) => s + it.price, 0);
    if (moneyStr(basketSum) !== moneyStr(Number(order.total_price))) {
      console.error('[iyzico/init] basket sum mismatch', { basketSum, total: order.total_price });
      return NextResponse.json({ error: 'Sipariş tutarı doğrulanamadı.' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    if (!baseUrl) {
      return NextResponse.json({ error: 'Sunucu konfigürasyon hatası.' }, { status: 500 });
    }

    const buyerIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip')?.trim() ||
      '';

    const buyerIdentityNumber =
      typeof user.user_metadata?.identity_number === 'string'
        ? user.user_metadata.identity_number
        : null;

    const result = await initCheckoutForm({
      orderId: order.id,
      totalPrice: Number(order.total_price),
      userId: user.id,
      userEmail: user.email || `user-${user.id}@example.com`,
      buyerIdentityNumber,
      buyerIp,
      shipping: {
        name:    order.shipping_name,
        address: order.shipping_address,
        city:    order.shipping_city,
        phone:   order.shipping_phone,
        zip:     order.shipping_postal_code,
      },
      items: basketItems,
      callbackUrl: `${baseUrl}/api/payment/iyzico/callback`,
    });

    if (result.status !== 'success' || !result.paymentPageUrl) {
      console.error('[iyzico/init] failed', result.errorMessage);
      return NextResponse.json({ error: result.errorMessage || 'Ödeme başlatılamadı.' }, { status: 502 });
    }

    // payment_status: awaiting -> pending; token'ı payment_data'ya yaz
    await supabase
      .from('orders')
      .update({
        payment_method: 'iyzico',
        payment_status: 'pending',
        payment_reference: result.token ?? null,
      })
      .eq('id', order.id);

    return NextResponse.json({ paymentPageUrl: result.paymentPageUrl });
  } catch (err) {
    console.error('[POST /api/payment/iyzico/init]', err);
    return NextResponse.json({ error: 'Beklenmeyen bir hata oluştu.' }, { status: 500 });
  }
}
