import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { HomepageGalleryItem } from '@/lib/types';

export default async function ShopTheLook() {
  let galleryItems: HomepageGalleryItem[] = [];
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase.from('homepage_gallery_items').select('*').eq('is_active', true).order('slot_index');
    galleryItems = ((data as HomepageGalleryItem[]) || []).slice(0, 4);
  } catch {
    // table may not exist yet
  }
  const slots = Array.from({ length: 4 }, (_, index) => galleryItems.find((item) => item.slot_index === index + 1) || null);

  return (
    <section className="bg-cream">
      <div className="relative h-[80vh] min-h-[520px] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1920&q=85"
          alt="Yeni Oturma Odanız"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,16,0.26)_0%,rgba(18,18,16,0.46)_46%,rgba(18,18,16,0.66)_100%)]" />

        <div className="relative z-10 h-full flex items-center justify-center px-4 text-center">
          <div className="max-w-3xl rounded-[32px] border border-white/18 bg-charcoal/38 px-8 py-10 shadow-2xl shadow-black/25 backdrop-blur-sm sm:px-12">
            <h2 className="font-serif text-white leading-[0.95] tracking-tight [text-shadow:0_6px_24px_rgba(0,0,0,0.72)]">
              <span className="block text-5xl sm:text-7xl">YENİ</span>
              <span className="block text-5xl sm:text-7xl">OTURMA ODANIZ</span>
            </h2>
            <p className="font-serif italic text-white/90 text-2xl sm:text-3xl mt-8 mb-10 [text-shadow:0_4px_18px_rgba(0,0,0,0.65)]">
              Kalıcı Mobilya
            </p>
            <Link
              href="/kategori/oturma-grubu"
              className="inline-block bg-white px-10 py-4 text-[11px] font-semibold tracking-[0.22em] uppercase text-charcoal hover:bg-gold hover:text-white transition-colors duration-300"
            >
              OTURMA ODALARIMIZI KEŞFEDİN
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {slots.map((slot, index) => (
            <div
              key={index}
              className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-dashed border-stone/30 bg-white shadow-[0_12px_28px_rgba(28,28,26,0.04)]"
            >
              {slot?.image_url ? (
                <Image
                  src={slot.image_url}
                  alt={slot.alt_text || `Galeri görseli ${index + 1}`}
                  fill
                  sizes="(max-width: 1280px) 50vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-center text-sm font-medium uppercase tracking-[0.22em] text-brown/30">
                  Fotoğraf Alanı
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
