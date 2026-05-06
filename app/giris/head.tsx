import { absoluteUrl, SITE_NAME } from '@/lib/site';

export default function Head() {
  const title = `Giriş Yap | ${SITE_NAME}`;
  const description = 'Final Mobilya hesabınıza güvenle giriş yapın.';
  const canonical = absoluteUrl('/giris');

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="noindex, nofollow" />
      <link rel="canonical" href={canonical} />
    </>
  );
}
