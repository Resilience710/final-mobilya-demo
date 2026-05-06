'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Sofa, Truck, Ruler } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1800&q=85',
    href: '/urunler',
    label: 'YENİ KOLEKSİYON',
    headline: 'Mekanın Ritmini\nYükselten Parçalar',
    sub: 'Işık, doku ve hacmi birlikte düşünen koleksiyonlarla oturma alanlarını daha sıcak, daha rafine ve daha yaşanır kuruyoruz.',
    cta: 'Koleksiyonu Keşfet',
    accent: 'Oturma gruplarında stüdyo seçkisi',
    stat: '42 yeni ürün',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1800&q=85',
    href: '/urunler?kategori=yatak-odasi',
    label: 'YATAK ODASI',
    headline: 'Dinlenen Göz İçin\nDaha Yumuşak Bir Sahne',
    sub: 'Daha sakin renk geçişleri, daha tok malzemeler ve gündelik kullanımda rahatlık sunan dengeli bir kurgu.',
    cta: 'Yatak Odasını Gör',
    accent: 'Katmanlı tekstil ve masif detaylar',
    stat: '12 özel takım',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1800&q=85',
    href: '/urunler?kategori=yemek-odasi',
    label: 'YEMEK ODASI',
    headline: 'Sofrada Kalan\nİlk İzlenim',
    sub: 'Davet hissini büyüten tablalar, güçlü siluetler ve gündelik kullanıma uygun zarif bitişler.',
    cta: 'Yemek Odasını İncele',
    accent: 'Daha tok form, daha sıcak atmosfer',
    stat: '8 sahne kombinasyonu',
  },
];

const highlightChips = [
  { icon: Sofa, label: 'İç mimar dokunuşu' },
  { icon: Ruler, label: 'Özel ölçü seçenekleri' },
  { icon: Truck, label: 'Türkiye geneli teslimat' },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((value) => (value + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative min-h-[760px] overflow-hidden bg-charcoal">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image src={slide.image} alt={slide.headline} fill priority={slide.id === 1} className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(8,8,8,0.95)_4%,rgba(8,8,8,0.76)_34%,rgba(8,8,8,0.52)_66%,rgba(8,8,8,0.62)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(196,164,90,0.24),transparent_28%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_78%,rgba(255,255,255,0.06),transparent_22%)]" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex min-h-[760px] max-w-7xl flex-col justify-end px-4 pb-12 pt-32 sm:px-6 lg:px-8 lg:pb-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-2xl rounded-[34px] border border-white/12 bg-charcoal/46 p-6 shadow-2xl shadow-black/20 backdrop-blur-md md:p-8">
            <motion.div
              key={`label-${slide.id}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-3 rounded-full border border-gold/60 bg-charcoal px-4 py-2 text-white shadow-lg shadow-black/20"
            >
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em]">{slide.label}</span>
            </motion.div>

            <motion.h1
              key={`headline-${slide.id}`}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-[clamp(3rem,6vw,6rem)] leading-[0.95] tracking-[-0.04em] text-white whitespace-pre-line [text-shadow:0_6px_26px_rgba(0,0,0,0.72)]"
            >
              {slide.headline}
            </motion.h1>

            <motion.p
              key={`sub-${slide.id}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-white/90 md:text-lg [text-shadow:0_4px_18px_rgba(0,0,0,0.72)]"
            >
              {slide.sub}
            </motion.p>

            <motion.div
              key={`actions-${slide.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <Link
                href={slide.href}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-charcoal shadow-lg shadow-black/25 transition-colors hover:bg-[#d8b979]"
              >
                {slide.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/urunler"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/60 bg-charcoal px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-[#2b2b27]"
              >
                Tüm Ürünler
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              {highlightChips.map((chip) => (
                <div key={chip.label} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 py-2 text-sm font-medium text-charcoal shadow-lg shadow-black/10">
                  <chip.icon className="h-4 w-4 text-gold" />
                  {chip.label}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.22 }}
            className="grid gap-4 sm:grid-cols-2 lg:justify-self-end"
          >
            <div className="rounded-[30px] border border-stone/70 bg-[#f8f3ea] p-5 text-charcoal shadow-xl shadow-black/15 sm:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.26em] text-brown/70">Seçili An</p>
                  <p className="mt-3 font-serif text-2xl leading-tight text-charcoal">{slide.accent}</p>
                </div>
                <div className="rounded-2xl border border-stone/70 bg-white px-4 py-3 text-right shadow-lg shadow-black/10">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-brown/70">Bu hafta</p>
                  <p className="mt-1 text-lg font-semibold text-charcoal">{slide.stat}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-stone/70 bg-[#f4efe6] p-5 text-charcoal shadow-xl shadow-black/15">
              <p className="text-[10px] uppercase tracking-[0.24em] text-brown/70">Hızlı teslim</p>
              <p className="mt-4 font-serif text-3xl text-charcoal">7-14</p>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/82">İstanbul içi seçili ürünlerde hızlandırılmış planlama.</p>
            </div>

            <div className="rounded-[28px] border border-stone/70 bg-[#fffaf1] p-5 text-charcoal shadow-xl shadow-black/15">
              <p className="text-[10px] uppercase tracking-[0.24em] text-brown/70">Stüdyo Notu</p>
              <p className="mt-4 font-serif text-2xl leading-tight text-charcoal">“Doku geçişi güçlü olduğunda alan daha pahalı görünür.”</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {slides.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrent(index)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all ${
                  index === current
                    ? 'bg-charcoal text-white shadow-lg shadow-black/20'
                    : 'border border-charcoal/25 bg-white text-charcoal shadow-md shadow-black/5 hover:bg-[#f8f3ea]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="rounded-full border border-charcoal bg-charcoal px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cream shadow-lg shadow-black/20">Final Mobilya stüdyo vitrini</p>
        </div>
      </div>
    </section>
  );
}
