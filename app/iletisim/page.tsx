import type { Metadata } from 'next';
import InfoPage from '@/components/content/InfoPage';
import { absoluteUrl, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'İletişim',
  description:
    'Final Mobilya için sipariş desteği, mağaza yönlendirmesi ve bayilik başvurusu temas noktaları.',
  alternates: {
    canonical: '/iletisim',
  },
  openGraph: {
    title: `İletişim | ${SITE_NAME}`,
    description:
      'Final Mobilya için sipariş desteği, mağaza yönlendirmesi ve bayilik başvurusu temas noktaları.',
    url: absoluteUrl('/iletisim'),
  },
};

export default function IletisimPage() {
  return (
    <InfoPage
      eyebrow="Destek"
      title="İletişim"
      intro="Bu sitede iletişim deneyimini, kullanıcının ihtiyacına göre doğru yüzeye yönlendirecek şekilde düzenledik. Sipariş takibi, mağaza ziyareti ve iş ortaklığı için farklı kanallar kullanılır."
      sections={[
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
          href: '/subelerimiz',
          label: 'Şubelerimiz',
          description: 'Mağaza adresleri, şehir filtresi ve yol tarifi bağlantılarına ulaşın.',
        },
        {
          href: '/bayilik',
          label: 'Bayilik Başvurusu',
          description: 'Kurumsal iş birlikleri ve bayi ağı için başvuru akışını başlatın.',
        },
      ]}
    />
  );
}
