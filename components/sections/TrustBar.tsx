import { Hammer, Leaf, Heart, Sofa, MessageCircle } from 'lucide-react';
import { HomepageTrustBarSection } from '@/lib/types';

const icons = [Hammer, Leaf, Heart, Sofa, MessageCircle];

interface TrustBarProps {
  content: HomepageTrustBarSection;
}

export default function TrustBar({ content }: TrustBarProps) {
  return (
    <section className="bg-cream py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="whitespace-pre-line text-center font-serif text-charcoal text-3xl sm:text-4xl leading-tight mb-14 tracking-wide">
          {content.heading}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
          {content.items.map((feature, index) => {
            const Icon = icons[index] || MessageCircle;

            return (
              <div key={`${feature.title}-${index}`} className="text-center px-2">
                <Icon className="w-12 h-12 text-charcoal mx-auto mb-5 stroke-[1.2]" />
                <h3 className="font-serif text-base text-charcoal tracking-wide mb-3 leading-tight uppercase">
                  {feature.title}
                </h3>
                <p className="text-xs text-brown/60 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
