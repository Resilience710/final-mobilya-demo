import Image from 'next/image';
import Link from 'next/link';
import type { RoomCollection } from '@/lib/types';

const DEFAULT_ROOMS: RoomCollection[] = [
  { id: '1', sort_order: 1, label: 'OTURMA ODALARI', href: '/kategori/oturma-grubu', image_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=900&q=85', is_active: true, created_at: '' },
  { id: '2', sort_order: 2, label: 'YATAK ODALARI',  href: '/kategori/yatak-odasi',  image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=85', is_active: true, created_at: '' },
  { id: '3', sort_order: 3, label: 'YEMEK ODALARI',  href: '/kategori/yemek-odasi',  image_url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=900&q=85', is_active: true, created_at: '' },
];

export default function InstagramFeed({ rooms }: { rooms?: RoomCollection[] }) {
  const validRooms = rooms?.filter(r => r.image_url) ?? [];
  const list = validRooms.length > 0 ? validRooms : DEFAULT_ROOMS;

  return (
    <section className="bg-cream py-12 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {list.map((room) => (
          <Link
            key={room.id}
            href={room.href}
            className="relative h-[420px] sm:h-[520px] lg:h-[640px] block overflow-hidden group"
          >
            {room.image_url && (
              <Image
                src={room.image_url}
                alt={room.label}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
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
