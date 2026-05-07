'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Product, Campaign } from '@/lib/types';
import { applyCampaignToProducts, pickActiveCampaign, resolveProductPricing } from '@/lib/campaigns';

function formatPrice(n: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);
}

export default function Bestsellers() {
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
          .limit(5),
        supabase.from('campaigns').select('*').eq('is_active', true),
      ]);

      let rows = (productRows as Product[]) || [];
      // Eğer öne çıkan yeterli yoksa rastgele aktif ürünlerle tamamla
      if (rows.length < 5) {
        const { data: extra } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .not('id', 'in', `(${rows.map(r => `"${r.id}"`).join(',') || '""'})`)
          .limit(5 - rows.length);
        rows = [...rows, ...((extra as Product[]) || [])];
      }

      const activeCampaign = pickActiveCampaign((campaignRows as Campaign[]) || []);
      setProducts(applyCampaignToProducts(rows, activeCampaign));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <section className="bg-cream py-16 lg:py-24 border-t border-stone/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-3xl sm:text-4xl text-charcoal mb-12 tracking-wide">
          EN ÇOK SATANLAR
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-stone/10 aspect-[3/4] animate-pulse" />
              ))
            : products.map(product => {
                const pricing = resolveProductPricing(product, product.active_campaign);
                return (
                  <Link key={product.id} href={`/urun/${product.slug}`} className="group block">
                    <div className="relative bg-stone/10 aspect-[3/4] overflow-hidden mb-4">
                      {pricing.discountPercent > 0 && (
                        <span className="absolute top-3 left-3 z-10 bg-[#c94f3d] text-white text-[10px] font-bold px-2 py-1 tracking-wider">
                          -%{pricing.discountPercent}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label="Favorilere ekle"
                        onClick={(e) => e.preventDefault()}
                        className="absolute top-3 right-3 z-10 text-charcoal/30 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                      <Image
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-center text-[10px] text-brown/40 tracking-wider mb-1">
                      {product.category?.name || 'Final Mobilya'}
                    </p>
                    <h3 className="text-center text-sm font-medium text-charcoal uppercase tracking-wide mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="text-center text-sm">
                      {pricing.compareAtPrice ? (
                        <>
                          <span className="text-[#c94f3d] font-medium">{formatPrice(pricing.finalPrice)}</span>
                          <span className="ml-2 text-brown/40 line-through">{formatPrice(pricing.compareAtPrice)}</span>
                        </>
                      ) : (
                        <span className="text-charcoal font-medium">{formatPrice(pricing.finalPrice)}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/urunler?one-cikan=1"
            className="inline-block border border-charcoal px-8 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-charcoal hover:bg-charcoal hover:text-white transition-colors duration-300"
          >
            TÜM ÇOK SATANLARI GÖR
          </Link>
        </div>
      </div>
    </section>
  );
}
