import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Building2, ShieldCheck, PackageCheck, Mail } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Store } from '@/lib/types';
import { absoluteUrl, buildBreadcrumbSchema, buildMetadata, buildWebPageSchema } from '@/lib/site';

const pageTitle = 'Hakkımızda ve İletişim Bilgileri';
const pageDescription =
  'Final Mobilya marka yaklaşımı, aktif mağaza adresleri, telefon bilgileri ve sipariş destek yönlendirmeleri.';

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/hakkimizda-ve-iletisim-bilgileri',
});

export default async function HakkimizdaVeIletisimBilgileriPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('stores')
    .select('id, name, city, address, phone, map_url')
    .eq('is_active', true)
    .order('sort_order');

  const stores = (data as Store[]) || [];
  const schemas = [
    buildBreadcrumbSchema([
      { name: 'Ana Sayfa', path: '/' },
      { name: pageTitle, path: '/hakkimizda-ve-iletisim-bilgileri' },
    ]),
    buildWebPageSchema(pageTitle, pageDescription, '/hakkimizda-ve-iletisim-bilgileri', 'AboutPage'),
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Final Mobilya',
      url: absoluteUrl('/'),
      telephone: '+905445319012',
      email: 'destek@finalmobilya.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Gesi Fatih Mah. Gunsazak Cd. No: 37B',
        addressLocality: 'Melikgazi',
        addressRegion: 'Kayseri',
        postalCode: '38004',
        addressCountry: 'TR',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+905445319012',
        email: 'destek@finalmobilya.com',
        areaServed: 'TR',
        availableLanguage: ['tr'],
      },
    },
    ...stores.map((store) => ({
      '@context': 'https://schema.org',
      '@type': 'FurnitureStore',
      name: store.name,
      telephone: store.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: store.address,
        addressLocality: store.city,
        addressCountry: 'TR',
      },
      url: absoluteUrl('/hakkimizda-ve-iletisim-bilgileri'),
      hasMap: store.map_url || undefined,
    })),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />
      <div className="min-h-screen bg-cream">
        <section className="border-b border-stone/20 bg-charcoal">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
              Kurumsal Bilgilendirme
            </p>
            <h1 className="font-serif text-4xl leading-tight text-cream sm:text-5xl">
              Hakkımızda ve İletişim Bilgileri
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-stone/65 sm:text-base">
              Final Mobilya, yaşam alanlarını konfor, işlev ve estetik dengesiyle ele alan bir
              mobilya markasıdır. Online sipariş deneyimi ile mağaza desteğini birlikte kurgular;
              ürün keşfi, teslimat planlaması ve satış sonrası destek süreçlerini erişilebilir
              iletişim kanallarıyla yönetir.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-stone/20 bg-white p-6 shadow-card">
              <h2 className="font-serif text-2xl text-charcoal">Marka yaklaşımımız</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-brown/75">
                <p>
                  Ürün seçkimizi yalnızca fiyat odaklı değil, uzun ömürlü kullanım, malzeme uyumu
                  ve mekan bütünlüğü ekseninde oluşturuyoruz. Oturma grubu, yatak odası, yemek
                  odası, genç odası, baza başlık, yatak ve tamamlayıcı ürün kategorilerinde hem
                  online hem mağaza destekli bir alışveriş deneyimi sunuyoruz.
                </p>
                <p>
                  Siparişten teslimata kadar olan süreçte ürün varyantları, ödeme doğrulaması,
                  teslimat planı ve satış sonrası talepler kayıt altına alınır. Böylece müşteri,
                  seçtiği ürünün ödeme ve teslimat sürecini izlenebilir şekilde takip edebilir.
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-stone/20 bg-white p-6 shadow-card">
              <h2 className="font-serif text-2xl text-charcoal">Destek başlıkları</h2>
              <div className="mt-5 space-y-4 text-sm text-brown/75">
                <div className="flex items-start gap-3">
                  <PackageCheck className="mt-0.5 h-5 w-5 text-gold" />
                  <div>
                    <p className="font-medium text-charcoal">Sipariş ve teslimat desteği</p>
                    <p>
                      Sipariş durumu, teslimat planı, hasarlı veya eksik teslim başvuruları için
                      sipariş numarası ile mağaza veya destek kanalları üzerinden başvuru
                      yapılabilir.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-gold" />
                  <div>
                    <p className="font-medium text-charcoal">Ödeme ve güvenlik</p>
                    <p>
                      Kartlı ödemeler PayTR altyapısı üzerinden, havale siparişleri ise ödeme
                      doğrulaması sonrası işleme alınır. Müşteri talep ve itirazları kayıt altına
                      alınarak değerlendirilir.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-5 w-5 text-gold" />
                  <div>
                    <p className="font-medium text-charcoal">Mağaza ve ürün danışmanlığı</p>
                    <p>
                      Kumaş, renk, ölçü ve takım kombinasyonları hakkında mağaza ekipleri üzerinden
                      yönlendirme alınabilir. Fiziksel ürün deneyimi için aktif mağazalar aşağıda
                      listelenmiştir.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-stone/20 bg-beige p-5 text-sm text-brown/75">
                <p className="font-semibold text-charcoal">Merkez iletişim bilgileri</p>
                <div className="mt-3 space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-gold" />
                    <a href="tel:+905445319012" className="transition-colors hover:text-charcoal">
                      +90 544 531 90 12
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-gold" />
                    <a
                      href="mailto:destek@finalmobilya.com"
                      className="transition-colors hover:text-charcoal"
                    >
                      destek@finalmobilya.com
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-gold" />
                    <span>
                      Gesi Fatih Mah. Gunsazak Cd. No: 37B, Melikgazi / Kayseri, 38004
                      Kayseri, Turkey
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/mesafeli-satis-sozlesmesi"
                  className="rounded-2xl border border-stone/20 bg-beige px-5 py-4 text-sm transition-colors hover:border-gold hover:bg-white"
                >
                  <p className="font-semibold text-charcoal">Mesafeli Satış Sözleşmesi</p>
                  <p className="mt-2 text-brown/70">
                    Sipariş ve teslim yükümlülüklerinin genel çerçevesini inceleyin.
                  </p>
                </Link>
                <Link
                  href="/gizlilik-ve-guvenlik-politikasi"
                  className="rounded-2xl border border-stone/20 bg-beige px-5 py-4 text-sm transition-colors hover:border-gold hover:bg-white"
                >
                  <p className="font-semibold text-charcoal">Gizlilik ve Güvenlik</p>
                  <p className="mt-2 text-brown/70">
                    Kişisel veriler, ödeme akışı ve sistem güvenliği hakkında bilgi alın.
                  </p>
                </Link>
              </div>
            </article>
          </div>

          <div className="mt-10">
            <h2 className="font-serif text-3xl text-charcoal">Aktif mağaza ve iletişim noktaları</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brown/70">
              Aşağıdaki mağaza adresleri ve telefonları ürün danışmanlığı, teslimat takibi ve satış
              sonrası değerlendirmeler için kullanılabilir. Yol tarifi ve şehir bazlı tüm mağaza
              görünümü için şubelerimiz sayfası da kullanılabilir.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {stores.map((store) => (
                <article
                  key={store.id}
                  className="rounded-3xl border border-stone/20 bg-white p-6 shadow-card"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                    {store.city}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl text-charcoal">{store.name}</h3>
                  <div className="mt-5 space-y-4 text-sm leading-relaxed text-brown/75">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-gold" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gold" />
                      <a
                        href={`tel:${store.phone.replace(/\s/g, '')}`}
                        className="transition-colors hover:text-charcoal"
                      >
                        {store.phone}
                      </a>
                    </div>
                  </div>
                  <a
                    href={
                      store.map_url?.replace('/embed?', '/search?') ??
                      `https://maps.google.com/?q=${encodeURIComponent(store.address)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-charcoal"
                  >
                    Yol Tarifi Al
                  </a>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-stone/20 bg-white p-6 shadow-card">
              <h3 className="font-serif text-2xl text-charcoal">Destek yönlendirmeleri</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Link
                  href="/hesabim/siparislerim"
                  className="rounded-2xl border border-stone/20 bg-beige px-5 py-4 text-sm transition-colors hover:border-gold hover:bg-white"
                >
                  <p className="font-semibold text-charcoal">Siparişlerim</p>
                  <p className="mt-2 text-brown/70">
                    Giriş yaptıktan sonra sipariş hareketleri ve durum güncellemelerini izleyin.
                  </p>
                </Link>
                <Link
                  href="/subelerimiz"
                  className="rounded-2xl border border-stone/20 bg-beige px-5 py-4 text-sm transition-colors hover:border-gold hover:bg-white"
                >
                  <p className="font-semibold text-charcoal">Şubelerimiz</p>
                  <p className="mt-2 text-brown/70">
                    Tüm mağazaları şehir filtresiyle görüntüleyin ve size en yakın noktayı seçin.
                  </p>
                </Link>
                <Link
                  href="/iptal-ve-iade-kosullari"
                  className="rounded-2xl border border-stone/20 bg-beige px-5 py-4 text-sm transition-colors hover:border-gold hover:bg-white"
                >
                  <p className="font-semibold text-charcoal">İptal ve İade Koşulları</p>
                  <p className="mt-2 text-brown/70">
                    İade, cayma ve teslimat sonrası taleplerin nasıl değerlendirildiğini inceleyin.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
