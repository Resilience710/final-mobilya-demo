'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Loader2, Upload, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Product, Category, ProductVariant } from '@/lib/types';
import RichTextEditor from '@/components/admin/RichTextEditor';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(price);
}

function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type AdminVariantForm = {
  localId: string;
  id?: string;
  name: string;
  sku: string;
  price_modifier: number;
  stock_quantity: number;
  color: string;
  size: string;
  material: string;
  image_url: string;
  is_active: boolean;
};

type OptionGroupKey = 'types' | 'sizes' | 'colors';

type OptionValueForm = {
  localId: string;
  label: string;
  price_modifier: number;
  sku_suffix: string;
  is_active: boolean;
};

type OptionConfigForm = {
  types: OptionValueForm[];
  sizes: OptionValueForm[];
  colors: OptionValueForm[];
};

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  technical_details: string;
  parent_category_id: string;
  category_id: string;
  base_price: number;
  discount_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  sku: string;
  images: string[];
  tags: string[];
  specifications: Record<string, string>;
  optionConfig: OptionConfigForm;
};

const OPTION_CONFIG_SPEC_KEY = '__option_config';
const TECHNICAL_DETAILS_SPEC_KEY = '__details_content';

type CategorySelectOption = {
  id: string;
  label: string;
};

function createEmptyVariant(): AdminVariantForm {
  return {
    localId: createLocalId(),
    name: '',
    sku: '',
    price_modifier: 0,
    stock_quantity: 0,
    color: '',
    size: '',
    material: '',
    image_url: '',
    is_active: true,
  };
}

function createEmptyOptionValue(): OptionValueForm {
  return {
    localId: createLocalId(),
    label: '',
    price_modifier: 0,
    sku_suffix: '',
    is_active: true,
  };
}

function createEmptyOptionConfig(): OptionConfigForm {
  return {
    types: [],
    sizes: [],
    colors: [],
  };
}

function createEmptyProduct(): ProductForm {
  return {
    name: '',
    slug: '',
    description: '',
    short_description: '',
    technical_details: '',
    parent_category_id: '',
    category_id: '',
    base_price: 0,
    discount_price: null,
    is_active: true,
    is_featured: false,
    stock_quantity: 0,
    sku: '',
    images: [],
    tags: [],
    specifications: {},
    optionConfig: createEmptyOptionConfig(),
  };
}

function mapOptionValue(label: string, price_modifier = 0): OptionValueForm {
  return {
    localId: createLocalId(),
    label,
    price_modifier,
    sku_suffix: '',
    is_active: true,
  };
}

function splitSpecifications(specifications: Record<string, string> | null | undefined) {
  const source = specifications || {};
  const visible = Object.fromEntries(
    Object.entries(source).filter(([key]) => !key.startsWith('__')),
  );
  const technicalDetails =
    typeof source[TECHNICAL_DETAILS_SPEC_KEY] === 'string'
      ? source[TECHNICAL_DETAILS_SPEC_KEY]
      : Object.entries(visible)
          .map(([key, value]) => (value ? `**${key}**\n${value}` : `**${key}**`))
          .join('\n\n');

  let optionConfig = createEmptyOptionConfig();
  const rawConfig = source[OPTION_CONFIG_SPEC_KEY];

  if (rawConfig) {
    try {
      const parsed = JSON.parse(rawConfig) as Partial<OptionConfigForm>;
      optionConfig = {
        types: Array.isArray(parsed.types)
          ? parsed.types.map((item) => ({
              localId: createLocalId(),
              label: item?.label || '',
              price_modifier: Number(item?.price_modifier) || 0,
              sku_suffix: item?.sku_suffix || '',
              is_active: item?.is_active ?? true,
            }))
          : [],
        sizes: Array.isArray(parsed.sizes)
          ? parsed.sizes.map((item) => ({
              localId: createLocalId(),
              label: item?.label || '',
              price_modifier: Number(item?.price_modifier) || 0,
              sku_suffix: item?.sku_suffix || '',
              is_active: item?.is_active ?? true,
            }))
          : [],
        colors: Array.isArray(parsed.colors)
          ? parsed.colors.map((item) => ({
              localId: createLocalId(),
              label: item?.label || '',
              price_modifier: Number(item?.price_modifier) || 0,
              sku_suffix: item?.sku_suffix || '',
              is_active: item?.is_active ?? true,
            }))
          : [],
      };
    } catch {
      optionConfig = createEmptyOptionConfig();
    }
  }

  return { visible, optionConfig, technicalDetails };
}

function inferOptionConfigFromVariants(variants: ProductVariant[] | undefined): OptionConfigForm {
  const list = variants || [];
  const materials = Array.from(new Set(list.map((variant) => variant.material?.trim()).filter(Boolean))) as string[];
  const sizes = Array.from(new Set(list.map((variant) => variant.size?.trim()).filter(Boolean))) as string[];
  const colors = Array.from(new Set(list.map((variant) => variant.color?.trim()).filter(Boolean))) as string[];

  const inferModifiers = (kind: 'material' | 'size' | 'color', labels: string[]) => {
    const otherCounts = {
      material: { size: sizes.length, color: colors.length },
      size: { material: materials.length, color: colors.length },
      color: { material: materials.length, size: sizes.length },
    }[kind];

    const canInfer =
      Object.values(otherCounts).every((count) => count <= 1);

    return labels.map((label) => {
      const matched = list.find((variant) => (variant[kind]?.trim() || '') === label);
      return mapOptionValue(label, canInfer ? Number(matched?.price_modifier) || 0 : 0);
    });
  };

  return {
    types: inferModifiers('material', materials),
    sizes: inferModifiers('size', sizes),
    colors: inferModifiers('color', colors),
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(createEmptyProduct());
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const rootCategoryOptions = useMemo(
    () => categories
      .filter((c) => !c.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, 'tr')),
    [categories],
  );

  const subcategoryOptions = useMemo(
    () => categories
      .filter((c) => c.parent_id === form.parent_category_id)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, 'tr')),
    [categories, form.parent_category_id],
  );

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(*), variants:product_variants(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ]);
    setProducts((prodRes.data as Product[]) || []);
    setCategories((catRes.data as Category[]) || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setError(null);
    setForm(createEmptyProduct());
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setError(null);
    const { visible, optionConfig, technicalDetails } = splitSpecifications(product.specifications || {});
    const productCategory = categories.find((c) => c.id === (product.category_id || ''));
    const parentCatId = productCategory?.parent_id
      ? productCategory.parent_id
      : (productCategory?.id || '');
    const subCatId = productCategory?.parent_id ? (productCategory.id || '') : '';
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      short_description: product.short_description || '',
      technical_details: technicalDetails,
      parent_category_id: parentCatId,
      category_id: subCatId,
      base_price: product.base_price,
      discount_price: product.discount_price,
      is_active: product.is_active,
      is_featured: product.is_featured,
      stock_quantity: product.stock_quantity,
      sku: product.sku || '',
      images: product.images || [],
      tags: product.tags || [],
      specifications: visible,
      optionConfig:
        optionConfig.types.length || optionConfig.sizes.length || optionConfig.colors.length
          ? optionConfig
          : inferOptionConfigFromVariants(product.variants),
    });
    setShowForm(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  };

  const uploadImage = async (file: File, folder = 'products') => {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from('product-images').upload(path, file);
    if (upErr) {
      throw new Error(upErr.message);
    }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    return publicUrl;
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingImage(true);
    setError(null);

    try {
      const remainingSlots = Math.max(0, 6 - form.images.length);
      if (remainingSlots === 0) {
        setError('Bir ürün için en fazla 6 görsel yükleyebilirsiniz.');
        return;
      }

      const acceptedFiles = Array.from(files).slice(0, remainingSlots);
      const failures: string[] = [];
      const newImages = [...form.images];

      for (const file of acceptedFiles) {
        if (file.size > 5 * 1024 * 1024) {
          failures.push(`${file.name} (5MB üzeri)`);
          continue;
        }
        try {
          newImages.push(await uploadImage(file));
        } catch (err: any) {
          failures.push(`${file.name}: ${err?.message || 'yüklenemedi'}`);
        }
      }

      if (files.length > acceptedFiles.length) {
        failures.push(`Sadece ${remainingSlots} görsel daha eklenebilir`);
      }

      setForm((current) => ({ ...current, images: newImages }));
      if (failures.length) setError(`Yüklenemeyen dosyalar: ${failures.join(', ')}`);
    } catch (err: any) {
      setError(`Yükleme hatası: ${err?.message || 'Bilinmeyen hata'}`);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form.tags.includes(t)) return;
    setForm({ ...form, tags: [...form.tags, t] });
    setTagInput('');
  };

  const removeTag = (t: string) => {
    setForm({ ...form, tags: form.tags.filter((x) => x !== t) });
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const addOptionValue = (group: OptionGroupKey) => {
    setForm((current) => ({
      ...current,
      optionConfig: {
        ...current.optionConfig,
        [group]: [...current.optionConfig[group], createEmptyOptionValue()],
      },
    }));
  };

  const updateOptionValue = (
    group: OptionGroupKey,
    localId: string,
    field: keyof OptionValueForm,
    value: string | number | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      optionConfig: {
        ...current.optionConfig,
        [group]: current.optionConfig[group].map((item) =>
          item.localId === localId ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const removeOptionValue = (group: OptionGroupKey, localId: string) => {
    setForm((current) => ({
      ...current,
      optionConfig: {
        ...current.optionConfig,
        [group]: current.optionConfig[group].filter((item) => item.localId !== localId),
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (form.images.length < 1) {
      setSaving(false);
      setError('Bir ürün için en az 1 görsel yüklemelisiniz.');
      return;
    }

    if (form.images.length > 6) {
      setSaving(false);
      setError('Bir ürün için en fazla 6 görsel yükleyebilirsiniz.');
      return;
    }

    const cleanOptionConfig: OptionConfigForm = {
      types: form.optionConfig.types
        .map((item) => ({
          ...item,
          label: item.label.trim(),
          sku_suffix: item.sku_suffix.trim(),
        }))
        .filter((item) => item.label),
      sizes: form.optionConfig.sizes
        .map((item) => ({
          ...item,
          label: item.label.trim(),
          sku_suffix: item.sku_suffix.trim(),
        }))
        .filter((item) => item.label),
      colors: form.optionConfig.colors
        .map((item) => ({
          ...item,
          label: item.label.trim(),
          sku_suffix: item.sku_suffix.trim(),
        }))
        .filter((item) => item.label),
    };

    const specifications: Record<string, string> = {};
    const hasOptionConfig =
      cleanOptionConfig.types.length > 0 ||
      cleanOptionConfig.sizes.length > 0 ||
      cleanOptionConfig.colors.length > 0;

    const cleanTechnicalDetails = form.technical_details.trim();

    if (hasOptionConfig) {
      specifications[OPTION_CONFIG_SPEC_KEY] = JSON.stringify(cleanOptionConfig);
    }

    if (cleanTechnicalDetails) {
      specifications[TECHNICAL_DETAILS_SPEC_KEY] = cleanTechnicalDetails;
    }

    const productData = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      description: form.description,
      short_description: form.short_description,
      category_id: form.category_id || form.parent_category_id || null,
      base_price: form.base_price,
      discount_price: form.discount_price || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
      stock_quantity: form.stock_quantity,
      sku: form.sku || null,
      images: form.images,
      tags: form.tags,
      specifications,
    };

    const productResult = editingProduct
      ? await supabase.from('products').update(productData).eq('id', editingProduct.id).select('id').single()
      : await supabase.from('products').insert(productData).select('id').single();

    if (productResult.error || !productResult.data?.id) {
      setSaving(false);
      setError(`Kaydedilemedi: ${productResult.error?.message || 'Ürün kaydedilemedi.'}`);
      return;
    }

    const productId = productResult.data.id;
    const variantKey = (material?: string | null, size?: string | null, color?: string | null) =>
      `${material?.trim() || ''}__${size?.trim() || ''}__${color?.trim() || ''}`;
    const existingVariantMap = new Map(
      (editingProduct?.variants || []).map((variant) => [
        variantKey(variant.material, variant.size, variant.color),
        variant,
      ]),
    );

    const activeTypes = cleanOptionConfig.types.filter((item) => item.is_active);
    const activeSizes = cleanOptionConfig.sizes.filter((item) => item.is_active);
    const activeColors = cleanOptionConfig.colors.filter((item) => item.is_active);

    const typeOptions = activeTypes.length > 0 ? activeTypes : [null];
    const sizeOptions = activeSizes.length > 0 ? activeSizes : [null];
    const colorOptions = activeColors.length > 0 ? activeColors : [null];

    const nextVariants: Array<{
      id?: string;
      name: string;
      sku: string | null;
      price_modifier: number;
      stock_quantity: number;
      color: string | null;
      material: string | null;
      size: string | null;
      image_url: string | null;
      is_active: boolean;
      key: string;
    }> = [];

    for (const typeOption of typeOptions) {
      for (const sizeOption of sizeOptions) {
        for (const colorOption of colorOptions) {
          const material = typeOption?.label || null;
          const size = sizeOption?.label || null;
          const color = colorOption?.label || null;
          const key = variantKey(material, size, color);
          const existingVariant = existingVariantMap.get(key);
          const name = [material, size, color].filter(Boolean).join(' - ') || 'Standart Varyant';
          const priceModifier =
            (Number(typeOption?.price_modifier) || 0) +
            (Number(sizeOption?.price_modifier) || 0) +
            (Number(colorOption?.price_modifier) || 0);
          const skuParts = [
            form.sku.trim() || null,
            typeOption?.sku_suffix || null,
            sizeOption?.sku_suffix || null,
            colorOption?.sku_suffix || null,
          ].filter(Boolean);

          nextVariants.push({
            id: existingVariant?.id,
            key,
            name,
            sku: skuParts.length > 0 ? skuParts.join('-') : null,
            price_modifier: priceModifier,
            stock_quantity: Number(form.stock_quantity) || 0,
            color,
            material,
            size,
            image_url: existingVariant?.image_url || null,
            is_active: true,
          });
        }
      }
    }

    const keptVariantIds = new Set(nextVariants.map((variant) => variant.id).filter(Boolean) as string[]);
    const existingVariantIds = new Set((editingProduct?.variants || []).map((variant) => variant.id));
    const removedVariantIds = Array.from(existingVariantIds).filter((variantId) => !keptVariantIds.has(variantId));

    if (removedVariantIds.length) {
      const { error: deleteVariantError } = await supabase
        .from('product_variants')
        .delete()
        .in('id', removedVariantIds);

      if (deleteVariantError) {
        setSaving(false);
        setError(`Varyantlar silinemedi: ${deleteVariantError.message}`);
        return;
      }
    }

    for (const variant of nextVariants) {
      if (variant.id) {
        const { error: updateVariantError } = await supabase
          .from('product_variants')
          .update({
            name: variant.name,
            sku: variant.sku,
            price_modifier: variant.price_modifier,
            stock_quantity: variant.stock_quantity,
            color: variant.color,
            material: variant.material,
            size: variant.size,
            image_url: variant.image_url,
            is_active: variant.is_active,
          })
          .eq('id', variant.id);

        if (updateVariantError) {
          setSaving(false);
          setError(`Varyant güncellenemedi: ${updateVariantError.message}`);
          return;
        }
      } else {
        const { error: insertVariantError } = await supabase
          .from('product_variants')
          .insert({
            product_id: productId,
            name: variant.name,
            sku: variant.sku,
            price_modifier: variant.price_modifier,
            stock_quantity: variant.stock_quantity,
            color: variant.color,
            material: variant.material,
            size: variant.size,
            image_url: variant.image_url,
            is_active: variant.is_active,
          });

        if (insertVariantError) {
          setSaving(false);
          setError(`Varyant eklenemedi: ${insertVariantError.message}`);
          return;
        }
      }
    }

    setSaving(false);
    setShowForm(false);
    setEditingProduct(null);
    setForm(createEmptyProduct());
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    setError(null);
    const { error: dbErr } = await supabase.from('products').delete().eq('id', id);
    if (dbErr) { setError(`Silinemedi: ${dbErr.message}`); return; }
    fetchData();
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="text-center py-20 text-brown/40">Yükleniyor...</div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-charcoal">Ürün Yönetimi</h1>
          <p className="mt-1 text-sm text-brown/50">{products.length} ürün</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold">
          <Plus className="h-4 w-4" /> Yeni Ürün
        </button>
      </div>

      {error && !showForm && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ürün ara..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-brown/50">
                <th className="px-6 py-3">Ürün</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Fiyat</th>
                <th className="px-6 py-3">Stok</th>
                <th className="px-6 py-3">Durum</th>
                <th className="px-6 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal">{product.name}</p>
                        <p className="text-xs text-brown/40">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-brown/60">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-charcoal">{formatPrice(product.discount_price ?? product.base_price)}</p>
                      {product.discount_price && <p className="text-xs text-brown/40 line-through">{formatPrice(product.base_price)}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${product.stock_quantity <= 5 ? 'text-red-500' : 'text-charcoal'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(product)} className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 pt-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="mb-20 w-full max-w-5xl rounded-2xl bg-white shadow-modal">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="font-serif text-xl text-charcoal">{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}</h2>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-2 hover:bg-gray-100"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-charcoal">Ürün Adı</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-charcoal">URL Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-charcoal">Ana Kategori</label>
                    <select
                      value={form.parent_category_id}
                      onChange={(e) => setForm({ ...form, parent_category_id: e.target.value, category_id: '' })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    >
                      <option value="">Seçiniz</option>
                      {rootCategoryOptions.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-charcoal">Alt Kategori</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      disabled={!form.parent_category_id || subcategoryOptions.length === 0}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-brown/40"
                    >
                      <option value="">
                        {!form.parent_category_id
                          ? 'Önce ana kategori seçin'
                          : subcategoryOptions.length === 0
                            ? 'Bu ana kategori için alt kategori yok'
                            : 'Seçiniz'}
                      </option>
                      {subcategoryOptions.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-charcoal">SKU</label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">Kısa Açıklama</label>
                  <input
                    type="text"
                    value={form.short_description}
                    onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>
                <div>
                  <RichTextEditor
                    label="Detaylı Açıklama"
                    value={form.description}
                    onChange={(value) => setForm({ ...form, description: value })}
                    rows={6}
                    hint="Metni seçip üstteki araç çubuğundan kalın, italik, altı çizili veya liste uygulayabilirsiniz."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-charcoal">Fiyat (₺)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={form.base_price}
                      onChange={(e) => setForm({ ...form, base_price: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-charcoal">İndirimli (₺)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.discount_price ?? ''}
                      onChange={(e) => setForm({ ...form, discount_price: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                      placeholder="Opsiyonel"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-charcoal">Stok</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.stock_quantity}
                      onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                    Aktif
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded" />
                    Öne Çıkan
                  </label>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-charcoal">Görseller</label>
                    <span className="text-xs text-brown/45">Min 1, maks 6 görsel. Şu an: {form.images.length}/6</span>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg">
                        <Image src={img} alt={`Image ${i}`} fill className="object-cover" sizes="80px" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                    {form.images.length < 6 && (
                      <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-200 transition-colors hover:border-gold">
                        {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin text-brown/30" /> : <Upload className="h-5 w-5 text-brown/30" />}
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-stone/15 bg-stone-50/70 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-charcoal">Seçenek Grupları</h3>
                    <p className="mt-1 text-xs text-brown/50">
                      Ürün tipi, ölçü ve renkleri ayrı ayrı tanımlayın. Sistem tüm kombinasyon varyantlarını otomatik oluşturur.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {[
                      {
                        key: 'types' as const,
                        title: 'Ürün Tipleri',
                        description: 'Örn: Kadife, Keten, Deri',
                        placeholder: 'Kadife',
                      },
                      {
                        key: 'sizes' as const,
                        title: 'Ölçüler',
                        description: 'Örn: 90x200, 90x400',
                        placeholder: '90x200',
                      },
                      {
                        key: 'colors' as const,
                        title: 'Renkler',
                        description: 'Örn: Gri, Lacivert, Bej',
                        placeholder: 'Gri',
                      },
                    ].map((group) => {
                      const values = form.optionConfig[group.key];

                      return (
                        <div key={group.key} className="rounded-2xl border border-stone/15 bg-white p-4">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-charcoal">{group.title}</p>
                              <p className="text-xs text-brown/45">{group.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addOptionValue(group.key)}
                              className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-3 py-2 text-sm text-white transition-colors hover:bg-gold"
                            >
                              <Plus className="h-4 w-4" />
                              Ekle
                            </button>
                          </div>

                          {values.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-stone/25 bg-stone-50 px-4 py-4 text-sm text-brown/50">
                              Bu grup için henüz seçenek eklenmedi.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {values.map((value, index) => (
                                <div key={value.localId} className="rounded-xl border border-stone/15 bg-stone-50/70 p-4">
                                  <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-sm font-medium text-charcoal">{group.title} {index + 1}</p>
                                    <button
                                      type="button"
                                      onClick={() => removeOptionValue(group.key, value.localId)}
                                      className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                      <label className="mb-1 block text-sm font-medium text-charcoal">Ad</label>
                                      <input
                                        type="text"
                                        value={value.label}
                                        onChange={(e) => updateOptionValue(group.key, value.localId, 'label', e.target.value)}
                                        placeholder={group.placeholder}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-sm font-medium text-charcoal">Ek Fiyat (₺)</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={value.price_modifier}
                                        onChange={(e) => updateOptionValue(group.key, value.localId, 'price_modifier', parseFloat(e.target.value) || 0)}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-sm font-medium text-charcoal">SKU Eki</label>
                                      <input
                                        type="text"
                                        value={value.sku_suffix}
                                        onChange={(e) => updateOptionValue(group.key, value.localId, 'sku_suffix', e.target.value)}
                                        placeholder="90X200"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                                      />
                                    </div>
                                  </div>

                                  <label className="mt-3 flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={value.is_active}
                                      onChange={(e) => updateOptionValue(group.key, value.localId, 'is_active', e.target.checked)}
                                      className="rounded"
                                    />
                                    Aktif
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <RichTextEditor
                    label="Teknik Özellikler"
                    value={form.technical_details}
                    onChange={(value) => setForm({ ...form, technical_details: value })}
                    rows={8}
                    placeholder={'**Takım İçeriği**\n3+3+1 koltuk takımı\n\n**Kumaş**\nSilinebilir dokulu yüzey'}
                    hint="Bu alan tek kolonlu gösterilir. Seçili metne toolbar’dan biçim uygulayabilirsiniz."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-charcoal">Etiketler</label>
                  {form.tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {form.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-charcoal">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="Etiket ekle (Enter ile ekle)"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                    <button type="button" onClick={addTag} className="rounded-lg bg-gray-100 px-3 py-2 text-sm transition-colors hover:bg-gray-200">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-gray-100 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm transition-colors hover:bg-gray-50">
                    İptal
                  </button>
                  <button type="submit" disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-charcoal py-3 text-sm text-white transition-colors hover:bg-gold disabled:opacity-50">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> {editingProduct ? 'Güncelle' : 'Kaydet'}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
