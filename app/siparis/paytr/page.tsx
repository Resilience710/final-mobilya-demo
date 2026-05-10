import Link from 'next/link';
import Script from 'next/script';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPaymentResultProof } from '@/lib/payment-result-proof';
import { buildNoIndexMetadata } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const metadata = buildNoIndexMetadata(
  'PayTR Güvenli Ödeme',
  'Final Mobilya PayTR hosted ödeme ekranı.',
  '/siparis/paytr',
);

export default async function PaytrCheckoutPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const orderId = searchParams.order?.trim() || '';

  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
    redirect('/siparis/onay?status=failed&reason=order-not-found&provider=paytr');
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/giris?redirect=${encodeURIComponent(`/siparis/paytr?order=${orderId}`)}`);
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, payment_status, payment_method, payment_data')
    .eq('id', orderId)
    .single();

  if (!order || order.user_id !== user.id) {
    redirect('/siparis/onay?status=failed&reason=order-not-found&provider=paytr');
  }

  if (order.payment_status === 'paid') {
    const proof = createPaymentResultProof({ orderId: order.id, status: 'success', provider: 'paytr' });
    redirect(`/siparis/onay?status=success&order=${encodeURIComponent(order.id)}&provider=paytr&proof=${encodeURIComponent(proof)}`);
  }

  if (order.payment_status === 'failed') {
    const reason =
      typeof order.payment_data?.error === 'string' ? order.payment_data.error : 'payment-not-success';
    redirect(`/siparis/onay?status=failed&order=${encodeURIComponent(order.id)}&provider=paytr&reason=${encodeURIComponent(reason)}`);
  }

  if (order.payment_method !== 'paytr') {
    redirect('/siparis/onay?status=failed&reason=paytr-not-configured&provider=paytr');
  }

  const iframeToken =
    typeof order.payment_data?.iframeToken === 'string' ? order.payment_data.iframeToken : '';

  if (!iframeToken) {
    redirect(`/siparis/onay?status=failed&order=${encodeURIComponent(order.id)}&provider=paytr&reason=verify-failed`);
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.32em] text-brown/45 mb-3">PayTR Secure Checkout</p>
          <h1 className="font-serif text-display-sm text-charcoal mb-3">Güvenli Ödeme</h1>
          <p className="text-sm text-brown/70 max-w-2xl">
            Kart bilgileriniz PayTR altyapısında işlenir. Ödeme tamamlandıktan sonra sonuç önce sunucu tarafından doğrulanır, ardından sipariş durumuna işlenir.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border border-stone/20 shadow-card overflow-hidden">
          <div className="px-6 py-5 border-b border-stone/15 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal">Sipariş No</p>
              <p className="text-xs text-brown/55 font-mono break-all">{order.id}</p>
            </div>
            <Link
              href="/hesabim/siparislerim"
              className="inline-flex items-center justify-center rounded-full border border-stone/25 px-4 py-2 text-sm text-charcoal hover:border-gold transition-colors"
            >
              Siparişlerime Dön
            </Link>
          </div>

          <div className="p-3 sm:p-4">
            <Script src="https://www.paytr.com/js/iframeResizer.min.js?v2" strategy="afterInteractive" />
            <iframe
              src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
              id="paytriframe"
              frameBorder="0"
              scrolling="no"
              className="w-full min-h-[760px] rounded-[1.5rem] bg-white"
              title="PayTR Ödeme Formu"
            />
            <Script id="paytr-iframe-resize" strategy="afterInteractive">
              {`if (typeof iFrameResize === 'function') { iFrameResize({}, '#paytriframe'); }`}
            </Script>
          </div>
        </div>
      </div>
    </div>
  );
}
