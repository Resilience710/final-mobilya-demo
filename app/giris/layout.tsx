import type { ReactNode } from 'react';
import { buildNoIndexMetadata } from '@/lib/site';

export const metadata = buildNoIndexMetadata(
  'Giriş Yap',
  'Final Mobilya hesabınıza güvenle giriş yapın.',
  '/giris',
);

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
