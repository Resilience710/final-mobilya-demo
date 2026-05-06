'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

function OnayInner() {
  const params = useSearchParams();
  const status = params.get('status');
  const orderId = params.get('order') || '';
  const reason = params.get('reason') || '';

  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (status === 'success' && !cleared) {
      clearCart();
      setCleared(true);
    }
  }, [status, cleared, clearCart]);

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream pt-24 pb-20 px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-card p-10 border border-stone/30">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-5" />
            <h2 className="font-serif text-2xl text-charcoal mb-3">Ödeme Başarılı!</h2>
            <p className="text-brown/70 text-sm mb-2">Sipariş numaranız:</p>
            <p className="text-charcoal font-mono text-sm bg-cream rounded-lg px-4 py-2 mb-6 break-all">
              {orderId}
            </p>
            <p className="text-brown/60 text-sm mb-8">
              Siparişiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/hesabim/siparislerim" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-charcoal text-white rounded-xl hover:bg-gold transition-colors text-sm">
                Siparişlerim
              </Link>
              <Link href="/urunler" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone/40 text-charcoal rounded-xl hover:border-gold transition-colors text-sm">
                Alışverişe Devam
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    const reasonText: Record<string, string> = {
      'amount-mismatch': 'Sipariş tutarı doğrulanamadı.',
      'token-mismatch': 'Güvenlik doğrulaması başarısız.',
      'payment-not-success': 'Ödeme tamamlanamadı.',
      'verify-failed': 'iyzico doğrulaması başarısız.',
      'order-not-found': 'Sipariş bulunamadı.',
      'iyzico-not-configured': 'Ödeme sistemi şu an aktif değil.',
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-cream pt-24 pb-20 px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-card p-10 border border-stone/30">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-5" />
            <h2 className="font-serif text-2xl text-charcoal mb-3">Ödeme Başarısız</h2>
            <p className="text-brown/70 text-sm mb-6">
              {reasonText[reason] || 'Ödeme tamamlanamadı. Lütfen tekrar deneyin.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/sepet" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-charcoal text-white rounded-xl hover:bg-gold transition-colors text-sm">
                Sepete Dön
              </Link>
              <Link href="/" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone/40 text-charcoal rounded-xl hover:border-gold transition-colors text-sm">
                Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream pt-24 pb-20 px-4">
      <Loader2 className="w-8 h-8 animate-spin text-gold" />
    </div>
  );
}

export default function OnayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    }>
      <OnayInner />
    </Suspense>
  );
}
