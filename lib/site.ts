import type { Metadata } from 'next';

export const SITE_NAME = 'Final Mobilya';
export const SITE_DESCRIPTION =
  'Final Mobilya; koltuk takımları, yatak odası, yemek odası ve dekorasyon ürünlerinde premium tasarım, güvenli alışveriş ve Türkiye geneli teslimat sunar.';
export const SITE_DEFAULT_TITLE = 'Premium Mobilya ve Yaşam Alanı Tasarımı';
export const SITE_LOCALE = 'tr_TR';
export const DEFAULT_OG_IMAGE_PATH = '/opengraph-image';
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

function toAbsoluteAssetUrl(value?: string) {
  if (!value) {
    return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  }

  return value.startsWith('http') ? value : absoluteUrl(value);
}

export function cleanText(value: string | null | undefined, fallback = '') {
  return (value || fallback).replace(/\s+/g, ' ').trim();
}

export function formatMetaTitle(title: string) {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

interface BuildMetadataOptions {
  title: string;
  description: string;
  path?: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  keywords?: string[];
}

export function buildMetadata({
  title,
  description,
  path = '/',
  canonical,
  image,
  imageAlt,
  type = 'website',
  noIndex = false,
  keywords,
}: BuildMetadataOptions): Metadata {
  const canonicalUrl = canonical || absoluteUrl(path);
  const imageUrl = toAbsoluteAssetUrl(image);
  const resolvedDescription = cleanText(description, SITE_DESCRIPTION);

  return {
    title,
    description: resolvedDescription,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        }
      : undefined,
    openGraph: {
      title: formatMetaTitle(title),
      description: resolvedDescription,
      url: canonicalUrl,
      type,
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt || formatMetaTitle(title),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: formatMetaTitle(title),
      description: resolvedDescription,
      images: [imageUrl],
    },
  };
}

export function buildNoIndexMetadata(title: string, description: string, path: string) {
  return buildMetadata({
    title,
    description,
    path,
    noIndex: true,
  });
}

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    sameAs: ['https://instagram.com/finalmobilya'],
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: getSiteUrl(),
    inLanguage: 'tr-TR',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/urunler')}?arama={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildWebPageSchema(title: string, description: string, path: string, type = 'WebPage') {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: formatMetaTitle(title),
    description: cleanText(description, SITE_DESCRIPTION),
    url: absoluteUrl(path),
    inLanguage: 'tr-TR',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}
