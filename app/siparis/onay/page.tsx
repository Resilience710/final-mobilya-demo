'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

function OnayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get('status');
  const orderId = params.get('order') || '';
  const reason = params.get('reason') || '';
  const provider = params.get('provider') || '';
  const proof = params.get('proof') || '';

  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('Ödeme sonucu doğrulanıyor...');
  const [successVerified, setSuccessVerified] = useState(false);
  const [successVerificationDone, setSuccessVerificationDone] = useState(false);

  useEffect(() => {
    if (status === 'success' && successVerified && !cleared) {
      clearCart();
      setCleared(true);
    }
  }, [status, successVerified, cleared, clearCart]);

  useEffect(() => {
    if (status !== 'success') {
      setSuccessVerified(false);
      setSuccessVerificationDone(false);
      return;
    }

    if (!orderId || !provider || !proof) {
      setSuccessVerified(false);
      setSuccessVerificationDone(true);
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const qs = new URLSearchParams({
          order: orderId,
          status: 'success',
          provider,
          proof,
        });
        const res = await fetch(`/api/payment/result/verify?${qs.toString()}`, { cache: 'no-store' });
        const data = await res.json().catch(() => ({ valid: false }));

        if (cancelled) return;

        setSuccessVerified(Boolean(res.ok && data.valid));
        setSuccessVerificationDone(true);
      } catch {
        if (!cancelled) {
          setSuccessVerified(false);
          setSuccessVerificationDone(true);
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [orderId, proof, provider, status]);

  useEffect(() => {
    if (status !== 'pending' || !orderId) return;

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          if (attempts >= 10 && !cancelled) {
            setPendingMessage('Ödeme sonucu henüz işlenmedi. Siparişlerim ekranından birkaç saniye sonra tekrar kontrol edebilirsiniz.');
          }
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        if (data.payment_status === 'paid') {
          const proofParam =
            typeof data.success_proof === 'string' ? `&proof=${encodeURIComponent(data.success_proof)}` : '';
          const nextProvider =
            typeof data.provider === 'string' && data.provider.length > 0 ? data.provider : provider;
          router.replace(`/siparis/onay?status=success&order=${encodeURIComponent(orderId)}&provider=${encodeURIComponent(nextProvider)}${proofParam}`);
          return;
        }

        if (data.payment_status === 'failed') {
          router.replace(`/siparis/onay?status=failed&order=${encodeURIComponent(orderId)}&provider=${encodeURIComponent(provider)}&reason=${encodeURIComponent(data.reason || 'payment-not-success')}`);
          return;
        }

        if (attempts >= 10) {
          setPendingMessage('Ödeme sonucu henüz işlenmedi. Siparişlerim ekranından birkaç saniye sonra tekrar kontrol edebilirsiniz.');
        }
      } catch {
        if (!cancelled && attempts >= 10) {
          setPendingMessage('Ödeme sonucu henüz doğrulanamadı. Siparişlerim ekranından kontrol edebilirsiniz.');
        }
      }
    };

    poll();
    const interval = window.setInterval(() => {
      if (attempts < 10) {
        poll();
      }
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [orderId, provider, router, status]);

  if (status === 'success' && !successVerificationDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream pt-24 pb-20 px-4">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (status === 'success' && successVerified) {
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

  if (status === 'success' && !successVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream pt-24 pb-20 px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-card p-10 border border-stone/30">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-5" />
            <h2 className="font-serif text-2xl text-charcoal mb-3">Ödeme Sonucu Doğrulanamadı</h2>
            <p className="text-brown/70 text-sm mb-6">
              Bu başarı sayfası doğrulanamadı. Sipariş durumunu güvenli şekilde görmek için siparişlerim ekranını kontrol edin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/hesabim/siparislerim" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-charcoal text-white rounded-xl hover:bg-gold transition-colors text-sm">
                Siparişlerim
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

  if (status === 'failed') {
    const reasonText: Record<string, string> = {
      'amount-mismatch': 'Sipariş tutarı doğrulanamadı.',
      'token-mismatch': 'Güvenlik doğrulaması başarısız.',
      'payment-not-success': 'Ödeme tamamlanamadı.',
      'verify-failed': 'Ödeme doğrulaması başarısız.',
      'signature-failed': 'Ödeme yanıtı güvenlik doğrulamasını geçemedi.',
      'order-not-found': 'Sipariş bulunamadı.',
      'paytr-user-fail': 'Ödeme PayTR ekranında tamamlanamadı.',
      'paytr-not-configured': 'PayTR ödeme sistemi şu an aktif değil.',
      'paytr-hash-failed': 'PayTR ödeme yanıtı güvenlik kontrolünü geçemedi.',
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

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream pt-24 pb-20 px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-card p-10 border border-stone/30">
            <Loader2 className="w-16 h-16 animate-spin text-gold mx-auto mb-5" />
            <h2 className="font-serif text-2xl text-charcoal mb-3">Ödeme Sonucu Bekleniyor</h2>
            <p className="text-brown/70 text-sm mb-2">Sipariş numaranız:</p>
            <p className="text-charcoal font-mono text-sm bg-cream rounded-lg px-4 py-2 mb-6 break-all">
              {orderId}
            </p>
            <p className="text-brown/60 text-sm mb-8">{pendingMessage}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/hesabim/siparislerim" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-charcoal text-white rounded-xl hover:bg-gold transition-colors text-sm">
                Siparişlerim
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
