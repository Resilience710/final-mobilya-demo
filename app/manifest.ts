import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Final Mobilya',
    short_name: 'Final',
    description: 'Premium mobilya koleksiyonları, kampanyalar ve güvenli sipariş deneyimi.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fafaf8',
    theme_color: '#fafaf8',
    lang: 'tr-TR',
    categories: ['shopping', 'lifestyle', 'home'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32 48x48',
        type: 'image/x-icon',
      },
      {
        src: '/icon.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
  };
}
