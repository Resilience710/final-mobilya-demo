import { absoluteUrl, SITE_NAME } from '@/lib/site';

export default function Head() {
  const title = `Kayıt Ol | ${SITE_NAME}`;
  const description = 'Final Mobilya üyeliği oluşturarak siparişlerinizi ve hesabınızı yönetin.';
  const canonical = absoluteUrl('/kayit');

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="noindex, nofollow" />
      <link rel="canonical" href={canonical} />
    </>
  );
}
