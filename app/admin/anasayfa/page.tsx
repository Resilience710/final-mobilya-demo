'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ImagePlus, Loader2, Save, Trash2, Plus, GripVertical,
  ChevronUp, ChevronDown, Eye, EyeOff,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TRUST_ICON_MAP } from '@/components/sections/TrustBar';
import type {
  HeroSlide, Testimonial, TrustFeature, RoomCollection,
  BrandStoryContent, HomepageGalleryItem,
} from '@/lib/types';

// ─── Ortak yardımcılar ───────────────────────────────────────────────────────

type Tab = 'announcement' | 'hero' | 'brand' | 'rooms' | 'gallery' | 'testimonials' | 'trust';

const TABS: { id: Tab; label: string }[] = [
  { id: 'announcement', label: 'Duyuru Çubuğu' },
  { id: 'hero',         label: 'Hero Slider' },
  { id: 'brand',        label: 'Marka Hikayesi' },
  { id: 'rooms',        label: 'Oda Koleksiyonları' },
  { id: 'gallery',      label: 'Shop The Look' },
  { id: 'testimonials', label: 'Yorumlar' },
  { id: 'trust',        label: 'Güven Özellikleri' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-brown/60 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 ${className}`}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 resize-none"
    />
  );
}

function SaveBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-5 py-2.5 text-sm text-white hover:bg-gold disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      Kaydet
    </button>
  );
}

function DeleteBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      Sil
    </button>
  );
}

function ToggleBtn({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
    >
      {active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      {active ? 'Aktif' : 'Pasif'}
    </button>
  );
}

function ImageUploadBox({
  imageUrl, onUpload, onRemove, uploading, storagePath, label,
}: {
  imageUrl: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
  uploading: boolean;
  storagePath: string;
  label?: string;
}) {
  const supabase = createClient();

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop();
    const path = `${storagePath}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) { alert(`Yükleme hatası: ${error.message}`); return; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    onUpload(publicUrl);
  };

  return (
    <div className="space-y-2">
      {label && <span className="block text-xs font-medium text-brown/60 uppercase tracking-wider">{label}</span>}
      <div className="relative aspect-video overflow-hidden rounded-xl border border-dashed border-stone/30 bg-cream">
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="400px" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brown/30">Görsel yok</div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <label className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-charcoal hover:border-gold transition-colors">
          <ImagePlus className="w-4 h-4" />
          {imageUrl ? 'Değiştir' : 'Yükle'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        {imageUrl && (
          <button onClick={onRemove} className="rounded-xl border border-red-100 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Duyuru Çubuğu ─────────────────────────────────────────────────────

function AnnouncementTab() {
  const supabase = createClient();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('app_settings').select('value').eq('key', 'announcement').single()
      .then(({ data }: { data: { value: any } | null }) => {
        if (data?.value) setText(data.value.text ?? '');
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true); setMsg('');
    const { error } = await supabase.from('app_settings').upsert(
      { key: 'announcement', value: { text, is_active: true } },
      { onConflict: 'key' },
    );
    setSaving(false);
    setMsg(error ? 'Kaydedilemedi: ' + error.message : 'Kaydedildi!');
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brown/30" /></div>;

  return (
    <div className="max-w-xl space-y-4">
      <p className="text-sm text-brown/50">Sitenin en üstündeki koyu şeritte görünen kargo/kampanya metni.</p>
      <Field label="Duyuru Metni">
        <Input value={text} onChange={setText} placeholder="5.000 ₺ üzeri siparişlerde ücretsiz kargo..." />
      </Field>
      <div className="flex items-center gap-3">
        <SaveBtn loading={saving} onClick={save} />
        {msg && <span className={`text-sm ${msg.startsWith('Kay') && !msg.includes('edi') ? 'text-red-500' : 'text-green-600'}`}>{msg}</span>}
      </div>
    </div>
  );
}

// ─── Tab: Hero Slider ────────────────────────────────────────────────────────

function HeroTab() {
  const supabase = createClient();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('hero_slides').select('*').order('sort_order');
    setSlides((data as HeroSlide[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<HeroSlide>) =>
    setSlides(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  const save = async (slide: HeroSlide) => {
    setSaving(slide.id);
    const { id, created_at, updated_at, ...rest } = slide;
    const isNew = id.startsWith('new-');
    if (isNew) {
      await supabase.from('hero_slides').insert(rest);
    } else {
      await supabase.from('hero_slides').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id);
    }
    setSaving(null);
    load();
  };

  const del = async (slide: HeroSlide) => {
    if (!confirm('Bu slide silinsin mi?')) return;
    setDeleting(slide.id);
    if (!slide.id.startsWith('new-')) {
      await supabase.from('hero_slides').delete().eq('id', slide.id);
    }
    setDeleting(null);
    load();
  };

  const addNew = () => {
    const newSlide: HeroSlide = {
      id: `new-${Date.now()}`,
      sort_order: (slides[slides.length - 1]?.sort_order ?? 0) + 1,
      image_url: null,
      title1: '',
      title2: '',
      italic_text: '',
      cta_text: '',
      cta_href: '/',
      is_active: true,
      created_at: '',
      updated_at: '',
    };
    setSlides(prev => [...prev, newSlide]);
  };

  const handleImageUpload = async (slide: HeroSlide, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(slide.id);
    const ext = file.name.split('.').pop();
    const path = `hero/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) { alert(error.message); setUploading(null); return; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    const updated = { ...slide, image_url: publicUrl };
    update(slide.id, { image_url: publicUrl });
    setUploading(null);
    await save(updated);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brown/30" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-brown/50">Ana sayfanın tam ekran slayt gösterisini yönetin.</p>
        <button onClick={addNew} className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm text-white hover:bg-gold/80 transition-colors">
          <Plus className="w-4 h-4" /> Yeni Slide
        </button>
      </div>

      <div className="space-y-6">
        {slides.map(slide => (
          <div key={slide.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium text-charcoal">Slide #{slide.sort_order}</span>
              <div className="flex items-center gap-2">
                <ToggleBtn active={slide.is_active} onChange={v => update(slide.id, { is_active: v })} />
                <DeleteBtn loading={deleting === slide.id} onClick={() => del(slide)} />
                <SaveBtn loading={saving === slide.id} onClick={() => save(slide)} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sol: görsel */}
              <div className="space-y-3">
                <div className="relative aspect-video overflow-hidden rounded-xl border border-dashed border-stone/30 bg-cream">
                  {slide.image_url ? (
                    <Image src={slide.image_url} alt="" fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-brown/30">Görsel yok</div>
                  )}
                  {uploading === slide.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <Loader2 className="w-6 h-6 animate-spin text-gold" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-charcoal hover:border-gold transition-colors">
                    <ImagePlus className="w-4 h-4" /> {slide.image_url ? 'Değiştir' : 'Yükle'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(slide, e)} />
                  </label>
                  {slide.image_url && (
                    <button onClick={() => update(slide.id, { image_url: null })} className="rounded-xl border border-red-100 px-3 py-2 text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Field label="Görsel URL (veya yükle)">
                  <Input value={slide.image_url ?? ''} onChange={v => update(slide.id, { image_url: v || null })} placeholder="https://..." />
                </Field>
              </div>

              {/* Sağ: içerik */}
              <div className="space-y-3">
                <Field label="Başlık 1. Satır">
                  <Input value={slide.title1} onChange={v => update(slide.id, { title1: v })} placeholder="ALANINIZI" />
                </Field>
                <Field label="Başlık 2. Satır">
                  <Input value={slide.title2} onChange={v => update(slide.id, { title2: v })} placeholder="DÖNÜŞTÜRÜN" />
                </Field>
                <Field label="İtalik Alt Yazı">
                  <Input value={slide.italic_text} onChange={v => update(slide.id, { italic_text: v })} placeholder="Hayalinizdeki Mobilya" />
                </Field>
                <Field label="Buton Metni">
                  <Input value={slide.cta_text} onChange={v => update(slide.id, { cta_text: v })} placeholder="OTURMA ODALARIMIZI KEŞFEDİN" />
                </Field>
                <Field label="Buton Linki">
                  <Input value={slide.cta_href} onChange={v => update(slide.id, { cta_href: v })} placeholder="/kategori/oturma-grubu" />
                </Field>
                <Field label="Sıra">
                  <Input
                    value={String(slide.sort_order)}
                    onChange={v => update(slide.id, { sort_order: Number(v) || 0 })}
                    placeholder="1"
                  />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Marka Hikayesi ─────────────────────────────────────────────────────

const DEFAULT_BRAND: BrandStoryContent = {
  heading_line1: 'ÖDÜLLÜ', heading_line2: 'MOBİLYA', heading_line3: 'TASARIMLARI!',
  subtitle_line1: 'Yenilikçi Tasarım,', subtitle_line2: 'Sınırsız Konfor',
  cta_text: 'TÜM ÜRÜNLERİ GÖRÜN', cta_href: '/urunler',
  left_image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85',
  left_image_label: 'BEJ İÇ MEKAN', left_image_href: '/kategori/oturma-grubu',
  right_image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85',
  right_image_label: 'MUTFAK MOBİLYALARI', right_image_href: '/kategori/yemek-odasi',
};

function BrandTab() {
  const supabase = createClient();
  const [content, setContent] = useState<BrandStoryContent>(DEFAULT_BRAND);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploadingLeft, setUploadingLeft] = useState(false);
  const [uploadingRight, setUploadingRight] = useState(false);

  useEffect(() => {
    supabase.from('app_settings').select('value').eq('key', 'brand_story').single()
      .then(({ data }: { data: { value: any } | null }) => {
        if (data?.value) setContent(data.value as BrandStoryContent);
        setLoading(false);
      });
  }, []);

  const set = (patch: Partial<BrandStoryContent>) => setContent(prev => ({ ...prev, ...patch }));

  const save = async () => {
    setSaving(true); setMsg('');
    const { error } = await supabase.from('app_settings').upsert(
      { key: 'brand_story', value: content },
      { onConflict: 'key' },
    );
    setSaving(false);
    setMsg(error ? 'Kaydedilemedi: ' + error.message : 'Kaydedildi!');
  };

  const uploadImg = async (side: 'left' | 'right', e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    side === 'left' ? setUploadingLeft(true) : setUploadingRight(true);
    const ext = file.name.split('.').pop();
    const path = `brand/${Date.now()}-${side}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) { alert(error.message); side === 'left' ? setUploadingLeft(false) : setUploadingRight(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    side === 'left' ? set({ left_image_url: publicUrl }) : set({ right_image_url: publicUrl });
    side === 'left' ? setUploadingLeft(false) : setUploadingRight(false);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brown/30" /></div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <p className="text-sm text-brown/50">Ana sayfadaki 3-kolonlu marka hikayesi bölümünü düzenleyin.</p>

      {/* Orta metin */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
        <h3 className="font-medium text-charcoal">Orta Metin</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Başlık 1. Satır"><Input value={content.heading_line1} onChange={v => set({ heading_line1: v })} /></Field>
          <Field label="Başlık 2. Satır"><Input value={content.heading_line2} onChange={v => set({ heading_line2: v })} /></Field>
          <Field label="Başlık 3. Satır"><Input value={content.heading_line3} onChange={v => set({ heading_line3: v })} /></Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Alt Yazı 1. Satır"><Input value={content.subtitle_line1} onChange={v => set({ subtitle_line1: v })} /></Field>
          <Field label="Alt Yazı 2. Satır"><Input value={content.subtitle_line2} onChange={v => set({ subtitle_line2: v })} /></Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Buton Metni"><Input value={content.cta_text} onChange={v => set({ cta_text: v })} /></Field>
          <Field label="Buton Linki"><Input value={content.cta_href} onChange={v => set({ cta_href: v })} /></Field>
        </div>
      </div>

      {/* Sol görsel */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
        <h3 className="font-medium text-charcoal">Sol Görsel</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-dashed border-stone/30 bg-cream">
              {content.left_image_url ? <Image src={content.left_image_url} alt="" fill className="object-cover" sizes="300px" /> : <div className="flex h-full items-center justify-center text-sm text-brown/30">Görsel yok</div>}
              {uploadingLeft && <div className="absolute inset-0 flex items-center justify-center bg-white/70"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>}
            </div>
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm hover:border-gold">
              <ImagePlus className="w-4 h-4" /> Görsel Yükle
              <input type="file" accept="image/*" className="hidden" onChange={e => uploadImg('left', e)} />
            </label>
          </div>
          <div className="space-y-3">
            <Field label="Görsel URL"><Input value={content.left_image_url} onChange={v => set({ left_image_url: v })} placeholder="https://..." /></Field>
            <Field label="Etiket (görselin üstündeki yazı)"><Input value={content.left_image_label} onChange={v => set({ left_image_label: v })} placeholder="BEJ İÇ MEKAN" /></Field>
            <Field label="Link"><Input value={content.left_image_href} onChange={v => set({ left_image_href: v })} placeholder="/kategori/..." /></Field>
          </div>
        </div>
      </div>

      {/* Sağ görsel */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
        <h3 className="font-medium text-charcoal">Sağ Görsel</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-dashed border-stone/30 bg-cream">
              {content.right_image_url ? <Image src={content.right_image_url} alt="" fill className="object-cover" sizes="300px" /> : <div className="flex h-full items-center justify-center text-sm text-brown/30">Görsel yok</div>}
              {uploadingRight && <div className="absolute inset-0 flex items-center justify-center bg-white/70"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>}
            </div>
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm hover:border-gold">
              <ImagePlus className="w-4 h-4" /> Görsel Yükle
              <input type="file" accept="image/*" className="hidden" onChange={e => uploadImg('right', e)} />
            </label>
          </div>
          <div className="space-y-3">
            <Field label="Görsel URL"><Input value={content.right_image_url} onChange={v => set({ right_image_url: v })} placeholder="https://..." /></Field>
            <Field label="Etiket"><Input value={content.right_image_label} onChange={v => set({ right_image_label: v })} placeholder="MUTFAK MOBİLYALARI" /></Field>
            <Field label="Link"><Input value={content.right_image_href} onChange={v => set({ right_image_href: v })} placeholder="/kategori/..." /></Field>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SaveBtn loading={saving} onClick={save} />
        {msg && <span className={`text-sm ${msg.includes('edi') ? 'text-red-500' : 'text-green-600'}`}>{msg}</span>}
      </div>
    </div>
  );
}

// ─── Tab: Oda Koleksiyonları ─────────────────────────────────────────────────

function RoomsTab() {
  const supabase = createClient();
  const [rooms, setRooms] = useState<RoomCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('room_collections').select('*').order('sort_order');
    setRooms((data as RoomCollection[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<RoomCollection>) =>
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const save = async (room: RoomCollection) => {
    setSaving(room.id);
    const { id, created_at, ...rest } = room;
    const isNew = id.startsWith('new-');
    if (isNew) {
      await supabase.from('room_collections').insert(rest);
    } else {
      await supabase.from('room_collections').update(rest).eq('id', id);
    }
    setSaving(null);
    load();
  };

  const del = async (room: RoomCollection) => {
    if (!confirm('Bu koleksiyon silinsin mi?')) return;
    setDeleting(room.id);
    if (!room.id.startsWith('new-')) await supabase.from('room_collections').delete().eq('id', room.id);
    setDeleting(null);
    load();
  };

  const addNew = () => {
    setRooms(prev => [...prev, {
      id: `new-${Date.now()}`,
      sort_order: (prev[prev.length - 1]?.sort_order ?? 0) + 1,
      label: '',
      href: '/',
      image_url: null,
      is_active: true,
      created_at: '',
    }]);
  };

  const handleImg = async (room: RoomCollection, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(room.id);
    const ext = file.name.split('.').pop();
    const path = `rooms/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) { alert(error.message); setUploading(null); return; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    const updated = { ...room, image_url: publicUrl };
    update(room.id, { image_url: publicUrl });
    setUploading(null);
    await save(updated);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brown/30" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-brown/50">Ana sayfadaki 3'lü oda koleksiyonu grid bölümü.</p>
        <button onClick={addNew} className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm text-white hover:bg-gold/80 transition-colors">
          <Plus className="w-4 h-4" /> Yeni Koleksiyon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {rooms.map(room => (
          <div key={room.id} className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-stone/30 bg-cream">
              {room.image_url ? <Image src={room.image_url} alt="" fill className="object-cover" sizes="300px" /> : <div className="flex h-full items-center justify-center text-sm text-brown/30">Görsel yok</div>}
              {uploading === room.id && <div className="absolute inset-0 flex items-center justify-center bg-white/70"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>}
            </div>

            <Field label="Görsel URL">
              <Input value={room.image_url ?? ''} onChange={v => update(room.id, { image_url: v || null })} placeholder="https://..." />
            </Field>
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm hover:border-gold">
              <ImagePlus className="w-4 h-4" /> Görsel Yükle
              <input type="file" accept="image/*" className="hidden" onChange={e => handleImg(room, e)} />
            </label>
            <Field label="Etiket (örn: OTURMA ODALARI)">
              <Input value={room.label} onChange={v => update(room.id, { label: v })} placeholder="OTURMA ODALARI" />
            </Field>
            <Field label="Link">
              <Input value={room.href} onChange={v => update(room.id, { href: v })} placeholder="/kategori/..." />
            </Field>
            <Field label="Sıra">
              <Input value={String(room.sort_order)} onChange={v => update(room.id, { sort_order: Number(v) || 0 })} />
            </Field>

            <div className="flex items-center gap-2 pt-1">
              <ToggleBtn active={room.is_active} onChange={v => update(room.id, { is_active: v })} />
              <DeleteBtn loading={deleting === room.id} onClick={() => del(room)} />
              <SaveBtn loading={saving === room.id} onClick={() => save(room)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Shop The Look (Gallery) ────────────────────────────────────────────

function getGallerySlots(items: HomepageGalleryItem[]) {
  return Array.from({ length: 4 }, (_, i) => {
    const slotIndex = i + 1;
    return items.find(it => it.slot_index === slotIndex) || {
      id: `slot-${slotIndex}`, slot_index: slotIndex,
      image_url: null, alt_text: `Slot ${slotIndex}`, is_active: true, created_at: '',
    };
  });
}

function GalleryTab() {
  const supabase = createClient();
  const [items, setItems] = useState<HomepageGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('homepage_gallery_items').select('*').order('slot_index');
    setItems((data as HomepageGalleryItem[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateItem = (slotIndex: number, patch: Partial<HomepageGalleryItem>) =>
    setItems(prev => {
      const existing = prev.find(it => it.slot_index === slotIndex);
      if (existing) return prev.map(it => it.slot_index === slotIndex ? { ...it, ...patch } : it);
      return [...prev, { id: `slot-${slotIndex}`, slot_index: slotIndex, image_url: null, alt_text: '', is_active: true, created_at: '', ...patch } as HomepageGalleryItem];
    });

  const saveSlot = async (slot: HomepageGalleryItem) => {
    setSaving(slot.slot_index);
    await supabase.from('homepage_gallery_items').upsert(
      { slot_index: slot.slot_index, image_url: slot.image_url, alt_text: slot.alt_text, is_active: slot.is_active },
      { onConflict: 'slot_index' },
    );
    setSaving(null);
    load();
  };

  const uploadImage = async (slot: HomepageGalleryItem, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(slot.slot_index);
    const ext = file.name.split('.').pop();
    const path = `homepage/${Date.now()}-${slot.slot_index}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) { setSaving(null); alert(error.message); return; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    const updated = { ...slot, image_url: publicUrl };
    updateItem(slot.slot_index, { image_url: publicUrl });
    await saveSlot(updated);
  };

  const slots = getGallerySlots(items);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brown/30" /></div>;

  return (
    <div className="space-y-5">
      <p className="text-sm text-brown/50">"Shop The Look" bölümünün altındaki 4 görsel slotunu yönetin.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {slots.map(slot => (
          <div key={slot.slot_index} className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-dashed border-stone/30 bg-cream">
              {slot.image_url ? <Image src={slot.image_url} alt={slot.alt_text ?? ''} fill sizes="25vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-brown/30">Slot {slot.slot_index}</div>}
            </div>
            <p className="text-sm font-medium text-charcoal">Slot {slot.slot_index}</p>
            <Input value={slot.alt_text ?? ''} onChange={v => updateItem(slot.slot_index, { alt_text: v })} placeholder="Alternatif metin" />
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm hover:border-gold">
              <ImagePlus className="w-4 h-4" /> Görsel Yükle
              <input type="file" accept="image/*" className="hidden" onChange={e => uploadImage(slot, e)} />
            </label>
            <button onClick={() => saveSlot(slot)} disabled={saving === slot.slot_index} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-sm text-white hover:bg-gold disabled:opacity-50 transition-colors">
              {saving === slot.slot_index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Kaydet
            </button>
            {slot.image_url && (
              <button onClick={() => { const s = { ...slot, image_url: null }; updateItem(slot.slot_index, { image_url: null }); saveSlot(s); }} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" /> Görseli Kaldır
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Yorumlar ───────────────────────────────────────────────────────────

function TestimonialsTab() {
  const supabase = createClient();
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('testimonials').select('*').order('sort_order');
    setReviews((data as Testimonial[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<Testimonial>) =>
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const save = async (r: Testimonial) => {
    setSaving(r.id);
    const { id, created_at, ...rest } = r;
    if (id.startsWith('new-')) {
      await supabase.from('testimonials').insert(rest);
    } else {
      await supabase.from('testimonials').update(rest).eq('id', id);
    }
    setSaving(null);
    load();
  };

  const del = async (r: Testimonial) => {
    if (!confirm('Bu yorum silinsin mi?')) return;
    setDeleting(r.id);
    if (!r.id.startsWith('new-')) await supabase.from('testimonials').delete().eq('id', r.id);
    setDeleting(null);
    load();
  };

  const addNew = () => {
    setReviews(prev => [...prev, {
      id: `new-${Date.now()}`,
      sort_order: (prev[prev.length - 1]?.sort_order ?? 0) + 1,
      author_name: '',
      review_text: '',
      rating: 5,
      is_active: true,
      created_at: '',
    }]);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brown/30" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-brown/50">Ana sayfadaki müşteri yorumları bölümü.</p>
        <button onClick={addNew} className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm text-white hover:bg-gold/80 transition-colors">
          <Plus className="w-4 h-4" /> Yeni Yorum
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Field label="Puan (1-5)">
                <select
                  value={r.rating}
                  onChange={e => update(r.id, { rating: Number(e.target.value) })}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                >
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} ★</option>)}
                </select>
              </Field>
              <div className="flex items-center gap-2">
                <ToggleBtn active={r.is_active} onChange={v => update(r.id, { is_active: v })} />
                <DeleteBtn loading={deleting === r.id} onClick={() => del(r)} />
                <SaveBtn loading={saving === r.id} onClick={() => save(r)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Müşteri Adı">
                <Input value={r.author_name} onChange={v => update(r.id, { author_name: v })} placeholder="Selin Yıldız" />
              </Field>
              <Field label="Sıra">
                <Input value={String(r.sort_order)} onChange={v => update(r.id, { sort_order: Number(v) || 0 })} />
              </Field>
            </div>
            <Field label="Yorum Metni">
              <Textarea value={r.review_text} onChange={v => update(r.id, { review_text: v })} placeholder="Müşteri yorumu..." rows={2} />
            </Field>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Güven Özellikleri ──────────────────────────────────────────────────

const ICON_OPTIONS = Object.keys(TRUST_ICON_MAP);

function TrustTab() {
  const supabase = createClient();
  const [features, setFeatures] = useState<TrustFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('trust_features').select('*').order('sort_order');
    setFeatures((data as TrustFeature[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<TrustFeature>) =>
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));

  const save = async (f: TrustFeature) => {
    setSaving(f.id);
    const { id, created_at, ...rest } = f;
    if (id.startsWith('new-')) {
      await supabase.from('trust_features').insert(rest);
    } else {
      await supabase.from('trust_features').update(rest).eq('id', id);
    }
    setSaving(null);
    load();
  };

  const del = async (f: TrustFeature) => {
    if (!confirm('Bu özellik silinsin mi?')) return;
    setDeleting(f.id);
    if (!f.id.startsWith('new-')) await supabase.from('trust_features').delete().eq('id', f.id);
    setDeleting(null);
    load();
  };

  const addNew = () => {
    setFeatures(prev => [...prev, {
      id: `new-${Date.now()}`,
      sort_order: (prev[prev.length - 1]?.sort_order ?? 0) + 1,
      icon_name: 'Shield',
      title: '',
      description: '',
      is_active: true,
      created_at: '',
    }]);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brown/30" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-brown/50">Ana sayfadaki "Mobilyalarımız Neden Farklı?" bölümü.</p>
        <button onClick={addNew} className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm text-white hover:bg-gold/80 transition-colors">
          <Plus className="w-4 h-4" /> Yeni Özellik
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map(f => {
          const Icon = TRUST_ICON_MAP[f.icon_name];
          return (
            <div key={f.id} className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {Icon && <Icon className="w-8 h-8 text-charcoal stroke-[1.2]" />}
                  <span className="text-sm font-medium text-charcoal">{f.title || 'Yeni Özellik'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ToggleBtn active={f.is_active} onChange={v => update(f.id, { is_active: v })} />
                  <DeleteBtn loading={deleting === f.id} onClick={() => del(f)} />
                  <SaveBtn loading={saving === f.id} onClick={() => save(f)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="İkon">
                  <select
                    value={f.icon_name}
                    onChange={e => update(f.id, { icon_name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                  >
                    {ICON_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </Field>
                <Field label="Sıra">
                  <Input value={String(f.sort_order)} onChange={v => update(f.id, { sort_order: Number(v) || 0 })} />
                </Field>
              </div>
              <Field label="Başlık">
                <Input value={f.title} onChange={v => update(f.id, { title: v })} placeholder="USTALIK GARANTİSİ" />
              </Field>
              <Field label="Açıklama">
                <Textarea value={f.description} onChange={v => update(f.id, { description: v })} placeholder="Kısa açıklama..." rows={2} />
              </Field>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Ana sayfa ───────────────────────────────────────────────────────────────

export default function AdminAnasayfaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('announcement');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-charcoal">Ana Sayfa Yönetimi</h1>
        <p className="mt-1 text-sm text-brown/50">
          Ana sayfadaki tüm bölümleri, metinleri, fotoğrafları ve slider'ları buradan düzenleyin.
        </p>
      </div>

      {/* Sekme başlıkları */}
      <div className="flex gap-1 flex-wrap border-b border-gray-100 pb-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors ${
              activeTab === tab.id
                ? 'bg-white border border-b-white border-gray-100 text-charcoal -mb-px'
                : 'text-brown/50 hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sekme içerikleri */}
      <div>
        {activeTab === 'announcement'  && <AnnouncementTab />}
        {activeTab === 'hero'          && <HeroTab />}
        {activeTab === 'brand'         && <BrandTab />}
        {activeTab === 'rooms'         && <RoomsTab />}
        {activeTab === 'gallery'       && <GalleryTab />}
        {activeTab === 'testimonials'  && <TestimonialsTab />}
        {activeTab === 'trust'         && <TrustTab />}
      </div>
    </div>
  );
}
