'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Product, Campaign, ProductDiscount, HomepageFeaturedTab } from '@/lib/types';
import {
  applyCampaignToProducts,
  applyProductDiscountsToProducts,
  pickActiveCampaign,
  resolveProductPricing,
} from '@/lib/campaigns';
import { getProductSticker } from '@/lib/product-stickers';
import DiscountCountdown from '@/components/ui/DiscountCountdown';

type TabKey = 'discounted' | 'bestsellers' | 'newest';

function formatPrice(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
  }).format(value);
}

function takeUniqueProducts(source: Product[], usedIds: Set<string>, count = 4) {
  const selection: Product[] = [];

  for (const product of source) {
    if (usedIds.has(product.id)) continue;
    usedIds.add(product.id);
    selection.push(product);
    if (selection.length === count) break;
  }

  return selection;
}

function completeUniqueProducts(selection: Product[], source: Product[], usedIds: Set<string>, count = 4) {
  if (selection.length >= count) return selection;

  for (const product of source) {
    if (usedIds.has(product.id)) continue;
    usedIds.add(product.id);
    selection.push(product);
    if (selection.length === count) break;
  }

  return selection;
}

interface FeaturedProductsProps {
  tabs: HomepageFeaturedTab[];
}

export default function FeaturedProducts({ tabs }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('discounted');

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient();
      const [{ data: productRows }, { data: campaignRows }, { data: productDiscountRows }] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(60),
        supabase.from('campaigns').select('*').eq('is_active', true),
        supabase.from('product_discounts').select('*'),
      ]);

      const activeCampaign = pickActiveCampaign((campaignRows as Campaign[]) || []);
      const campaignProducts = applyCampaignToProducts((productRows as Product[]) || [], activeCampaign);
      setProducts(applyProductDiscountsToProducts(campaignProducts, (productDiscountRows as ProductDiscount[]) || []));
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const groupedProducts = useMemo(() => {
    const newest = [...products].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const timedDiscounted = [...products]
      .filter((product) => !!product.active_product_discount)
      .sort((a, b) => {
        const aEnd = a.active_product_discount?.end_date ? new Date(a.active_product_discount.end_date).getTime() : 0;
        const bEnd = b.active_product_discount?.end_date ? new Date(b.active_product_discount.end_date).getTime() : 0;
        return aEnd - bEnd;
      });
    const discounted = [...products]
      .filter((product) => resolveProductPricing(product, product.active_campaign).hasDiscount && !product.active_product_discount)
      .sort(
        (a, b) =>
          resolveProductPricing(b, b.active_campaign).discountPercent -
          resolveProductPricing(a, a.active_campaign).discountPercent,
      );
    const bestsellers = [...products]
      .filter((product) => product.is_featured)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const usedIds = new Set<string>();
    const discountedSelection = completeUniqueProducts(
      takeUniqueProducts(timedDiscounted, usedIds, 4),
      discounted,
      usedIds,
      4,
    );
    const bestsellerSelection = completeUniqueProducts(
      takeUniqueProducts(bestsellers, usedIds, 4),
      newest,
      usedIds,
      4,
    );
    const newestSelection = completeUniqueProducts(
      takeUniqueProducts(newest, usedIds, 4),
      newest,
      usedIds,
      4,
    );

    return {
      discounted: discountedSelection,
      bestsellers: bestsellerSelection,
      newest: newestSelection,
    };
  }, [products]);

  const activeTabConfig = tabs.find((tab) => tab.key === activeTab) || tabs[0];
  const visibleProducts = groupedProducts[activeTab];

  return (
    <section className="bg-white py-16 lg:py-24 border-t border-stone/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-stone/20">
          <div className="grid grid-cols-1 gap-2 pb-4 md:grid-cols-3 md:gap-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  onMouseEnter={() => setActiveTab(tab.key)}
                  onFocus={() => setActiveTab(tab.key)}
                  className={`relative pb-4 text-left text-2xl sm:text-3xl font-semibold transition-colors duration-200 ${
                    isActive ? 'text-[#1f5aa8]' : 'text-brown/35 hover:text-charcoal'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[3px] rounded-full bg-[#1f5aa8] transition-all duration-300 ${
                      isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-[420px] rounded-[2rem] border border-stone/20 bg-stone/10 animate-pulse" />
              ))
            : visibleProducts.map((product) => {
                const pricing = resolveProductPricing(product, product.active_campaign);
                const isNewTab = activeTab === 'newest';
                const sticker = getProductSticker(product.slug);

                return (
                  <Link
                    key={product.id}
                    href={`/urun/${product.slug}`}
                    className="group rounded-[2rem] border border-stone/20 bg-white p-3 shadow-[0_18px_40px_rgba(28,28,26,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(28,28,26,0.1)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-cream">
                      <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
                        {sticker ? (
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white ${
                            sticker.kind === 'advantage' ? 'bg-[#2f8f62]' : 'bg-[#f08a24]'
                          }`}>
                            {sticker.label}
                          </span>
                        ) : null}
                        {pricing.discountPercent > 0 ? (
                          <span className="rounded-full bg-[#d25842] px-3 py-1 text-xs font-semibold text-white">
                            %{pricing.discountPercent} İndirim
                          </span>
                        ) : isNewTab ? (
                          <span className="rounded-full bg-[#1f5aa8] px-3 py-1 text-xs font-semibold text-white">
                            Yeni Ürün
                          </span>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        aria-label="Favorilere ekle"
                        onClick={(event) => event.preventDefault()}
                        className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-charcoal/40 transition-colors hover:text-red-500"
                      >
                        <Heart className="w-5 h-5" />
                      </button>

                      <Image
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    <div className="px-2 pb-3 pt-5 text-center">
                      <p className="text-xs uppercase tracking-[0.18em] text-brown/40">
                        {product.category?.name || 'Final Mobilya'}
                      </p>
                      <h3 className="mt-3 text-xl font-medium text-charcoal line-clamp-2 min-h-[3.5rem]">
                        {product.name}
                      </h3>
                      <div className="mt-4 text-2xl font-semibold text-charcoal">
                        {pricing.compareAtPrice ? (
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <span className="text-[#d25842]">{formatPrice(pricing.finalPrice)}</span>
                            <span className="text-lg font-normal text-brown/35 line-through">
                              {formatPrice(pricing.compareAtPrice)}
                            </span>
                          </div>
                        ) : (
                          <span>{formatPrice(pricing.finalPrice)}</span>
                        )}
                      </div>
                      {activeTab === 'discounted' && product.active_product_discount?.end_date ? (
                        <div className="mt-3 flex justify-center">
                          <DiscountCountdown
                            endDate={product.active_product_discount.end_date}
                            note="İndirimli fiyat için süre devam ediyor."
                          />
                        </div>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={activeTabConfig.href}
            className="inline-flex items-center justify-center border border-charcoal px-8 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-charcoal transition-colors duration-300 hover:bg-charcoal hover:text-white"
          >
            {activeTabConfig.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
