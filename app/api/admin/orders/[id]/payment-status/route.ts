import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';

interface OrderRow {
  id: string;
  status: string;
  payment_status: 'awaiting' | 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
  payment_data: Record<string, any> | null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id?.trim();
    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return NextResponse.json({ error: 'Geçersiz sipariş.' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { limited, retryAfterMs } = rateLimit(`admin-pay-status:${ip}`, 20, 60_000);
    if (limited) {
      return NextResponse.json(
        { error: 'Çok fazla deneme. Lütfen bekleyin.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const authSupabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await authSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin yetkisi gerekli.' }, { status: 403 });
    }

    let body: { payment_status?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
    }

    const nextPaymentStatus = body.payment_status;
    if (nextPaymentStatus !== 'paid' && nextPaymentStatus !== 'failed') {
      return NextResponse.json({ error: 'Geçersiz ödeme durumu.' }, { status: 400 });
    }

    const serviceSupabase = createServiceSupabaseClient();
    const { data: order, error: orderError } = await serviceSupabase
      .from('orders')
      .select('id, status, payment_status, payment_method, payment_data')
      .eq('id', orderId)
      .single<OrderRow>();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 });
    }

    if (order.payment_status === 'refunded') {
      return NextResponse.json({ error: 'İade edilmiş siparişin ödeme durumu değiştirilemez.' }, { status: 409 });
    }

    if (nextPaymentStatus === 'paid' && ['cancelled', 'refunded'].includes(order.status)) {
      return NextResponse.json({ error: 'İptal veya iade edilmiş sipariş ödenmiş olarak işaretlenemez.' }, { status: 409 });
    }

    if (order.payment_status === nextPaymentStatus) {
      return NextResponse.json({
        success: true,
        payment_status: order.payment_status,
        status: order.status,
      });
    }

    const reviewedAt = new Date().toISOString();
    const paymentData: Record<string, any> = {
      ...(order.payment_data || {}),
      manualReviewDecision: nextPaymentStatus === 'paid' ? 'approved' : 'rejected',
      manuallyReviewedAt: reviewedAt,
      manuallyReviewedBy: user.id,
      provider: order.payment_data?.provider || order.payment_method || null,
    };

    const updatePayload: Record<string, any> = {
      payment_status: nextPaymentStatus,
      payment_data: paymentData,
    };

    if (nextPaymentStatus === 'paid') {
      paymentData.paidAt = paymentData.paidAt || reviewedAt;
      if (order.status === 'pending') {
        updatePayload.status = 'confirmed';
      }
    } else {
      paymentData.error = paymentData.error || 'manual-review-failed';
    }

    const { data: updatedOrder, error: updateError } = await serviceSupabase
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id)
      .select('id, status, payment_status')
      .single();

    if (updateError || !updatedOrder) {
      console.error('[admin/payment-status] update failed', updateError);
      return NextResponse.json({ error: 'Ödeme durumu güncellenemedi.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      payment_status: updatedOrder.payment_status,
      status: updatedOrder.status,
    });
  } catch (error) {
    console.error('[POST /api/admin/orders/[id]/payment-status]', error);
    return NextResponse.json({ error: 'Beklenmeyen bir hata oluştu.' }, { status: 500 });
  }
}
