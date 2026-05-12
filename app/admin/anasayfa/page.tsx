'use client';

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Save, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_HOMEPAGE_CONTENT, normalizeHomepageContent } from '@/lib/homepage-content';
import { HomepageContent, HomepageGalleryItem } from '@/lib/types';

function cloneHomepageContent(content: HomepageContent): HomepageContent {
  return JSON.parse(JSON.stringify(content)) as HomepageContent;
}

function getPlaceholderSlots(items: HomepageGalleryItem[]) {
  return Array.from({ length: 4 }, (_, index) => {
    const slotIndex = index + 1;
    return (
      items.find((item) => item.slot_index === slotIndex) || {
        id: `slot-${slotIndex}`,
        slot_index: slotIndex,
        image_url: null,
        alt_text: `Ana sayfa galeri görseli ${slotIndex}`,
        is_active: true,
        created_at: '',
      }
    );
  });
}

export default function AdminAnasayfaPage() {
  const supabase = createClient();
  const [form, setForm] = useState<HomepageContent>(cloneHomepageContent(DEFAULT_HOMEPAGE_CONTENT));
  const [galleryItems, setGalleryItems] = useState<HomepageGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [galleryLoadError, setGalleryLoadError] = useState('');
  const [source, setSource] = useState<'db' | 'default'>('default');
  const [tableReady, setTableReady] = useState(true);

  const slots = useMemo(() => getPlaceholderSlots(galleryItems), [galleryItems]);

  const updateForm = (recipe: (draft: HomepageContent) => void) => {
    setForm((prev) => {
      const next = cloneHomepageContent(prev);
      recipe(next);
      return next;
    });
  };

  const loadSettings = async () => {
    const res = await fetch('/api/admin/settings/homepage', { cache: 'no-store' });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Ana sayfa ayarları yüklenemedi.');
    }

    setForm(normalizeHomepageContent(data.values));
    setSource(data.source || 'default');
    setTableReady(Boolean(data.tableReady));
  };

  const loadGallery = async () => {
    const { data, error: loadError } = await supabase
      .from('homepage_gallery_items')
      .select('*')
      .order('slot_index');

    setGalleryItems((data as HomepageGalleryItem[]) || []);
    setGalleryLoadError(
      loadError
        ? 'Galeri slotları okunamadı. Önce `supabase/shipping_promotions_homepage_upgrade.sql` dosyasını çalıştırın.'
        : '',
    );
  };

  const load = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await Promise.all([loadSettings(), loadGallery()]);
    } catch (loadError: any) {
      setError(loadError.message || 'Ana sayfa ayarları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const uploadFile = async (file: File, fieldKey: string) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `homepage/${fieldKey}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, {
      upsert: false,
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(path);

    return publicUrl;
  };

  const uploadContentImage = async (
    event: ChangeEvent<HTMLInputElement>,
    fieldKey: string,
    onUploaded: (publicUrl: string) => void,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadingField(fieldKey);
    setError('');
    setSuccess('');

    try {
      const publicUrl = await uploadFile(file, fieldKey);
      onUploaded(publicUrl);
    } catch (uploadError: any) {
      setError(`Görsel yükleme hatası: ${uploadError.message || 'Bilinmeyen hata'}`);
    } finally {
      setUploadingField(null);
    }
  };

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/settings/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ana sayfa ayarları kaydedilemedi.');
      }

      setForm(normalizeHomepageContent(data.values));
      setSource('db');
      setTableReady(true);
      setSuccess('Ana sayfa içeriği kaydedildi.');
    } catch (saveError: any) {
      setError(saveError.message || 'Ana sayfa ayarları kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const updateGalleryItem = (slotIndex: number, patch: Partial<HomepageGalleryItem>) => {
    setGalleryItems((prev) => {
      const existing = prev.find((item) => item.slot_index === slotIndex);

      if (existing) {
        return prev.map((item) => (item.slot_index === slotIndex ? { ...item, ...patch } : item));
      }

      return [
        ...prev,
        {
          id: `slot-${slotIndex}`,
          slot_index: slotIndex,
          image_url: null,
          alt_text: '',
          is_active: true,
          created_at: '',
          ...patch,
        } as HomepageGalleryItem,
      ];
    });
  };

  const saveGallerySlot = async (slot: HomepageGalleryItem) => {
    setSavingSlot(slot.slot_index);
    setError('');
    setSuccess('');

    const { error: dbError } = await supabase.from('homepage_gallery_items').upsert(
      {
        slot_index: slot.slot_index,
        image_url: slot.image_url,
        alt_text: slot.alt_text,
        is_active: slot.is_active,
      },
      { onConflict: 'slot_index' },
    );

    setSavingSlot(null);

    if (dbError) {
      setError('Galeri slotu kaydedilemedi. Önce `supabase/shipping_promotions_homepage_upgrade.sql` dosyasını çalıştırın.');
      return;
    }

    await loadGallery();
    setSuccess(`Galeri slotu ${slot.slot_index} kaydedildi.`);
  };

  const uploadGalleryImage = async (slot: HomepageGalleryItem, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setSavingSlot(slot.slot_index);
    setError('');
    setSuccess('');

    try {
      const publicUrl = await uploadFile(file, `gallery-slot-${slot.slot_index}`);
      const nextSlot = { ...slot, image_url: publicUrl };
      updateGalleryItem(slot.slot_index, { image_url: publicUrl });
      await saveGallerySlot(nextSlot);
    } catch (uploadError: any) {
      setSavingSlot(null);
      setError(`Galeri görseli yükleme hatası: ${uploadError.message || 'Bilinmeyen hata'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-brown/30" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-serif text-charcoal">Ana Sayfa Düzenleme</h1>
          <p className="mt-1 text-sm text-brown/50">
            Ana sayfadaki slider, metin, vitrin görselleri ve galeri slotlarını bu ekrandan yönetin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm text-charcoal transition-colors hover:border-gold"
        >
          Yenile
        </button>
      </div>

      {error ? <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p> : null}
      {galleryLoadError ? <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{galleryLoadError}</p> : null}

      {!tableReady ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          Ana sayfa içerik kaydı için veritabanı ayar tablosu hazır değil. Önce
          {' '}
          `supabase/homepage_content_upgrade.sql`
          {' '}
          dosyasını Supabase SQL Editor’da bir kez çalıştırın.
        </div>
      ) : null}

      <div className="rounded-[28px] border border-gray-100 bg-white px-5 py-4 shadow-card">
        <p className="text-sm font-medium text-charcoal">Aktif veri kaynağı</p>
        <p className="mt-1 text-xs text-brown/55">
          {source === 'db' ? 'Veritabanı' : 'Varsayılan içerik'}
        </p>
      </div>

      <form onSubmit={saveSettings} className="space-y-8">
        <SectionCard title="Hero Sliderları" description="Ana sayfanın üst kısmındaki üç slider görselini ve yazılarını yönetin.">
          <div className="grid gap-6 xl:grid-cols-3">
            {form.hero.slides.map((slide, index) => (
              <div key={index} className="rounded-[24px] border border-gray-100 bg-gray-50/70 p-4">
                <p className="mb-4 text-sm font-semibold text-charcoal">Slider {index + 1}</p>
                <ImageField
                  label="Arka Plan Görseli"
                  fieldKey={`hero-slide-${index}`}
                  value={slide.image}
                  altValue={slide.imageAlt}
                  uploading={uploadingField === `hero-slide-${index}`}
                  onUrlChange={(value) => updateForm((draft) => { draft.hero.slides[index].image = value; })}
                  onAltChange={(value) => updateForm((draft) => { draft.hero.slides[index].imageAlt = value; })}
                  onUpload={(event) => uploadContentImage(event, `hero-slide-${index}`, (publicUrl) => {
                    updateForm((draft) => { draft.hero.slides[index].image = publicUrl; });
                  })}
                />
                <div className="mt-4 space-y-4">
                  <TextAreaField
                    label="Başlık"
                    value={slide.title}
                    rows={4}
                    onChange={(value) => updateForm((draft) => { draft.hero.slides[index].title = value; })}
                  />
                  <TextField
                    label="Alt Başlık"
                    value={slide.subtitle}
                    onChange={(value) => updateForm((draft) => { draft.hero.slides[index].subtitle = value; })}
                  />
                  <TextField
                    label="Buton Yazısı"
                    value={slide.ctaLabel}
                    onChange={(value) => updateForm((draft) => { draft.hero.slides[index].ctaLabel = value; })}
                  />
                  <TextField
                    label="Buton Linki"
                    value={slide.href}
                    onChange={(value) => updateForm((draft) => { draft.hero.slides[index].href = value; })}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Kategori Alanı" description="Hero altındaki kategori yazılarını ve linklerini düzenleyin.">
          <div className="space-y-5">
            <TextField
              label="Bölüm Başlığı"
              value={form.categories.heading}
              onChange={(value) => updateForm((draft) => { draft.categories.heading = value; })}
            />
            <div className="grid gap-4 lg:grid-cols-2">
              {form.categories.items.map((item, index) => (
                <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <p className="mb-3 text-sm font-semibold text-charcoal">Kategori {index + 1}</p>
                  <div className="space-y-4">
                    <TextField
                      label="Başlık"
                      value={item.label}
                      onChange={(value) => updateForm((draft) => { draft.categories.items[index].label = value; })}
                    />
                    <TextField
                      label="Link"
                      value={item.href}
                      onChange={(value) => updateForm((draft) => { draft.categories.items[index].href = value; })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Ödüllü Tasarımlar Bloğu" description="İki yan görseli ve ortadaki metin alanını yönetin.">
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-4 rounded-[24px] border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-sm font-semibold text-charcoal">Sol Kart</p>
              <TextField
                label="Rozet Başlığı"
                value={form.brandStory.leftBadgeLabel}
                onChange={(value) => updateForm((draft) => { draft.brandStory.leftBadgeLabel = value; })}
              />
              <TextField
                label="Rozet Yılı"
                value={form.brandStory.leftBadgeYear}
                onChange={(value) => updateForm((draft) => { draft.brandStory.leftBadgeYear = value; })}
              />
              <ImageField
                label="Görsel"
                fieldKey="brand-left"
                value={form.brandStory.leftCard.image}
                altValue={form.brandStory.leftCard.imageAlt}
                uploading={uploadingField === 'brand-left'}
                onUrlChange={(value) => updateForm((draft) => { draft.brandStory.leftCard.image = value; })}
                onAltChange={(value) => updateForm((draft) => { draft.brandStory.leftCard.imageAlt = value; })}
                onUpload={(event) => uploadContentImage(event, 'brand-left', (publicUrl) => {
                  updateForm((draft) => { draft.brandStory.leftCard.image = publicUrl; });
                })}
              />
              <TextAreaField
                label="Başlık"
                value={form.brandStory.leftCard.headline}
                rows={3}
                onChange={(value) => updateForm((draft) => { draft.brandStory.leftCard.headline = value; })}
              />
              <TextField
                label="Buton Yazısı"
                value={form.brandStory.leftCard.ctaLabel}
                onChange={(value) => updateForm((draft) => { draft.brandStory.leftCard.ctaLabel = value; })}
              />
              <TextField
                label="Link"
                value={form.brandStory.leftCard.href}
                onChange={(value) => updateForm((draft) => { draft.brandStory.leftCard.href = value; })}
              />
            </div>

            <div className="space-y-4 rounded-[24px] border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-sm font-semibold text-charcoal">Orta İçerik</p>
              <TextAreaField
                label="Başlık"
                value={form.brandStory.centerTitle}
                rows={5}
                onChange={(value) => updateForm((draft) => { draft.brandStory.centerTitle = value; })}
              />
              <TextAreaField
                label="Alt Yazı"
                value={form.brandStory.centerSubtitle}
                rows={3}
                onChange={(value) => updateForm((draft) => { draft.brandStory.centerSubtitle = value; })}
              />
              <TextField
                label="Buton Yazısı"
                value={form.brandStory.centerCtaLabel}
                onChange={(value) => updateForm((draft) => { draft.brandStory.centerCtaLabel = value; })}
              />
              <TextField
                label="Buton Linki"
                value={form.brandStory.centerCtaHref}
                onChange={(value) => updateForm((draft) => { draft.brandStory.centerCtaHref = value; })}
              />
            </div>

            <div className="space-y-4 rounded-[24px] border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-sm font-semibold text-charcoal">Sağ Kart</p>
              <ImageField
                label="Görsel"
                fieldKey="brand-right"
                value={form.brandStory.rightCard.image}
                altValue={form.brandStory.rightCard.imageAlt}
                uploading={uploadingField === 'brand-right'}
                onUrlChange={(value) => updateForm((draft) => { draft.brandStory.rightCard.image = value; })}
                onAltChange={(value) => updateForm((draft) => { draft.brandStory.rightCard.imageAlt = value; })}
                onUpload={(event) => uploadContentImage(event, 'brand-right', (publicUrl) => {
                  updateForm((draft) => { draft.brandStory.rightCard.image = publicUrl; });
                })}
              />
              <TextAreaField
                label="Başlık"
                value={form.brandStory.rightCard.headline}
                rows={3}
                onChange={(value) => updateForm((draft) => { draft.brandStory.rightCard.headline = value; })}
              />
              <TextField
                label="Buton Yazısı"
                value={form.brandStory.rightCard.ctaLabel}
                onChange={(value) => updateForm((draft) => { draft.brandStory.rightCard.ctaLabel = value; })}
              />
              <TextField
                label="Link"
                value={form.brandStory.rightCard.href}
                onChange={(value) => updateForm((draft) => { draft.brandStory.rightCard.href = value; })}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Öne Çıkan Ürün Sekmeleri" description="Ürün alanındaki sekme adlarını, hedef linkleri ve alt CTA yazılarını değiştirin.">
          <div className="grid gap-4 lg:grid-cols-3">
            {form.featuredProducts.tabs.map((tab, index) => (
              <div key={tab.key} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <p className="mb-3 text-sm font-semibold text-charcoal">Sekme {index + 1}</p>
                <div className="space-y-4">
                  <TextField
                    label="Sekme Adı"
                    value={tab.label}
                    onChange={(value) => updateForm((draft) => { draft.featuredProducts.tabs[index].label = value; })}
                  />
                  <TextField
                    label="CTA Yazısı"
                    value={tab.cta}
                    onChange={(value) => updateForm((draft) => { draft.featuredProducts.tabs[index].cta = value; })}
                  />
                  <TextField
                    label="Link"
                    value={tab.href}
                    onChange={(value) => updateForm((draft) => { draft.featuredProducts.tabs[index].href = value; })}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Yeni Oturma Odanız Bölümü" description="Büyük arka plan görselini, başlığı ve CTA butonunu değiştirin.">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <ImageField
              label="Arka Plan Görseli"
              fieldKey="shop-the-look-bg"
              value={form.shopTheLook.backgroundImage}
              altValue={form.shopTheLook.backgroundImageAlt}
              uploading={uploadingField === 'shop-the-look-bg'}
              onUrlChange={(value) => updateForm((draft) => { draft.shopTheLook.backgroundImage = value; })}
              onAltChange={(value) => updateForm((draft) => { draft.shopTheLook.backgroundImageAlt = value; })}
              onUpload={(event) => uploadContentImage(event, 'shop-the-look-bg', (publicUrl) => {
                updateForm((draft) => { draft.shopTheLook.backgroundImage = publicUrl; });
              })}
            />
            <div className="space-y-4 rounded-[24px] border border-gray-100 bg-gray-50/70 p-4">
              <TextAreaField
                label="Başlık"
                value={form.shopTheLook.title}
                rows={4}
                onChange={(value) => updateForm((draft) => { draft.shopTheLook.title = value; })}
              />
              <TextField
                label="Alt Başlık"
                value={form.shopTheLook.subtitle}
                onChange={(value) => updateForm((draft) => { draft.shopTheLook.subtitle = value; })}
              />
              <TextField
                label="Buton Yazısı"
                value={form.shopTheLook.ctaLabel}
                onChange={(value) => updateForm((draft) => { draft.shopTheLook.ctaLabel = value; })}
              />
              <TextField
                label="Buton Linki"
                value={form.shopTheLook.ctaHref}
                onChange={(value) => updateForm((draft) => { draft.shopTheLook.ctaHref = value; })}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Alt Galeri Slotları" description="Shop the Look bölümünün altındaki 4 görsel kartı yönetin.">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {slots.map((slot) => (
              <div key={slot.slot_index} className="rounded-[24px] border border-gray-100 bg-gray-50/70 p-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] border border-dashed border-stone/30 bg-white">
                  {slot.image_url ? (
                    <Image
                      src={slot.image_url}
                      alt={slot.alt_text || `Slot ${slot.slot_index}`}
                      fill
                      sizes="25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-sm text-brown/35">
                      Slot {slot.slot_index}
                      <br />
                      Fotoğraf alanı
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-4">
                  <TextField
                    label={`Slot ${slot.slot_index} Alt Metni`}
                    value={slot.alt_text || ''}
                    onChange={(value) => updateGalleryItem(slot.slot_index, { alt_text: value })}
                  />

                  <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-charcoal transition-colors hover:border-gold">
                    {savingSlot === slot.slot_index ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    Görsel Yükle
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadGalleryImage(slot, event)} />
                  </label>

                  <button
                    type="button"
                    onClick={() => saveGallerySlot(slot)}
                    disabled={savingSlot === slot.slot_index}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal px-4 py-3 text-sm text-white transition-colors hover:bg-gold disabled:opacity-50"
                  >
                    {savingSlot === slot.slot_index ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Slotu Kaydet
                  </button>

                  {slot.image_url ? (
                    <button
                      type="button"
                      onClick={() => {
                        const nextSlot = { ...slot, image_url: null };
                        updateGalleryItem(slot.slot_index, { image_url: null });
                        void saveGallerySlot(nextSlot);
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-3 text-sm text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Görseli Kaldır
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Alt Vitrin Kartları" description="Üç büyük kategori görselini, başlıklarını ve butonlarını değiştirin.">
          <div className="grid gap-6 xl:grid-cols-3">
            {form.roomShowcase.items.map((item, index) => (
              <div key={index} className="rounded-[24px] border border-gray-100 bg-gray-50/70 p-4">
                <p className="mb-4 text-sm font-semibold text-charcoal">Vitrin {index + 1}</p>
                <ImageField
                  label="Görsel"
                  fieldKey={`room-showcase-${index}`}
                  value={item.image}
                  altValue={item.imageAlt}
                  uploading={uploadingField === `room-showcase-${index}`}
                  onUrlChange={(value) => updateForm((draft) => { draft.roomShowcase.items[index].image = value; })}
                  onAltChange={(value) => updateForm((draft) => { draft.roomShowcase.items[index].imageAlt = value; })}
                  onUpload={(event) => uploadContentImage(event, `room-showcase-${index}`, (publicUrl) => {
                    updateForm((draft) => { draft.roomShowcase.items[index].image = publicUrl; });
                  })}
                />
                <div className="mt-4 space-y-4">
                  <TextField
                    label="Başlık"
                    value={item.label}
                    onChange={(value) => updateForm((draft) => { draft.roomShowcase.items[index].label = value; })}
                  />
                  <TextField
                    label="Buton Yazısı"
                    value={item.ctaLabel}
                    onChange={(value) => updateForm((draft) => { draft.roomShowcase.items[index].ctaLabel = value; })}
                  />
                  <TextField
                    label="Link"
                    value={item.href}
                    onChange={(value) => updateForm((draft) => { draft.roomShowcase.items[index].href = value; })}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tüm Ürünler Bölümü" description="Ürün listesinin üstündeki başlık alanını ve butonu düzenleyin.">
          <SectionFormGrid>
            <TextField
              label="Üst Etiket"
              value={form.allProducts.eyebrow}
              onChange={(value) => updateForm((draft) => { draft.allProducts.eyebrow = value; })}
            />
            <TextField
              label="Başlık"
              value={form.allProducts.heading}
              onChange={(value) => updateForm((draft) => { draft.allProducts.heading = value; })}
            />
            <TextAreaField
              label="Açıklama"
              value={form.allProducts.description}
              rows={4}
              onChange={(value) => updateForm((draft) => { draft.allProducts.description = value; })}
            />
            <TextField
              label="Buton Yazısı"
              value={form.allProducts.ctaLabel}
              onChange={(value) => updateForm((draft) => { draft.allProducts.ctaLabel = value; })}
            />
            <TextField
              label="Buton Linki"
              value={form.allProducts.ctaHref}
              onChange={(value) => updateForm((draft) => { draft.allProducts.ctaHref = value; })}
            />
          </SectionFormGrid>
        </SectionCard>

        <SectionCard title="Blog Bölümü" description="Blog alanının başlığını, açıklamasını ve CTA metnini değiştirin.">
          <SectionFormGrid>
            <TextField
              label="Üst Etiket"
              value={form.blogHighlights.eyebrow}
              onChange={(value) => updateForm((draft) => { draft.blogHighlights.eyebrow = value; })}
            />
            <TextField
              label="Başlık"
              value={form.blogHighlights.heading}
              onChange={(value) => updateForm((draft) => { draft.blogHighlights.heading = value; })}
            />
            <TextAreaField
              label="Açıklama"
              value={form.blogHighlights.description}
              rows={4}
              onChange={(value) => updateForm((draft) => { draft.blogHighlights.description = value; })}
            />
            <TextField
              label="Buton Yazısı"
              value={form.blogHighlights.ctaLabel}
              onChange={(value) => updateForm((draft) => { draft.blogHighlights.ctaLabel = value; })}
            />
            <TextField
              label="Buton Linki"
              value={form.blogHighlights.ctaHref}
              onChange={(value) => updateForm((draft) => { draft.blogHighlights.ctaHref = value; })}
            />
          </SectionFormGrid>
        </SectionCard>

        <SectionCard title="Müşteri Yorumları" description="Başlığı ve üç yorum kartını bu alandan düzenleyin.">
          <div className="space-y-5">
            <TextField
              label="Bölüm Başlığı"
              value={form.testimonials.heading}
              onChange={(value) => updateForm((draft) => { draft.testimonials.heading = value; })}
            />
            <div className="grid gap-4 xl:grid-cols-3">
              {form.testimonials.items.map((item, index) => (
                <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <p className="mb-3 text-sm font-semibold text-charcoal">Yorum {index + 1}</p>
                  <div className="space-y-4">
                    <TextField
                      label="İsim"
                      value={item.name}
                      onChange={(value) => updateForm((draft) => { draft.testimonials.items[index].name = value; })}
                    />
                    <TextAreaField
                      label="Yorum"
                      value={item.text}
                      rows={5}
                      onChange={(value) => updateForm((draft) => { draft.testimonials.items[index].text = value; })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Neden Farklı Bölümü" description="Alt güven alanındaki başlığı ve beş açıklama kartını değiştirin.">
          <div className="space-y-5">
            <TextAreaField
              label="Bölüm Başlığı"
              value={form.trustBar.heading}
              rows={3}
              onChange={(value) => updateForm((draft) => { draft.trustBar.heading = value; })}
            />
            <div className="grid gap-4 xl:grid-cols-5">
              {form.trustBar.items.map((item, index) => (
                <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <p className="mb-3 text-sm font-semibold text-charcoal">Özellik {index + 1}</p>
                  <div className="space-y-4">
                    <TextField
                      label="Başlık"
                      value={item.title}
                      onChange={(value) => updateForm((draft) => { draft.trustBar.items[index].title = value; })}
                    />
                    <TextAreaField
                      label="Açıklama"
                      value={item.description}
                      rows={5}
                      onChange={(value) => updateForm((draft) => { draft.trustBar.items[index].description = value; })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gold disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Tüm Değişiklikleri Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-[32px] border border-gray-100 bg-white p-6 shadow-card sm:p-8">
      <div>
        <h2 className="text-xl font-serif text-charcoal">{title}</h2>
        <p className="mt-1 text-sm text-brown/55">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SectionFormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 lg:grid-cols-2">{children}</div>;
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-charcoal">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  rows,
  onChange,
}: {
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-charcoal">{label}</label>
      <textarea
        value={value}
        rows={rows || 4}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
      />
    </div>
  );
}

function ImageField({
  label,
  fieldKey,
  value,
  altValue,
  uploading,
  onUrlChange,
  onAltChange,
  onUpload,
}: {
  label: string;
  fieldKey: string;
  value: string;
  altValue: string;
  uploading: boolean;
  onUrlChange: (value: string) => void;
  onAltChange: (value: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">{label}</label>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] border border-dashed border-stone/30 bg-cream">
          {value ? (
            <Image
              src={value}
              alt={altValue || label}
              fill
              sizes="(max-width: 1280px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-brown/35">
              Görsel seçilmedi
            </div>
          )}
        </div>
      </div>

      <TextField label="Görsel URL" value={value} onChange={onUrlChange} />
      <TextField label="Alt Metin" value={altValue} onChange={onAltChange} />

      <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-charcoal transition-colors hover:border-gold">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        Görsel Yükle
        <input
          key={fieldKey}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onUpload}
        />
      </label>
    </div>
  );
}
