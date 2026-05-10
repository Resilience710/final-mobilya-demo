import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  createPaytrIframeToken,
  createPaytrMerchantOid,
  isPaytrConfigured,
  moneyToMinorUnits,
  resolvePaytrBuyerIp,
} from '@/lib/paytr';

interface OrderRow {
  id: string;
  user_id: string;
  total_price: number;
  shipping_cost: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district: string | null;
  shipping_phone: string;
  shipping_postal_code: string | null;
  payment_status: 'awaiting' | 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
  status: string;
  currency: string;
}

interface OrderItemRow {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export async function POST(req: NextRequest) {
  try {
    if (!isPaytrConfigured()) {
      return NextResponse.json(
        { error: 'PayTR ödeme sistemi henüz aktif değil. Lütfen daha sonra tekrar deneyin.' },
        { status: 503 }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { limited, retryAfterMs } = rateLimit(`paytr-init:${ip}`, 10, 60_000);
    if (limited) {
      return NextResponse.json(
        { error: 'Çok fazla deneme. Lütfen bekleyin.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    let body: { order_id?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
    }

    const orderId = body.order_id?.trim();
    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return NextResponse.json({ error: 'Geçersiz sipariş.' }, { status: 400 });
    }

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, user_id, total_price, shipping_cost, shipping_name, shipping_address, shipping_city, shipping_district, shipping_phone, shipping_postal_code, payment_status, payment_method, status, currency')
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

    if (!['awaiting', 'failed'].includes(order.payment_status)) {
      return NextResponse.json({ error: 'Sipariş bu aşamada ödeme alamaz.' }, { status: 409 });
    }
    if (order.payment_status === 'awaiting' && order.payment_method) {
      return NextResponse.json({ error: 'Bu sipariş için ödeme yöntemi zaten seçildi.' }, { status: 409 });
    }

    if (order.status === 'cancelled' || order.status === 'refunded') {
      return NextResponse.json({ error: 'Sipariş iptal edilmiş.' }, { status: 409 });
    }

    if (!['TRY', 'TL'].includes(order.currency)) {
      return NextResponse.json({ error: 'Bu para birimi desteklenmiyor.' }, { status: 400 });
    }

    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('product_name, quantity, unit_price')
      .eq('order_id', order.id);

    if (itemsErr || !items || items.length === 0) {
      return NextResponse.json({ error: 'Sipariş kalemleri yüklenemedi.' }, { status: 500 });
    }

    const basketItems = (items as OrderItemRow[]).map((item) => ({
      name: item.product_name,
      unitPrice: Number(item.unit_price),
      quantity: Number(item.quantity),
    }));

    if (Number(order.shipping_cost) > 0) {
      basketItems.push({
        name: 'Kargo',
        unitPrice: Number(order.shipping_cost),
        quantity: 1,
      });
    }

    const expectedAmount = moneyToMinorUnits(Number(order.total_price));
    const basketTotal = basketItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    if (moneyToMinorUnits(basketTotal) !== expectedAmount) {
      console.error('[paytr/init] basket sum mismatch', { basketTotal, total: order.total_price });
      return NextResponse.json({ error: 'Sipariş tutarı doğrulanamadı.' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    if (!baseUrl) {
      return NextResponse.json({ error: 'Sunucu konfigürasyon hatası.' }, { status: 500 });
    }

    if (process.env.NODE_ENV === 'production' && !baseUrl.startsWith('https://')) {
      return NextResponse.json({ error: 'PayTR dönüş adresi HTTPS olmalıdır.' }, { status: 500 });
    }

    const buyerIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip')?.trim() ||
      '';

    const merchantOid = createPaytrMerchantOid(order.id);
    const result = await createPaytrIframeToken({
      merchantOid,
      userIp: resolvePaytrBuyerIp(buyerIp),
      email: user.email || `user-${user.id}@example.com`,
      paymentAmount: Number(order.total_price),
      userName: order.shipping_name,
      userAddress: [
        order.shipping_address,
        order.shipping_district,
        order.shipping_city,
        order.shipping_postal_code,
      ]
        .filter(Boolean)
        .join(', '),
      userPhone: order.shipping_phone,
      userBasket: basketItems,
      merchantOkUrl: `${baseUrl}/siparis/onay?status=pending&provider=paytr&order=${encodeURIComponent(order.id)}`,
      merchantFailUrl: `${baseUrl}/siparis/onay?status=failed&provider=paytr&reason=paytr-user-fail&order=${encodeURIComponent(order.id)}`,
    });

    if (result.status !== 'success' || !result.token) {
      console.error('[paytr/init] failed', result.reason);
      return NextResponse.json({ error: result.reason || 'Ödeme başlatılamadı.' }, { status: 502 });
    }

    await supabase
      .from('orders')
      .update({
        payment_method: 'paytr',
        payment_status: 'pending',
        payment_reference: merchantOid,
        payment_data: {
          provider: 'paytr',
          iframeToken: result.token,
          initializedAt: new Date().toISOString(),
        },
      })
      .eq('id', order.id);

    return NextResponse.json({ paymentPageUrl: `${baseUrl}/siparis/paytr?order=${encodeURIComponent(order.id)}` });
  } catch (error) {
    console.error('[POST /api/payment/paytr/init]', error);
    return NextResponse.json({ error: 'Beklenmeyen bir hata oluştu.' }, { status: 500 });
  }
}
