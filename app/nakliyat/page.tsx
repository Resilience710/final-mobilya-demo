import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ShippingRule } from '@/lib/types';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import NakliyatClient from './NakliyatClient';

export const metadata: Metadata = {
  title: 'Nakliyat',
  description: 'Final Mobilya nakliyat ücretlerini il ve ilçe bazında kontrol edin.',
  alternates: {
    canonical: '/nakliyat',
  },
  openGraph: {
    title: `Nakliyat | ${SITE_NAME}`,
    description: 'Final Mobilya nakliyat ücretlerini il ve ilçe bazında kontrol edin.',
    url: absoluteUrl('/nakliyat'),
  },
};

export default async function NakliyatPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('shipping_rules')
    .select('*')
    .eq('is_active', true)
    .order('city')
    .order('district');

  return <NakliyatClient rules={(data as ShippingRule[]) || []} />;
}
