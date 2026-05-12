import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Product, Campaign, ProductDiscount, HomepageCollectionSection } from '@/lib/types';
import {
  applyCampaignToProducts,
  applyProductDiscountsToProducts,
  pickActiveCampaign,
} from '@/lib/campaigns';

interface AllProductsSectionProps {
  content: HomepageCollectionSection;
}

export default async function AllProductsSection({ content }: AllProductsSectionProps) {
  const supabase = createServerSupabaseClient();

  const [{ data: productRows }, { data: campaignRows }, { data: productDiscountRows }] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('campaigns').select('*').eq('is_active', true),
    supabase.from('product_discounts').select('*'),
  ]);

  const activeCampaign = pickActiveCampaign((campaignRows as Campaign[]) || []);
  const campaignProducts = applyCampaignToProducts((productRows as Product[]) || [], activeCampaign);
  const products = applyProductDiscountsToProducts(
    campaignProducts,
    (productDiscountRows as ProductDiscount[]) || [],
  );

  return (
    <section className="bg-cream py-16 lg:py-24 border-t border-stone/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1f5aa8]/75">
            {content.eyebrow}
          </p>
          <h2 className="mt-4 font-serif text-4xl text-charcoal sm:text-5xl">
            {content.heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-brown/60 sm:text-lg">
            {content.description}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={content.ctaHref}
            className="inline-flex items-center justify-center border border-charcoal px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-charcoal transition-colors duration-300 hover:bg-charcoal hover:text-white"
          >
            {content.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
