import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import {
  isPaytrConfigured,
  moneyToMinorUnits,
  verifyPaytrCallbackHash,
} from '@/lib/paytr';

function plainText(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(req: NextRequest) {
  if (!isPaytrConfigured()) {
    return plainText('PAYTR_NOT_CONFIGURED', 503);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return plainText('BAD_PAYLOAD', 400);
  }

  const merchantOid = String(form.get('merchant_oid') || '').trim();
  const status = String(form.get('status') || '').trim();
  const totalAmount = String(form.get('total_amount') || '').trim();
  const paymentAmount = String(form.get('payment_amount') || '').trim();
  const hash = String(form.get('hash') || '').trim();
  const paymentType = String(form.get('payment_type') || '').trim();
  const currency = String(form.get('currency') || '').trim();
  const failedReasonCode = String(form.get('failed_reason_code') || '').trim();
  const failedReasonMsg = String(form.get('failed_reason_msg') || '').trim();
  const testMode = String(form.get('test_mode') || '').trim();

  if (!merchantOid || !status || !totalAmount || !hash) {
    return plainText('MISSING_FIELDS', 400);
  }

  if (!verifyPaytrCallbackHash({ merchantOid, status, totalAmount, hash })) {
    console.error('[paytr/callback] hash verification failed', { merchantOid, status });
    return plainText('BAD_HASH', 400);
  }

  const supabase = createServiceSupabaseClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, total_price, payment_status, payment_reference, payment_method')
    .eq('payment_reference', merchantOid)
    .single();

  if (error || !order) {
    console.error('[paytr/callback] order not found', { merchantOid });
    return plainText('ORDER_NOT_FOUND', 404);
  }

  if (order.payment_status === 'paid') {
    return plainText('OK');
  }

  if (order.payment_method && order.payment_method !== 'paytr') {
    console.error('[paytr/callback] provider mismatch', { merchantOid, paymentMethod: order.payment_method });
    return plainText('BAD_PROVIDER', 400);
  }

  if (status !== 'success') {
    await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        payment_data: {
          provider: 'paytr',
          error: failedReasonCode || 'payment-not-success',
          failed_reason_code: failedReasonCode || null,
          failed_reason_msg: failedReasonMsg || null,
          status,
          total_amount: totalAmount,
          payment_type: paymentType || null,
          callbackAt: new Date().toISOString(),
        },
      })
      .eq('id', order.id);

    return plainText('OK');
  }

  if (!paymentAmount) {
    console.error('[paytr/callback] missing payment_amount on success', { merchantOid, totalAmount });
    await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        payment_data: {
          provider: 'paytr',
          error: 'verify-failed',
          total_amount: totalAmount,
          callbackAt: new Date().toISOString(),
        },
      })
      .eq('id', order.id);

    return plainText('OK');
  }

  const expectedPaymentAmount = moneyToMinorUnits(Number(order.total_price));
  if (paymentAmount !== expectedPaymentAmount) {
    console.error('[paytr/callback] amount mismatch', {
      orderId: order.id,
      expected: expectedPaymentAmount,
      got: paymentAmount,
      totalAmount,
    });

    await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        payment_data: {
          provider: 'paytr',
          error: 'amount-mismatch',
          expected_payment_amount: expectedPaymentAmount,
          payment_amount: paymentAmount,
          total_amount: totalAmount,
          callbackAt: new Date().toISOString(),
        },
      })
      .eq('id', order.id);

    return plainText('OK');
  }

  const { error: updateErr } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
      payment_data: {
        provider: 'paytr',
        merchant_oid: merchantOid,
        payment_amount: paymentAmount || expectedPaymentAmount,
        total_amount: totalAmount,
        payment_type: paymentType || null,
        currency: currency || 'TL',
        test_mode: testMode || null,
        paidAt: new Date().toISOString(),
      },
    })
    .eq('id', order.id)
    .eq('payment_status', 'pending');

  if (updateErr) {
    console.error('[paytr/callback] update failed', updateErr);
    return plainText('DB_UPDATE_FAILED', 500);
  }

  return plainText('OK');
}
