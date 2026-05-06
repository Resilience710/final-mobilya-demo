import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { retrieveCheckoutForm, isIyzicoConfigured, moneyStr } from '@/lib/iyzico';

/**
 * iyzico checkout form callback.
 *
 * iyzico does an application/x-www-form-urlencoded POST here with `token`.
 * We retrieve the result from iyzico server-to-server, verify it matches
 * the order in our DB, and update payment_status idempotently.
 *
 * Never trust query/body fields except `token` — we re-fetch from iyzico.
 */

const FAIL = (reason: string) => {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  return NextResponse.redirect(`${base}/siparis/onay?status=failed&reason=${encodeURIComponent(reason)}`, 303);
};

const SUCCESS = (orderId: string) => {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  return NextResponse.redirect(`${base}/siparis/onay?status=success&order=${encodeURIComponent(orderId)}`, 303);
};

async function handle(req: NextRequest) {
  if (!isIyzicoConfigured()) return FAIL('iyzico-not-configured');

  let token: string | null = null;
  const ct = req.headers.get('content-type') || '';

  try {
    if (ct.includes('application/json')) {
      const j = await req.json();
      token = typeof j.token === 'string' ? j.token : null;
    } else {
      const form = await req.formData();
      const t = form.get('token');
      token = typeof t === 'string' ? t : null;
    }
  } catch {
    return FAIL('bad-payload');
  }

  // GET fallback (some browsers may follow redirect as GET — iyzico uses POST normally)
  if (!token) {
    token = req.nextUrl.searchParams.get('token');
  }

  if (!token || token.length < 10 || token.length > 200) {
    return FAIL('missing-token');
  }

  const result = await retrieveCheckoutForm(token);
  if (result.status !== 'success' || !result.conversationId) {
    return FAIL('verify-failed');
  }

  const orderId = result.conversationId;
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
    return FAIL('bad-order-id');
  }

  const supabase = createServiceSupabaseClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, user_id, total_price, payment_status, payment_reference')
    .eq('id', orderId)
    .single();

  if (error || !order) return FAIL('order-not-found');

  // Idempotency: zaten ödenmişse yine başarıyla yönlendir
  if (order.payment_status === 'paid') return SUCCESS(orderId);

  // Tutar doğrulama (tampering koruması)
  if (moneyStr(Number(result.paidPrice ?? 0)) !== moneyStr(Number(order.total_price))) {
    console.error('[iyzico/callback] amount mismatch', {
      orderId, expected: order.total_price, got: result.paidPrice,
    });
    await supabase.from('orders').update({
      payment_status: 'failed',
      payment_data: { error: 'amount-mismatch', expected: order.total_price, got: result.paidPrice },
    }).eq('id', orderId);
    return FAIL('amount-mismatch');
  }

  // Token, init sırasında kaydedilen token ile eşleşmeli
  if (order.payment_reference && order.payment_reference !== token) {
    console.error('[iyzico/callback] token mismatch', { orderId });
    return FAIL('token-mismatch');
  }

  if (result.paymentStatus !== 'SUCCESS') {
    await supabase.from('orders').update({
      payment_status: 'failed',
      payment_data: {
        paymentStatus: result.paymentStatus,
        errorMessage: result.errorMessage ?? null,
      },
    }).eq('id', orderId);
    return FAIL('payment-not-success');
  }

  // Tüm doğrulamalar geçti → 'paid' olarak işaretle
  const { error: updateErr } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
      payment_data: {
        paymentId:       result.paymentId ?? null,
        binNumber:       result.binNumber ?? null,
        lastFourDigits:  result.lastFourDigits ?? null,
        installment:     result.installment ?? 1,
        cardType:        result.cardType ?? null,
        cardAssociation: result.cardAssociation ?? null,
        paidAt:          new Date().toISOString(),
      },
    })
    .eq('id', orderId)
    .eq('payment_status', 'pending'); // race condition koruması

  if (updateErr) {
    console.error('[iyzico/callback] update failed', updateErr);
    return FAIL('db-update-failed');
  }

  return SUCCESS(orderId);
}

export const POST = handle;
export const GET  = handle;
