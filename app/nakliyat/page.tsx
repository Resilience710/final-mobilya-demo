import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ShippingRule } from '@/lib/types';
import { absoluteUrl, buildBreadcrumbSchema, buildMetadata, buildWebPageSchema } from '@/lib/site';
import NakliyatClient from './NakliyatClient';

const pageTitle = 'Nakliyat Ücretleri';
const pageDescription = 'Final Mobilya nakliyat ücretlerini il ve ilçe bazında kontrol edin.';

export const metadata: Metadata = buildMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/nakliyat',
});

export default async function NakliyatPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('shipping_rules')
    .select('*')
    .eq('is_active', true)
    .order('city')
    .order('district');
  const rules = (data as ShippingRule[]) || [];
  const shippingSchemas = [
    buildBreadcrumbSchema([
      { name: 'Ana Sayfa', path: '/' },
      { name: pageTitle, path: '/nakliyat' },
    ]),
    buildWebPageSchema(pageTitle, pageDescription, '/nakliyat'),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      numberOfItems: rules.length,
      itemListElement: rules.slice(0, 25).map((rule, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: rule.district ? `${rule.city} / ${rule.district}` : rule.city,
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(shippingSchemas),
        }}
      />
      <NakliyatClient rules={rules} />
    </>
  );
}
