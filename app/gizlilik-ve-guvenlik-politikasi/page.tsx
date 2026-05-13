import type { Metadata } from 'next';
import InfoPage from '@/components/content/InfoPage';
import { buildBreadcrumbSchema, buildMetadata, buildWebPageSchema } from '@/lib/site';

const pageTitle = 'Gizlilik ve Güvenlik Politikası';
const pageDescription =
  'Final Mobilya internet sitesinde kişisel verilerin işlenmesi, ödeme güvenliği, sipariş kayıtları ve sistem güvenliği hakkında bilgilendirme.';

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/gizlilik-ve-guvenlik-politikasi',
});

export default function GizlilikVeGuvenlikPolitikasiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildBreadcrumbSchema([
              { name: 'Ana Sayfa', path: '/' },
              { name: pageTitle, path: '/gizlilik-ve-guvenlik-politikasi' },
            ]),
            buildWebPageSchema(pageTitle, pageDescription, '/gizlilik-ve-guvenlik-politikasi'),
          ]),
        }}
      />
      <InfoPage
        eyebrow="Gizlilik"
        title="Gizlilik ve Güvenlik Politikası"
        intro="Final Mobilya, sipariş ve üyelik süreçlerinde elde edilen bilgileri yalnızca hizmetin sunulması, siparişin yönetilmesi, teslimatın planlanması ve yasal yükümlülüklerin yerine getirilmesi amacıyla işler. Bu sayfa, sitede kullanılan temel veri ve güvenlik yaklaşımını açıklar."
        sections={[
          {
            title: 'İşlenen bilgiler',
            paragraphs: [
              'Üyelik ve sipariş süreçlerinde ad soyad, e-posta, telefon, teslimat adresi, şehir, ilçe, sipariş notu ve sipariş içeriği gibi bilgiler işlenir. Bu veriler siparişin oluşturulması, doğrulanması ve teslim edilmesi için gereklidir.',
              'Sepet verileri kullanıcı deneyimini sürdürebilmek için tarayıcı tarafında tutulabilir; sipariş tamamlandığında gerekli kayıtlar güvenli sunucu tarafı işlemleriyle sipariş sistemine aktarılır.',
            ],
          },
          {
            title: 'Ödeme güvenliği',
            paragraphs: [
              'Kartlı ödemeler, PayTR tarafından sağlanan güvenli ödeme altyapısı üzerinden gerçekleştirilir. Kart numarası, son kullanma tarihi ve CVV gibi hassas ödeme verileri site veritabanında saklanmaz; ödeme sonucu sunucu tarafında doğrulanan işlem kayıtları üzerinden değerlendirilir.',
              'Banka havalesi siparişlerinde ödeme onayı, hesap hareketlerinin kontrolü sonrasında verilir. Başarısız ödeme ve başarılı ödeme durumları sipariş yönetiminde ayrı işlenir; sipariş statüsü doğrudan istemci beyanına göre değil doğrulanmış kayıtlar üzerinden güncellenir.',
            ],
          },
          {
            title: 'Veri güvenliği ve erişim sınırları',
            paragraphs: [
              'Yönetim paneline erişim rol bazlı olarak sınırlandırılır. Sipariş, müşteri ve operasyon verileri yalnızca yetkili kullanıcılar tarafından görüntülenebilir ve sistem erişimleri sunucu tarafı kurallarla kısıtlanır.',
              'Teknik altyapıda kimlik doğrulama, veritabanı erişim politikaları ve sipariş doğrulama kontrolleri kullanılır. Güvenlik güncellemeleri ve yapılandırmalar düzenli olarak gözden geçirilmelidir.',
            ],
          },
          {
            title: 'Verilerin kullanım amacı',
            paragraphs: [
              'Toplanan bilgiler; sipariş yönetimi, teslimat organizasyonu, satış sonrası destek, muhasebe kayıtları, yasal yükümlülükler ve gerektiğinde dolandırıcılık önleme kontrolleri amacıyla kullanılabilir.',
              'Kişisel veriler, mevzuatın izin verdiği durumlar dışında üçüncü kişilerle amaç dışı şekilde paylaşılmaz. Ödeme, lojistik ve teknoloji hizmetleri yalnızca hizmetin yürütülmesi için gerekli ölçüde sisteme entegre edilir.',
            ],
          },
          {
            title: 'Başvuru ve talepler',
            paragraphs: [
              'Kişisel veriler, sipariş güvenliği veya gizlilik uygulamaları hakkında bilgi talep etmek için iletişim ve mağaza kanalları kullanılabilir. Siparişe ilişkin taleplerde sipariş numarası paylaşılması değerlendirme sürecini hızlandırır.',
              'Siteyi kullanmaya devam eden kullanıcı, yürürlükteki politika ve sipariş süreçleri hakkında bu bilgilendirmeyi okuduğunu kabul etmiş sayılır.',
            ],
          },
        ]}
        links={[
          {
            href: '/mesafeli-satis-sozlesmesi',
            label: 'Mesafeli Satış Sözleşmesi',
            description: 'Siparişin kurulması ve tüketici haklarına ilişkin genel çerçeveyi inceleyin.',
          },
          {
            href: '/iptal-ve-iade-kosullari',
            label: 'İptal ve İade Koşulları',
            description: 'Cayma bildirimi, hasarlı teslim ve geri ödeme koşullarını görüntüleyin.',
          },
          {
            href: '/hakkimizda-ve-iletisim-bilgileri',
            label: 'İletişim Bilgileri',
            description: 'Gizlilik ve güvenlik başvurularında kullanılabilecek iletişim noktalarına ulaşın.',
          },
        ]}
      />
    </>
  );
}
