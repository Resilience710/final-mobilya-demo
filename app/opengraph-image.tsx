import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Final Mobilya premium koleksiyonları';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px',
          color: '#fffaf2',
          background:
            'linear-gradient(135deg, #161614 0%, #4d3828 42%, #c8a15d 100%)',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontSize: 30,
            letterSpacing: 8,
            textTransform: 'uppercase',
            opacity: 0.88,
          }}
        >
          Final Mobilya
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 820 }}>
          <div style={{ fontSize: 82, lineHeight: 1.02, fontWeight: 600 }}>
            Premium mobilya ile yaşam alanınızı dönüştürün
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.35, opacity: 0.9 }}>
            Koltuk takımları, yatak odası, yemek odası ve dekorasyon ürünlerinde zamansız tasarım.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 24,
            opacity: 0.88,
          }}
        >
          <div>final-mobilya-demo.vercel.app</div>
          <div>Türkiye geneli teslimat</div>
        </div>
      </div>
    ),
    size
  );
}
