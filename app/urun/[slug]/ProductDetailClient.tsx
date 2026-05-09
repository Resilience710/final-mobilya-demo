'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Truck, Shield, RotateCcw, Minus, Plus, ChevronRight, Loader2, MapPin } from 'lucide-react';
import { Product, ProductVariant } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import ProductCard from '@/components/product/ProductCard';
import { resolveProductPricing } from '@/lib/campaigns';
import { turkeyProvinces } from '@/lib/turkey-locations';

interface Props {
  product: Product;
  relatedProducts: Product[];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(price);
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingNote, setShippingNote] = useState('İl ve ilçe seçmeden sepete eklenemez.');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');
  const { addItem } = useCart();

  const pricing = resolveProductPricing(product, product.active_campaign);
  const variantModifier = selectedVariant?.price_modifier || 0;
  const totalPrice = pricing.finalPrice + variantModifier;
  const provinces = useMemo(() => turkeyProvinces.map((province) => province.name), []);
  const districts = useMemo(
    () => turkeyProvinces.find((province) => province.name === city)?.districts || [],
    [city],
  );
  const canAddToCart = product.stock_quantity > 0 && !!city && !!district && shippingCost !== null && !shippingLoading;

  const images = product.images?.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'];

  useEffect(() => {
    if (!city || !district) {
      setShippingCost(null);
      setShippingError('');
      setShippingNote('İl ve ilçe seçmeden sepete eklenemez.');
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
    if (!canAddToCart || shippingCost === null) {
      setShippingError('Sepete eklemeden önce il ve ilçe seçip nakliyat fiyatını hesaplayın.');
      return;
    }

    addItem(product, selectedVariant, quantity, {
      city,
      district,
      price: shippingCost,
      note: shippingNote,
    });
    setShippingError('');
  };

  const specs = product.specifications || {};

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
                    src={images[selectedImage]}
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
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
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
                    {new Date(product.active_campaign.end_date).toLocaleDateString('tr-TR')} tarihine kadar
                  </span>
                ) : null}
              </div>
            ) : null}
            
            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-3xl text-charcoal">{formatPrice(totalPrice)}</span>
              {pricing.compareAtPrice && (
                <span className="text-lg text-brown/40 line-through">{formatPrice(pricing.compareAtPrice + variantModifier)}</span>
              )}
            </div>

            {product.active_campaign?.subtitle ? (
              <div className="mb-6 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-brown/80">
                {product.active_campaign.subtitle}
              </div>
            ) : null}

            <p className="text-brown/70 leading-relaxed mb-8">{product.description}</p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-charcoal mb-3">
                  Seçenek: <span className="text-gold">{selectedVariant?.name}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.filter(v => v.is_active).map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2.5 rounded-xl text-sm transition-all border ${
                        selectedVariant?.id === variant.id
                          ? 'bg-charcoal text-white border-charcoal'
                          : 'bg-white text-charcoal border-stone/40 hover:border-gold/60'
                      }`}
                    >
                      {variant.name}
                      {variant.price_modifier > 0 && (
                        <span className="ml-1 text-xs opacity-70">+{formatPrice(variant.price_modifier)}</span>
                      )}
                    </button>
                  ))}
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
                {product.stock_quantity === 0 ? 'Tükendi' : !city || !district ? 'İl ve İlçe Seçin' : 'Sepete Ekle'}
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
            {Object.keys(specs).length > 0 && (
              <div className="mt-10">
                <h3 className="font-serif text-xl text-charcoal mb-4">Teknik Özellikler</h3>
                <div className="bg-white rounded-2xl border border-stone/20 divide-y divide-stone/10">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between px-5 py-3.5">
                      <span className="text-sm text-brown/60">{key}</span>
                      <span className="text-sm text-charcoal font-medium">{value}</span>
                    </div>
                  ))}
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
