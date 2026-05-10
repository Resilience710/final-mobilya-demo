'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ArrowUpRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { resolveProductPricing } from '@/lib/campaigns';
import { getProductSticker } from '@/lib/product-stickers';
import DiscountCountdown from '@/components/ui/DiscountCountdown';

interface Props {
  product: Product;
  viewMode?: 'grid' | 'list';
  showDiscountCountdown?: boolean;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(price);
}

export default function ProductCard({ product, viewMode = 'grid', showDiscountCountdown = false }: Props) {
  const { addItem } = useCart();
  const pricing = resolveProductPricing(product, product.active_campaign);
  const campaignLabel = product.active_campaign?.badge_text || (pricing.appliedCampaign ? 'Sezon Fırsatı' : null);
  const sticker = getProductSticker(product.slug);
  const shouldShowCountdown = !!product.active_product_discount?.end_date && (showDiscountCountdown || pricing.appliedTimedDiscount);

  if (viewMode === 'list') {
    return (
      <div className="group relative overflow-hidden rounded-[28px] border border-stone/25 bg-white transition-all duration-500 hover:-translate-y-0.5 hover:shadow-product-hover">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(196,164,90,0.12),_transparent_40%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="flex flex-col md:flex-row">
          <Link href={`/urun/${product.slug}`} className="relative h-72 w-full overflow-hidden md:h-auto md:w-56 md:flex-shrink-0">
            <Image
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 224px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/35 via-transparent to-transparent" />
            {sticker ? (
              <span className={`absolute left-4 top-4 z-10 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-lg ${
                sticker.kind === 'advantage' ? 'bg-[#2f8f62]' : 'bg-[#f08a24]'
              }`}>
                {sticker.label}
              </span>
            ) : null}
          </Link>

          <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                  {product.category?.name || 'Mobilya'}
                </span>
                {campaignLabel ? (
                  <span className="rounded-full bg-charcoal px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                    {campaignLabel}
                  </span>
                ) : null}
              </div>
              <Link href={`/urun/${product.slug}`}>
                <h3 className="font-serif text-2xl text-charcoal transition-colors group-hover:text-gold">{product.name}</h3>
              </Link>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brown/65">
                {product.short_description || product.description}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-2xl text-charcoal">{formatPrice(pricing.finalPrice)}</span>
                  {pricing.compareAtPrice ? (
                    <span className="text-sm text-brown/40 line-through">{formatPrice(pricing.compareAtPrice)}</span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-brown/55">
                  {pricing.discountPercent > 0 ? <span>%{pricing.discountPercent} avantaj</span> : null}
                  {product.stock_quantity > 0 && product.stock_quantity <= 5 ? <span>Son {product.stock_quantity} adet</span> : null}
                </div>
                {shouldShowCountdown && product.active_product_discount?.end_date ? (
                  <div className="mt-3">
                    <DiscountCountdown
                      endDate={product.active_product_discount.end_date}
                      note="İndirimli fiyat için süre devam ediyor."
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <button type="button" className="rounded-full border border-stone/30 p-3 text-charcoal transition-colors hover:border-red-300 hover:text-red-500">
                  <Heart className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    addItem(product);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gold"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Sepete Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-stone/20 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-product-hover">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(196,164,90,0.18),_transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <Link href={`/urun/${product.slug}`} className="block">
        <div className="relative aspect-[0.82] overflow-hidden">
          <Image
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              {sticker ? (
                <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-lg ${
                  sticker.kind === 'advantage' ? 'bg-[#2f8f62]' : 'bg-[#f08a24]'
                }`}>
                  {sticker.label}
                </span>
              ) : null}
              {pricing.discountPercent > 0 ? (
                <span className="rounded-full bg-[#c94f3d] px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  %{pricing.discountPercent}
                </span>
              ) : null}
              {campaignLabel ? (
                <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  {campaignLabel}
                </span>
              ) : null}
            </div>

            <button type="button" className="rounded-full bg-white/85 p-2.5 text-charcoal backdrop-blur-sm transition-transform duration-300 hover:scale-105 hover:bg-white">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="translate-y-0 opacity-100 transition-all duration-500 sm:translate-y-6 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  addItem(product);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-gold hover:text-white"
              >
                <ShoppingBag className="h-4 w-4" />
                Hızlı Sepet
              </button>
            </div>
          </div>
        </div>

        <div className="relative p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              {product.category?.name || 'Mobilya'}
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-brown/45">
              İncele <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>

          <h3 className="font-serif text-xl text-charcoal transition-colors group-hover:text-gold">{product.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brown/60">
            {product.short_description || product.description}
          </p>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl text-charcoal">{formatPrice(pricing.finalPrice)}</span>
                {pricing.compareAtPrice ? (
                  <span className="text-sm text-brown/40 line-through">{formatPrice(pricing.compareAtPrice)}</span>
                ) : null}
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-brown/48">
                {pricing.appliedCampaign ? <span>Kampanya uygulandı</span> : null}
                {product.stock_quantity > 0 && product.stock_quantity <= 5 ? <span>Son {product.stock_quantity} adet</span> : null}
              </div>
              {shouldShowCountdown && product.active_product_discount?.end_date ? (
                <div className="mt-3">
                  <DiscountCountdown
                    endDate={product.active_product_discount.end_date}
                    note="İndirimli fiyat için süre devam ediyor."
                  />
                </div>
              ) : null}
            </div>
            <motion.div
              initial={{ opacity: 0.75 }}
              whileHover={{ opacity: 1, scale: 1.04 }}
              className="rounded-2xl bg-beige px-3 py-2 text-right"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-brown/45">Stüdyo Seçimi</p>
              <p className="mt-1 text-xs font-medium text-charcoal">{product.is_featured ? 'Öne Çıkan' : 'Yeni Sezon'}</p>
            </motion.div>
          </div>
        </div>
      </Link>
    </div>
  );
}
