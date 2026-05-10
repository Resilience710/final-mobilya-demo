'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, Shield, Lock, ChevronRight, Truck, MapPin, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/data';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { useLang } from '@/lib/i18n';
import { resolveProductPricing } from '@/lib/campaigns';
import { turkeyProvinces } from '@/lib/turkey-locations';

export default function SepetPage() {
  const { items, removeItem, updateQuantity, subtotal, shippingSelection, setShippingSelection, shippingCost, total } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [city, setCity] = useState(shippingSelection?.city || '');
  const [district, setDistrict] = useState(shippingSelection?.district || '');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');
  const { t } = useLang();
  const provinces = useMemo(() => turkeyProvinces.map((province) => province.name), []);
  const districts = useMemo(
    () => turkeyProvinces.find((province) => province.name === city)?.districts || [],
    [city],
  );

  const finalPrice = total;

  useEffect(() => {
    setCity(shippingSelection?.city || '');
    setDistrict(shippingSelection?.district || '');
  }, [shippingSelection?.city, shippingSelection?.district]);

  useEffect(() => {
    if (!city || !district) {
      setShippingSelection(null);
      return;
    }

    const controller = new AbortController();
    const loadShipping = async () => {
      try {
        setShippingLoading(true);
        setShippingError('');
        const params = new URLSearchParams({ city, district });
        const response = await fetch(`/api/shipping/quote?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Nakliyat hesaplanamadı.');
        }
        setShippingSelection({
          city,
          district,
          price: Number(data.price) || 0,
          note: data.matchedRule?.note || data.note || null,
        });
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        setShippingError(error.message || 'Nakliyat hesaplanamadı.');
      } finally {
        setShippingLoading(false);
      }
    };

    loadShipping();
    return () => controller.abort();
  }, [city, district, setShippingSelection]);

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <AnimatedSection className="text-center max-w-md mx-auto px-5 py-20">
          <div className="w-16 h-16 bg-olive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="heading-1 text-charcoal mb-4">{t.checkout.successTitle}</h1>
          <p className="text-brown text-sm leading-relaxed mb-8">{t.checkout.successDesc}</p>
          <div className="bg-beige p-6 mb-8 text-left space-y-2 text-sm">
            <div className="flex justify-between text-charcoal">
              <span className="font-medium">{t.checkout.orderNo}:</span>
              <span>NOK-{Math.floor(Math.random() * 90000) + 10000}</span>
            </div>
            <div className="flex justify-between text-charcoal">
              <span className="font-medium">{t.checkout.estimatedDelivery}:</span>
              <span>{t.checkout.estimatedDays}</span>
            </div>
          </div>
          <Link href="/" className="btn-primary inline-flex">
            {t.checkout.continueShopping}
          </Link>
        </AnimatedSection>
      </div>
    );
  }

  if (step === 'checkout') {
    return <CheckoutForm total={finalPrice} onSuccess={() => setStep('success')} onBack={() => setStep('cart')} />;
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-px py-10 md:py-16">
        {/* Header */}
        <AnimatedSection className="mb-10">
          <h1 className="heading-1 text-charcoal">{t.cart.title}</h1>
          {items.length > 0 && (
            <p className="text-brown text-sm mt-2">{t.cart.items(items.length)}</p>
          )}
        </AnimatedSection>

        {items.length === 0 ? (
          <AnimatedSection className="text-center py-20">
            <p className="font-serif text-2xl text-charcoal mb-4">{t.cart.empty}</p>
            <p className="text-brown text-sm mb-8">{t.cart.emptyDesc}</p>
            <Link href="/kategori" className="btn-primary inline-flex">
              {t.cart.startShopping}
            </Link>
          </AnimatedSection>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-10">
            {/* Cart items */}
            <div>
              <AnimatedSection className="bg-beige border border-stone p-4 mb-6 flex items-center gap-3">
                <Truck className="w-4 h-4 text-gold flex-shrink-0" />
                <p className="text-xs text-brown">
                  {shippingSelection
                    ? `Nakliyat seçimi: ${shippingSelection.city} / ${shippingSelection.district} ${shippingCost === 0 ? '(Ücretsiz)' : `(${formatPrice(shippingCost)})`}`
                    : 'Siparişe devam etmeden önce nakliyat için il ve ilçe seçin.'}
                </p>
              </AnimatedSection>

              <AnimatedSection className="mb-8 rounded-[24px] border border-stone/30 bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-gold" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-charcoal">Nakliyat Seçimi</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55">İl</span>
                    <select
                      value={city}
                      onChange={(event) => {
                        setCity(event.target.value);
                        setDistrict('');
                        setShippingSelection(null);
                      }}
                      className="w-full rounded-xl border border-stone/30 bg-cream/50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    >
                      <option value="">İl seçin</option>
                      {provinces.map((province) => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55">İlçe</span>
                    <select
                      value={district}
                      onChange={(event) => setDistrict(event.target.value)}
                      disabled={!city}
                      className="w-full rounded-xl border border-stone/30 bg-cream/50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">{city ? 'İlçe seçin' : 'Önce il seçin'}</option>
                      {districts.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="mt-4 rounded-2xl border border-stone/20 bg-cream px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-brown/60">Nakliyat Tutarı</span>
                    <span className="text-lg font-semibold text-charcoal">
                      {shippingLoading ? 'Hesaplanıyor...' : shippingSelection ? (shippingCost === 0 ? 'Ücretsiz' : formatPrice(shippingCost)) : '---'}
                    </span>
                  </div>
                  {shippingError ? (
                    <p className="mt-2 text-sm font-medium text-red-500">{shippingError}</p>
                  ) : null}
                </div>
              </AnimatedSection>

              <ul className="divide-y divide-stone/40">
                {items.map((item) => (
                  <AnimatePresence key={`${item.product.id}-${item.variant?.id || 'default'}`}>
                    <motion.li
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="py-6 flex gap-5"
                    >
                      <Link href={`/urun/${item.product.slug}`} className="relative w-24 h-28 flex-shrink-0 bg-beige overflow-hidden">
                        <Image
                          src={item.product.images?.[0] || '/placeholder.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <Link href={`/urun/${item.product.slug}`}>
                              <p className="font-medium text-charcoal hover:text-gold transition-colors truncate">{item.product.name}</p>
                            </Link>
                            <p className="text-xs text-sand mt-0.5">{item.variant?.name || item.variant?.color || 'Standart'}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.variant?.id || null)}
                            className="text-pebble hover:text-brown transition-colors flex-shrink-0 p-1"
                            aria-label={t.cart.remove}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4 gap-4">
                          <div className="flex items-center border border-stone">
                            <button
                              onClick={() =>
                                item.quantity > 1
                                  ? updateQuantity(item.product.id, item.variant?.id || null, item.quantity - 1)
                                  : removeItem(item.product.id, item.variant?.id || null)
                              }
                              className="w-9 h-9 flex items-center justify-center text-brown hover:text-charcoal transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-9 h-9 flex items-center justify-center text-sm font-medium text-charcoal">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.variant?.id || null, item.quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center text-brown hover:text-charcoal transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-semibold text-charcoal">
                            {formatPrice(
                              (resolveProductPricing(item.product, item.product.active_campaign).finalPrice + (item.variant?.price_modifier ?? 0)) * item.quantity
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  </AnimatePresence>
                ))}
              </ul>
            </div>

            {/* Order Summary */}
            <AnimatedSection direction="right" className="self-start lg:sticky lg:top-24">
              <div className="bg-beige border border-stone p-6">
                <h2 className="font-serif text-lg text-charcoal mb-6">{t.checkout.orderSummary}</h2>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-brown">
                    <span>{t.cart.subtotal}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-brown">
                    <span>{t.cart.shipping}</span>
                    <span className="text-charcoal">
                      {shippingSelection ? (shippingCost === 0 ? 'Ücretsiz' : formatPrice(shippingCost)) : 'Henüz seçilmedi'}
                    </span>
                  </div>
                  {shippingSelection ? (
                    <div className="text-xs text-brown/60">
                      {shippingSelection.city} / {shippingSelection.district}
                    </div>
                  ) : null}
                  <div className="flex justify-between font-semibold text-charcoal text-base pt-3 border-t border-stone">
                    <span>{t.cart.total}</span>
                    <span>{formatPrice(finalPrice)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!shippingSelection) {
                      setShippingError('Siparişe devam etmek için lütfen il ve ilçe seçin.');
                      return;
                    }
                    setStep('checkout');
                  }}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!shippingSelection || shippingLoading}
                >
                  {shippingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>{t.cart.checkout}</span><ChevronRight className="w-4 h-4" /></>}
                </button>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-sand">
                  <Lock className="w-3 h-3" />
                  <span>{t.cart.securePayment}</span>
                </div>

                <div className="mt-4 flex items-center justify-center gap-3 text-xs text-sand">
                  <Shield className="w-3 h-3" />
                  <span>{t.cart.guarantee}</span>
                </div>

              </div>
            </AnimatedSection>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * SECURITY FIX: Removed the previous CheckoutForm that collected credit card
 * numbers client-side and called onSuccess() without any server-side validation.
 * That pattern:
 *   1. Never validated prices server-side (client-side price manipulation)
 *   2. Collected credit card data without PCI DSS compliance
 *   3. Never created a real order record
 *
 * Users are now redirected to /siparis which uses the secure /api/orders
 * endpoint that calculates prices server-side from the database.
 */
function CheckoutForm({ total: _total, onSuccess: _onSuccess, onBack: _onBack }: { total: number; onSuccess: () => void; onBack: () => void }) {
  const { t } = useLang();
  const router = useRouter();

  // Redirect to the secure checkout page that uses server-side pricing
  useEffect(() => {
    router.push('/siparis');
  }, [router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-5 py-20">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-gold" />
        </div>
        <h1 className="heading-1 text-charcoal mb-4">Güvenli Ödeme</h1>
        <p className="text-brown text-sm leading-relaxed mb-8">
          Güvenli sipariş sayfasına yönlendiriliyorsunuz...
        </p>
        <Link href="/siparis" className="btn-primary inline-flex">
          Sipariş Sayfasına Git
        </Link>
      </div>
    </div>
  );
}
