import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Product, Campaign, ProductDiscount } from '@/lib/types';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import {
  applyCampaignToProduct,
  applyCampaignToProducts,
  applyProductDiscountToProduct,
  applyProductDiscountsToProducts,
  pickActiveCampaign,
  resolveProductPricing,
} from '@/lib/campaigns';
import { absoluteUrl, buildBreadcrumbSchema, buildMetadata, cleanText, SITE_NAME } from '@/lib/site';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description, slug, images, tags, category:categories(name, slug)')
    .eq('slug', params.slug)
    .single();

  if (!product) return { title: 'Ürün Bulunamadı' };

  const title = product.name;
  const description = cleanText(product.short_description, `${product.name} ürün detayları ve fiyat bilgisi.`);
  const rawCategory = (product as { category?: { name?: string } | Array<{ name?: string }> }).category;
  const categoryName = Array.isArray(rawCategory) ? rawCategory[0]?.name : rawCategory?.name;

  return buildMetadata({
    title,
    description,
    path: `/urun/${product.slug}`,
    image: Array.isArray(product.images) ? product.images[0] : undefined,
    imageAlt: product.name,
    keywords: [product.name, ...(Array.isArray(product.tags) ? product.tags : []), categoryName].filter(Boolean),
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const supabase = createServerSupabaseClient();
  const { data: campaignRows } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_active', true);

  const activeCampaign = pickActiveCampaign((campaignRows as Campaign[]) ?? []);

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*), variants:product_variants(*)')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!product) {
    notFound();
  }

  // Related products
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .eq('is_active', true)
    .limit(4);

  const productIds = [product.id, ...(((relatedProducts as Product[]) || []).map((relatedProduct) => relatedProduct.id))];
  const { data: productDiscountRows } = await supabase
    .from('product_discounts')
    .select('*')
    .in('product_id', productIds);

  const discountList = (productDiscountRows as ProductDiscount[]) || [];
  const relatedOnlyDiscounts = discountList.filter((discount) => discount.product_id !== product.id);
  const productDiscount = discountList.filter((discount) => discount.product_id === product.id);

  const resolvedProduct = applyProductDiscountToProduct(
    applyCampaignToProduct(product as Product, activeCampaign),
    productDiscount,
  );
  const offerPricing = resolveProductPricing(resolvedProduct, resolvedProduct.active_campaign);
  const productSchemas = [
    buildBreadcrumbSchema([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Ürünler', path: '/urunler' },
      ...(resolvedProduct.category?.slug
        ? [{ name: resolvedProduct.category.name, path: `/kategori/${resolvedProduct.category.slug}` }]
        : []),
      { name: resolvedProduct.name, path: `/urun/${resolvedProduct.slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: resolvedProduct.name,
      description: cleanText(resolvedProduct.short_description || resolvedProduct.description, resolvedProduct.name),
      image: resolvedProduct.images,
      sku: resolvedProduct.sku || undefined,
      category: resolvedProduct.category?.name || undefined,
      brand: {
        '@type': 'Brand',
        name: SITE_NAME,
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: resolvedProduct.currency || 'TRY',
        price: offerPricing.finalPrice,
        availability: resolvedProduct.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: absoluteUrl(`/urun/${resolvedProduct.slug}`),
        seller: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchemas),
        }}
      />
      <ProductDetailClient
        product={resolvedProduct}
        relatedProducts={applyProductDiscountsToProducts(
          applyCampaignToProducts((relatedProducts as Product[]) || [], activeCampaign),
          relatedOnlyDiscounts,
        )}
      />
    </>
  );
}
