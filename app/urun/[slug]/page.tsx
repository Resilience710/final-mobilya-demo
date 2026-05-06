import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Product, Campaign } from '@/lib/types';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { applyCampaignToProduct, applyCampaignToProducts, pickActiveCampaign } from '@/lib/campaigns';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createServerSupabaseClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description')
    .eq('slug', params.slug)
    .single();

  if (!product) return { title: 'Ürün Bulunamadı' };

  return {
    title: product.name,
    description: product.short_description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const supabase = createServerSupabaseClient();
  const { data: campaignRows } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_active', true);

  const activeCampaign = pickActiveCampaign((campaignRows as Campaign[]) ?? []);

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*), variants:product_variants(*)')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!product) {
    notFound();
  }

  // Related products
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .eq('is_active', true)
    .limit(4);

  return (
    <ProductDetailClient
      product={applyCampaignToProduct(product as Product, activeCampaign)}
      relatedProducts={applyCampaignToProducts((relatedProducts as Product[]) || [], activeCampaign)}
    />
  );
}
