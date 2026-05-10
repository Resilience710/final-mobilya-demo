import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import CategoryGrid from '@/components/sections/CategoryGrid';
import BrandStory from '@/components/sections/BrandStory';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import ShopTheLook from '@/components/sections/ShopTheLook';
import InstagramFeed from '@/components/sections/InstagramFeed';
import BlogHighlights from '@/components/sections/BlogHighlights';
import Testimonials from '@/components/sections/Testimonials';
import TrustBar from '@/components/sections/TrustBar';
import AllProductsSection from '@/components/sections/AllProductsSection';
import { absoluteUrl, buildBreadcrumbSchema, buildMetadata, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Premium Mobilya ve Online Koleksiyonlar',
  description: SITE_DESCRIPTION,
  path: '/',
  imageAlt: `${SITE_NAME} ana sayfa koleksiyon görseli`,
});

export default function HomePage() {
  const homeSchemas = [
    buildBreadcrumbSchema([{ name: 'Ana Sayfa', path: '/' }]),
    {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: SITE_NAME,
      url: absoluteUrl('/'),
      description: SITE_DESCRIPTION,
      image: absoluteUrl('/opengraph-image'),
      priceRange: '$$',
      areaServed: 'TR',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeSchemas),
        }}
      />
      <Hero />
      <CategoryGrid />
      <BrandStory />
      <FeaturedProducts />
      <ShopTheLook />
      <InstagramFeed />
      <AllProductsSection />
      <BlogHighlights />
      <Testimonials />
      <TrustBar />
    </>
  );
}
