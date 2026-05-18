'use client';

import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Truck, Shield, RotateCcw, Minus, Plus, ChevronRight, Loader2, MapPin } from 'lucide-react';
import { Product, ProductVariant } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import ProductCard from '@/components/product/ProductCard';
import { resolveProductPricing } from '@/lib/campaigns';
import { turkeyProvinces } from '@/lib/turkey-locations';
import { getProductSticker } from '@/lib/product-stickers';
import DiscountCountdown from '@/components/ui/DiscountCountdown';

interface Props {
  product: Product;
  relatedProducts: Product[];
}

type ProductOptionValue = {
  label: string;
  price_modifier?: number;
  sku_suffix?: string;
  is_active?: boolean;
};

type ProductOptionConfig = {
  types: ProductOptionValue[];
  sizes: ProductOptionValue[];
  colors: ProductOptionValue[];
};

const OPTION_CONFIG_SPEC_KEY = '__option_config';
const TECHNICAL_DETAILS_SPEC_KEY = '__details_content';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(price);
}

function formatCampaignEndDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}

function getVariantTypeLabel(variant: ProductVariant) {
  return variant.material?.trim() || '';
}

function getVariantColorLabel(variant: ProductVariant) {
  return variant.color?.trim() || '';
}

function getVariantSizeLabel(variant: ProductVariant) {
  return variant.size?.trim() || '';
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function createEmptyOptionConfig(): ProductOptionConfig {
  return {
    types: [],
    sizes: [],
    colors: [],
  };
}

function parseOptionConfig(specifications: Product['specifications'] | null | undefined): ProductOptionConfig {
  const rawConfig = specifications?.[OPTION_CONFIG_SPEC_KEY];

  if (!rawConfig) {
    return createEmptyOptionConfig();
  }

  try {
    const parsed = JSON.parse(rawConfig) as Partial<ProductOptionConfig>;
    const normalize = (values: ProductOptionValue[] | undefined) =>
      Array.isArray(values)
        ? values
            .map((value) => ({
              label: value?.label?.trim() || '',
              price_modifier: Number(value?.price_modifier) || 0,
              sku_suffix: value?.sku_suffix?.trim() || '',
              is_active: value?.is_active ?? true,
            }))
            .filter((value) => value.label)
        : [];

    return {
      types: normalize(parsed.types),
      sizes: normalize(parsed.sizes),
      colors: normalize(parsed.colors),
    };
  } catch {
    return createEmptyOptionConfig();
  }
}

function getTechnicalDetailsContent(specifications: Product['specifications'] | null | undefined) {
  const source = specifications || {};
  const richContent =
    typeof source[TECHNICAL_DETAILS_SPEC_KEY] === 'string'
      ? source[TECHNICAL_DETAILS_SPEC_KEY].trim()
      : '';

  if (richContent) {
    return richContent;
  }

  return Object.entries(source)
    .filter(([key]) => !key.startsWith('__'))
    .map(([key, value]) => (value ? `**${key}**\n${value}` : `**${key}**`))
    .join('\n\n')
    .trim();
}

function renderInlineFormatting(text: string) {
  const tokens = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|\+\+[^+]+\+\+)/g).filter(Boolean);

  return tokens.map((token, index) => {
    if (token.startsWith('***') && token.endsWith('***') && token.length > 6) {
      return (
        <strong key={`${token}-${index}`} className="font-semibold italic text-charcoal">
          {token.slice(3, -3)}
        </strong>
      );
    }

    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={`${token}-${index}`} className="font-semibold text-charcoal">
          {token.slice(2, -2)}
        </strong>
      );
    }

    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={`${token}-${index}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }

    if (token.startsWith('++') && token.endsWith('++') && token.length > 4) {
      return (
        <u key={`${token}-${index}`} className="underline underline-offset-2">
          {token.slice(2, -2)}
        </u>
      );
    }

    return <Fragment key={`${token}-${index}`}>{token}</Fragment>;
  });
}

function renderParagraphLines(lines: string[]) {
  return lines.map((line, lineIndex) => (
    <span key={`${lineIndex}-${line}`}>
      {renderInlineFormatting(line)}
      {lineIndex < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

function renderListItems(lines: string[], ordered: boolean) {
  const ListTag = ordered ? 'ol' : 'ul';
  const pattern = ordered ? /^\d+\.\s+/ : /^-\s+/;

  return (
    <ListTag className={ordered ? 'list-decimal space-y-2 pl-5' : 'list-disc space-y-2 pl-5'}>
      {lines
        .filter((line) => line.trim())
        .map((line, index) => (
          <li key={`${index}-${line}`} className="pl-1 leading-relaxed">
            {renderInlineFormatting(line.replace(pattern, ''))}
          </li>
        ))}
    </ListTag>
  );
}

function FormattedText({ content, className = '' }: { content: string; className?: string }) {
  const blocks = content
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n');
        const meaningfulLines = lines.filter((line) => line.trim());
        const isUnorderedList = meaningfulLines.length > 0 && meaningfulLines.every((line) => /^-\s+/.test(line));
        const isOrderedList = meaningfulLines.length > 0 && meaningfulLines.every((line) => /^\d+\.\s+/.test(line));
        let contentNode: ReactNode;

        if (isUnorderedList) {
          contentNode = renderListItems(lines, false);
        } else if (isOrderedList) {
          contentNode = renderListItems(lines, true);
        } else {
          contentNode = (
            <p className="leading-relaxed">
              {renderParagraphLines(lines)}
            </p>
          );
        }

        return (
          <div key={`${blockIndex}-${block}`}>
            {contentNode}
          </div>
        );
      })}
    </div>
  );
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const activeVariants = useMemo(
    () => (product.variants || []).filter((variant) => variant.is_active),
    [product.variants],
  );
  const optionConfig = useMemo(() => parseOptionConfig(product.specifications), [product.specifications]);
  const technicalDetails = useMemo(
    () => getTechnicalDetailsContent(product.specifications),
    [product.specifications],
  );
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(activeVariants[0] || null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingNote, setShippingNote] = useState('Ürünü isterseniz şimdi sepete ekleyebilir, nakliyatı sepette seçebilirsiniz.');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');
  const { addItem } = useCart();

  const pricing = resolveProductPricing(product, product.active_campaign);
  const sticker = getProductSticker(product.slug);
  const variantModifier = selectedVariant?.price_modifier || 0;
  const totalPrice = pricing.finalPrice + variantModifier;
  const compareAtPrice = pricing.compareAtPrice ? pricing.compareAtPrice + variantModifier : null;
  const provinces = useMemo(() => turkeyProvinces.map((province) => province.name), []);
  const districts = useMemo(
    () => turkeyProvinces.find((province) => province.name === city)?.districts || [],
    [city],
  );
  const canAddToCart = product.stock_quantity > 0;
  const activeTypeConfig = useMemo(
    () => optionConfig.types.filter((item) => item.is_active !== false),
    [optionConfig.types],
  );
  const activeSizeConfig = useMemo(
    () => optionConfig.sizes.filter((item) => item.is_active !== false),
    [optionConfig.sizes],
  );
  const activeColorConfig = useMemo(
    () => optionConfig.colors.filter((item) => item.is_active !== false),
    [optionConfig.colors],
  );
  const typeModifierMap = useMemo(
    () => new Map(activeTypeConfig.map((item) => [item.label, Number(item.price_modifier) || 0])),
    [activeTypeConfig],
  );
  const sizeModifierMap = useMemo(
    () => new Map(activeSizeConfig.map((item) => [item.label, Number(item.price_modifier) || 0])),
    [activeSizeConfig],
  );
  const colorModifierMap = useMemo(
    () => new Map(activeColorConfig.map((item) => [item.label, Number(item.price_modifier) || 0])),
    [activeColorConfig],
  );
  const productTypeOptions = useMemo(
    () =>
      activeTypeConfig.length > 0
        ? activeTypeConfig.map((item) => item.label)
        : uniqueValues(activeVariants.map((variant) => getVariantTypeLabel(variant))),
    [activeTypeConfig, activeVariants],
  );
  const selectedType = selectedVariant ? getVariantTypeLabel(selectedVariant) : '';
  const sizeOptions = useMemo(() => uniqueValues(
    activeSizeConfig.length > 0
      ? activeSizeConfig.map((item) => item.label)
      : activeVariants
          .filter((variant) => !selectedType || getVariantTypeLabel(variant) === selectedType)
          .map((variant) => getVariantSizeLabel(variant)),
  ), [activeSizeConfig, activeVariants, selectedType]);
  const selectedSize = selectedVariant ? getVariantSizeLabel(selectedVariant) : sizeOptions[0] || '';
  const colorOptions = useMemo(() => uniqueValues(
    activeColorConfig.length > 0
      ? activeColorConfig.map((item) => item.label)
      : activeVariants
          .filter((variant) => !selectedType || getVariantTypeLabel(variant) === selectedType)
          .filter((variant) => !selectedSize || getVariantSizeLabel(variant) === selectedSize)
          .map((variant) => getVariantColorLabel(variant)),
  ), [activeColorConfig, activeVariants, selectedSize, selectedType]);
  const selectedColor = selectedVariant ? getVariantColorLabel(selectedVariant) : colorOptions[0] || '';
  const galleryImages = useMemo(() => {
    const merged = [selectedVariant?.image_url, ...(product.images || [])]
      .filter((image): image is string => Boolean(image));
    const unique = merged.filter((image, index) => merged.indexOf(image) === index);
    return unique.length > 0 ? unique : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'];
  }, [product.images, selectedVariant?.image_url]);

  useEffect(() => {
    if (activeVariants.length === 0) {
      if (selectedVariant !== null) {
        setSelectedVariant(null);
      }
      return;
    }

    if (!selectedVariant || !activeVariants.some((variant) => variant.id === selectedVariant.id)) {
      setSelectedVariant(activeVariants[0]);
    }
  }, [activeVariants, selectedVariant]);

  useEffect(() => {
    setSelectedImage(0);
  }, [selectedVariant?.id]);

  const findBestVariant = (filters: { type?: string; size?: string; color?: string }) => {
    const { type = '', size = '', color = '' } = filters;
    const strategies = [
      (variant: ProductVariant) => (!type || getVariantTypeLabel(variant) === type)
        && (!size || getVariantSizeLabel(variant) === size)
        && (!color || getVariantColorLabel(variant) === color),
      (variant: ProductVariant) => (!type || getVariantTypeLabel(variant) === type)
        && (!size || getVariantSizeLabel(variant) === size),
      (variant: ProductVariant) => (!type || getVariantTypeLabel(variant) === type)
        && (!color || getVariantColorLabel(variant) === color),
      (variant: ProductVariant) => (!type || getVariantTypeLabel(variant) === type),
      (variant: ProductVariant) => (!size || getVariantSizeLabel(variant) === size)
        && (!color || getVariantColorLabel(variant) === color),
      (variant: ProductVariant) => (!size || getVariantSizeLabel(variant) === size),
      (variant: ProductVariant) => (!color || getVariantColorLabel(variant) === color),
    ];

    for (const strategy of strategies) {
      const match = activeVariants.find(strategy);
      if (match) {
        return match;
      }
    }

    return activeVariants[0] || null;
  };

  useEffect(() => {
    if (!city || !district) {
      setShippingCost(null);
      setShippingError('');
      setShippingNote('Ürünü isterseniz şimdi sepete ekleyebilir, nakliyatı sepette seçebilirsiniz.');
      return;
    }

    const controller = new AbortController();
    const loadShipping = async () => {
      try {
        setShippingLoading(true);
        setShippingError('');
        const params = new URLSearchParams({ city, district });
        const response = await fetch(`/api/shipping/quote?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Nakliyat hesaplanamadı.');
        }
        setShippingCost(Number(data.price) || 0);
        setShippingNote(data.matchedRule?.note || data.note || 'Nakliyat fiyatı seçilen il ve ilçe için hesaplandı.');
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        setShippingCost(null);
        setShippingError(error.message || 'Nakliyat hesaplanamadı.');
      } finally {
        setShippingLoading(false);
      }
    };

    loadShipping();
    return () => controller.abort();
  }, [city, district]);

  const handleAddToCart = () => {
    if (!canAddToCart) {
      return;
    }

    if (city && district && shippingCost !== null) {
      addItem(product, selectedVariant, quantity, {
        city,
        district,
        price: shippingCost,
        note: shippingNote,
      });
    } else {
      addItem(product, selectedVariant, quantity);
    }
    setShippingError('');
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-brown/50 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Ana Sayfa</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/urunler" className="hover:text-gold transition-colors">Ürünler</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {product.category && (
            <>
              <Link href={`/urunler?kategori=${product.category.slug}`} className="hover:text-gold transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-charcoal">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Image
                    src={galleryImages[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>
              {pricing.discountPercent > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-xl">
                  %{pricing.discountPercent} İndirim
                </span>
              )}
              {sticker ? (
                <span className={`absolute right-4 top-4 px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.16em] text-white rounded-xl ${
                  sticker.kind === 'advantage' ? 'bg-[#2f8f62]' : 'bg-[#f08a24]'
                }`}>
                  {sticker.label}
                </span>
              ) : null}
            </div>
            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-gold' : 'border-transparent hover:border-stone'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <p className="text-xs text-gold font-medium tracking-widest uppercase mb-2">
              {product.category?.name}
            </p>
            <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-4">{product.name}</h1>

            {product.active_campaign ? (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-charcoal px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                  {product.active_campaign.badge_text || 'Kampanya'}
                </span>
                {product.active_campaign.end_date ? (
                  <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                    {formatCampaignEndDate(product.active_campaign.end_date)} tarihine kadar
                  </span>
                ) : null}
              </div>
            ) : null}
            
            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-3xl text-charcoal">{formatPrice(totalPrice)}</span>
              {compareAtPrice && (
                <span className="text-lg text-brown/40 line-through">{formatPrice(compareAtPrice)}</span>
              )}
            </div>

            {pricing.appliedTimedDiscount && product.active_product_discount?.end_date ? (
              <div className="mb-6">
                <DiscountCountdown
                  endDate={product.active_product_discount.end_date}
                  note="İndirimli fiyat için süre devam ediyor."
                />
              </div>
            ) : null}

            {product.active_campaign?.subtitle ? (
              <div className="mb-6 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-brown/80">
                {product.active_campaign.subtitle}
              </div>
            ) : null}

            {product.description ? (
              <FormattedText
                content={product.description}
                className="mb-8 space-y-4 text-brown/70"
              />
            ) : null}

            {/* Variants */}
            {activeVariants.length > 0 && (
              <div className="mb-8">
                <div className="space-y-5">
                  {productTypeOptions.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-medium text-charcoal">
                        Ürün Tipi: <span className="text-gold">{selectedType || 'Standart'}</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {productTypeOptions.map((type) => {
                          const typeModifier = typeModifierMap.get(type) || 0;
                          return (
                            <button
                              key={type}
                              onClick={() => {
                                setSelectedVariant(findBestVariant({ type, size: selectedSize, color: selectedColor }));
                              }}
                              className={`rounded-xl border px-4 py-2.5 text-sm transition-all ${
                                selectedType === type
                                  ? 'border-charcoal bg-charcoal text-white'
                                  : 'border-stone/40 bg-white text-charcoal hover:border-gold/60'
                              }`}
                            >
                              {type}
                              {typeModifier > 0 && (
                                <span className="ml-1 text-xs opacity-70">+{formatPrice(typeModifier)}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {sizeOptions.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-medium text-charcoal">
                        Ölçü: <span className="text-gold">{selectedSize || 'Standart'}</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {sizeOptions.map((size) => {
                          const sizeModifier = sizeModifierMap.get(size) || 0;
                          return (
                            <button
                              key={size}
                              onClick={() => {
                                setSelectedVariant(findBestVariant({ type: selectedType, size, color: selectedColor }));
                              }}
                              className={`rounded-xl border px-4 py-2.5 text-sm transition-all ${
                                selectedSize === size
                                  ? 'border-charcoal bg-charcoal text-white'
                                  : 'border-stone/40 bg-white text-charcoal hover:border-gold/60'
                              }`}
                            >
                              {size}
                              {sizeModifier > 0 && (
                                <span className="ml-1 text-xs opacity-70">+{formatPrice(sizeModifier)}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {colorOptions.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-medium text-charcoal">
                        Renk: <span className="text-gold">{selectedColor || 'Standart'}</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => {
                          const colorModifier = colorModifierMap.get(color) || 0;
                          const colorVariant = activeVariants.find((variant) =>
                            (!selectedType || getVariantTypeLabel(variant) === selectedType) &&
                            (!selectedSize || getVariantSizeLabel(variant) === selectedSize) &&
                            getVariantColorLabel(variant) === color,
                          );
                          const isSelected = selectedColor === color;

                          return (
                            <button
                            key={color}
                            onClick={() => {
                                if (colorVariant) {
                                  setSelectedVariant(findBestVariant({ type: selectedType, size: selectedSize, color }) || colorVariant);
                                }
                              }}
                              className={`rounded-xl border px-4 py-2.5 text-sm transition-all ${
                                isSelected
                                  ? 'border-charcoal bg-charcoal text-white'
                                  : 'border-stone/40 bg-white text-charcoal hover:border-gold/60'
                              }`}
                            >
                              {color}
                              {colorModifier > 0 && (
                                <span className="ml-1 text-xs opacity-70">+{formatPrice(colorModifier)}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-charcoal mb-3">Adet</h3>
              <div className="inline-flex items-center bg-white border border-stone/40 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-cream transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 text-charcoal font-medium min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-cream transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {product.stock_quantity <= 10 && (
                <p className="text-xs text-red-500 mt-2">Stokta sadece {product.stock_quantity} adet kaldı!</p>
              )}
            </div>

            <div className="mb-8 rounded-2xl border border-stone/20 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gold" />
                <h3 className="text-sm font-medium text-charcoal">Nakliyat Hesapla</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55">İl</span>
                  <select
                    value={city}
                    onChange={(event) => {
                      setCity(event.target.value);
                      setDistrict('');
                    }}
                    className="w-full rounded-xl border border-stone/30 bg-cream/50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    <option value="">İl seçin</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55">İlçe</span>
                  <select
                    value={district}
                    onChange={(event) => setDistrict(event.target.value)}
                    disabled={!city}
                    className="w-full rounded-xl border border-stone/30 bg-cream/50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">{city ? 'İlçe seçin' : 'Önce il seçin'}</option>
                    {districts.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4 rounded-xl border border-stone/15 bg-cream px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-brown/60">Nakliyat</span>
                  <span className="text-lg font-semibold text-charcoal">
                    {shippingLoading ? 'Hesaplanıyor...' : shippingCost === null ? '---' : shippingCost === 0 ? 'Ücretsiz' : formatPrice(shippingCost)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-brown/60">
                  {shippingNote}
                </p>
                {shippingError ? (
                  <p className="mt-2 text-sm font-medium text-red-500">{shippingError}</p>
                ) : null}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-charcoal text-white font-medium rounded-xl hover:bg-gold disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 text-base"
              >
                {shippingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                {product.stock_quantity === 0 ? 'Tükendi' : 'Sepete Ekle'}
              </button>
              <button className="p-4 bg-white border border-stone/40 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-stone/20">
                <Truck className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-xs text-charcoal">İl ve İlçeye Göre Nakliyat</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-stone/20">
                <Shield className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-xs text-charcoal">Garanti</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-stone/20">
                <RotateCcw className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-xs text-charcoal">Kolay İade</span>
              </div>
            </div>

            {/* Specifications */}
            {technicalDetails && (
              <div className="mt-10">
                <h3 className="font-serif text-xl text-charcoal mb-4">Teknik Özellikler</h3>
                <div className="rounded-2xl border border-stone/20 bg-white px-5 py-4">
                  <FormattedText
                    content={technicalDetails}
                    className="space-y-4 text-sm text-brown/70"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-2xl text-charcoal mb-8">Benzer Ürünler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
