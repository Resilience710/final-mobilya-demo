'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Save } from 'lucide-react';

interface FormState {
  bankName: string;
  accountHolder: string;
  iban: string;
  branch: string;
  accountNumber: string;
  note: string;
}

const emptyForm: FormState = {
  bankName: '',
  accountHolder: '',
  iban: '',
  branch: '',
  accountNumber: '',
  note: '',
};

export default function AdminPaymentSettingsPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [source, setSource] = useState<'db' | 'env' | 'none'>('none');
  const [tableReady, setTableReady] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/settings/bank-transfer', { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ayarlar yüklenemedi.');
      }

      setForm({
        bankName: data.values?.bankName || '',
        accountHolder: data.values?.accountHolder || '',
        iban: data.values?.iban || '',
        branch: data.values?.branch || '',
        accountNumber: data.values?.accountNumber || '',
        note: data.values?.note || '',
      });
      setSource(data.source || 'none');
      setTableReady(Boolean(data.tableReady));
    } catch (error: any) {
      setError(error.message || 'Ayarlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/settings/bank-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ayarlar kaydedilemedi.');
      }

      setSuccess('Banka havalesi ayarları kaydedildi.');
      setSource('db');
      setTableReady(true);
    } catch (error: any) {
      setError(error.message || 'Ayarlar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-charcoal">Ödeme Ayarları</h1>
        <p className="mt-1 text-sm text-brown/50">
          Banka havalesi / EFT ekranında gösterilecek hesap bilgilerini yönetin.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>
      ) : null}

      {!tableReady ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          Veritabanı ayar tablosu henüz hazır değil. Önce `supabase/app_settings_bank_transfer_upgrade.sql`
          dosyasını Supabase SQL Editor’da bir kez çalıştırın. Şu an görünen değerler varsa env fallback’inden geliyor.
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brown/30" />
        </div>
      ) : (
        <form onSubmit={save} className="max-w-3xl space-y-6 rounded-[32px] border border-gray-100 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-center gap-3 rounded-2xl bg-cream/70 px-4 py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-stone/20 bg-white p-2 shadow-sm">
              <Image
                src="/enpara.png"
                alt="Enpara"
                width={80}
                height={27}
                className="h-auto w-full object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal">Aktif veri kaynağı</p>
              <p className="text-xs text-brown/55">
                {source === 'db'
                  ? 'Veritabanı'
                  : source === 'env'
                    ? 'Env fallback'
                    : 'Henüz tanımlı değil'}
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Banka Adı</label>
              <input
                required
                value={form.bankName}
                onChange={(e) => updateField('bankName', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                placeholder="Örn. Garanti BBVA"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Hesap Sahibi</label>
              <input
                required
                value={form.accountHolder}
                onChange={(e) => updateField('accountHolder', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                placeholder="Örn. Final Mobilya Ltd. Şti."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-charcoal">IBAN</label>
              <input
                required
                value={form.iban}
                onChange={(e) => updateField('iban', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                placeholder="TR00 0000 0000 0000 0000 0000 00"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Şube</label>
              <input
                value={form.branch}
                onChange={(e) => updateField('branch', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                placeholder="Opsiyonel"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Hesap Numarası</label>
              <input
                value={form.accountNumber}
                onChange={(e) => updateField('accountNumber', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                placeholder="Opsiyonel"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Not</label>
              <textarea
                value={form.note}
                onChange={(e) => updateField('note', e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                placeholder="Örn. Açıklamaya sipariş numaranızı yazın."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gold disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Kaydet
          </button>
        </form>
      )}
    </div>
  );
}
