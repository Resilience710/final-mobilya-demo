import type { ReactNode } from 'react';
import { buildNoIndexMetadata } from '@/lib/site';

export const metadata = buildNoIndexMetadata(
  'Siparişlerim',
  'Final Mobilya sipariş geçmişi ve ödeme durumu ekranı.',
  '/hesabim/siparislerim',
);

export default function AccountOrdersLayout({ children }: { children: ReactNode }) {
  return children;
}
