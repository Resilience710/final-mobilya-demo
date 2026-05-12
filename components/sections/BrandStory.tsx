import Image from 'next/image';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { HomepageBrandStorySection } from '@/lib/types';

interface BrandStoryProps {
  content: HomepageBrandStorySection;
}

export default function BrandStory({ content }: BrandStoryProps) {
  return (
    <section className="bg-cream py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch gap-8">
          <Link
            href={content.leftCard.href}
            className="relative aspect-[3/4] overflow-hidden group"
          >
            <Image
              src={content.leftCard.image}
              alt={content.leftCard.imageAlt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute top-6 left-6 bg-cream/95 px-3 py-2 text-center">
              <Trophy className="w-4 h-4 text-charcoal mx-auto mb-1" />
              <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-charcoal">{content.leftBadgeLabel}</p>
              <p className="text-[10px] font-serif text-charcoal/70">{content.leftBadgeYear}</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 to-transparent" />
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="whitespace-pre-line font-serif text-3xl text-white tracking-wide">{content.leftCard.headline}</p>
              <span className="inline-block mt-4 bg-white/95 px-6 py-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-charcoal group-hover:bg-gold group-hover:text-white transition-colors">
                {content.leftCard.ctaLabel}
              </span>
            </div>
          </Link>

          <div className="flex flex-col items-center justify-center text-center px-4 py-10 lg:py-0">
            <h2 className="whitespace-pre-line font-serif text-4xl text-charcoal leading-[0.95] tracking-tight sm:text-5xl">
              {content.centerTitle}
            </h2>
            <p className="mt-8 whitespace-pre-line font-serif italic text-xl text-charcoal/75 sm:text-2xl">
              {content.centerSubtitle}
            </p>
            <Link
              href={content.centerCtaHref}
              className="mt-10 inline-block border border-charcoal px-8 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-charcoal hover:bg-charcoal hover:text-white transition-colors duration-300"
            >
              {content.centerCtaLabel}
            </Link>
          </div>

          <Link
            href={content.rightCard.href}
            className="relative aspect-[3/4] overflow-hidden group"
          >
            <Image
              src={content.rightCard.image}
              alt={content.rightCard.imageAlt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 to-transparent" />
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="whitespace-pre-line font-serif text-3xl text-white tracking-wide">{content.rightCard.headline}</p>
              <span className="inline-block mt-4 bg-white/95 px-6 py-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-charcoal group-hover:bg-gold group-hover:text-white transition-colors">
                {content.rightCard.ctaLabel}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
