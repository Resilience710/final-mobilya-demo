import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CategoryClientPage from './CategoryClientPage';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Product, Category, Campaign } from '@/lib/types';
import { applyCampaignToProducts, pickActiveCampaign } from '@/lib/campaigns';

interface Props {
  params: { slug: string };
  searchParams: { sort?: string; color?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: cat } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!cat) return {};
  return { title: cat.name, description: cat.description };
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
  const resolvedProducts = applyCampaignToProducts((products as Product[]) || [], activeCampaign);

  return <CategoryClientPage category={cat as Category} products={resolvedProducts} />;
}
