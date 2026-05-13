import type { Metadata } from 'next';
import InfoPage from '@/components/content/InfoPage';
import { buildBreadcrumbSchema, buildMetadata, buildWebPageSchema } from '@/lib/site';

const pageTitle = 'Mesafeli Satış Sözleşmesi';
const pageDescription =
  'Final Mobilya internet sitesi üzerinden verilen siparişlerde geçerli temel mesafeli satış sözleşmesi ve sipariş süreci bilgilendirmesi.';

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/mesafeli-satis-sozlesmesi',
});

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildBreadcrumbSchema([
              { name: 'Ana Sayfa', path: '/' },
              { name: pageTitle, path: '/mesafeli-satis-sozlesmesi' },
            ]),
            buildWebPageSchema(pageTitle, pageDescription, '/mesafeli-satis-sozlesmesi'),
          ]),
        }}
      />
      <InfoPage
        eyebrow="Yasal Bilgilendirme"
        title="Mesafeli Satış Sözleşmesi"
        intro="Bu sayfa, Final Mobilya internet sitesi üzerinden verilen siparişlerde uygulanan temel sözleşme çerçevesini özetlemek için hazırlanmıştır. Siparişin oluşturulması, ödemenin alınması, teslimatın planlanması ve cayma hakkına ilişkin esaslar ilgili tüketici mevzuatına uygun şekilde yürütülür."
        sections={[
          {
            title: 'Sözleşmenin konusu ve kapsamı',
            paragraphs: [
              'Bu sözleşme, tüketicinin Final Mobilya internet sitesi üzerinden elektronik ortamda sipariş verdiği ürünlerin satışı ve teslimine ilişkin tarafların hak ve yükümlülüklerini düzenler.',
              'Sipariş aşamasında görüntülenen ürün bilgileri, satış fiyatı, seçilen varyantlar, teslimat masrafı, ödeme yöntemi ve teslimat bilgileri sipariş kaydının ayrılmaz parçası kabul edilir.',
            ],
          },
          {
            title: 'Siparişin kurulması ve ödeme',
            paragraphs: [
              'Tüketici, siparişi onayladığında bunun ödeme yükümlülüğü doğurduğunu kabul eder. Sipariş ancak ödeme adımı tamamlandıktan veya banka havalesi için gerekli sipariş kaydı oluşturulduktan sonra işleme alınır.',
              'PayTR ile yapılan kartlı ödemelerde işlem sonucu, ödeme hizmet sağlayıcısından gelen doğrulama kayıtları üzerinden kontrol edilir. Banka havalesi siparişlerinde onay, ödemenin hesap hareketlerinde doğrulanması sonrasında verilir.',
            ],
          },
          {
            title: 'Teslimat ve ifa süresi',
            paragraphs: [
              'Siparişe konu ürünler, stok durumu, üretim planı, teslimat adresi ve lojistik organizasyona göre hazırlanır. Taraflarca ayrıca farklı bir süre kararlaştırılmadıkça teslimat yasal azami süreler gözetilerek yürütülür.',
              'İfanın imkansız hale gelmesi durumunda tüketiciye gecikmeksizin bilgi verilir ve tahsil edilen ödemeler mevzuatta öngörülen süre içinde iade edilir. Stokta bulunmama hali tek başına imkansızlık sayılmaz; bu durumda müşteriyle yeni teslim tarihi veya alternatif çözüm paylaşılır.',
            ],
          },
          {
            title: 'Cayma hakkı ve istisnalar',
            paragraphs: [
              'Tüketici, mal satışlarında ürünü teslim aldığı tarihten itibaren on dört gün içinde herhangi bir gerekçe göstermeden ve cezai şart ödemeden cayma hakkını kullanabilir. Cayma bildirimi yazılı olarak veya kalıcı veri saklayıcısı üzerinden yapılabilir.',
              'Müşterinin açık talebi doğrultusunda ölçü, kumaş, renk veya benzeri kişisel ihtiyaçlara göre özel hazırlanan ürünlerde cayma hakkı mevzuattaki istisnalar çerçevesinde sınırlı olabilir. Kurulumu yapıldıktan sonra yeniden satılabilir niteliğini kaybeden veya hijyen açısından iadeye elverişli olmayan ürünler için de mevzuat hükümleri uygulanır.',
            ],
          },
          {
            title: 'Uyuşmazlık ve başvuru yolları',
            paragraphs: [
              'Siparişe ilişkin talepler öncelikle müşteri destek ve mağaza iletişim kanalları üzerinden değerlendirilir. Tüketici mevzuatından doğan haklar saklıdır.',
              'Uyuşmazlık halinde, başvuru tarihinde geçerli parasal sınırlar dahilinde tüketici hakem heyetleri ve tüketici mahkemeleri yetkilidir.',
            ],
          },
        ]}
        links={[
          {
            href: '/iptal-ve-iade-kosullari',
            label: 'İptal ve İade Koşulları',
            description: 'Cayma, sipariş iptali, hasarlı teslim ve geri ödeme adımlarını inceleyin.',
          },
          {
            href: '/teslimat-ve-kargo-bilgileri',
            label: 'Teslimat ve Kargo Bilgileri',
            description: 'Teslimat planlaması, lojistik akış ve teslim anı kontrolleri hakkında bilgi alın.',
          },
          {
            href: '/hakkimizda-ve-iletisim-bilgileri',
            label: 'Hakkımızda ve İletişim Bilgileri',
            description: 'Mağaza adresleri, telefonlar ve destek yönlendirmelerine ulaşın.',
          },
        ]}
      />
    </>
  );
}
