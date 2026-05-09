'use client';

import { useMemo, useState } from 'react';
import { MapPin, Truck } from 'lucide-react';
import { ShippingRule } from '@/lib/types';
import { getShippingQuote } from '@/lib/shipping';
import { turkeyProvinces } from '@/lib/turkey-locations';

function formatPrice(price: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function NakliyatClient({ rules }: { rules: ShippingRule[] }) {
  const cities = useMemo(() => turkeyProvinces.map((province) => province.name), []);
  const [city, setCity] = useState('');
  const districts = useMemo(
    () => turkeyProvinces.find((province) => province.name === city)?.districts || [],
    [city],
  );
  const [district, setDistrict] = useState('');

  const quote = useMemo(() => {
    if (!city) return null;
    return getShippingQuote(rules, city, district);
  }, [rules, city, district]);

  return (
    <main className="min-h-screen bg-cream pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.28em] uppercase text-[#1f5aa8]/75 mb-4">
            Final Mobilya
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal leading-tight">
            Nakliyat ücretini il ve ilçe bazında anında görün.
          </h1>
          <p className="mt-5 text-lg text-brown/60 leading-relaxed">
            İstanbul çevresindeki bazı teslimat bölgelerinde nakliyat ücretsiz olabilir. Aşağıdan teslimat yerinizi seçin.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[2rem] border border-stone/25 bg-white p-6 sm:p-8 shadow-card">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55">İl</span>
                <select
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                    setDistrict('');
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                >
                  <option value="">İl seçin</option>
                  {cities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55">İlçe</span>
                <select
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  disabled={!city}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                >
                  <option value="">{city ? 'İlçe seçmeden şehir fiyatını gör' : 'Önce il seçin'}</option>
                  {districts.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-stone/20 bg-cream p-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#1f5aa8] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-charcoal">
                    Seçilen bölge: {city ? `${city}${district ? ` / ${district}` : ''}` : '—'}
                  </p>
                  <p className="mt-1 text-sm text-brown/60">
                    {!city
                      ? 'Nakliyat ücretini görmek için önce il seçin.'
                      : quote?.matchedRule?.note || 'Bu bölge için aktif nakliyat kuralı uygulanıyor.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-stone/25 bg-charcoal p-6 text-white shadow-card">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-gold" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">Nakliyat Tutarı</p>
            </div>
            <p className="mt-6 font-serif text-4xl">
              {!quote ? '---' : quote.isFree ? 'Ücretsiz' : formatPrice(quote.price)}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {!quote
                ? 'İl ve ilçe seçmeden fiyat gösterilmez.'
                : quote.isFree
                ? 'Bu bölge için ücretsiz nakliyat uygulanıyor.'
                : 'Nakliyat ücreti sipariş sırasında aynı bölge kuralı ile hesaplanır.'}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
