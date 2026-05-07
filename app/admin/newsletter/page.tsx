'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, RefreshCw } from 'lucide-react';

interface SubscriberRow {
  id: string;
  email: string;
  created_at: string;
  source?: string | null;
  is_active?: boolean | null;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const load = async () => {
    setLoading(true);
    const supabase = createClient();

    const primary = await supabase
      .from('newsletter_subscribers')
      .select('id, email, created_at, source, is_active')
      .order('created_at', { ascending: false });

    if (!primary.error) {
      setSubscribers((primary.data as SubscriberRow[]) ?? []);
      setUsingFallback(false);
      setLoading(false);
      return;
    }

    const fallback = await supabase
      .from('dealer_applications')
      .select('id, email, created_at')
      .eq('company_name', '__newsletter__')
      .order('created_at', { ascending: false });

    setSubscribers(((fallback.data as SubscriberRow[]) ?? []).map((item) => ({ ...item, source: 'website-footer', is_active: true })));
    setUsingFallback(true);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif text-charcoal">Newsletter Aboneleri</h1>
          <p className="text-sm text-brown/50 mt-1">Footer formundan toplanan e-posta adresleri</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white text-sm rounded-xl hover:bg-charcoal/90 transition-colors">
          <RefreshCw className="w-4 h-4" /> Yenile
        </button>
      </div>

      {usingFallback ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <code>newsletter_subscribers</code> tablosu bu ortamda bulunmadığı için aboneler geçici olarak mevcut başvuru tablosunda tutuluyor.
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-brown/30" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-20 text-center text-brown/30 text-sm">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Henüz newsletter aboneliği yok
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-brown/50 uppercase tracking-wider border-b border-gray-50">
                  <th className="px-6 py-3 font-medium">E-posta</th>
                  <th className="px-6 py-3 font-medium">Kaynak</th>
                  <th className="px-6 py-3 font-medium">Durum</th>
                  <th className="px-6 py-3 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-charcoal">{subscriber.email}</td>
                    <td className="px-6 py-4 text-sm text-brown/60">{subscriber.source || 'website-footer'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${subscriber.is_active === false ? 'border-stone-200 bg-stone-50 text-brown/60' : 'border-green-200 bg-green-50 text-green-700'}`}>
                        {subscriber.is_active === false ? 'Pasif' : 'Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-brown/50">{new Date(subscriber.created_at).toLocaleString('tr-TR')}</td>
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
