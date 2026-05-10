import type { Metadata } from 'next';
import BayilikClient from './BayilikClient';
import { absoluteUrl, buildBreadcrumbSchema, buildMetadata, buildWebPageSchema, SITE_NAME } from '@/lib/site';

const pageTitle = 'Bayilik Başvurusu';
const pageDescription =
  'Final Mobilya bayilik programı, bayi avantajları ve online bayilik başvuru formu.';

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/bayilik',
});

export default function BayilikPage() {
  const schemas = [
    buildBreadcrumbSchema([
      { name: 'Ana Sayfa', path: '/' },
      { name: pageTitle, path: '/bayilik' },
    ]),
    buildWebPageSchema(pageTitle, pageDescription, '/bayilik'),
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${SITE_NAME} Bayilik Programı`,
      serviceType: 'Mobilya bayilik ve iş ortaklığı programı',
      areaServed: 'TR',
      provider: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: absoluteUrl('/'),
      },
      url: absoluteUrl('/bayilik'),
      description: pageDescription,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />
      <BayilikClient />
    </>
  );
}
