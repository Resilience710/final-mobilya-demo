export const SITE_NAME = 'Final Mobilya';
export const SITE_DESCRIPTION =
  'Final Mobilya; koltuk takımları, yatak odası, yemek odası ve dekorasyon ürünlerinde premium tasarım, güvenli alışveriş ve Türkiye geneli teslimat sunar.';
export const SITE_KEYWORDS = [
  'final mobilya',
  'mobilya',
  'koltuk takımı',
  'yatak odası takımı',
  'yemek odası takımı',
  'genç odası',
  'dekorasyon',
  'premium mobilya',
  'online mobilya',
  'türkiye mobilya',
];

export function getSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    'http://localhost:3000';

  const normalized = value.startsWith('http') ? value : `https://${value}`;
  return normalized.replace(/\/+$/, '');
}

export function absoluteUrl(path = '/') {
  const base = getSiteUrl();
  return new URL(path, `${base}/`).toString();
}

export function cleanText(value: string | null | undefined, fallback = '') {
  return (value || fallback).replace(/\s+/g, ' ').trim();
}
