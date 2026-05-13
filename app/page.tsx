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
import { loadHomepageContent } from '@/lib/homepage';
import { absoluteUrl, buildBreadcrumbSchema, buildMetadata, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Premium Mobilya ve Online Koleksiyonlar',
  description: SITE_DESCRIPTION,
  path: '/',
  imageAlt: `${SITE_NAME} ana sayfa koleksiyon görseli`,
});

export default async function HomePage() {
  const { content } = await loadHomepageContent();
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
      <Hero slides={content.hero.slides} />
      <CategoryGrid heading={content.categories.heading} items={content.categories.items} />
      <BrandStory content={content.brandStory} />
      <FeaturedProducts tabs={content.featuredProducts.tabs} />
      <ShopTheLook content={content.shopTheLook} galleryLinks={content.gallery.items} />
      <InstagramFeed items={content.roomShowcase.items} />
      <AllProductsSection content={content.allProducts} />
      <BlogHighlights content={content.blogHighlights} />
      <Testimonials content={content.testimonials} />
      <TrustBar content={content.trustBar} />
    </>
  );
}
