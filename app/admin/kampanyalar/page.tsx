'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Loader2, X, Megaphone, Sparkles, CalendarClock, ArrowUpRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Campaign, Category } from '@/lib/types';
import { isCampaignLive } from '@/lib/campaigns';

type CampaignRow = Campaign & {
  category?: Pick<Category, 'id' | 'name' | 'slug'> | null;
};

type FormState = {
  title: string;
  subtitle: string;
  badge_text: string;
  cta_label: string;
  cta_href: string;
  theme: Campaign['theme'];
  discount_percentage: string;
  scope: Campaign['scope'];
  category_id: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
};

const emptyForm: FormState = {
  title: '',
  subtitle: '',
  badge_text: '',
  cta_label: '',
  cta_href: '',
  theme: 'sunset',
  discount_percentage: '',
  scope: 'all',
  category_id: '',
  is_active: true,
  start_date: '',
  end_date: '',
};

const themeStyles: Record<Campaign['theme'], string> = {
  sunset: 'from-[#221713] via-[#7f4c35] to-[#d6a86c] text-white',
  forest: 'from-[#12201a] via-[#355545] to-[#88a37d] text-white',
  midnight: 'from-[#101321] via-[#253357] to-[#6675a6] text-white',
};

export default function AdminKampanyalarPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; data?: CampaignRow } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const supabase = createClient();

  const load = async () => {
    setLoading(true);

    const [{ data: campaignData }, { data: categoryData }] = await Promise.all([
      supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('id, name, slug, description, image_url, parent_id, sort_order, created_at')
        .order('sort_order'),
    ]);

    setCampaigns((campaignData as CampaignRow[]) ?? []);
    setCategories((categoryData as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setModal({ mode: 'create' });
  };

  const openEdit = (campaign: CampaignRow) => {
    setForm({
      title: campaign.title,
      subtitle: campaign.subtitle ?? '',
      badge_text: campaign.badge_text ?? '',
      cta_label: campaign.cta_label ?? '',
      cta_href: campaign.cta_href ?? '',
      theme: campaign.theme ?? 'sunset',
      discount_percentage: campaign.discount_percentage?.toString() ?? '',
      scope: campaign.scope ?? 'all',
      category_id: campaign.category_id ?? '',
      is_active: campaign.is_active,
      start_date: campaign.start_date ? campaign.start_date.slice(0, 16) : '',
      end_date: campaign.end_date ? campaign.end_date.slice(0, 16) : '',
    });
    setFormError('');
    setModal({ mode: 'edit', data: campaign });
  };

  const closeModal = () => {
    setModal(null);
    setFormError('');
  };

  const validateForm = () => {
    if (!form.title.trim()) return 'Kampanya başlığı zorunludur.';

    const discount = form.discount_percentage ? Number(form.discount_percentage) : null;
    if (discount !== null && (Number.isNaN(discount) || discount < 0 || discount > 90)) {
      return 'İndirim yüzdesi 0 ile 90 arasında olmalıdır.';
    }

    if (form.scope === 'category' && !form.category_id) {
      return 'Kategori bazlı kampanya için kategori seçin.';
    }

    if (form.start_date && form.end_date && new Date(form.start_date) >= new Date(form.end_date)) {
      return 'Bitiş tarihi başlangıçtan sonra olmalıdır.';
    }

    if (form.cta_href && !form.cta_href.startsWith('/') && !form.cta_href.startsWith('http')) {
      return 'CTA linki / ile başlayan bir site yolu ya da tam URL olmalıdır.';
    }

    return '';
  };

  const handleSave = async () => {
    const validation = validateForm();
    if (validation) {
      setFormError(validation);
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      badge_text: form.badge_text.trim() || null,
      cta_label: form.cta_label.trim() || null,
      cta_href: form.cta_href.trim() || null,
      theme: form.theme,
      discount_percentage: form.discount_percentage ? Number(form.discount_percentage) : null,
      scope: form.scope,
      category_id: form.scope === 'category' ? form.category_id : null,
      is_active: form.is_active,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    let error = null;

    if (modal?.mode === 'create') {
      ({ error } = await supabase.from('campaigns').insert(payload));
    } else if (modal?.data) {
      ({ error } = await supabase.from('campaigns').update(payload).eq('id', modal.data.id));
    }

    setSaving(false);

    if (error) {
      setFormError('Kaydedilemedi. Önce `supabase/campaign_discount_upgrade.sql` dosyasını çalıştırın.');
      return;
    }

    closeModal();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    await supabase.from('campaigns').delete().eq('id', id);
    setDeleting(null);
    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
  };

  const handleToggle = async (campaign: CampaignRow) => {
    setToggling(campaign.id);
    await supabase.from('campaigns').update({ is_active: !campaign.is_active }).eq('id', campaign.id);
    setCampaigns((prev) =>
      prev.map((item) => (item.id === campaign.id ? { ...item, is_active: !item.is_active } : item))
    );
    setToggling(null);
  };

  const formatDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  const stats = useMemo(() => {
    const liveCount = campaigns.filter((campaign) => isCampaignLive(campaign)).length;
    const timedCount = campaigns.filter((campaign) => campaign.start_date || campaign.end_date).length;
    const discountCount = campaigns.filter((campaign) => !!campaign.discount_percentage).length;

    return { liveCount, timedCount, discountCount };
  }, [campaigns]);

  const categoryNameMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-serif text-charcoal">Kampanyalar</h1>
          <p className="mt-1 text-sm text-brown/50">Süreli indirimleri, üst bant mesajını ve yönlendirme linklerini tek yerden yönetin.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-charcoal px-4 py-3 text-sm text-white transition-colors hover:bg-gold"
        >
          <Plus className="h-4 w-4" />
          Yeni Kampanya
        </button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard icon={Sparkles} label="Yayındaki Kampanya" value={String(stats.liveCount)} />
        <StatCard icon={CalendarClock} label="Zamanlanmış Akış" value={String(stats.timedCount)} />
        <StatCard icon={Megaphone} label="İndirimli Kampanya" value={String(stats.discountCount)} />
      </div>

      <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-brown/30" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-20 text-center">
            <Megaphone className="mx-auto mb-3 h-8 w-8 text-brown/20" />
            <p className="text-sm text-brown/30">Henüz kampanya yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wider text-brown/50">
                  <th className="px-6 py-4 font-medium">Kampanya</th>
                  <th className="px-6 py-4 font-medium">İndirim</th>
                  <th className="px-6 py-4 font-medium">Kapsam</th>
                  <th className="px-6 py-4 font-medium">Periyot</th>
                  <th className="px-6 py-4 font-medium">Durum</th>
                  <th className="px-6 py-4 text-right font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.map((campaign) => {
                  const live = isCampaignLive(campaign);

                  return (
                    <tr key={campaign.id} className="align-top transition-colors hover:bg-gray-50/60">
                      <td className="px-6 py-5">
                        <div className={`max-w-sm rounded-2xl bg-gradient-to-r p-4 ${themeStyles[campaign.theme ?? 'sunset']}`}>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/85">
                              {campaign.badge_text || 'Kampanya'}
                            </span>
                            {campaign.discount_percentage ? (
                              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                                %{campaign.discount_percentage}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm font-semibold">{campaign.title}</p>
                          {campaign.subtitle ? <p className="mt-1 text-xs text-white/72">{campaign.subtitle}</p> : null}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-charcoal">
                        {campaign.discount_percentage ? `%${campaign.discount_percentage}` : 'Sadece duyuru'}
                      </td>
                      <td className="px-6 py-5 text-sm text-brown/60">
                        {campaign.scope === 'all' && 'Tüm ürünler'}
                        {campaign.scope === 'featured' && 'Öne çıkan ürünler'}
                        {campaign.scope === 'category' && (categoryNameMap.get(campaign.category_id || '') || 'Seçili kategori')}
                      </td>
                      <td className="px-6 py-5 text-sm text-brown/60">
                        <p>{formatDate(campaign.start_date)}</p>
                        <p className="mt-1">{formatDate(campaign.end_date)}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(campaign)}
                            disabled={toggling === campaign.id}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${
                              campaign.is_active ? 'bg-charcoal' : 'bg-stone'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                                campaign.is_active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <div>
                            <p className={`text-xs font-semibold ${campaign.is_active ? 'text-charcoal' : 'text-brown/40'}`}>
                              {campaign.is_active ? 'Aktif' : 'Pasif'}
                            </p>
                            <p className={`mt-0.5 text-[11px] ${live ? 'text-emerald-600' : 'text-brown/35'}`}>
                              {live ? 'Şu an yayında' : 'Bekliyor / süresi doldu'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1">
                          {campaign.cta_href ? (
                            <Link
                              href={campaign.cta_href}
                              className="rounded-lg p-2 text-brown/40 transition-colors hover:bg-gray-100 hover:text-charcoal"
                              target={campaign.cta_href.startsWith('http') ? '_blank' : undefined}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          ) : null}
                          <button
                            onClick={() => openEdit(campaign)}
                            className="rounded-lg p-2 text-brown/40 transition-colors hover:bg-gray-100 hover:text-charcoal"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(campaign.id)}
                            disabled={deleting === campaign.id}
                            className="rounded-lg p-2 text-brown/40 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                          >
                            {deleting === campaign.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-modal">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <div>
                    <h2 className="font-serif text-lg text-charcoal">
                      {modal.mode === 'create' ? 'Yeni Kampanya' : 'Kampanyayı Düzenle'}
                    </h2>
                    <p className="mt-1 text-xs text-brown/45">Zamanlanmış indirimler ve üst bant içeriği aynı kayıt üzerinde yönetilir.</p>
                  </div>
                  <button onClick={closeModal} className="rounded-lg p-1.5 text-brown/40 transition-colors hover:text-charcoal">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6">
                    {formError ? (
                      <p className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</p>
                    ) : null}

                    <div className="grid gap-5 md:grid-cols-2">
                      <Field label="Başlık *">
                        <input
                          type="text"
                          value={form.title}
                          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                          placeholder="Salon Günleri · %20 indirim"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal placeholder:text-brown/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                        />
                      </Field>

                      <Field label="Etiket">
                        <input
                          type="text"
                          value={form.badge_text}
                          onChange={(event) => setForm((prev) => ({ ...prev, badge_text: event.target.value }))}
                          placeholder="Sınırlı Süre"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal placeholder:text-brown/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                        />
                      </Field>

                      <div className="md:col-span-2">
                        <Field label="Alt Metin">
                          <textarea
                            value={form.subtitle}
                            onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
                            placeholder="Vitrindeki oturma gruplarında hafta sonuna kadar ekstra fırsat."
                            rows={3}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal placeholder:text-brown/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                          />
                        </Field>
                      </div>

                      <Field label="İndirim Yüzdesi">
                        <input
                          type="number"
                          min="0"
                          max="90"
                          step="1"
                          value={form.discount_percentage}
                          onChange={(event) => setForm((prev) => ({ ...prev, discount_percentage: event.target.value }))}
                          placeholder="20"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal placeholder:text-brown/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                        />
                      </Field>

                      <Field label="Tema">
                        <select
                          value={form.theme}
                          onChange={(event) => setForm((prev) => ({ ...prev, theme: event.target.value as Campaign['theme'] }))}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                        >
                          <option value="sunset">Sunset</option>
                          <option value="forest">Forest</option>
                          <option value="midnight">Midnight</option>
                        </select>
                      </Field>

                      <Field label="Kapsam">
                        <select
                          value={form.scope}
                          onChange={(event) => setForm((prev) => ({ ...prev, scope: event.target.value as Campaign['scope'] }))}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                        >
                          <option value="all">Tüm ürünler</option>
                          <option value="featured">Öne çıkan ürünler</option>
                          <option value="category">Belirli kategori</option>
                        </select>
                      </Field>

                      <Field label="Kategori">
                        <select
                          value={form.category_id}
                          disabled={form.scope !== 'category'}
                          onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Kategori seçin</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Başlangıç">
                        <input
                          type="datetime-local"
                          value={form.start_date}
                          onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                        />
                      </Field>

                      <Field label="Bitiş">
                        <input
                          type="datetime-local"
                          value={form.end_date}
                          onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                        />
                      </Field>

                      <Field label="CTA Metni">
                        <input
                          type="text"
                          value={form.cta_label}
                          onChange={(event) => setForm((prev) => ({ ...prev, cta_label: event.target.value }))}
                          placeholder="Koleksiyonu Gör"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal placeholder:text-brown/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                        />
                      </Field>

                      <Field label="CTA Linki">
                        <input
                          type="text"
                          value={form.cta_href}
                          onChange={(event) => setForm((prev) => ({ ...prev, cta_href: event.target.value }))}
                          placeholder="/urunler?kategori=oturma-grubu"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal placeholder:text-brown/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                        />
                      </Field>
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-charcoal">Aktif</p>
                        <p className="mt-0.5 text-xs text-brown/40">Kapalıysa kampanya vitrinde ve fiyat hesaplarında kullanılmaz.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          form.is_active ? 'bg-charcoal' : 'bg-stone'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            form.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 bg-[#f7f4ef] p-6 lg:border-l lg:border-t-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brown/45">Canlı Önizleme</p>
                    <div className={`mt-4 overflow-hidden rounded-[28px] bg-gradient-to-br p-6 shadow-card ${themeStyles[form.theme]}`}>
                      <div className="mb-12 flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/85">
                            {form.badge_text.trim() || 'Sınırlı Süre'}
                          </span>
                          <p className="mt-4 max-w-xs text-2xl font-semibold leading-tight">
                            {form.title.trim() || 'Hafta sonu seçili koleksiyonlarda ekstra fırsat'}
                          </p>
                        </div>
                        {form.discount_percentage ? (
                          <div className="rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-right">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-white/60">İndirim</p>
                            <p className="mt-1 text-2xl font-semibold">%{form.discount_percentage}</p>
                          </div>
                        ) : null}
                      </div>

                      <p className="max-w-xs text-sm leading-relaxed text-white/78">
                        {form.subtitle.trim() || 'Yeni sezon parçalarında kontrollü bir indirim dili ve güçlü bir yönlendirme alanı.'}
                      </p>

                      {(form.cta_label.trim() || form.end_date) && (
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                          {form.cta_label.trim() ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-charcoal">
                              {form.cta_label.trim()}
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </span>
                          ) : null}
                          {form.end_date ? (
                            <span className="text-xs text-white/75">Bitiş: {formatDate(form.end_date)}</span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 space-y-3 rounded-2xl border border-white/50 bg-white/65 p-5 text-sm text-brown/70">
                      <p>
                        <span className="font-medium text-charcoal">Kapsam:</span>{' '}
                        {form.scope === 'all' && 'Tüm ürünler'}
                        {form.scope === 'featured' && 'Öne çıkan ürünler'}
                        {form.scope === 'category' && (categories.find((category) => category.id === form.category_id)?.name || 'Kategori seçilmedi')}
                      </p>
                      <p>
                        <span className="font-medium text-charcoal">Durum:</span> {form.is_active ? 'Aktif' : 'Pasif'}
                      </p>
                      <p>
                        <span className="font-medium text-charcoal">Zamanlama:</span>{' '}
                        {form.start_date || form.end_date ? 'Planlı kampanya' : 'Anında yayınlanır'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                  <button
                    onClick={closeModal}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-brown/60 transition-colors hover:text-charcoal"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-5 py-2.5 text-sm text-white transition-colors hover:bg-gold disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {modal.mode === 'create' ? 'Oluştur' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55">{label}</span>
      {children}
    </label>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/80 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brown/45">{label}</p>
          <p className="mt-3 text-3xl font-serif text-charcoal">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
