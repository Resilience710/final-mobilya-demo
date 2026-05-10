import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { verifyPaymentResultProof } from '@/lib/payment-result-proof';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('order')?.trim() || '';
    const status = req.nextUrl.searchParams.get('status')?.trim() || '';
    const provider = req.nextUrl.searchParams.get('provider')?.trim() || '';
    const proof = req.nextUrl.searchParams.get('proof')?.trim() || '';

    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return NextResponse.json({ valid: false, reason: 'bad-order-id' }, { status: 400 });
    }

    if (status !== 'success' || !provider || !proof) {
      return NextResponse.json({ valid: false, reason: 'missing-proof' }, { status: 400 });
    }

    if (!verifyPaymentResultProof({ orderId, status: 'success', provider, proof })) {
      return NextResponse.json({ valid: false, reason: 'bad-proof' }, { status: 400 });
    }

    const supabase = createServiceSupabaseClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, payment_status, payment_method')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ valid: false, reason: 'order-not-found' }, { status: 404 });
    }

    if (order.payment_status !== 'paid') {
      return NextResponse.json({ valid: false, reason: 'not-paid' }, { status: 409 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('[GET /api/payment/result/verify]', error);
    return NextResponse.json({ valid: false, reason: 'unexpected' }, { status: 500 });
  }
}
