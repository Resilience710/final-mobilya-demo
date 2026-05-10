import type { ReactNode } from 'react';
import { buildNoIndexMetadata } from '@/lib/site';

export const metadata = buildNoIndexMetadata(
  'Sipariş Sonucu',
  'Final Mobilya ödeme sonucu ve sipariş onay ekranı.',
  '/siparis/onay',
);

export default function CheckoutResultLayout({ children }: { children: ReactNode }) {
  return children;
}
