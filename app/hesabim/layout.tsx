import type { ReactNode } from 'react';
import { buildNoIndexMetadata } from '@/lib/site';

export const metadata = buildNoIndexMetadata(
  'Hesabım',
  'Final Mobilya hesabınız ve kişisel sipariş yönetim alanı.',
  '/hesabim',
);

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
