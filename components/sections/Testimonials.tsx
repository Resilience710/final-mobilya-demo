import { Star } from 'lucide-react';
import { HomepageTestimonialsSection } from '@/lib/types';

interface TestimonialsProps {
  content: HomepageTestimonialsSection;
}

export default function Testimonials({ content }: TestimonialsProps) {
  return (
    <section className="bg-cream py-20 lg:py-24 border-t border-stone/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-3xl sm:text-4xl text-charcoal mb-14 tracking-wide">
          {content.heading}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-12 lg:divide-x lg:divide-stone/40">
          {content.items.map((r, i) => (
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
