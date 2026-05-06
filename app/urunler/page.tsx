import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Product, Category, Campaign } from '@/lib/types';
import ProductsClient from './ProductsClient';
import { applyCampaignToProducts, pickActiveCampaign, resolveProductPricing } from '@/lib/campaigns';

export const metadata = {
  title: 'Ürünler',
  description: 'Final Mobilya premium mobilya koleksiyonu. Oturma grubu, yatak odası, yemek odası ve daha fazlası.',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { kategori?: string; siralama?: string; arama?: string };
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
  let resolvedProducts = applyCampaignToProducts((products as Product[]) || [], activeCampaign);

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
    <ProductsClient
      products={resolvedProducts}
      categories={(categories as Category[]) || []}
      activeCategory={searchParams.kategori || null}
      activeSort={searchParams.siralama || null}
      searchQuery={searchParams.arama || null}
    />
  );
}
