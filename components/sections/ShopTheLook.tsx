import Link from 'next/link';
import Image from 'next/image';

export default function ShopTheLook() {
  return (
    <section className="relative h-[80vh] min-h-[520px] w-full overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1920&q=85"
        alt="Yeni Oturma Odanız"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-cream/10" />

      <div className="relative z-10 h-full flex items-center justify-center px-4 text-center">
        <div className="max-w-3xl">
          <h2 className="font-serif text-charcoal leading-[0.95] tracking-tight">
            <span className="block text-5xl sm:text-7xl">YENİ</span>
            <span className="block text-5xl sm:text-7xl">OTURMA ODANIZ</span>
          </h2>
          <p className="font-serif italic text-charcoal/80 text-2xl sm:text-3xl mt-8 mb-10">
            Kalıcı Mobilya
          </p>
          <Link
            href="/kategori/oturma-grubu"
            className="inline-block bg-charcoal px-10 py-4 text-[11px] font-semibold tracking-[0.22em] uppercase text-white hover:bg-gold transition-colors duration-300"
          >
            OTURMA ODALARIMIZI KEŞFEDİN
          </Link>
        </div>
      </div>
    </section>
  );
}
