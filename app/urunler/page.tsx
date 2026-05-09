import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Product, Category, Campaign, ProductDiscount } from '@/lib/types';
import ProductsClient from './ProductsClient';
import {
  applyCampaignToProducts,
  applyProductDiscountsToProducts,
  pickActiveCampaign,
  resolveProductPricing,
} from '@/lib/campaigns';
import { absoluteUrl, cleanText, SITE_NAME } from '@/lib/site';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { kategori?: string; siralama?: string; arama?: string; indirim?: string; 'one-cikan'?: string };
}): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  let title = 'Ürünler';
  let description = 'Final Mobilya ürünleri, koltuk takımları, yatak odası, yemek odası ve dekorasyon koleksiyonlarını keşfedin.';
  let canonical = absoluteUrl('/urunler');
  let openGraphTitle = `${title} | ${SITE_NAME}`;

  if (searchParams.kategori) {
    const { data: category } = await supabase
      .from('categories')
      .select('name, slug, description')
      .eq('slug', searchParams.kategori)
      .maybeSingle();

    if (category) {
      title = `${category.name} Koleksiyonu`;
      description = cleanText(category.description, `${category.name} ürünleri ve kampanyaları.`);
      canonical = absoluteUrl(`/kategori/${category.slug}`);
      openGraphTitle = `${title} | ${SITE_NAME}`;
    }
  }

  if (searchParams.arama) {
    title = `"${searchParams.arama}" Arama Sonuçları`;
    description = `${searchParams.arama} için ${SITE_NAME} ürün arama sonuçları.`;
    openGraphTitle = `${title} | ${SITE_NAME}`;
  }

  if (searchParams.indirim === '1') {
    title = 'İndirimli Ürünler';
    description = `${SITE_NAME} kampanyalı ve indirimli ürünlerini keşfedin.`;
    openGraphTitle = `${title} | ${SITE_NAME}`;
  }

  if (searchParams['one-cikan'] === '1') {
    title = 'En Çok Satanlar';
    description = `${SITE_NAME} öne çıkan ve en çok tercih edilen ürünlerini inceleyin.`;
    openGraphTitle = `${title} | ${SITE_NAME}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: openGraphTitle,
      description,
      url: canonical,
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { kategori?: string; siralama?: string; arama?: string; indirim?: string; 'one-cikan'?: string };
}) {
  const supabase = createServerSupabaseClient();

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  const { data: campaignRows } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_active', true);

  const activeCampaign = pickActiveCampaign((campaignRows as Campaign[]) ?? []);

  // Build product query
  let query = supabase
    .from('products')
    .select('*, category:categories(*), variants:product_variants(*)')
    .eq('is_active', true);

  if (searchParams.kategori) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.kategori)
      .single();
    if (cat) {
      query = query.eq('category_id', cat.id);
    }
  }

  if (searchParams.arama) {
    query = query.or(`name.ilike.%${searchParams.arama}%,description.ilike.%${searchParams.arama}%`);
  }

  query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });

  const { data: products } = await query;
  const baseProducts = (products as Product[]) || [];
  const productIds = baseProducts.map((product) => product.id);
  const { data: productDiscountRows } = productIds.length
    ? await supabase
        .from('product_discounts')
        .select('*')
        .in('product_id', productIds)
    : { data: [] as ProductDiscount[] };

  let resolvedProducts = applyCampaignToProducts(baseProducts, activeCampaign);
  resolvedProducts = applyProductDiscountsToProducts(resolvedProducts, (productDiscountRows as ProductDiscount[]) || []);

  if (searchParams['one-cikan'] === '1') {
    resolvedProducts = resolvedProducts.filter((product) => product.is_featured);
  }

  if (searchParams.indirim === '1') {
    resolvedProducts = resolvedProducts.filter((product) => resolveProductPricing(product, product.active_campaign).hasDiscount);
  }

  switch (searchParams.siralama) {
    case 'fiyat-artan':
      resolvedProducts = [...resolvedProducts].sort(
        (a, b) => resolveProductPricing(a, a.active_campaign).finalPrice - resolveProductPricing(b, b.active_campaign).finalPrice
      );
      break;
    case 'fiyat-azalan':
      resolvedProducts = [...resolvedProducts].sort(
        (a, b) => resolveProductPricing(b, b.active_campaign).finalPrice - resolveProductPricing(a, a.active_campaign).finalPrice
      );
      break;
    case 'yeni':
      resolvedProducts = [...resolvedProducts].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      break;
    default:
      break;
  }

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Final Mobilya Ürünler',
            url: absoluteUrl('/urunler'),
            numberOfItems: resolvedProducts.length,
          }),
        }}
      />
      <ProductsClient
        products={resolvedProducts}
        categories={(categories as Category[]) || []}
        activeCategory={searchParams.kategori || null}
        activeSort={searchParams.siralama || null}
        searchQuery={searchParams.arama || null}
        showDiscountCountdown={searchParams.indirim === '1'}
      />
    </>
  );
}
