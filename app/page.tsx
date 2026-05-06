import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import CategoryGrid from '@/components/sections/CategoryGrid';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import ShopTheLook from '@/components/sections/ShopTheLook';
import TrustBar from '@/components/sections/TrustBar';
import BrandStory from '@/components/sections/BrandStory';
import Testimonials from '@/components/sections/Testimonials';
import InstagramFeed from '@/components/sections/InstagramFeed';
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Premium Mobilya ve Online Koleksiyonlar',
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${SITE_NAME} | Premium Mobilya ve Online Koleksiyonlar`,
    description: SITE_DESCRIPTION,
    url: absoluteUrl('/'),
    images: [
      {
        url: absoluteUrl('/opengraph-image'),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} ana sayfa koleksiyon görseli`,
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: SITE_NAME,
            url: absoluteUrl('/'),
            description: SITE_DESCRIPTION,
            image: absoluteUrl('/opengraph-image'),
            priceRange: '$$',
            areaServed: 'TR',
          }),
        }}
      />
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <TrustBar />
      <ShopTheLook />
      <BrandStory />
      <InstagramFeed />
      <Testimonials />
    </>
  );
}
