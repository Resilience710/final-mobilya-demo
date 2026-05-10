import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBankTransferDetails, isBankTransferConfigured } from '@/lib/bank-transfer';

interface OrderRow {
  id: string;
  user_id: string;
  total_price: number;
  payment_status: 'awaiting' | 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
  status: string;
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isBankTransferConfigured())) {
      return NextResponse.json(
        { error: 'Banka havalesi bilgileri henüz tanımlı değil.' },
        { status: 503 }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { limited, retryAfterMs } = rateLimit(`bank-transfer-init:${ip}`, 10, 60_000);
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
      .select('id, user_id, total_price, payment_status, payment_method, status')
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

    const details = await getBankTransferDetails();
    const paymentReference = `BANK-${order.id.replace(/-/g, '').slice(0, 12).toUpperCase()}`;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';

    await supabase
      .from('orders')
      .update({
        payment_method: 'bank_transfer',
        payment_status: 'awaiting',
        payment_reference: paymentReference,
        payment_data: {
          provider: 'bank_transfer',
          bank_name: details.bankName,
          iban: details.iban,
          account_holder: details.accountHolder,
          initializedAt: new Date().toISOString(),
        },
      })
      .eq('id', order.id);

    return NextResponse.json({
      paymentPageUrl: `${baseUrl}/siparis/havale?order=${encodeURIComponent(order.id)}`,
    });
  } catch (error) {
    console.error('[POST /api/payment/bank-transfer/init]', error);
    return NextResponse.json({ error: 'Beklenmeyen bir hata oluştu.' }, { status: 500 });
  }
}
