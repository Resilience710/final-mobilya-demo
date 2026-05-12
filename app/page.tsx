export const dynamic = 'force-dynamic';

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
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { absoluteUrl, buildBreadcrumbSchema, buildMetadata, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';
import type { HeroSlide, Testimonial, TrustFeature, RoomCollection, BrandStoryContent } from '@/lib/types';

export const metadata: Metadata = buildMetadata({
  title: 'Premium Mobilya ve Online Koleksiyonlar',
  description: SITE_DESCRIPTION,
  path: '/',
  imageAlt: `${SITE_NAME} ana sayfa koleksiyon görseli`,
});

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  const [heroRes, testimonialsRes, trustRes, roomsRes, brandStoryRes] = await Promise.allSettled([
    supabase.from('hero_slides').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('trust_features').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('room_collections').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('app_settings').select('value').eq('key', 'brand_story').single(),
  ]);

  const heroSlides      = heroRes.status         === 'fulfilled' ? (heroRes.value.data         as HeroSlide[]       ?? []) : [];
  const testimonials    = testimonialsRes.status  === 'fulfilled' ? (testimonialsRes.value.data  as Testimonial[]     ?? []) : [];
  const trustFeatures   = trustRes.status         === 'fulfilled' ? (trustRes.value.data         as TrustFeature[]    ?? []) : [];
  const roomCollections = roomsRes.status         === 'fulfilled' ? (roomsRes.value.data         as RoomCollection[]  ?? []) : [];
  const brandStory      = brandStoryRes.status    === 'fulfilled' ? (brandStoryRes.value.data?.value as BrandStoryContent ?? null) : null;

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchemas) }}
      />
      <Hero slides={heroSlides} />
      <CategoryGrid />
      <BrandStory content={brandStory} />
      <FeaturedProducts />
      <ShopTheLook />
      <InstagramFeed rooms={roomCollections} />
      <AllProductsSection />
      <BlogHighlights />
      <Testimonials reviews={testimonials} />
      <TrustBar features={trustFeatures} />
    </>
  );
}
