'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, MapPin, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ShippingRule } from '@/lib/types';
import { turkeyProvinces } from '@/lib/turkey-locations';

const emptyForm = {
  id: '',
  city: '',
  district: '',
  price: '0',
  note: '',
  is_active: true,
};

function formatPrice(price: number) {
  return price <= 0
    ? 'Ücretsiz'
    : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(price);
}

export default function AdminNakliyatPage() {
  const supabase = createClient();
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const cities = useMemo(() => turkeyProvinces.map((province) => province.name), []);
  const districts = useMemo(
    () => turkeyProvinces.find((province) => province.name === form.city)?.districts || [],
    [form.city],
  );

  const load = async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from('shipping_rules').select('*').order('city').order('district');
    setRules((data as ShippingRule[]) || []);
    setLoadFailed(!!loadError);
    if (loadError) {
      setError('Nakliyat kuralları okunamadı. Varsayılan şehir fiyatları çalışır; admin kayıtları için SQL kurulumu gerekebilir.');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    if (loadFailed) {
      setError('Nakliyat kuralları okunamadı. Varsayılan şehir fiyatları çalışır; admin kayıtları için SQL kurulumu gerekebilir.');
      return;
    }
    setError('');
  };

  const handleSave = async () => {
    if (!form.city.trim()) {
      setError('İl alanı zorunludur.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      city: form.city.trim(),
      district: form.district.trim() || null,
      price: Number(form.price) || 0,
      note: form.note.trim() || null,
      is_active: form.is_active,
    };

    const { error: dbError } = form.id
      ? await supabase.from('shipping_rules').update(payload).eq('id', form.id)
      : await supabase.from('shipping_rules').insert(payload);

    setSaving(false);

    if (dbError) {
      setError('Kaydedilemedi. Önce `supabase/shipping_promotions_homepage_upgrade.sql` dosyasını çalıştırın.');
      return;
    }

    resetForm();
    load();
  };

  const handleEdit = (rule: ShippingRule) => {
    setForm({
      id: rule.id,
      city: rule.city,
      district: rule.district || '',
      price: String(rule.price),
      note: rule.note || '',
      is_active: rule.is_active,
    });
    setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu nakliyat kuralını silmek istediğinize emin misiniz?')) return;
    await supabase.from('shipping_rules').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-charcoal">Nakliyat Yönetimi</h1>
        <p className="mt-1 text-sm text-brown/50">
          İl ve ilçe bazında nakliyat ücretlerini yönetin. `0` girilen kayıtlar ücretsiz nakliyat olarak çalışır.
        </p>
      </div>

      <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-charcoal">{form.id ? 'Kuralı Düzenle' : 'Yeni Nakliyat Kuralı'}</h2>
          {form.id ? (
            <button onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-brown/60 hover:text-charcoal">
              <X className="w-4 h-4" />
              Temizle
            </button>
          ) : null}
        </div>

        {error ? <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="İl *">
            <select
              value={form.city}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value, district: '' }))}
              className="input"
            >
              <option value="">İl seçin</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </Field>
          <Field label="İlçe">
            <select
              value={form.district}
              onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
              disabled={!form.city}
              className="input disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">{form.city ? 'Tüm il geneli' : 'Önce il seçin'}</option>
              {districts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </Field>
          <Field label="Nakliyat Tutarı (₺)">
            <input type="number" min="0" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} className="input" />
          </Field>
          <Field label="Not">
            <input value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} className="input" placeholder="İstanbul yakın çevre ücretsiz" />
          </Field>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-charcoal">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))} />
            Aktif
          </label>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-5 py-3 text-sm text-white hover:bg-gold disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : form.id ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {form.id ? 'Kaydet' : 'Kural Ekle'}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brown/30" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wider text-brown/50">
                  <th className="px-6 py-4 font-medium">Bölge</th>
                  <th className="px-6 py-4 font-medium">Tutar</th>
                  <th className="px-6 py-4 font-medium">Not</th>
                  <th className="px-6 py-4 font-medium">Durum</th>
                  <th className="px-6 py-4 text-right font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal">{rule.city}</p>
                          <p className="text-xs text-brown/45">{rule.district || 'Tüm il geneli'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-charcoal">{formatPrice(Number(rule.price))}</td>
                    <td className="px-6 py-4 text-sm text-brown/60">{rule.note || '—'}</td>
                    <td className="px-6 py-4 text-sm text-brown/60">{rule.is_active ? 'Aktif' : 'Pasif'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEdit(rule)} className="rounded-lg p-2 text-brown/40 hover:bg-gray-100 hover:text-charcoal">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(rule.id)} className="rounded-lg p-2 text-brown/40 hover:bg-red-50 hover:text-red-500">
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
