import type { Metadata } from 'next';
import KategoriContent from './KategoriContent';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Category } from '@/lib/types';
import { absoluteUrl, buildBreadcrumbSchema, buildMetadata } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Tüm Kategoriler',
  description: 'Oturma odası, yatak odası, yemek odası ve daha fazlası için premium mobilya koleksiyonları.',
  path: '/kategori',
});

export default async function KategoriPage() {
  const supabase = createServerSupabaseClient();

  const [{ data: categories }, { data: productsByCategory }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .order('sort_order'),
    supabase
      .from('products')
      .select('category_id')
      .eq('is_active', true),
  ]);

  const counts = new Map<string, number>();
  for (const row of productsByCategory || []) {
    const categoryId = row.category_id as string | null;
    if (!categoryId) continue;
    counts.set(categoryId, (counts.get(categoryId) || 0) + 1);
  }

  const allCategories = (categories as Category[]) || [];
  const categoryList: Category[] = allCategories
    .filter((category) => !category.parent_id)
    .map((category) => {
      const childIds = allCategories
        .filter((item) => item.parent_id === category.id)
        .map((item) => item.id);

      const productCount = [category.id, ...childIds].reduce(
        (sum, categoryId) => sum + (counts.get(categoryId) || 0),
        0,
      );

      return {
        ...category,
        product_count: productCount,
      };
    });
  const categorySchemas = [
    buildBreadcrumbSchema([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Kategoriler', path: '/kategori' },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Final Mobilya Kategorileri',
      url: absoluteUrl('/kategori'),
      numberOfItems: categoryList.length,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      numberOfItems: categoryList.length,
      itemListElement: categoryList.map((category, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/kategori/${category.slug}`),
        name: category.name,
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categorySchemas),
        }}
      />
      <KategoriContent categories={categoryList} />
    </>
  );
}
