'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Save, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { HomepageGalleryItem } from '@/lib/types';

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
  const [items, setItems] = useState<HomepageGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('homepage_gallery_items').select('*').order('slot_index');
    setItems((data as HomepageGalleryItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const slots = useMemo(() => getPlaceholderSlots(items), [items]);

  const updateItem = (slotIndex: number, patch: Partial<HomepageGalleryItem>) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.slot_index === slotIndex);
      if (existing) {
        return prev.map((item) => (item.slot_index === slotIndex ? { ...item, ...patch } : item));
      }
      return [...prev, { id: `slot-${slotIndex}`, slot_index: slotIndex, image_url: null, alt_text: '', is_active: true, created_at: '', ...patch } as HomepageGalleryItem];
    });
  };

  const saveSlot = async (slot: HomepageGalleryItem) => {
    setSavingSlot(slot.slot_index);
    setError('');
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
      setError('Kaydedilemedi. Önce `supabase/shipping_promotions_homepage_upgrade.sql` dosyasını çalıştırın.');
      return;
    }
    load();
  };

  const uploadImage = async (slot: HomepageGalleryItem, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSavingSlot(slot.slot_index);
    setError('');
    const ext = file.name.split('.').pop();
    const path = `homepage/${Date.now()}-${slot.slot_index}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file);

    if (uploadError) {
      setSavingSlot(null);
      setError(`Yükleme hatası: ${uploadError.message}`);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    const nextSlot = { ...slot, image_url: publicUrl };
    updateItem(slot.slot_index, { image_url: publicUrl });
    await saveSlot(nextSlot);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-charcoal">Ana Sayfa Görsel Alanı</h1>
        <p className="mt-1 text-sm text-brown/50">
          “YENİ OTURMA ODANIZ / Kalıcı Mobilya” bölümünün altında görünecek 4 görsel slotunu yönetin.
        </p>
      </div>

      {error ? <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brown/30" /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {slots.map((slot) => (
            <div key={slot.slot_index} className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-card">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-dashed border-stone/30 bg-cream">
                {slot.image_url ? (
                  <Image src={slot.image_url} alt={slot.alt_text || `Slot ${slot.slot_index}`} fill sizes="25vw" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-sm text-brown/35">
                    Slot {slot.slot_index}
                    <br />
                    Fotoğraf alanı
                  </div>
                )}
              </div>

              <p className="mt-4 text-sm font-medium text-charcoal">Görsel Slotu {slot.slot_index}</p>

              <input
                value={slot.alt_text || ''}
                onChange={(e) => updateItem(slot.slot_index, { alt_text: e.target.value })}
                className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                placeholder="Alternatif metin"
              />

              <div className="mt-4 flex flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-charcoal hover:border-gold">
                  <ImagePlus className="w-4 h-4" />
                  Görsel Yükle
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(slot, event)} />
                </label>
                <button onClick={() => saveSlot(slot)} disabled={savingSlot === slot.slot_index} className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-4 py-3 text-sm text-white hover:bg-gold disabled:opacity-50">
                  {savingSlot === slot.slot_index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Kaydet
                </button>
                {slot.image_url ? (
                  <button
                    onClick={() => {
                      const nextSlot = { ...slot, image_url: null };
                      updateItem(slot.slot_index, { image_url: null });
                      saveSlot(nextSlot);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-3 text-sm text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Görseli Kaldır
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
