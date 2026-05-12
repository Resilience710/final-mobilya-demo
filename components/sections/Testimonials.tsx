import { Star } from 'lucide-react';
import type { Testimonial } from '@/lib/types';

const DEFAULT_REVIEWS: Testimonial[] = [
  { id: '1', sort_order: 1, author_name: 'Selin Yıldız', review_text: 'Final Mobilya yaşam alanımı eşsiz koleksiyonuyla bambaşka bir yere taşıdı. Kesinlikle tavsiye ederim.', rating: 5, is_active: true, created_at: '' },
  { id: '2', sort_order: 2, author_name: 'Mehmet Kaya',  review_text: 'Yakın zamanda Final Mobilya\'dan ilk alışverişimi yaptım, deneyim tüm beklentilerimi aştı diyebilirim!', rating: 5, is_active: true, created_at: '' },
  { id: '3', sort_order: 3, author_name: 'Ayşe Demir',  review_text: 'Final Mobilya\'nın ürünleri evimizi sıcak bir yuvaya dönüştürdü. Şık tasarımlar beklediğimden çok daha iyi.', rating: 5, is_active: true, created_at: '' },
];

export default function Testimonials({ reviews }: { reviews?: Testimonial[] }) {
  const list = (reviews && reviews.length > 0) ? reviews : DEFAULT_REVIEWS;

  return (
    <section className="bg-cream py-20 lg:py-24 border-t border-stone/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-3xl sm:text-4xl text-charcoal mb-14 tracking-wide">
          MÜŞTERİ YORUMLARIMIZ
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-12 lg:divide-x lg:divide-stone/40">
          {list.map((r) => (
            <div key={r.id} className="text-center px-6">
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: r.rating }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-[#c94f3d] text-[#c94f3d]" />
                ))}
              </div>
              <p className="font-medium uppercase text-charcoal leading-relaxed text-sm tracking-wider mb-8 max-w-xs mx-auto">
                {r.review_text}
              </p>
              <p className="text-sm text-brown/55">{r.author_name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
