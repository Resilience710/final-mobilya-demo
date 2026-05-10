import type { Metadata } from 'next';
import InfoPage from '@/components/content/InfoPage';
import { buildBreadcrumbSchema, buildMetadata, buildWebPageSchema } from '@/lib/site';

const pageTitle = 'Gizlilik Politikası';
const pageDescription =
  'Final Mobilya sitesinde hesap, sipariş ve ödeme süreçlerinde işlenen temel veriler hakkında özet gizlilik bilgilendirmesi.';

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/gizlilik-politikasi',
});

export default function GizlilikPolitikasiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildBreadcrumbSchema([
              { name: 'Ana Sayfa', path: '/' },
              { name: pageTitle, path: '/gizlilik-politikasi' },
            ]),
            buildWebPageSchema(pageTitle, pageDescription, '/gizlilik-politikasi'),
          ]),
        }}
      />
      <InfoPage
        eyebrow="Gizlilik"
        title="Gizlilik Politikası"
        intro="Bu sitede kullanıcı hesabı, sipariş, teslimat ve ödeme akışlarının çalışabilmesi için bazı veriler işlenir. Aşağıdaki özet, uygulamadaki mevcut teknik akışa göre temel veri kategorilerini açıklar."
        sections={[
          {
            title: 'İşlenen temel veriler',
            paragraphs: [
              'Hesap oluşturma ve giriş süreçlerinde e-posta adresi, kullanıcı kimliği ve profil alanları kullanılır. Sipariş sırasında teslimat adı, adres, şehir, telefon ve sipariş notu gibi bilgiler saklanır.',
              'Sepet bilgileri tarayıcı tarafında yerel depolamada tutulur; sipariş tamamlandığında yetkili sipariş kayıtlarına dönüştürülür.',
            ],
          },
          {
            title: 'Ödeme ve üçüncü taraf hizmetler',
            paragraphs: [
              'Ödeme akışı iyzico entegrasyonu üzerinden başlatılır. Sipariş yönetimi, kimlik doğrulama ve veri saklama katmanlarında Supabase servisleri kullanılır.',
              'Ödeme sonucu, sipariş statüsü ve referans bilgileri güvenli sunucu rotaları üzerinden işlenir; istemciden gelen fiyat bilgileri sipariş oluştururken doğrudan kabul edilmez.',
            ],
          },
          {
            title: 'Kullanım amaçları ve erişim',
            paragraphs: [
              'Veriler sipariş oluşturma, ödeme başlatma, teslimat planlama, kullanıcı hesabını yönetme ve yönetim panelinde operasyonel raporlama için kullanılır.',
              'Yönetim verileri, rol kontrollü erişim ve sunucu tarafı politikalarla sınırlandırılır. Yayın öncesi güvenlik politikalarının ve veritabanı düzeltmelerinin production ortamında uygulanması gerekir.',
            ],
          },
        ]}
        links={[
          {
            href: '/iletisim',
            label: 'İletişim',
            description: 'Gizlilik ve veri işleme süreçleriyle ilgili doğru temas noktasına yönlenin.',
          },
        ]}
      />
    </>
  );
}
