import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, Receipt, ShieldCheck } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBankTransferDetails, isBankTransferConfigured } from '@/lib/bank-transfer';
import { createPaymentResultProof } from '@/lib/payment-result-proof';
import { buildNoIndexMetadata } from '@/lib/site';
import ClearCartOnMount from './ClearCartOnMount';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
  }).format(price);
}

function formatIban(iban: string) {
  return iban.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
}

export const dynamic = 'force-dynamic';
export const metadata = buildNoIndexMetadata(
  'Havale Talimatı',
  'Final Mobilya banka havalesi ve EFT ödeme talimatları.',
  '/siparis/havale',
);

export default async function BankTransferPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const orderId = searchParams.order?.trim() || '';

  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
    redirect('/siparis/onay?status=failed&reason=order-not-found');
  }

  if (!(await isBankTransferConfigured())) {
    redirect('/siparis/onay?status=failed&reason=payment-not-success');
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/giris?redirect=${encodeURIComponent(`/siparis/havale?order=${orderId}`)}`);
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, total_price, payment_status, payment_method, payment_reference, status, created_at')
    .eq('id', orderId)
    .single();

  if (!order || order.user_id !== user.id) {
    redirect('/siparis/onay?status=failed&reason=order-not-found');
  }

  if (order.payment_status === 'paid') {
    const proof = createPaymentResultProof({ orderId: order.id, status: 'success', provider: 'bank_transfer' });
    redirect(`/siparis/onay?status=success&provider=bank_transfer&order=${encodeURIComponent(order.id)}&proof=${encodeURIComponent(proof)}`);
  }

  if (order.payment_method !== 'bank_transfer') {
    redirect('/siparis/onay?status=failed&reason=payment-not-success');
  }

  if (order.payment_status === 'failed' || order.status === 'cancelled' || order.status === 'refunded') {
    redirect(`/siparis/onay?status=failed&order=${encodeURIComponent(order.id)}&reason=payment-not-success`);
  }

  const details = await getBankTransferDetails();

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <ClearCartOnMount />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-brown/45 mb-3">Banka Havalesi / EFT</p>
          <h1 className="font-serif text-display-sm text-charcoal mb-3">Ödeme Talimatı</h1>
          <p className="text-sm text-brown/70 max-w-2xl">
            Siparişiniz oluşturuldu. Aşağıdaki hesaba havale/EFT yaptıktan sonra admin onayıyla siparişiniz işleme alınır.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-white rounded-[2rem] border border-stone/20 shadow-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-brown/45">Hesap Bilgileri</p>
                <p className="font-serif text-2xl text-charcoal">{details.bankName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-stone/20 bg-cream/50 p-4">
                <p className="text-xs text-brown/45 mb-1">Hesap Sahibi</p>
                <p className="text-charcoal font-medium">{details.accountHolder}</p>
              </div>
              <div className="rounded-2xl border border-stone/20 bg-cream/50 p-4">
                <p className="text-xs text-brown/45 mb-1">IBAN</p>
                <p className="text-charcoal font-mono text-lg break-all">{formatIban(details.iban)}</p>
              </div>
              {details.branch && (
                <div className="rounded-2xl border border-stone/20 bg-cream/50 p-4">
                  <p className="text-xs text-brown/45 mb-1">Şube</p>
                  <p className="text-charcoal">{details.branch}</p>
                </div>
              )}
              {details.accountNumber && (
                <div className="rounded-2xl border border-stone/20 bg-cream/50 p-4">
                  <p className="text-xs text-brown/45 mb-1">Hesap No</p>
                  <p className="text-charcoal font-mono">{details.accountNumber}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-stone/20 shadow-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Receipt className="w-5 h-5 text-gold" />
                <p className="font-medium text-charcoal">Sipariş Özeti</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-brown/55">Sipariş No</span>
                  <span className="font-mono text-charcoal text-right break-all">{order.id}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-brown/55">Ödeme Referansı</span>
                  <span className="font-mono text-charcoal">{order.payment_reference}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-brown/55">Tutar</span>
                  <span className="font-serif text-xl text-charcoal">{formatPrice(order.total_price)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-brown/55">Durum</span>
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                    Ödeme Bekleniyor
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-charcoal rounded-[2rem] text-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-gold" />
                <p className="font-medium">Önemli Not</p>
              </div>
              <p className="text-sm text-white/80 leading-7">{details.note}</p>
              <p className="text-sm text-white/80 leading-7 mt-3">
                Açıklama alanında sipariş numaranızı veya ödeme referansınızı kullanmanız eşleştirmeyi hızlandırır.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/hesabim/siparislerim"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-medium text-white hover:bg-gold transition-colors"
              >
                Siparişlerim
              </Link>
              <Link
                href="/urunler"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-stone/30 bg-white px-5 py-3 text-sm font-medium text-charcoal hover:border-gold transition-colors"
              >
                Alışverişe Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
