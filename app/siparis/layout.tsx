import type { ReactNode } from 'react';
import { buildNoIndexMetadata } from '@/lib/site';

export const metadata = buildNoIndexMetadata(
  'Sipariş ve Ödeme',
  'Final Mobilya güvenli sipariş, ödeme ve teslimat bilgileri akışı.',
  '/siparis',
);

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
