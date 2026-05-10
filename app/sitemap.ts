import type { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { absoluteUrl } from '@/lib/site';
import { blogPosts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('slug, updated_at').eq('is_active', true),
    supabase.from('categories').select('slug, created_at'),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/hakkimizda',
    '/urunler',
    '/kategori',
    '/subelerimiz',
    '/bayilik',
    '/blog',
    '/iletisim',
    '/nakliyat',
    '/kargo-teslimat',
    '/iade-degisim',
    '/gizlilik-politikasi',
  ].map((path) => ({
    url: absoluteUrl(path || '/'),
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
      priority: path === '' ? 1 : 0.7,
    }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  const productRoutes: MetadataRoute.Sitemap =
    products?.map((product) => ({
      url: absoluteUrl(`/urun/${product.slug}`),
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })) ?? [];

  const categoryRoutes: MetadataRoute.Sitemap =
    categories?.map((category) => ({
      url: absoluteUrl(`/kategori/${category.slug}`),
      lastModified: category.created_at ? new Date(category.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    })) ?? [];

  return [...staticRoutes, ...blogRoutes, ...categoryRoutes, ...productRoutes];
}
