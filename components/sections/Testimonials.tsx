import { Star } from 'lucide-react';

const reviews = [
  {
    text: 'Final Mobilya yaşam alanımı eşsiz koleksiyonuyla bambaşka bir yere taşıdı. Kesinlikle tavsiye ederim.',
    name: 'Selin Yıldız',
  },
  {
    text: 'Yakın zamanda Final Mobilya\'dan ilk alışverişimi yaptım, deneyim tüm beklentilerimi aştı diyebilirim!',
    name: 'Mehmet Kaya',
  },
  {
    text: 'Final Mobilya\'nın ürünleri evimizi sıcak bir yuvaya dönüştürdü. Şık tasarımlar beklediğimden çok daha iyi.',
    name: 'Ayşe Demir',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-cream py-20 lg:py-24 border-t border-stone/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-3xl sm:text-4xl text-charcoal mb-14 tracking-wide">
          MÜŞTERİ YORUMLARIMIZ
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-12 lg:divide-x lg:divide-stone/40">
          {reviews.map((r, i) => (
            <div key={i} className="text-center px-6">
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-[#c94f3d] text-[#c94f3d]" />
                ))}
              </div>
              <p className="font-medium uppercase text-charcoal leading-relaxed text-sm tracking-wider mb-8 max-w-xs mx-auto">
                {r.text}
              </p>
              <p className="text-sm text-brown/55">{r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
