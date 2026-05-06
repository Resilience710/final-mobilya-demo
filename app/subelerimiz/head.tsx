import { absoluteUrl, SITE_NAME } from '@/lib/site';

export default function Head() {
  const title = `Şubelerimiz | ${SITE_NAME}`;
  const description =
    'Final Mobilya mağazaları, adres bilgileri ve size en yakın şubeye ulaşım detayları.';
  const canonical = absoluteUrl('/subelerimiz');

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
