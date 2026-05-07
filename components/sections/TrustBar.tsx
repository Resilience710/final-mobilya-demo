import { Hammer, Leaf, Heart, Sofa, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: Hammer,
    title: 'USTALIK GARANTİSİ',
    desc: 'Her parça, deneyimli ustalarımız tarafından özenle el işçiliğiyle hazırlanır.',
  },
  {
    icon: Leaf,
    title: 'DOĞAYA SAYGI',
    desc: 'Üretimimizde çevre dostu malzemeleri ve sürdürülebilir uygulamaları önceliklendiriyoruz.',
  },
  {
    icon: Heart,
    title: 'KİŞİYE ÖZEL TASARIM',
    desc: 'Mobilyalarınızı yaşam alanınıza ve tarzınıza tam uyacak şekilde özelleştirin.',
  },
  {
    icon: Sofa,
    title: 'DAYANIKLILIK ODAĞI',
    desc: 'Yıllarca kullanım için tasarlandı; yalnızca en kaliteli malzemeleri kullanırız.',
  },
  {
    icon: MessageCircle,
    title: 'MÜŞTERİ DESTEĞİ',
    desc: 'Sorunsuz bir alışveriş deneyimi için 7/24 yanınızdayız.',
  },
];

export default function TrustBar() {
  return (
    <section className="bg-cream py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-charcoal text-3xl sm:text-4xl leading-tight mb-14 tracking-wide">
          MOBİLYALARIMIZ
          <br />
          NEDEN FARKLI?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
          {features.map(f => (
            <div key={f.title} className="text-center px-2">
              <f.icon className="w-12 h-12 text-charcoal mx-auto mb-5 stroke-[1.2]" />
              <h3 className="font-serif text-base text-charcoal tracking-wide mb-3 leading-tight uppercase">
                {f.title}
              </h3>
              <p className="text-xs text-brown/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
