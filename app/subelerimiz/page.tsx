import type { Metadata } from 'next';
import SubelerimizClient from './SubelerimizClient';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Store } from '@/lib/types';
import { absoluteUrl, buildBreadcrumbSchema, buildMetadata, buildWebPageSchema } from '@/lib/site';

const pageTitle = 'Şubelerimiz';
const pageDescription =
  'Final Mobilya mağazaları, adres bilgileri ve size en yakın şubeye ulaşım detayları.';

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/subelerimiz',
});

export default async function SubelerimizPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('stores')
    .select('id, name, city, address, phone, map_url')
    .eq('is_active', true)
    .order('sort_order');

  const stores = (data as Store[]) || [];
  const schemas = [
    buildBreadcrumbSchema([
      { name: 'Ana Sayfa', path: '/' },
      { name: pageTitle, path: '/subelerimiz' },
    ]),
    buildWebPageSchema(pageTitle, pageDescription, '/subelerimiz'),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      numberOfItems: stores.length,
      itemListElement: stores.map((store, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${store.name} - ${store.city}`,
      })),
    },
    ...stores.map((store) => ({
      '@context': 'https://schema.org',
      '@type': 'FurnitureStore',
      name: store.name,
      telephone: store.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: store.address,
        addressLocality: store.city,
        addressCountry: 'TR',
      },
      url: absoluteUrl('/subelerimiz'),
      hasMap: store.map_url || undefined,
    })),
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
      <SubelerimizClient initialStores={stores} />
    </>
  );
}
