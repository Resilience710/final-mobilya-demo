'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Flame } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Product, Campaign } from '@/lib/types';
import ProductCard from '@/components/product/ProductCard';
import { applyCampaignToProducts, pickActiveCampaign } from '@/lib/campaigns';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient();

      const [{ data: productRows }, { data: campaignRows }] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .eq('is_featured', true)
          .limit(4),
        supabase
          .from('campaigns')
          .select('*')
          .eq('is_active', true),
      ]);

      const activeCampaign = pickActiveCampaign((campaignRows as Campaign[]) || []);
      setProducts(applyCampaignToProducts((productRows as Product[]) || [], activeCampaign));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <section className="relative overflow-hidden bg-beige py-20 lg:py-28">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle,_rgba(196,164,90,0.16),_transparent_65%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
        >
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
              <Flame className="h-3.5 w-3.5" />
              Öne Çıkan Koleksiyon
            </span>
            <h2 className="font-serif text-display-sm text-charcoal">
              Daha çok bakan,
              <br />
              daha hızlı karar verilen ürünler
            </h2>
          </div>
          <div className="rounded-[30px] border border-white/70 bg-white/70 p-5 shadow-card backdrop-blur-sm lg:ml-auto lg:max-w-xl">
            <p className="text-sm leading-relaxed text-brown/66">
              Bu seçki; formu güçlü, fotoğrafı kuvvetli ve kampanya diliyle birlikte daha iyi çalışan ürünleri öne çıkarıyor. Demo gösteriminde en net etkiyi burada alırsın.
            </p>
            <Link
              href="/urunler"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-charcoal transition-colors hover:text-gold"
            >
              Tümünü Gör
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[28px] bg-white">
                <div className="aspect-[0.82] animate-pulse bg-stone/20" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 animate-pulse rounded bg-stone/20" />
                  <div className="h-6 w-40 animate-pulse rounded bg-stone/20" />
                  <div className="h-4 w-full animate-pulse rounded bg-stone/20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
