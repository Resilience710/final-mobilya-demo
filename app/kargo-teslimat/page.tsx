import type { Metadata } from 'next';
import InfoPage from '@/components/content/InfoPage';
import { buildBreadcrumbSchema, buildMetadata, buildWebPageSchema } from '@/lib/site';

const pageTitle = 'Kargo ve Teslimat';
const pageDescription =
  'Final Mobilya sipariş hazırlığı, teslimat planlaması ve ürün teslimi sırasında dikkat edilmesi gerekenler.';

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/kargo-teslimat',
});

export default function KargoTeslimatPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildBreadcrumbSchema([
              { name: 'Ana Sayfa', path: '/' },
              { name: pageTitle, path: '/kargo-teslimat' },
            ]),
            buildWebPageSchema(pageTitle, pageDescription, '/kargo-teslimat'),
          ]),
        }}
      />
      <InfoPage
        eyebrow="Teslimat"
        title="Kargo ve Teslimat"
        intro="Mobilya teslimatı standart paket gönderimden farklıdır; ürün tipi, hacim ve teslimat adresi planlamanın parçasıdır. Bu sayfa, sipariş sonrası beklemeniz gereken temel adımları açıklar."
        sections={[
          {
            title: 'Sipariş hazırlığı',
            paragraphs: [
              'Sipariş oluşturulduktan sonra ürün kalemleri, ödeme durumu ve teslimat bilgileri doğrulanır. Stokta bulunan ürünlerle planlamaya alınan ürünlerin hazırlık süreleri farklı olabilir.',
              'Sipariş onayı ve ödeme tamamlandıktan sonra teslimat akışı güncel sipariş durumuna yansıtılır.',
            ],
          },
          {
            title: 'Teslimat planlaması',
            paragraphs: [
              'Teslimat tarihi ürünün boyutu, teslimat adresi ve bölgesel planlamaya göre değişebilir. Büyük hacimli ürünlerde kat, bina erişimi ve kurulum ihtiyacı gibi detaylar da planlamayı etkiler.',
              'Teslimat adresinizi verirken açık adres, il, ilçe ve telefon bilgilerinin eksiksiz olması sürecin sağlıklı ilerlemesi için gereklidir.',
            ],
          },
          {
            title: 'Teslim anında kontrol',
            paragraphs: [
              'Ürünü teslim alırken ambalaj, paket bütünlüğü ve görünür hasar kontrolünü teslim ekibi yanınızdayken yapın. Hasar veya eksik parça fark edilirse bunu teslim anında kayıt altına alın.',
              'Teslim sonrası süreçler için sipariş ekranındaki bilgiler ve destek yönlendirmeleri esas alınır.',
            ],
          },
        ]}
        links={[
          {
            href: '/hesabim/siparislerim',
            label: 'Sipariş Takibi',
            description: 'Teslimat öncesi ve sonrası sipariş durumunuzu hesabınızdan izleyin.',
          },
          {
            href: '/iade-degisim',
            label: 'İade ve Değişim',
            description: 'Hasar, eksik parça veya iade süreci için temel adımları inceleyin.',
          },
        ]}
      />
    </>
  );
}
