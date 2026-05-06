import { absoluteUrl, SITE_NAME } from '@/lib/site';

export default function Head() {
  return (
    <>
      <title>{`Sipariş Onayı | ${SITE_NAME}`}</title>
      <meta name="robots" content="noindex, nofollow" />
      <link rel="canonical" href={absoluteUrl('/siparis/onay')} />
    </>
  );
}
