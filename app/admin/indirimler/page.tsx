'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CalendarClock, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Product, ProductDiscount } from '@/lib/types';

type DiscountRow = ProductDiscount & {
  product?: Pick<Product, 'id' | 'name' | 'slug' | 'base_price' | 'images'> | null;
};

const defaultStart = () => new Date().toISOString().slice(0, 16);
const defaultEnd = () => new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
const defaultDurationDays = '6';

const emptyForm = {
  id: '',
  product_id: '',
  title: '',
  discount_type: 'percentage' as ProductDiscount['discount_type'],
  discount_value: '10',
  duration_days: defaultDurationDays,
  start_date: defaultStart(),
  end_date: defaultEnd(),
  is_active: true,
};

export default function AdminIndirimlerPage() {
  const supabase = createClient();
  const [discounts, setDiscounts] = useState<DiscountRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const [{ data: discountData }, { data: productData }] = await Promise.all([
      supabase
        .from('product_discounts')
        .select('*, product:products(id, name, slug, base_price, images)')
        .order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, slug, base_price, images').eq('is_active', true).order('name'),
    ]);
    setDiscounts((discountData as DiscountRow[]) || []);
    setProducts((productData as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      duration_days: defaultDurationDays,
      start_date: defaultStart(),
      end_date: defaultEnd(),
    });
    setError('');
  };

  const handleEdit = (discount: DiscountRow) => {
    setForm({
      id: discount.id,
      product_id: discount.product_id,
      title: discount.title || '',
      discount_type: discount.discount_type,
      discount_value: String(discount.discount_value),
      start_date: discount.start_date ? discount.start_date.slice(0, 16) : defaultStart(),
      end_date: discount.end_date ? discount.end_date.slice(0, 16) : defaultEnd(),
      duration_days: getDurationDays(
        discount.start_date ? discount.start_date.slice(0, 16) : defaultStart(),
        discount.end_date ? discount.end_date.slice(0, 16) : defaultEnd(),
      ),
      is_active: discount.is_active,
    });
    setError('');
  };

  const updateDuration = (durationDays: string, startDate = form.start_date) => {
    const normalized = durationDays.replace(/[^\d]/g, '');
    const nextDuration = normalized || '';
    const dayCount = Number(nextDuration);

    setForm((prev) => ({
      ...prev,
      duration_days: nextDuration,
      end_date: dayCount > 0 ? addDaysToLocalDate(startDate, dayCount) : prev.end_date,
    }));
  };

  const updateStartDate = (startDate: string) => {
    setForm((prev) => ({
      ...prev,
      start_date: startDate,
      end_date: Number(prev.duration_days) > 0 ? addDaysToLocalDate(startDate, Number(prev.duration_days)) : prev.end_date,
    }));
  };

  const updateEndDate = (endDate: string) => {
    setForm((prev) => ({
      ...prev,
      end_date: endDate,
      duration_days: getDurationDays(prev.start_date, endDate),
    }));
  };

  const handleSave = async () => {
    if (!form.product_id) {
      setError('Ürün seçimi zorunludur.');
      return;
    }
    if (!form.discount_value || Number(form.discount_value) <= 0) {
      setError('İndirim değeri sıfırdan büyük olmalıdır.');
      return;
    }
    if (new Date(form.start_date) >= new Date(form.end_date)) {
      setError('Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      product_id: form.product_id,
      title: form.title.trim() || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      start_date: form.start_date,
      end_date: form.end_date,
      is_active: form.is_active,
    };

    const { error: dbError } = form.id
      ? await supabase.from('product_discounts').update(payload).eq('id', form.id)
      : await supabase.from('product_discounts').insert(payload);

    setSaving(false);

    if (dbError) {
      setError('Kaydedilemedi. Önce `supabase/shipping_promotions_homepage_upgrade.sql` dosyasını çalıştırın.');
      return;
    }

    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürün indirimini silmek istediğinize emin misiniz?')) return;
    await supabase.from('product_discounts').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-charcoal">Ürün İndirimleri</h1>
        <p className="mt-1 text-sm text-brown/50">
          Ana sayfadaki sayaçlı indirimleri ürün bazında yönetin. Yeni kayıtlar varsayılan olarak 6 günlük süre ile açılır.
        </p>
      </div>

      <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-charcoal">{form.id ? 'İndirimi Düzenle' : 'Yeni Ürün İndirimi'}</h2>
          {form.id ? (
            <button onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-brown/60 hover:text-charcoal">
              <X className="w-4 h-4" />
              Temizle
            </button>
          ) : null}
        </div>

        {error ? <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Ürün *">
            <select value={form.product_id} onChange={(e) => setForm((prev) => ({ ...prev, product_id: e.target.value }))} className="input">
              <option value="">Ürün seçin</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Başlık">
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="input" placeholder="6 Günlük Fırsat" />
          </Field>
          <Field label="İndirim Tipi">
            <select value={form.discount_type} onChange={(e) => setForm((prev) => ({ ...prev, discount_type: e.target.value as ProductDiscount['discount_type'] }))} className="input">
              <option value="percentage">Yüzde</option>
              <option value="fixed">TL Tutar</option>
            </select>
          </Field>
          <Field label={form.discount_type === 'percentage' ? 'İndirim (%)' : 'İndirim Tutarı (₺)'}>
            <input type="number" min="0" value={form.discount_value} onChange={(e) => setForm((prev) => ({ ...prev, discount_value: e.target.value }))} className="input" />
          </Field>
          <Field label="Süre (Gün)">
            <input type="number" min="1" value={form.duration_days} onChange={(e) => updateDuration(e.target.value)} className="input" />
          </Field>
          <Field label="Başlangıç">
            <input type="datetime-local" value={form.start_date} onChange={(e) => updateStartDate(e.target.value)} className="input" />
          </Field>
          <Field label="Bitiş">
            <input type="datetime-local" value={form.end_date} onChange={(e) => updateEndDate(e.target.value)} className="input" />
          </Field>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-charcoal">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))} />
            Aktif
          </label>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-5 py-3 text-sm text-white hover:bg-gold disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : form.id ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {form.id ? 'Kaydet' : 'İndirim Ekle'}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brown/30" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wider text-brown/50">
                  <th className="px-6 py-4 font-medium">Ürün</th>
                  <th className="px-6 py-4 font-medium">İndirim</th>
                  <th className="px-6 py-4 font-medium">Süre</th>
                  <th className="px-6 py-4 font-medium">Durum</th>
                  <th className="px-6 py-4 text-right font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-cream">
                          {discount.product?.images?.[0] ? (
                            <Image src={discount.product.images[0]} alt={discount.product.name} fill sizes="56px" className="object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal">{discount.product?.name || 'Ürün bulunamadı'}</p>
                          <p className="text-xs text-brown/45">{discount.title || 'Sayaçlı ürün indirimi'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal">
                      {discount.discount_type === 'percentage' ? `%${discount.discount_value}` : `${discount.discount_value} ₺`}
                    </td>
                    <td className="px-6 py-4 text-sm text-brown/60">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-brown/35" />
                        <div>
                          <p>{discount.start_date ? formatDate(discount.start_date) : '—'}</p>
                          <p>{discount.end_date ? formatDate(discount.end_date) : '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-brown/60">{discount.is_active ? 'Aktif' : 'Pasif'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEdit(discount)} className="rounded-lg p-2 text-brown/40 hover:bg-gray-100 hover:text-charcoal">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(discount.id)} className="rounded-lg p-2 text-brown/40 hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55">{label}</span>
      {children}
    </label>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function addDaysToLocalDate(value: string, days: number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return defaultEnd();
  }

  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 16);
}

function getDurationDays(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return defaultDurationDays;
  }

  return String(Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000)));
}
