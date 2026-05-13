'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingBag, Menu, X, User, LogOut,
  ShieldCheck, ChevronDown, ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';

interface MenuLink {
  label: string;
  href: string;
}

interface MenuPreview {
  title: string;
  href: string;
  image: string;
}

interface MenuColumn {
  links: MenuLink[];
}

interface MenuItem {
  label: string;
  href: string;
  columns: MenuColumn[];
  previews: MenuPreview[];
}

const megaMenuItems: MenuItem[] = [
  {
    label: 'Oturma Grubu',
    href: '/kategori/oturma-grubu',
    columns: [
      {
        links: [
          { label: 'Koltuk Takımı', href: '/kategori/koltuk-takimi' },
          { label: 'Köşe Takımı', href: '/kategori/kose-takimi' },
          { label: 'Kanepe', href: '/kategori/kanepe' },
        ],
      },
      {
        links: [
          { label: 'Berjer', href: '/kategori/berjer' },
          { label: 'TV Ünitesi', href: '/kategori/tv-unitesi' },
          { label: 'Orta Sehpa', href: '/kategori/orta-sehpa' },
        ],
      },
      {
        links: [
          { label: 'Zigon Sehpa', href: '/kategori/zigon-sehpa' },
          { label: 'Dresuar', href: '/kategori/oturma-grubu-dresuar' },
        ],
      },
    ],
    previews: [
      {
        title: 'Oturma odasında koltuk yerleşimini dengeleyen modern kombinler',
        href: '/kategori/oturma-grubu',
        image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=85',
      },
      {
        title: 'Salonun merkezini güçlendiren sehpa ve TV ünitesi önerileri',
        href: '/blog/kucuk-salonlar-icin-ferah-dekorasyon-onerileri',
        image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&q=85',
      },
    ],
  },
  {
    label: 'Yatak Odası',
    href: '/kategori/yatak-odasi',
    columns: [
      {
        links: [
          { label: 'Yatak Odası Takımı', href: '/kategori/yatak-odasi-takimi' },
          { label: 'Gardırop', href: '/kategori/gardirop' },
          { label: 'Şifonyer', href: '/kategori/sifonyer' },
        ],
      },
      {
        links: [
          { label: 'Komodin', href: '/kategori/komodin' },
          { label: 'Çamaşırlık', href: '/kategori/camasirlik' },
          { label: 'Puf', href: '/kategori/yatak-odasi-puf' },
        ],
      },
    ],
    previews: [
      {
        title: 'Yatak odasında dinginlik sağlayan doğal ton ve doku önerileri',
        href: '/blog/yatak-odasinda-huzurlu-bir-atmosfer-nasil-kurulur',
        image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=85',
      },
      {
        title: 'Gardırop ve komodin planında hareket alanını koruyan çözümler',
        href: '/kategori/yatak-odasi',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=85',
      },
    ],
  },
  {
    label: 'Yemek Odası',
    href: '/kategori/yemek-odasi',
    columns: [
      {
        links: [
          { label: 'Yemek Odası Takımı', href: '/kategori/yemek-odasi-takimi' },
          { label: 'Konsol Aynası', href: '/kategori/konsol-aynasi' },
          { label: 'Yemek Masası', href: '/kategori/yemek-masasi' },
        ],
      },
      {
        links: [
          { label: 'Mutfak Masa Takımları', href: '/kategori/mutfak-masa-takimlari' },
          { label: 'Vitrin', href: '/kategori/vitrin' },
          { label: 'Sandalye', href: '/kategori/sandalye' },
        ],
      },
      {
        links: [
          { label: 'Konsol', href: '/kategori/konsol' },
          { label: 'Gümüşlük', href: '/kategori/gumusluk' },
        ],
      },
    ],
    previews: [
      {
        title: 'Yemek odasında masa ve konsol uyumu için ilham veren kurulumlar',
        href: '/kategori/yemek-odasi',
        image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200&q=85',
      },
      {
        title: 'Sıcak akşam sofraları için davetkar yemek alanı fikirleri',
        href: '/kategori/yemek-odasi',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=85',
      },
    ],
  },
  {
    label: 'Genç Odası',
    href: '/kategori/genc-odasi',
    columns: [
      {
        links: [
          { label: 'Genç Odası Takımı', href: '/kategori/genc-odasi-takimi' },
          { label: 'Karyola', href: '/kategori/karyola' },
          { label: 'Dolap', href: '/kategori/genc-odasi-dolap' },
        ],
      },
      {
        links: [
          { label: 'Çalışma Masası', href: '/kategori/calisma-masasi' },
          { label: 'Kitaplık', href: '/kategori/genc-odasi-kitaplik' },
          { label: 'Ranza', href: '/kategori/ranza' },
        ],
      },
    ],
    previews: [
      {
        title: 'Genç odalarında ders ve dinlenme alanını birlikte planlayan fikirler',
        href: '/kategori/genc-odasi',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=85&hue=30',
      },
      {
        title: 'Çocuk ve genç odalarında depolamayı artıran modüler çözümler',
        href: '/kategori/genc-odasi',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=85&sat=10',
      },
    ],
  },
  {
    label: 'Baza Başlık',
    href: '/kategori/baza-baslik',
    columns: [
      {
        links: [
          { label: 'Baza', href: '/kategori/baza' },
          { label: 'Başlık', href: '/kategori/baslik' },
          { label: 'Sandıklı Baza', href: '/kategori/sandikli-baza' },
        ],
      },
      {
        links: [
          { label: 'Baza Başlık Seti', href: '/kategori/baza-baslik-seti' },
          { label: 'Premium Başlıklar', href: '/kategori/premium-basliklar' },
        ],
      },
    ],
    previews: [
      {
        title: 'Bazalı sistemlerle depolamayı büyüten pratik yatak çözümleri',
        href: '/kategori/baza-baslik',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=85&sat=-20',
      },
      {
        title: 'Başlık seçimiyle yatak odasında güçlü bir odak noktası oluşturun',
        href: '/urunler?arama=başlık',
        image: 'https://images.unsplash.com/photo-1505693534990-82e6846fbe7b?w=1200&q=85',
      },
    ],
  },
  {
    label: 'Yatak',
    href: '/kategori/yatak',
    columns: [
      {
        links: [
          { label: 'Tek Kişilik Yatak', href: '/kategori/tek-kisilik-yatak' },
          { label: 'Çift Kişilik Yatak', href: '/kategori/cift-kisilik-yatak' },
          { label: 'Ortopedik Yatak', href: '/kategori/ortopedik-yatak' },
        ],
      },
      {
        links: [
          { label: 'Bebek Yatağı', href: '/kategori/bebek-yatagi' },
          { label: 'Yatak Pedi', href: '/kategori/yatak-pedi' },
          { label: 'Yastık', href: '/kategori/yastik' },
        ],
      },
    ],
    previews: [
      {
        title: 'Doğru yatak ölçüsüyle uyku alanında konforu artırın',
        href: '/kategori/yatak',
        image: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=1200&q=85',
      },
      {
        title: 'Tek ve çift kişilik yatak seçiminde oda boyutuna göre planlama',
        href: '/urunler?arama=yatak',
        image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=85',
      },
    ],
  },
  {
    label: 'Tamamlayıcı Ürünler',
    href: '/kategori/tamamlayici-urunler',
    columns: [
      {
        links: [
          { label: 'Ayna', href: '/kategori/ayna' },
          { label: 'Dresuar', href: '/kategori/tamamlayici-dresuar' },
          { label: 'Kitaplık', href: '/kategori/tamamlayici-kitaplik' },
        ],
      },
      {
        links: [
          { label: 'Sehpa', href: '/kategori/sehpa' },
          { label: 'Lambader', href: '/kategori/lambader' },
          { label: 'Puf', href: '/kategori/tamamlayici-puf' },
        ],
      },
    ],
    previews: [
      {
        title: 'Tamamlayıcı parçalarla yaşam alanında derinlik oluşturan dokunuşlar',
        href: '/kategori/tamamlayici-urunler',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=85',
      },
      {
        title: 'Ayna, sehpa ve lambader ile boş köşeleri odak alanına dönüştürün',
        href: '/kategori/tamamlayici-urunler',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85',
      },
    ],
  },
];

const topLinks = [
  { label: 'Ana Sayfa', href: '/' },
  { label: 'Ürünler', href: '/urunler' },
  { label: 'Şubelerimiz', href: '/subelerimiz' },
  { label: 'Nakliyat', href: '/nakliyat' },
  { label: 'Bayilik', href: '/bayilik' },
];

const DEFAULT_ANNOUNCEMENT = '5.000 ₺ üzeri siparişlerde ücretsiz kargo · Tüm Türkiye\'ye teslimat';

export default function Header({ announcement }: { announcement?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { itemCount, setIsOpen } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMegaMenu = (label: string) => {
    clearCloseTimer();
    setActiveMenu(label);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/urunler?arama=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const isActive = (href: string) => pathname === href;
  const activeMenuItem = megaMenuItems.find((item) => item.label === activeMenu);

  return (
    <>
      <div className="bg-charcoal text-center py-2 px-4">
        <p className="text-[9px] sm:text-[10px] font-medium tracking-[0.08em] sm:tracking-[0.18em] uppercase text-stone/70 leading-snug">
          {announcement ?? DEFAULT_ANNOUNCEMENT}
        </p>
      </div>

      <header className="sticky top-0 z-50 border-b border-stone/35 bg-cream/98 shadow-card backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <Link href="/" className="flex-shrink-0 group transition-opacity duration-300 hover:opacity-75">
              <span className="flex items-baseline gap-[5px] sm:gap-[7px]">
                <span className="font-sans font-black text-[18px] sm:text-[22px] lg:text-[25px] tracking-[0.13em] text-[#7A7A7A] uppercase leading-none">
                  FİNAL
                </span>
                <span className="font-serif text-[18px] sm:text-[22px] lg:text-[25px] tracking-[0.07em] text-[#8B7240] leading-none">
                  MOBİLYA
                </span>
              </span>
            </Link>

            <nav className="hidden xl:flex items-center gap-6">
              {topLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[12px] font-medium tracking-[0.18em] uppercase transition-colors ${
                    isActive(link.href) ? 'text-gold' : 'text-charcoal/65 hover:text-charcoal'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-3 text-charcoal/70 hover:text-charcoal transition-colors rounded-lg"
                aria-label="Ara"
              >
                <Search className="w-5 h-5" />
              </button>

              {user ? (
                <div className="hidden sm:flex items-center gap-0.5">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="p-3 text-gold hover:text-gold-light transition-colors rounded-lg"
                      title="Admin Panel"
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </Link>
                  )}
                  <Link
                    href="/hesabim"
                    className="p-3 text-charcoal/70 hover:text-charcoal transition-colors rounded-lg"
                    title="Hesabım"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                </div>
              ) : (
                <Link
                  href="/giris"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-charcoal/70 hover:text-charcoal transition-colors rounded-lg"
                >
                  <User className="w-4 h-4" />
                  Giriş
                </Link>
              )}

              <button
                onClick={() => setIsOpen(true)}
                className="relative p-3 text-charcoal/70 hover:text-charcoal transition-colors rounded-lg"
                aria-label="Sepet"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </button>

              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-3 text-charcoal/70 hover:text-charcoal transition-colors rounded-lg ml-1"
                aria-label="Menü"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div
          className="relative hidden lg:block border-t border-stone/20"
          onMouseLeave={scheduleClose}
          onMouseEnter={clearCloseTimer}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between gap-2 overflow-x-auto py-3 no-scrollbar">
              {megaMenuItems.map((item) => {
                const isCurrent =
                  activeMenu === item.label ||
                  pathname === item.href ||
                  item.columns.some((column) => column.links.some((link) => link.href === pathname));

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onMouseEnter={() => openMegaMenu(item.label)}
                    className={`relative whitespace-nowrap px-1.5 pb-2 text-[15px] font-medium transition-colors ${
                      isCurrent ? 'text-charcoal' : 'text-charcoal/85 hover:text-charcoal'
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-[#d9b400] transition-all duration-200 ${
                        isCurrent ? 'w-full opacity-100' : 'w-0 opacity-0'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          <AnimatePresence>
            {activeMenuItem && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute left-0 right-0 top-full z-50 border-t border-stone/20 bg-white shadow-menu"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                  <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
                    <div className="grid gap-8 md:grid-cols-3">
                      {activeMenuItem.columns.map((column, index) => (
                        <div
                          key={`${activeMenuItem.label}-${index}`}
                          className={index > 0 ? 'border-l border-stone/20 pl-6' : ''}
                        >
                          <div className="space-y-4">
                            {column.links.map((link) => (
                              <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setActiveMenu(null)}
                                className="block text-[16px] text-charcoal hover:text-[#1f5aa8] transition-colors"
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2">
                      {activeMenuItem.previews.map((preview) => (
                        <Link
                          key={preview.title}
                          href={preview.href}
                          onClick={() => setActiveMenu(null)}
                          className="group text-center"
                        >
                          <div className="mx-auto relative h-52 w-52 overflow-hidden rounded-full border-[3px] border-[#1f5aa8]">
                            <Image
                              src={preview.image}
                              alt={preview.title}
                              fill
                              sizes="208px"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                          <p className="mt-5 text-[15px] leading-6 text-charcoal group-hover:text-[#1f5aa8] transition-colors">
                            {preview.title}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-stone/20">
                    <Link
                      href={activeMenuItem.href}
                      onClick={() => setActiveMenu(null)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#1f5aa8] hover:text-charcoal transition-colors"
                    >
                      {activeMenuItem.label} kategorisini incele
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-px bg-stone/30" />
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: [0.25, 0.1, 0.25, 1], duration: 0.32 }}
              className="safe-bottom fixed right-0 top-0 bottom-0 w-[320px] max-w-[88vw] bg-cream z-50 overflow-y-auto shadow-modal lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone/20">
                <span className="flex items-baseline gap-[5px]">
                  <span className="font-sans font-black text-[17px] tracking-[0.13em] text-[#7A7A7A] uppercase leading-none">
                    FİNAL
                  </span>
                  <span className="font-serif text-[17px] tracking-[0.07em] text-[#8B7240] leading-none">
                    MOBİLYA
                  </span>
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 text-brown/60 hover:text-charcoal rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 px-3 py-4 space-y-1">
                {megaMenuItems.map((item) => {
                  const isOpen = mobileMenu === item.label;

                  return (
                    <div key={item.label} className="rounded-2xl border border-stone/20 bg-white/75 overflow-hidden">
                      <button
                        onClick={() => setMobileMenu((current) => (current === item.label ? null : item.label))}
                        className="w-full flex items-center justify-between px-4 py-3.5 text-charcoal font-medium text-sm"
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 text-brown/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-stone/15"
                          >
                            <div className="px-4 py-3 space-y-2">
                              <Link
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className="block rounded-xl bg-cream px-3 py-2.5 text-sm font-medium text-[#1f5aa8]"
                              >
                                Tümünü Gör
                              </Link>
                              {item.columns.flatMap((column) => column.links).map((link) => (
                                <Link
                                  key={`${item.label}-${link.label}`}
                                  href={link.href}
                                  onClick={() => setMenuOpen(false)}
                                  className="block px-3 py-2 text-sm text-brown/75 rounded-xl hover:bg-cream hover:text-charcoal transition-colors"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <div className="pt-3 mt-3 border-t border-stone/20 space-y-1">
                  {topLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-3 py-3 font-medium text-sm rounded-xl hover:bg-stone/20 transition-colors ${
                        isActive(link.href) ? 'text-gold' : 'text-charcoal'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/blog"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-3 font-medium text-sm rounded-xl text-charcoal hover:bg-stone/20 transition-colors"
                  >
                    Blog
                  </Link>
                </div>
              </div>

              <div className="px-3 pb-6 pt-3 border-t border-stone/20 space-y-0.5">
                {user ? (
                  <>
                    <Link
                      href="/hesabim"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 text-charcoal text-sm rounded-xl hover:bg-stone/20 transition-colors"
                    >
                      <User className="w-4 h-4 text-brown/40" /> Hesabım
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-gold text-sm rounded-xl hover:bg-stone/20 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-3 text-red-500 text-sm rounded-xl hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/giris"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-3 text-charcoal font-medium text-sm rounded-xl hover:bg-stone/20 transition-colors"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/kayit"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-3 text-gold font-medium text-sm rounded-xl hover:bg-stone/20 transition-colors"
                    >
                      Kayıt Ol
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/85 backdrop-blur-md flex items-start justify-center pt-24 px-5"
            onClick={(event) => event.target === event.currentTarget && setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-4 border-b-2 border-cream/20 pb-4">
                <Search className="w-6 h-6 text-cream/40 flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Ürün ara..."
                  className="flex-1 bg-transparent text-cream text-xl placeholder-cream/30 outline-none"
                />
                <button type="button" onClick={() => setSearchOpen(false)}>
                  <X className="w-6 h-6 text-cream/40 hover:text-cream transition-colors" />
                </button>
              </form>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Kanepe', 'Yatak Odası', 'Yemek Odası', 'Genç Odası'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      router.push(`/urunler?arama=${encodeURIComponent(term)}`);
                      setSearchOpen(false);
                    }}
                    className="px-4 py-1.5 border border-cream/15 text-cream/50 text-sm rounded-full hover:border-cream/40 hover:text-cream transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
