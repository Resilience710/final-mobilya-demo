import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CategoryClientPage from './CategoryClientPage';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Product, Category, Campaign, ProductDiscount } from '@/lib/types';
import { applyCampaignToProducts, applyProductDiscountsToProducts, pickActiveCampaign } from '@/lib/campaigns';
import { absoluteUrl, buildBreadcrumbSchema, buildMetadata, cleanText } from '@/lib/site';

interface Props {
  params: { slug: string };
  searchParams: { sort?: string; color?: string };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: cat } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!cat) return {};
  const title = cat.name;
  const description = cleanText(cat.description, `${cat.name} koleksiyonunu keşfedin.`);
  const hasFacetedNavigation = Boolean(searchParams.sort || searchParams.color);

  return buildMetadata({
    title,
    description,
    path: `/kategori/${cat.slug}`,
    image: cat.image_url || undefined,
    imageAlt: cat.name,
    noIndex: hasFacetedNavigation,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const supabase = createServerSupabaseClient();
  
  const { data: cat } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!cat) notFound();

  const { data: products } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('category_id', cat.id)
    .eq('is_active', true);

  const { data: campaignRows } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_active', true);

  const activeCampaign = pickActiveCampaign((campaignRows as Campaign[]) ?? []);
  const productList = (products as Product[]) || [];
  const productIds = productList.map((product) => product.id);
  const { data: productDiscountRows } = productIds.length
    ? await supabase
        .from('product_discounts')
        .select('*')
        .in('product_id', productIds)
    : { data: [] as ProductDiscount[] };
  const resolvedProducts = applyProductDiscountsToProducts(
    applyCampaignToProducts(productList, activeCampaign),
    (productDiscountRows as ProductDiscount[]) || [],
  );
  const categorySchemas = [
    buildBreadcrumbSchema([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Kategoriler', path: '/kategori' },
      { name: (cat as Category).name, path: `/kategori/${(cat as Category).slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: (cat as Category).name,
      description: cleanText((cat as Category).description, `${(cat as Category).name} koleksiyonunu inceleyin.`),
      url: absoluteUrl(`/kategori/${(cat as Category).slug}`),
      numberOfItems: resolvedProducts.length,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      numberOfItems: resolvedProducts.length,
      itemListElement: resolvedProducts.slice(0, 12).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/urun/${product.slug}`),
        name: product.name,
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
      <CategoryClientPage category={cat as Category} products={resolvedProducts} />
    </>
  );
}
