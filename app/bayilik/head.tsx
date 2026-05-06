import { absoluteUrl, SITE_NAME } from '@/lib/site';

export default function Head() {
  const title = `Bayilik Başvurusu | ${SITE_NAME}`;
  const description =
    'Final Mobilya bayilik programı, avantajlar ve online bayi başvuru formu.';
  const canonical = absoluteUrl('/bayilik');

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
    </>
  );
}
