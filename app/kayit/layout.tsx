import type { ReactNode } from 'react';
import { buildNoIndexMetadata } from '@/lib/site';

export const metadata = buildNoIndexMetadata(
  'Kayıt Ol',
  'Final Mobilya üyeliği oluşturarak siparişlerinizi ve hesabınızı yönetin.',
  '/kayit',
);

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
