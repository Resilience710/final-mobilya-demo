import {
  Hammer, Leaf, Heart, Sofa, MessageCircle,
  Shield, Star, Award, Truck, Phone, Zap, Package,
  ThumbsUp, Clock, CheckCircle, type LucideIcon,
} from 'lucide-react';
import type { TrustFeature } from '@/lib/types';

export const TRUST_ICON_MAP: Record<string, LucideIcon> = {
  Hammer, Leaf, Heart, Sofa, MessageCircle,
  Shield, Star, Award, Truck, Phone, Zap, Package,
  ThumbsUp, Clock, CheckCircle,
};

const DEFAULT_FEATURES: TrustFeature[] = [
  { id: '1', sort_order: 1, icon_name: 'Hammer',        title: 'USTALIK GARANTİSİ',   description: 'Her parça, deneyimli ustalarımız tarafından özenle el işçiliğiyle hazırlanır.', is_active: true, created_at: '' },
  { id: '2', sort_order: 2, icon_name: 'Leaf',          title: 'DOĞAYA SAYGI',         description: 'Üretimimizde çevre dostu malzemeleri ve sürdürülebilir uygulamaları önceliklendiriyoruz.', is_active: true, created_at: '' },
  { id: '3', sort_order: 3, icon_name: 'Heart',         title: 'KİŞİYE ÖZEL TASARIM', description: 'Mobilyalarınızı yaşam alanınıza ve tarzınıza tam uyacak şekilde özelleştirin.', is_active: true, created_at: '' },
  { id: '4', sort_order: 4, icon_name: 'Sofa',          title: 'DAYANIKLILIK ODAĞI',   description: 'Yıllarca kullanım için tasarlandı; yalnızca en kaliteli malzemeleri kullanırız.', is_active: true, created_at: '' },
  { id: '5', sort_order: 5, icon_name: 'MessageCircle', title: 'MÜŞTERİ DESTEĞİ',     description: 'Sorunsuz bir alışveriş deneyimi için 7/24 yanınızdayız.', is_active: true, created_at: '' },
];

export default function TrustBar({ features }: { features?: TrustFeature[] }) {
  const list = (features && features.length > 0) ? features : DEFAULT_FEATURES;

  return (
    <section className="bg-cream py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-charcoal text-3xl sm:text-4xl leading-tight mb-14 tracking-wide">
          MOBİLYALARIMIZ
          <br />
          NEDEN FARKLI?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
          {list.map((f) => {
            const Icon = TRUST_ICON_MAP[f.icon_name] ?? Shield;
            return (
              <div key={f.id} className="text-center px-2">
                <Icon className="w-12 h-12 text-charcoal mx-auto mb-5 stroke-[1.2]" />
                <h3 className="font-serif text-base text-charcoal tracking-wide mb-3 leading-tight uppercase">
                  {f.title}
                </h3>
                <p className="text-xs text-brown/60 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
