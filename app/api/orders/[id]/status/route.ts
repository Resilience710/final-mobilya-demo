import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPaymentResultProof } from '@/lib/payment-result-proof';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id?.trim();
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
    return NextResponse.json({ error: 'Geçersiz sipariş.' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, user_id, payment_status, payment_method, payment_data')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 });
  }

  if (order.user_id !== user.id) {
    return NextResponse.json({ error: 'Yetkisiz işlem.' }, { status: 403 });
  }

  const reason =
    typeof order.payment_data?.error === 'string'
      ? order.payment_data.error
      : typeof order.payment_data?.failed_reason_code === 'string'
        ? order.payment_data.failed_reason_code
        : null;

  const provider =
    typeof order.payment_method === 'string' && order.payment_method.length > 0
      ? order.payment_method
      : typeof order.payment_data?.provider === 'string'
        ? order.payment_data.provider
        : '';

  return NextResponse.json({
    payment_status: order.payment_status,
    reason,
    success_proof:
      order.payment_status === 'paid' && provider
        ? createPaymentResultProof({ orderId, status: 'success', provider })
        : null,
    provider,
  });
}
