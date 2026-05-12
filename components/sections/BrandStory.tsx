import Image from 'next/image';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import type { BrandStoryContent } from '@/lib/types';

const DEFAULT: BrandStoryContent = {
  heading_line1: 'ÖDÜLLÜ',
  heading_line2: 'MOBİLYA',
  heading_line3: 'TASARIMLARI!',
  subtitle_line1: 'Yenilikçi Tasarım,',
  subtitle_line2: 'Sınırsız Konfor',
  cta_text: 'TÜM ÜRÜNLERİ GÖRÜN',
  cta_href: '/urunler',
  left_image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85',
  left_image_label: 'BEJ İÇ MEKAN',
  left_image_href: '/kategori/oturma-grubu',
  right_image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85',
  right_image_label: 'MUTFAK MOBİLYALARI',
  right_image_href: '/kategori/yemek-odasi',
};

export default function BrandStory({ content }: { content?: BrandStoryContent | null }) {
  const c = content ?? DEFAULT;

  return (
    <section className="bg-cream py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch gap-8">
          {/* Sol görsel */}
          <Link href={c.left_image_href} className="relative aspect-[3/4] overflow-hidden group">
            <Image
              src={c.left_image_url}
              alt={c.left_image_label}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute top-6 left-6 bg-cream/95 px-3 py-2 text-center">
              <Trophy className="w-4 h-4 text-charcoal mx-auto mb-1" />
              <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-charcoal">FINAL</p>
              <p className="text-[10px] font-serif text-charcoal/70">1990</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 to-transparent" />
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="font-serif text-3xl text-white tracking-wide">{c.left_image_label}</p>
              <span className="inline-block mt-4 bg-white/95 px-6 py-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-charcoal group-hover:bg-gold group-hover:text-white transition-colors">
                İNCELE
              </span>
            </div>
          </Link>

          {/* Orta metin */}
          <div className="flex flex-col items-center justify-center text-center px-4 py-10 lg:py-0">
            <h2 className="font-serif text-charcoal leading-[0.95] tracking-tight">
              <span className="block text-4xl sm:text-5xl">{c.heading_line1}</span>
              <span className="block text-4xl sm:text-5xl">{c.heading_line2}</span>
              <span className="block text-4xl sm:text-5xl">{c.heading_line3}</span>
            </h2>
            <p className="font-serif italic text-xl sm:text-2xl text-charcoal/75 mt-8">
              {c.subtitle_line1}
              <br />
              {c.subtitle_line2}
            </p>
            <Link
              href={c.cta_href}
              className="mt-10 inline-block border border-charcoal px-8 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-charcoal hover:bg-charcoal hover:text-white transition-colors duration-300"
            >
              {c.cta_text}
            </Link>
          </div>

          {/* Sağ görsel */}
          <Link href={c.right_image_href} className="relative aspect-[3/4] overflow-hidden group">
            <Image
              src={c.right_image_url}
              alt={c.right_image_label}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 to-transparent" />
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="font-serif text-3xl text-white tracking-wide">{c.right_image_label}</p>
              <span className="inline-block mt-4 bg-white/95 px-6 py-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-charcoal group-hover:bg-gold group-hover:text-white transition-colors">
                İNCELE
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
