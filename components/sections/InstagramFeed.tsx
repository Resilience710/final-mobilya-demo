import Image from 'next/image';
import Link from 'next/link';

const rooms = [
  {
    label: 'OTURMA ODALARI',
    href: '/kategori/oturma-grubu',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=900&q=85',
  },
  {
    label: 'YATAK ODALARI',
    href: '/kategori/yatak-odasi',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=85',
  },
  {
    label: 'YEMEK ODALARI',
    href: '/kategori/yemek-odasi',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=900&q=85',
  },
];

export default function InstagramFeed() {
  return (
    <section className="bg-cream py-12 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {rooms.map(room => (
          <Link
            key={room.label}
            href={room.href}
            className="relative h-[420px] sm:h-[520px] lg:h-[640px] block overflow-hidden group"
          >
            <Image
              src={room.image}
              alt={room.label}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-charcoal/30 group-hover:bg-charcoal/40 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-center">
              <h3 className="font-serif text-3xl sm:text-4xl text-white tracking-wide mb-5">
                {room.label}
              </h3>
              <span className="inline-block bg-white/95 px-7 py-2.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-charcoal group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                İNCELE
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
