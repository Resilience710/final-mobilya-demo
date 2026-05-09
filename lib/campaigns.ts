import { Campaign, Product, ProductDiscount } from '@/lib/types';

const FALLBACK_DISCOUNT_START = '2026-05-09T00:00:00+03:00';
const FALLBACK_DISCOUNT_DAYS: Record<string, number> = {
  'elegance-yemek-masasi': 2,
  'urban-genc-odasi-takimi': 4,
  'milano-kose-koltuk-takimi': 5,
  'royal-yatak-odasi-takimi': 6,
};

export const ACTIVE_CAMPAIGN_SELECT = `
  id,
  title,
  subtitle,
  badge_text,
  cta_label,
  cta_href,
  theme,
  discount_percentage,
  scope,
  category_id,
  is_active,
  start_date,
  end_date,
  created_at,
  updated_at
`;

function roundCurrency(value: number) {
  return Math.max(0, Math.round(value));
}

export function isCampaignLive(campaign: Pick<Campaign, 'is_active' | 'start_date' | 'end_date'>, now = new Date()) {
  if (!campaign.is_active) return false;
  if (campaign.start_date && new Date(campaign.start_date) > now) return false;
  if (campaign.end_date && new Date(campaign.end_date) < now) return false;
  return true;
}

export function pickActiveCampaign(campaigns: Campaign[] | null | undefined, now = new Date()) {
  if (!campaigns?.length) return null;

  return [...campaigns]
    .filter((campaign) => isCampaignLive(campaign, now))
    .sort((a, b) => {
      const aStart = a.start_date ? new Date(a.start_date).getTime() : 0;
      const bStart = b.start_date ? new Date(b.start_date).getTime() : 0;
      return bStart - aStart;
    })[0] ?? null;
}

export function campaignAppliesToProduct(campaign: Campaign | null | undefined, product: Pick<Product, 'category_id' | 'is_featured'>) {
  if (!campaign || !campaign.is_active) return false;

  if (campaign.scope === 'featured') {
    return product.is_featured;
  }

  if (campaign.scope === 'category') {
    return !!campaign.category_id && campaign.category_id === product.category_id;
  }

  return true;
}

export function isProductDiscountLive(
  discount: Pick<ProductDiscount, 'is_active' | 'start_date' | 'end_date'>,
  now = new Date(),
) {
  if (!discount.is_active) return false;
  if (discount.start_date && new Date(discount.start_date) > now) return false;
  if (discount.end_date && new Date(discount.end_date) < now) return false;
  return true;
}

function resolveTimedProductDiscountPrice(
  product: Pick<Product, 'base_price' | 'active_product_discount'>,
  now = new Date(),
) {
  const discount = product.active_product_discount;

  if (!discount || !isProductDiscountLive(discount, now)) {
    return null;
  }

  if (discount.discount_type === 'fixed') {
    return roundCurrency(Number(product.base_price) - Number(discount.discount_value));
  }

  return roundCurrency(Number(product.base_price) * (1 - Number(discount.discount_value) / 100));
}

export function pickActiveProductDiscount(discounts: ProductDiscount[] | null | undefined, now = new Date()) {
  if (!discounts?.length) return null;

  return [...discounts]
    .filter((discount) => isProductDiscountLive(discount, now))
    .sort((a, b) => {
      const aStart = a.start_date ? new Date(a.start_date).getTime() : 0;
      const bStart = b.start_date ? new Date(b.start_date).getTime() : 0;
      return bStart - aStart;
    })[0] ?? null;
}

function createFallbackProductDiscount(product: Product): ProductDiscount | null {
  const durationDays = FALLBACK_DISCOUNT_DAYS[product.slug];
  const basePrice = Number(product.base_price);
  const staticDiscountPrice =
    product.discount_price !== null && Number(product.discount_price) < basePrice
      ? Number(product.discount_price)
      : null;

  if (!durationDays || staticDiscountPrice === null) {
    return null;
  }

  const startDate = new Date(FALLBACK_DISCOUNT_START);
  const endDate = new Date(startDate.getTime() + durationDays * 86_400_000);

  return {
    id: `fallback-${product.id}`,
    product_id: product.id,
    title: `${durationDays} Günlük Fırsat`,
    discount_type: 'fixed',
    discount_value: roundCurrency(basePrice - staticDiscountPrice),
    is_active: true,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    created_at: startDate.toISOString(),
  };
}

export function applyProductDiscountToProduct(product: Product, discounts: ProductDiscount[] | null | undefined): Product {
  const productDiscounts = [...(discounts ?? [])];

  if (productDiscounts.length === 0) {
    const fallbackDiscount = createFallbackProductDiscount(product);
    if (fallbackDiscount) {
      productDiscounts.push(fallbackDiscount);
    }
  }

  return {
    ...product,
    active_product_discount: pickActiveProductDiscount(productDiscounts) ?? null,
    has_product_discount_schedule: productDiscounts.length > 0,
  };
}

export function applyProductDiscountsToProducts(products: Product[], discounts: ProductDiscount[] | null | undefined): Product[] {
  const discountMap = new Map<string, ProductDiscount[]>();

  for (const discount of discounts ?? []) {
    const current = discountMap.get(discount.product_id) ?? [];
    current.push(discount);
    discountMap.set(discount.product_id, current);
  }

  return products.map((product) => applyProductDiscountToProduct(product, discountMap.get(product.id)));
}

export function resolveProductPricing(
  product: Pick<Product, 'base_price' | 'discount_price' | 'active_product_discount' | 'has_product_discount_schedule'>,
  campaign?: Campaign | null,
) {
  const basePrice = Number(product.base_price);
  const productDiscount =
    !product.has_product_discount_schedule && product.discount_price !== null && Number(product.discount_price) < basePrice
      ? Number(product.discount_price)
      : null;
  const timedDiscountPrice = resolveTimedProductDiscountPrice(product);

  let finalPrice = productDiscount ?? basePrice;
  let appliedCampaign = false;
  let appliedTimedDiscount = false;

  if (timedDiscountPrice !== null && timedDiscountPrice < finalPrice) {
    finalPrice = timedDiscountPrice;
    appliedTimedDiscount = true;
  }

  if (campaign?.discount_percentage && campaign.discount_percentage > 0 && isCampaignLive(campaign)) {
    const campaignPrice = roundCurrency(basePrice * (1 - campaign.discount_percentage / 100));
    if (campaignPrice < finalPrice) {
      finalPrice = campaignPrice;
      appliedCampaign = true;
      appliedTimedDiscount = false;
    }
  }

  return {
    basePrice,
    finalPrice,
    hasDiscount: finalPrice < basePrice,
    compareAtPrice: finalPrice < basePrice ? basePrice : null,
    discountPercent: finalPrice < basePrice ? Math.round(((basePrice - finalPrice) / basePrice) * 100) : 0,
    appliedCampaign,
    appliedTimedDiscount,
  };
}

export function applyCampaignToProduct(product: Product, campaign: Campaign | null): Product {
  if (!campaign || !isCampaignLive(campaign) || !campaignAppliesToProduct(campaign, product)) {
    return { ...product, active_campaign: null };
  }

  return {
    ...product,
    active_campaign: campaign,
  };
}

export function applyCampaignToProducts(products: Product[], campaign: Campaign | null): Product[] {
  return products.map((product) => applyCampaignToProduct(product, campaign));
}
