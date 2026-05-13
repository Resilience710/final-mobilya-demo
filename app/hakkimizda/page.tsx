import type { Metadata } from 'next';
import InfoPage from '@/components/content/InfoPage';
import { buildBreadcrumbSchema, buildMetadata, buildWebPageSchema } from '@/lib/site';

const pageTitle = 'Hakkımızda';
const pageDescription =
  'Final Mobilya tasarım yaklaşımı, ürün seçkisi ve yaşam alanlarına odaklanan marka anlayışı.';

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/hakkimizda',
});

export default function HakkimizdaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildBreadcrumbSchema([
              { name: 'Ana Sayfa', path: '/' },
              { name: pageTitle, path: '/hakkimizda' },
            ]),
            buildWebPageSchema(pageTitle, pageDescription, '/hakkimizda', 'AboutPage'),
          ]),
        }}
      />
      <InfoPage
        eyebrow="Final Mobilya"
        title="Hakkımızda"
        intro="Final Mobilya, ürünü tek başına değil yaşam alanının bütünlüğü içinde ele alan bir mobilya markasıdır. Koleksiyonlarımızı konfor, malzeme kalitesi ve uzun ömürlü kullanım dengesiyle kurguluyoruz."
        sections={[
          {
            title: 'Tasarım yaklaşımımız',
            paragraphs: [
              'Koleksiyonlarımızı trend odaklı hızlı değişim yerine zamana dayanıklı bir dil üzerine kuruyoruz. Her ürün, bulunduğu mekanla birlikte anlam kazansın diye ölçek, doku ve renk ilişkilerine dikkat ediyoruz.',
              'Bu nedenle kategorilerimizi yalnızca ürün listesi değil, yaşam alanı senaryosu olarak ele alıyoruz.',
            ],
          },
          {
            title: 'Malzeme ve işçilik',
            paragraphs: [
              'Ürün seçkisinde dayanıklılık, bakım kolaylığı ve günlük kullanımdaki performans temel kriterlerimizdir. Kumaş, ahşap, metal ve tamamlayıcı malzemelerde uzun ömürlü kullanım hedeflenir.',
              'Premium görünüm kadar gerçek kullanım kalitesini de önemseriz; ürün bilgileri, varyantlar ve fiyatlar bu nedenle katalogda açık şekilde sunulur.',
            ],
          },
          {
            title: 'Mağaza ve danışmanlık deneyimi',
            paragraphs: [
              'Online katalog ile mağaza deneyimini birbirini tamamlayan iki yüzey olarak tasarlıyoruz. Kullanıcı önce ürünleri keşfeder, ardından mağaza ziyareti, teslimat planı veya sipariş takibini ilgili kanallardan sürdürebilir.',
              'Bayilik yapılanmamız ve şube ağı da bu bütünsel deneyimi desteklemek için yapılandırılmıştır.',
            ],
          },
          {
            title: 'İletişim ve merkez adresi',
            paragraphs: [
              'Müşteri destek hattı: +90 544 531 90 12',
              'Destek e-postası: destek@finalmobilya.com',
              'Merkez iletişim adresi: Gesi Fatih Mah. Gunsazak Cd. No: 37B, Melikgazi / Kayseri, 38004 Kayseri, Turkey',
            ],
          },
        ]}
        links={[
          {
            href: '/urunler',
            label: 'Koleksiyonları İncele',
            description: 'Kategori ve ürün sayfaları üzerinden mevcut ürün seçkisini inceleyin.',
          },
          {
            href: '/subelerimiz',
            label: 'Şubelerimiz',
            description: 'Size en yakın mağazayı bulun ve ziyaret planınızı yapın.',
          },
          {
            href: '/hakkimizda-ve-iletisim-bilgileri',
            label: 'Kurumsal İletişim',
            description: 'Telefon, destek e-postası, mağaza adresleri ve kurumsal temas noktalarına ulaşın.',
          },
        ]}
      />
    </>
  );
}
