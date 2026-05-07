import Image from 'next/image';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function BrandStory() {
  return (
    <section className="bg-cream py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch gap-8">
          {/* Sol görsel */}
          <Link
            href="/kategori/oturma-grubu"
            className="relative aspect-[3/4] overflow-hidden group"
          >
            <Image
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85"
              alt="Bej İç Mekan"
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
              <p className="font-serif text-3xl text-white tracking-wide">
                BEJ<br />İÇ MEKAN
              </p>
              <span className="inline-block mt-4 bg-white/95 px-6 py-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-charcoal group-hover:bg-gold group-hover:text-white transition-colors">
                İNCELE
              </span>
            </div>
          </Link>

          {/* Orta metin */}
          <div className="flex flex-col items-center justify-center text-center px-4 py-10 lg:py-0">
            <h2 className="font-serif text-charcoal leading-[0.95] tracking-tight">
              <span className="block text-4xl sm:text-5xl">ÖDÜLLÜ</span>
              <span className="block text-4xl sm:text-5xl">MOBİLYA</span>
              <span className="block text-4xl sm:text-5xl">TASARIMLARI!</span>
            </h2>
            <p className="font-serif italic text-xl sm:text-2xl text-charcoal/75 mt-8">
              Yenilikçi Tasarım,
              <br />
              Sınırsız Konfor
            </p>
            <Link
              href="/urunler"
              className="mt-10 inline-block border border-charcoal px-8 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-charcoal hover:bg-charcoal hover:text-white transition-colors duration-300"
            >
              TÜM ÜRÜNLERİ GÖRÜN
            </Link>
          </div>

          {/* Sağ görsel */}
          <Link
            href="/kategori/yemek-odasi"
            className="relative aspect-[3/4] overflow-hidden group"
          >
            <Image
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85"
              alt="Mutfak Mobilyaları"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 to-transparent" />
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="font-serif text-3xl text-white tracking-wide">
                MUTFAK<br />MOBİLYALARI
              </p>
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
