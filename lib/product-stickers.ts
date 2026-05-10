export type ProductStickerKind = 'advantage' | 'bestseller';

export type ProductSticker = {
  kind: ProductStickerKind;
  label: string;
};

const PRODUCT_STICKERS: Record<string, ProductSticker> = {
  'milano-kose-koltuk-takimi': { kind: 'advantage', label: 'Avantajlı Ürün' },
  'elegance-yemek-masasi': { kind: 'advantage', label: 'Avantajlı Ürün' },
  'royal-yatak-odasi-takimi': { kind: 'bestseller', label: 'Çok Satan' },
};

export function getProductSticker(slug: string) {
  return PRODUCT_STICKERS[slug] || null;
}
