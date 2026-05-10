import type { ReactNode } from 'react';
import { buildNoIndexMetadata } from '@/lib/site';

export const metadata = buildNoIndexMetadata(
  'Sepet',
  'Final Mobilya alışveriş sepeti ve ödeme öncesi sipariş özeti.',
  '/sepet',
);

export default function CartLayout({ children }: { children: ReactNode }) {
  return children;
}
