'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { HeroSlide } from '@/lib/types';

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: '1',
    sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1920&q=85',
    title1: 'ALANINIZI',
    title2: 'DÖNÜŞTÜRÜN',
    italic_text: 'Hayalinizdeki Mobilya',
    cta_text: 'OTURMA ODALARIMIZI KEŞFEDİN',
    cta_href: '/kategori/oturma-grubu',
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    sort_order: 2,
    image_url: 'https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?w=1920&q=85',
    title1: 'ZARAFETLE',
    title2: 'YAŞAYIN',
    italic_text: 'Premium Tasarımın İmzası',
    cta_text: 'YATAK ODALARINI GÖRÜN',
    cta_href: '/kategori/yatak-odasi',
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    sort_order: 3,
    image_url: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1920&q=85',
    title1: 'EVİNİZE',
    title2: 'DEĞER KATIN',
    italic_text: 'Yıllara Meydan Okuyan İşçilik',
    cta_text: 'TÜM ÜRÜNLERİ GÖR',
    cta_href: '/urunler',
    is_active: true,
    created_at: '',
    updated_at: '',
  },
];

export default function Hero({ slides }: { slides?: HeroSlide[] }) {
  const activeSlides = (slides && slides.length > 0) ? slides : DEFAULT_SLIDES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % activeSlides.length), 6500);
    return () => clearInterval(t);
  }, [activeSlides.length]);

  const next = () => setIndex(i => (i + 1) % activeSlides.length);
  const prev = () => setIndex(i => (i - 1 + activeSlides.length) % activeSlides.length);
  const slide = activeSlides[index] ?? activeSlides[0];

  return (
    <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden bg-charcoal">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          {slide.image_url && (
            <Image
              src={slide.image_url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-charcoal/35" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`txt-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <h1 className="font-serif text-white leading-[0.95] tracking-tight">
                <span className="block text-5xl sm:text-7xl md:text-8xl">{slide.title1}</span>
                <span className="block text-5xl sm:text-7xl md:text-8xl">{slide.title2}</span>
              </h1>
              <p className="font-serif italic text-white/85 text-2xl sm:text-3xl mt-8 mb-10">
                {slide.italic_text}
              </p>
              <Link
                href={slide.cta_href}
                className="inline-block bg-white px-6 sm:px-10 py-3 sm:py-4 text-[9px] sm:text-[11px] font-semibold tracking-[0.1em] sm:tracking-[0.22em] uppercase text-charcoal hover:bg-gold hover:text-white transition-colors duration-300 max-w-[260px] sm:max-w-none text-center"
              >
                {slide.cta_text}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 border border-white/40 text-white/80 hover:text-white hover:border-white flex items-center justify-center transition-colors"
            aria-label="Önceki"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 border border-white/40 text-white/80 hover:text-white hover:border-white flex items-center justify-center transition-colors"
            aria-label="Sonraki"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {activeSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60 w-2'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
