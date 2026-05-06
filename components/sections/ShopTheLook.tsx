'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Product, Campaign } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { applyCampaignToProducts, pickActiveCampaign, resolveProductPricing } from '@/lib/campaigns';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(price);
}

export default function ShopTheLook() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const [{ data: productRows }, { data: campaignRows }] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .limit(3)
          .order('created_at', { ascending: false }),
        supabase
          .from('campaigns')
          .select('*')
          .eq('is_active', true),
      ]);

      const activeCampaign = pickActiveCampaign((campaignRows as Campaign[]) || []);
      setProducts(applyCampaignToProducts((productRows as Product[]) || [], activeCampaign));
    };
    fetch();
  }, []);

  return (
    <section className="relative overflow-hidden bg-cream py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-10 h-64 bg-[radial-gradient(circle,_rgba(196,164,90,0.12),_transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end"
        >
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              Stil Kompozisyonu
            </span>
            <h2 className="font-serif text-display-sm text-charcoal">
              Bir mekana <em className="not-italic text-gold">dokunup</em>
              <br />
              tamamını dönüştüren parçalar
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-brown/65 lg:ml-auto">
            Sadece ürün değil, birlikte çalışan bir atmosfer gösteriyoruz. Son eklenen parçaları editoryal bir kompozisyon gibi seçip tek blokta sunuyoruz.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {products[0] ? (
            <FeatureLookCard product={products[0]} onAdd={() => addItem(products[0])} />
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {products.slice(1).map((product, index) => (
              <LookCard key={product.id} product={product} onAdd={() => addItem(product)} delay={index * 0.08} />
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/urunler" className="inline-flex items-center gap-2 text-sm font-medium text-brown transition-colors hover:text-gold">
            Tüm Ürünleri Gör
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeatureLookCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const pricing = resolveProductPricing(product, product.active_campaign);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-[32px] bg-charcoal text-white shadow-product-hover"
    >
      <Link href={`/urun/${product.slug}`} className="block">
        <div className="relative aspect-[1.22] overflow-hidden">
          <Image
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/92 via-charcoal/55 to-charcoal/22" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(196,164,90,0.28),_transparent_35%)]" />

          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <span className="rounded-full border border-white/18 bg-black/28 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                {product.active_campaign?.badge_text || 'Yeni Kurgulanan Alan'}
              </span>
              {pricing.discountPercent > 0 ? (
                <span className="rounded-full bg-[#cc5d49] px-4 py-2 text-sm font-semibold text-white">
                  %{pricing.discountPercent}
                </span>
              ) : null}
            </div>

            <div className="max-w-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]">{product.category?.name || 'Mobilya'}</p>
              <h3 className="mt-4 font-serif text-3xl md:text-4xl leading-tight [text-shadow:0_5px_18px_rgba(0,0,0,0.55)]">{product.name}</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/86 [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]">
                {product.short_description || product.description}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="font-serif text-2xl text-white">{formatPrice(pricing.finalPrice)}</span>
                {pricing.compareAtPrice ? <span className="text-sm text-white/62 line-through">{formatPrice(pricing.compareAtPrice)}</span> : null}
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-6 py-4 md:px-8">
        <div className="text-xs uppercase tracking-[0.2em] text-white/72">Editör seçimi</div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-gold hover:text-white"
        >
          <ShoppingBag className="h-4 w-4" />
          Sepete Ekle
        </button>
      </div>
    </motion.div>
  );
}

function LookCard({ product, onAdd, delay }: { product: Product; onAdd: () => void; delay: number }) {
  const pricing = resolveProductPricing(product, product.active_campaign);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group overflow-hidden rounded-[28px] border border-stone/25 bg-white shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-product-hover"
    >
      <Link href={`/urun/${product.slug}`} className="block">
        <div className="relative aspect-[1.2] overflow-hidden">
          <Image
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 50vw, 30vw"
          />
        </div>
      </Link>
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">{product.category?.name || 'Mobilya'}</p>
        <Link href={`/urun/${product.slug}`}>
          <h3 className="mt-2 font-serif text-xl text-charcoal transition-colors group-hover:text-gold">{product.name}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brown/62">{product.short_description || product.description}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl text-charcoal">{formatPrice(pricing.finalPrice)}</span>
              {pricing.compareAtPrice ? <span className="text-xs text-brown/40 line-through">{formatPrice(pricing.compareAtPrice)}</span> : null}
            </div>
            {pricing.appliedCampaign ? <p className="mt-1 text-xs text-brown/45">Kampanya fiyatı</p> : null}
          </div>
          <button
            onClick={onAdd}
            className="rounded-full bg-charcoal p-3 text-white transition-colors hover:bg-gold"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
