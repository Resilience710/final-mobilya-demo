import Link from 'next/link';
import { Sofa, Bed, Armchair, Lamp, Utensils, GraduationCap, Archive } from 'lucide-react';

const categories = [
  { label: 'KOLTUKLAR',     href: '/kategori/oturma-grubu', icon: Sofa },
  { label: 'GARDIROPLAR',   href: '/kategori/yatak-odasi',  icon: Archive },
  { label: 'SANDALYELER',   href: '/kategori/yemek-odasi',  icon: Armchair },
  { label: 'YEMEK MASALARI',href: '/kategori/yemek-odasi',  icon: Utensils },
  { label: 'ÇALIŞMA ODASI', href: '/kategori/calisma-odasi',icon: Bed },
  { label: 'AYDINLATMA',    href: '/kategori/aksesuar',     icon: Lamp },
  { label: 'GENÇ ODASI',    href: '/kategori/genc-odasi',   icon: GraduationCap },
];

export default function CategoryGrid() {
  return (
    <section className="bg-cream py-16 lg:py-20 border-b border-stone/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-3xl sm:text-4xl text-charcoal mb-12 tracking-wide">
          EN İYİYİ KEŞFEDİN
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-10">
          {categories.map(cat => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group flex flex-col items-center gap-3 text-center"
            >
              <span className="w-16 h-16 flex items-center justify-center text-charcoal/80 group-hover:text-gold transition-colors duration-300">
                <cat.icon className="w-12 h-12 stroke-[1.2]" />
              </span>
              <span className="text-[11px] font-semibold tracking-[0.22em] text-charcoal/70 group-hover:text-gold transition-colors duration-300">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
