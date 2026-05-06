import { Campaign, Product } from '@/lib/types';

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

export function resolveProductPricing(product: Pick<Product, 'base_price' | 'discount_price'>, campaign?: Campaign | null) {
  const basePrice = Number(product.base_price);
  const productDiscount =
    product.discount_price !== null && Number(product.discount_price) < basePrice
      ? Number(product.discount_price)
      : null;

  let finalPrice = productDiscount ?? basePrice;
  let appliedCampaign = false;

  if (campaign?.discount_percentage && campaign.discount_percentage > 0 && isCampaignLive(campaign)) {
    const campaignPrice = roundCurrency(basePrice * (1 - campaign.discount_percentage / 100));
    if (campaignPrice < finalPrice) {
      finalPrice = campaignPrice;
      appliedCampaign = true;
    }
  }

  return {
    basePrice,
    finalPrice,
    hasDiscount: finalPrice < basePrice,
    compareAtPrice: finalPrice < basePrice ? basePrice : null,
    discountPercent: finalPrice < basePrice ? Math.round(((basePrice - finalPrice) / basePrice) * 100) : 0,
    appliedCampaign,
  };
}

export function applyCampaignToProduct(product: Product, campaign: Campaign | null) {
  if (!campaign || !isCampaignLive(campaign) || !campaignAppliesToProduct(campaign, product)) {
    return { ...product, active_campaign: null };
  }

  return {
    ...product,
    active_campaign: campaign,
  };
}

export function applyCampaignToProducts(products: Product[], campaign: Campaign | null) {
  return products.map((product) => applyCampaignToProduct(product, campaign));
}
