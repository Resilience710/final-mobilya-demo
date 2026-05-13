import type { Metadata } from 'next';
import InfoPage from '@/components/content/InfoPage';
import { buildBreadcrumbSchema, buildMetadata, buildWebPageSchema } from '@/lib/site';

const pageTitle = 'İptal ve İade Koşulları';
const pageDescription =
  'Final Mobilya siparişlerinde sipariş iptali, cayma hakkı, hasarlı teslim ve geri ödeme süreçlerine ilişkin bilgilendirme.';

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/iptal-ve-iade-kosullari',
});

export default function IptalVeIadeKosullariPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildBreadcrumbSchema([
              { name: 'Ana Sayfa', path: '/' },
              { name: pageTitle, path: '/iptal-ve-iade-kosullari' },
            ]),
            buildWebPageSchema(pageTitle, pageDescription, '/iptal-ve-iade-kosullari'),
          ]),
        }}
      />
      <InfoPage
        eyebrow="Satış Sonrası"
        title="İptal ve İade Koşulları"
        intro="Sipariş iptali, cayma hakkı ve iade değerlendirmeleri ürünün hazırlanma durumu, teslim edilip edilmediği ve ürün niteliğine göre yürütülür. Bu sayfa, tüketicinin temel haklarını ve sipariş operasyonunun nasıl ilerlediğini açıklar."
        sections={[
          {
            title: 'Sipariş iptali',
            paragraphs: [
              'Sipariş henüz üretim, paketleme veya sevkiyat aşamasına alınmadan önce iptal talebi iletilebilir. Ödeme alınmış siparişlerde iptal onayı verildiğinde tahsil edilen tutar kullanılan ödeme yöntemine uygun şekilde iade sürecine alınır.',
              'Banka havalesi siparişlerinde iptal ve iade işlemleri, ödeme kaydının doğrulanması ile birlikte değerlendirilir. Kartlı ödemelerde geri ödeme, işlem kaydının sistem üzerinden teyit edilmesi sonrasında başlatılır.',
            ],
          },
          {
            title: 'Cayma hakkının kullanılması',
            paragraphs: [
              'Tüketici, ürün tesliminden itibaren on dört gün içinde cayma hakkını kullanabilir. Cayma bildirimi e-posta, yazılı başvuru veya kalıcı veri saklayıcısı niteliğindeki dijital iletişim kanalları üzerinden açık bir beyanla iletilebilir.',
              'Cayma bildiriminin alınmasından sonra tüketici ürünü yasal süreler içinde geri göndermeli veya iade organizasyonu için destek birimiyle koordinasyon kurmalıdır. İade sürecinde sipariş numarası ve teslimat bilgileri esas alınır.',
            ],
          },
          {
            title: 'Cayma hakkının kapsamı dışında kalan haller',
            paragraphs: [
              'Müşterinin isteğine göre özel ölçü, özel kumaş, özel renk veya kişiye özel üretim planlaması yapılan ürünler mevzuattaki istisnalar kapsamında değerlendirilebilir. Bu tür siparişlerde üretim başladıktan sonra iptal veya iade talebi her zaman standart cayma hakkı kapsamında kabul edilmeyebilir.',
              'Kurulum sonrası ikinci kez satışa uygunluğunu kaybeden ürünler ile hijyen nedeniyle tekrar satışa elverişli olmayan ürünlerde de ilgili mevzuat hükümleri uygulanır.',
            ],
          },
          {
            title: 'Hasarlı, eksik veya yanlış teslimat',
            paragraphs: [
              'Teslim anında ambalaj hasarı, eksik parça veya yanlış ürün tespit edilirse durum hemen teslim ekibine bildirilmeli ve mümkünse teslim tutanağına işlenmelidir. Bu kayıt, hızlı çözüm için önemlidir.',
              'Hasarlı veya yanlış teslimat halinde öncelik, ürünün onarımı, eksik parçanın tamamlanması, değişim veya uygun olduğunda bedel iadesi seçeneklerinin değerlendirilmesidir.',
            ],
          },
          {
            title: 'Geri ödeme süreci',
            paragraphs: [
              'Mevzuat kapsamındaki geri ödemeler, cayma veya iptal bildirimine ilişkin şartların sağlanması halinde yasal sürede tamamlanır. Geri ödeme, tüketicinin siparişte kullandığı ödeme aracına uygun şekilde veya banka havalesi ile yapılır.',
              'Banka ve ödeme kuruluşu süreçlerinden kaynaklanan hesap yansıma süresi, teknik işlem süresine bağlı olarak değişebilir; ancak geri ödeme talimatı satıcı tarafından mevzuata uygun sürede oluşturulur.',
            ],
          },
        ]}
        links={[
          {
            href: '/mesafeli-satis-sozlesmesi',
            label: 'Mesafeli Satış Sözleşmesi',
            description: 'Siparişin kurulması, ödeme ve taraf yükümlülüklerine ilişkin genel çerçeveyi inceleyin.',
          },
          {
            href: '/teslimat-ve-kargo-bilgileri',
            label: 'Teslimat ve Kargo Bilgileri',
            description: 'Teslimat planı, sevkiyat ve teslim sırasında dikkat edilmesi gerekenleri görüntüleyin.',
          },
          {
            href: '/hakkimizda-ve-iletisim-bilgileri',
            label: 'İletişim Bilgileri',
            description: 'İade veya iptal talebiniz için kullanabileceğiniz mağaza ve destek temas noktalarına ulaşın.',
          },
        ]}
      />
    </>
  );
}
