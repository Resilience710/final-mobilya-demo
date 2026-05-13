import type { Metadata } from 'next';
import InfoPage from '@/components/content/InfoPage';
import { buildBreadcrumbSchema, buildMetadata, buildWebPageSchema } from '@/lib/site';

const pageTitle = 'İletişim';
const pageDescription =
  'Final Mobilya için sipariş desteği, mağaza yönlendirmesi ve bayilik başvurusu temas noktaları.';

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/iletisim',
});

export default function IletisimPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildBreadcrumbSchema([
              { name: 'Ana Sayfa', path: '/' },
              { name: pageTitle, path: '/iletisim' },
            ]),
            buildWebPageSchema(pageTitle, pageDescription, '/iletisim', 'ContactPage'),
          ]),
        }}
      />
      <InfoPage
        eyebrow="Destek"
        title="İletişim"
        intro="Bu sitede iletişim deneyimini, kullanıcının ihtiyacına göre doğru yüzeye yönlendirecek şekilde düzenledik. Sipariş takibi, mağaza ziyareti ve iş ortaklığı için farklı kanallar kullanılır."
        sections={[
          {
            title: 'Doğrudan iletişim bilgileri',
            paragraphs: [
              'Telefon: +90 544 531 90 12',
              'Destek e-postası: destek@finalmobilya.com',
              'Adres: Gesi Fatih Mah. Gunsazak Cd. No: 37B, Melikgazi / Kayseri, 38004 Kayseri, Turkey',
            ],
          },
          {
            title: 'Sipariş ve hesap desteği',
            paragraphs: [
              'Aktif siparişleriniz ve geçmiş sipariş hareketleriniz için hesabınız altındaki sipariş ekranını kullanın. Bu alan, oturum açmış kullanıcılar için sipariş takibini tek yerde toplar.',
              'Ödeme, durum değişimi ve teslimat adımlarını izlemek için önce hesabınızdan ilerlemeniz gerekir.',
            ],
          },
          {
            title: 'Mağaza ziyareti ve ürün deneyimi',
            paragraphs: [
              'Ürünü fiziksel olarak görmek, kumaş ve yüzey alternatiflerini değerlendirmek ya da size en yakın noktayı bulmak için şubelerimiz sayfasını kullanın.',
              'Şube sayfasında aktif mağazalar, şehir filtresi ve yönlendirme bağlantıları yer alır.',
            ],
          },
          {
            title: 'Kurumsal ve bayilik talepleri',
            paragraphs: [
              'Bayilik, iş ortaklığı ve bölgesel satış yapılanması için başvuru formu ayrı bir akışta tutulur. Böylece talepler ürün sorularından ayrılır ve daha hızlı değerlendirilir.',
              'Kurumsal talepleriniz için bayilik sayfasındaki form en doğru başlangıç noktasıdır.',
            ],
          },
        ]}
        links={[
          {
            href: '/hesabim/siparislerim',
            label: 'Siparişlerim',
            description: 'Giriş yaptıktan sonra sipariş detaylarınızı ve durum değişimlerini görüntüleyin.',
          },
          {
            href: 'mailto:destek@finalmobilya.com',
            label: 'Destek E-Postası',
            description: 'Sipariş, teslimat ve satış sonrası sorularınız için destek@finalmobilya.com adresine yazın.',
          },
          {
            href: '/subelerimiz',
            label: 'Şubelerimiz',
            description: 'Mağaza adresleri, şehir filtresi ve yol tarifi bağlantılarına ulaşın.',
          },
        ]}
      />
    </>
  );
}
