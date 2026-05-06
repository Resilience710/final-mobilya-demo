import type { Metadata } from 'next';
import InfoPage from '@/components/content/InfoPage';
import { absoluteUrl, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'İade ve Değişim',
  description:
    'Final Mobilya siparişlerinde hasarlı ürün, eksik parça ve iade-değişim değerlendirme sürecine dair genel bilgilendirme.',
  alternates: {
    canonical: '/iade-degisim',
  },
  openGraph: {
    title: `İade ve Değişim | ${SITE_NAME}`,
    description:
      'Final Mobilya siparişlerinde hasarlı ürün, eksik parça ve iade-değişim değerlendirme sürecine dair genel bilgilendirme.',
    url: absoluteUrl('/iade-degisim'),
  },
};

export default function IadeDegisimPage() {
  return (
    <InfoPage
      eyebrow="Satış Sonrası"
      title="İade ve Değişim"
      intro="Mobilya siparişlerinde iade ve değişim süreci ürünün niteliğine, teslimat durumuna ve kayıt altına alınan bilgilere göre değerlendirilir. Bu sayfa, sürecin temel çerçevesini özetler."
      sections={[
        {
          title: 'Hasarlı veya eksik teslimat',
          paragraphs: [
            'Teslim anında görünür hasar, eksik parça ya da yanlış ürün fark edilirse bunu ürün teslim edilirken kayıt altına alın. En hızlı çözüm bu kontrolün teslimat anında yapılmasıyla sağlanır.',
            'Sipariş bilgileri ve ürün kalemleri üzerinden değerlendirme yapılabilmesi için hesap ekranındaki sipariş kaydı esas alınır.',
          ],
        },
        {
          title: 'İade değerlendirmesi',
          paragraphs: [
            'İade talepleri ürünün durumu, teslimat şekli ve kullanım izine göre ayrı ayrı incelenir. Kurulumu yapılmış veya kişiselleştirilmiş ürünlerde süreç farklılaşabilir.',
            'Talep oluştururken sipariş numarası, ürün bilgisi ve sorunun kısa açıklamasıyla ilerlemek süreci hızlandırır.',
          ],
        },
        {
          title: 'Değişim süreci',
          paragraphs: [
            'Varyant, parça veya ürün bazlı değişimlerde stok ve lojistik uygunluğu kontrol edilir. Gerekli olduğunda yeni teslimat planı mevcut sipariş akışıyla ilişkilendirilir.',
            'Ürün değişimi gerektiren durumlarda mevcut siparişin ödeme ve teslimat statüsü de birlikte değerlendirilir.',
          ],
        },
      ]}
      links={[
        {
          href: '/hesabim/siparislerim',
          label: 'Sipariş Detayı',
          description: 'Talep oluşturmadan önce sipariş durumunuzu ve ürün kalemlerinizi kontrol edin.',
        },
        {
          href: '/iletisim',
          label: 'İletişim',
          description: 'Sorununuzu hangi destek yüzeyinden iletmeniz gerektiğini görmek için iletişim sayfasını kullanın.',
        },
      ]}
    />
  );
}
