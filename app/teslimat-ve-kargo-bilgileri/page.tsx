import type { Metadata } from 'next';
import InfoPage from '@/components/content/InfoPage';
import { buildBreadcrumbSchema, buildMetadata, buildWebPageSchema } from '@/lib/site';

const pageTitle = 'Teslimat ve Kargo Bilgileri';
const pageDescription =
  'Final Mobilya siparişlerinde teslimat planlaması, lojistik süreç, teslim kontrolü ve müşterinin yükümlülükleri hakkında bilgilendirme.';

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/teslimat-ve-kargo-bilgileri',
});

export default function TeslimatVeKargoBilgileriPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildBreadcrumbSchema([
              { name: 'Ana Sayfa', path: '/' },
              { name: pageTitle, path: '/teslimat-ve-kargo-bilgileri' },
            ]),
            buildWebPageSchema(pageTitle, pageDescription, '/teslimat-ve-kargo-bilgileri'),
          ]),
        }}
      />
      <InfoPage
        eyebrow="Teslimat"
        title="Teslimat ve Kargo Bilgileri"
        intro="Mobilya teslimatı, ürün hacmi, üretim planı ve adres koşulları nedeniyle standart kargo süreçlerinden farklı yürütülür. Bu sayfa, sipariş onayından teslim anına kadar temel adımları ve müşterinin dikkat etmesi gereken noktaları açıklar."
        sections={[
          {
            title: 'Sipariş hazırlık ve planlama süreci',
            paragraphs: [
              'Sipariş oluşturulduktan sonra ürün kalemleri, varyant bilgileri, ödeme durumu ve teslimat adresi kontrol edilir. Stoktan sevk edilen ürünlerle üretim veya tedarik planı gerektiren ürünlerin hazırlık süreleri farklı olabilir.',
              'Siparişe ait iletişim ve adres bilgilerinin eksiksiz girilmesi, planlamanın doğru yapılması için zorunludur. Eksik veya hatalı bilgi nedeniyle yaşanabilecek gecikmeler müşteriye bildirilerek giderilmeye çalışılır.',
            ],
          },
          {
            title: 'Teslimat süresi ve bölgesel organizasyon',
            paragraphs: [
              'Teslimat süresi ürün türü, üretim takvimi, kampanya yoğunluğu, teslimat ili ve lojistik rotaya göre değişebilir. Taraflar arasında ayrıca farklı bir süre kararlaştırılmamışsa teslimat mevzuattaki azami süreler gözetilerek gerçekleştirilir.',
              'Büyük hacimli siparişlerde bina erişimi, asansör uygunluğu, kat bilgisi ve kurulum ihtiyacı teslim planının parçasıdır. Gerekli durumlarda teslimat öncesi müşteri ile teyit yapılabilir.',
            ],
          },
          {
            title: 'Teslimat anında müşteri kontrolü',
            paragraphs: [
              'Ürün teslim alınırken ambalaj bütünlüğü, görünür hasar, eksik parça ve doğru ürün kontrol edilmelidir. Tespit edilen sorunlar mümkünse teslim anında kayıt altına alınmalı ve destek birimine aynı gün iletilmelidir.',
              'Teslim alınan ürünün kurulumu veya kullanımı öncesinde fark edilen açık bir hasar varsa, değerlendirme süreci için fotoğraf ve sipariş bilgileri ile başvuru yapılması tavsiye edilir.',
            ],
          },
          {
            title: 'Kargo, nakliye ve sorumluluk sınırları',
            paragraphs: [
              'Standart paket kargo ile gönderilebilen ürünler ile özel nakliye planı gerektiren ürünlerin operasyonu farklı olabilir. Teslimata kadar oluşabilecek kayıp veya hasar, genel olarak satıcının sorumluluğunda değerlendirilir; ancak müşterinin kendi belirlediği farklı bir taşıyıcıyı tercih ettiği durumlarda mevzuattaki sorumluluk dağılımı uygulanır.',
              'Teslimatın müşteriden kaynaklanan sebeplerle yapılamaması halinde yeni planlama gerekebilir. Bu tür durumlarda güncel teslim tarihi müşteri ile paylaşılır.',
            ],
          },
          {
            title: 'Teslimat sonrası destek',
            paragraphs: [
              'Eksik parça, hasar, yanlış ürün veya teslimatla ilgili diğer talepler satış sonrası destek süreci üzerinden incelenir. Değerlendirmede sipariş numarası, teslim tarihi ve ürün bilgileri esas alınır.',
              'Sipariş durumu ve ödeme bilgileri hesabım alanından izlenebilir; gerektiğinde mağaza iletişim kanalları üzerinden destek alınabilir.',
            ],
          },
        ]}
        links={[
          {
            href: '/iptal-ve-iade-kosullari',
            label: 'İptal ve İade Koşulları',
            description: 'Hasarlı teslim, cayma ve geri ödeme başlıklarını ayrıntılı inceleyin.',
          },
          {
            href: '/mesafeli-satis-sozlesmesi',
            label: 'Mesafeli Satış Sözleşmesi',
            description: 'Siparişin hukuki çerçevesi ve teslim yükümlülüklerine ilişkin genel metni görüntüleyin.',
          },
          {
            href: '/hakkimizda-ve-iletisim-bilgileri',
            label: 'İletişim Bilgileri',
            description: 'Teslimat sonrası başvurularda kullanılabilecek aktif mağaza temas noktalarına ulaşın.',
          },
        ]}
      />
    </>
  );
}
