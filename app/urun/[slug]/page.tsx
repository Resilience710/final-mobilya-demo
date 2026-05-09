import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Product, Campaign, ProductDiscount } from '@/lib/types';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import {
  applyCampaignToProduct,
  applyCampaignToProducts,
  applyProductDiscountToProduct,
  applyProductDiscountsToProducts,
  pickActiveCampaign,
  resolveProductPricing,
} from '@/lib/campaigns';
import { absoluteUrl, cleanText, SITE_NAME } from '@/lib/site';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createServerSupabaseClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description, slug, images')
    .eq('slug', params.slug)
    .single();

  if (!product) return { title: 'Ürün Bulunamadı' };

  const title = product.name;
  const description = cleanText(product.short_description, `${product.name} ürün detayları ve fiyat bilgisi.`);

  return {
    title,
    description,
    alternates: {
      canonical: `/urun/${product.slug}`,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: absoluteUrl(`/urun/${product.slug}`),
      images: Array.isArray(product.images) && product.images[0]
        ? [{ url: product.images[0], alt: product.name }]
        : undefined,
    },
  };
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

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: resolvedProduct.name,
            description: cleanText(resolvedProduct.short_description || resolvedProduct.description, resolvedProduct.name),
            image: resolvedProduct.images,
            sku: resolvedProduct.sku || undefined,
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
            },
          }),
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
