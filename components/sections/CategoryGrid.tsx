'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Category } from '@/lib/types';

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      setCategories((data as Category[]) || []);
    };
    fetch();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#f4efe7] py-20 lg:py-28">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle,_rgba(196,164,90,0.14),_transparent_65%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
        >
          <div>
            <span className="mb-4 block text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">Kategoriler</span>
            <h2 className="font-serif text-display-sm text-charcoal">
              Aynı evi tek bir stile değil,
              <em className="not-italic text-gold"> uyumlu sahnelere</em> bölüyoruz
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-brown/66 lg:ml-auto">
            Kategori kartlarını sadece liste değil, mekana giriş noktası gibi kurguladık. Her blok kendi hissini taşıyor; kullanıcı önce atmosferi, sonra ürünü seçiyor.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12">
          {categories.map((category, index) => {
            const isLarge = index % 5 === 0 || index % 5 === 3;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className={isLarge ? 'lg:col-span-7' : 'lg:col-span-5'}
              >
                <Link
                  href={`/urunler?kategori=${category.slug}`}
                  className={`group relative block overflow-hidden rounded-[30px] ${
                    isLarge ? 'aspect-[1.55]' : 'aspect-[1.05]'
                  }`}
                >
                  <Image
                    src={category.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900'}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,12,0.16)_0%,rgba(12,12,12,0.38)_35%,rgba(12,12,12,0.9)_100%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.1),_transparent_30%)]" />

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <div className="rounded-[24px] border border-white/70 bg-[#f8f3ea]/95 p-4 shadow-xl shadow-black/20 backdrop-blur-md sm:p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-charcoal px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-md">
                          Koleksiyon
                        </span>
                        {typeof category.product_count === 'number' ? (
                          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-charcoal">
                            {category.product_count} ürün
                          </span>
                        ) : null}
                      </div>

                      <h3 className="font-serif text-2xl text-charcoal transition-colors group-hover:text-gold">{category.name}</h3>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-brown/90">
                        {category.description || 'Bu kategoriye ait yeni nesil yaşam alanı çözümlerini keşfedin.'}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-charcoal">
                        Koleksiyonu Aç
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
