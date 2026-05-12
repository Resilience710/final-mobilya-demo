import {
  HomepageBrandStoryCard,
  HomepageCategoryItem,
  HomepageCollectionSection,
  HomepageContent,
  HomepageFeaturedTab,
  HomepageHeroSlide,
  HomepageRoomShowcaseItem,
  HomepageShopTheLookSection,
  HomepageTestimonialsItem,
  HomepageTrustItem,
} from '@/lib/types';

export const HOMEPAGE_CONTENT_KEY = 'homepage_content';

const DEFAULT_HERO_SLIDES: HomepageHeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1920&q=85',
    imageAlt: 'Modern yatak odası dekorasyonu',
    title: 'ALANINIZI\nDÖNÜŞTÜRÜN',
    subtitle: 'Hayalinizdeki Mobilya',
    ctaLabel: 'OTURMA ODALARIMIZI KEŞFEDİN',
    href: '/kategori/oturma-grubu',
  },
  {
    image: 'https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?w=1920&q=85',
    imageAlt: 'Şık ve aydınlık yatak odası',
    title: 'ZARAFETLE\nYAŞAYIN',
    subtitle: 'Premium Tasarımın İmzası',
    ctaLabel: 'YATAK ODALARINI GÖRÜN',
    href: '/kategori/yatak-odasi',
  },
  {
    image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1920&q=85',
    imageAlt: 'Doğal tonlarda salon tasarımı',
    title: 'EVİNİZE\nDEĞER KATIN',
    subtitle: 'Yıllara Meydan Okuyan İşçilik',
    ctaLabel: 'TÜM ÜRÜNLERİ GÖR',
    href: '/urunler',
  },
];

const DEFAULT_CATEGORY_ITEMS: HomepageCategoryItem[] = [
  { label: 'OTURMA GRUBU', href: '/kategori/oturma-grubu' },
  { label: 'YATAK ODASI', href: '/kategori/yatak-odasi' },
  { label: 'YEMEK ODASI', href: '/kategori/yemek-odasi' },
  { label: 'GENÇ ODASI', href: '/kategori/genc-odasi' },
  { label: 'BAZA BAŞLIK', href: '/kategori/baza-baslik' },
  { label: 'YATAK', href: '/kategori/yatak' },
  { label: 'TAMAMLAYICI ÜRÜNLER', href: '/kategori/tamamlayici-urunler' },
];

const DEFAULT_FEATURED_TABS: HomepageFeaturedTab[] = [
  {
    key: 'discounted',
    label: 'İndirimli Ürünler',
    href: '/urunler?indirim=1',
    cta: 'Tüm İndirimli Ürünleri Göster',
  },
  {
    key: 'bestsellers',
    label: 'En Çok Satanlar',
    href: '/urunler?one-cikan=1',
    cta: 'Tüm Çok Satanları Göster',
  },
  {
    key: 'newest',
    label: 'Yeni Ürünler',
    href: '/urunler?siralama=yeni',
    cta: 'Tüm Yeni Ürünleri Göster',
  },
];

const DEFAULT_ROOM_SHOWCASE_ITEMS: HomepageRoomShowcaseItem[] = [
  {
    label: 'OTURMA GRUBU',
    href: '/kategori/oturma-grubu',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=900&q=85',
    imageAlt: 'Oturma odası koleksiyonu',
    ctaLabel: 'İNCELE',
  },
  {
    label: 'YATAK ODASI',
    href: '/kategori/yatak-odasi',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=85',
    imageAlt: 'Yatak odası koleksiyonu',
    ctaLabel: 'İNCELE',
  },
  {
    label: 'YEMEK ODASI',
    href: '/kategori/yemek-odasi',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=900&q=85',
    imageAlt: 'Yemek odası koleksiyonu',
    ctaLabel: 'İNCELE',
  },
];

const DEFAULT_TESTIMONIALS: HomepageTestimonialsItem[] = [
  {
    text: 'Final Mobilya yaşam alanımı eşsiz koleksiyonuyla bambaşka bir yere taşıdı. Kesinlikle tavsiye ederim.',
    name: 'Selin Yıldız',
  },
  {
    text: "Yakın zamanda Final Mobilya'dan ilk alışverişimi yaptım, deneyim tüm beklentilerimi aştı diyebilirim!",
    name: 'Mehmet Kaya',
  },
  {
    text: "Final Mobilya'nın ürünleri evimizi sıcak bir yuvaya dönüştürdü. Şık tasarımlar beklediğimden çok daha iyi.",
    name: 'Ayşe Demir',
  },
];

const DEFAULT_TRUST_ITEMS: HomepageTrustItem[] = [
  {
    title: 'USTALIK GARANTİSİ',
    description: 'Her parça, deneyimli ustalarımız tarafından özenle el işçiliğiyle hazırlanır.',
  },
  {
    title: 'DOĞAYA SAYGI',
    description: 'Üretimimizde çevre dostu malzemeleri ve sürdürülebilir uygulamaları önceliklendiriyoruz.',
  },
  {
    title: 'KİŞİYE ÖZEL TASARIM',
    description: 'Mobilyalarınızı yaşam alanınıza ve tarzınıza tam uyacak şekilde özelleştirin.',
  },
  {
    title: 'DAYANIKLILIK ODAĞI',
    description: 'Yıllarca kullanım için tasarlandı; yalnızca en kaliteli malzemeleri kullanırız.',
  },
  {
    title: 'MÜŞTERİ DESTEĞİ',
    description: 'Sorunsuz bir alışveriş deneyimi için 7/24 yanınızdayız.',
  },
];

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  hero: {
    slides: DEFAULT_HERO_SLIDES,
  },
  categories: {
    heading: 'EN İYİYİ KEŞFEDİN',
    items: DEFAULT_CATEGORY_ITEMS,
  },
  brandStory: {
    leftBadgeLabel: 'FINAL',
    leftBadgeYear: '1990',
    leftCard: {
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85',
      imageAlt: 'Bej İç Mekan',
      headline: 'BEJ\nİÇ MEKAN',
      ctaLabel: 'İNCELE',
      href: '/kategori/oturma-grubu',
    },
    centerTitle: 'ÖDÜLLÜ\nMOBİLYA\nTASARIMLARI!',
    centerSubtitle: 'Yenilikçi Tasarım,\nSınırsız Konfor',
    centerCtaLabel: 'TÜM ÜRÜNLERİ GÖRÜN',
    centerCtaHref: '/urunler',
    rightCard: {
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85',
      imageAlt: 'Mutfak Mobilyaları',
      headline: 'MUTFAK\nMOBİLYALARI',
      ctaLabel: 'İNCELE',
      href: '/kategori/yemek-odasi',
    },
  },
  featuredProducts: {
    tabs: DEFAULT_FEATURED_TABS,
  },
  shopTheLook: {
    backgroundImage: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1920&q=85',
    backgroundImageAlt: 'Yeni oturma odası',
    title: 'YENİ\nOTURMA ODANIZ',
    subtitle: 'Kalıcı Mobilya',
    ctaLabel: 'OTURMA ODALARIMIZI KEŞFEDİN',
    ctaHref: '/kategori/oturma-grubu',
  },
  roomShowcase: {
    items: DEFAULT_ROOM_SHOWCASE_ITEMS,
  },
  allProducts: {
    eyebrow: 'Final Mobilya Koleksiyonu',
    heading: 'Tüm Ürünler',
    description: 'Salon, yatak odası, yemek alanı ve tamamlayıcı ürünlerden seçtiğimiz öne çıkan modelleri keşfedin.',
    ctaLabel: 'Tüm Ürünleri Gör',
    ctaHref: '/urunler',
  },
  blogHighlights: {
    eyebrow: 'İlham Köşesi',
    heading: 'Final Mobilya Blog',
    description: 'Dekorasyon trendleri, oda planlama ipuçları ve mobilya seçimini kolaylaştıran kısa rehberler.',
    ctaLabel: 'Tümünü Görüntüle',
    ctaHref: '/blog',
  },
  testimonials: {
    heading: 'MÜŞTERİ YORUMLARIMIZ',
    items: DEFAULT_TESTIMONIALS,
  },
  trustBar: {
    heading: 'MOBİLYALARIMIZ\nNEDEN FARKLI?',
    items: DEFAULT_TRUST_ITEMS,
  },
};

function cloneDefaultContent(): HomepageContent {
  return JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE_CONTENT)) as HomepageContent;
}

function normalizeString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeHeroSlide(value: unknown, fallback: HomepageHeroSlide): HomepageHeroSlide {
  const input = typeof value === 'object' && value ? (value as Partial<HomepageHeroSlide>) : {};

  return {
    image: normalizeString(input.image, fallback.image),
    imageAlt: normalizeString(input.imageAlt, fallback.imageAlt),
    title: normalizeString(input.title, fallback.title),
    subtitle: normalizeString(input.subtitle, fallback.subtitle),
    ctaLabel: normalizeString(input.ctaLabel, fallback.ctaLabel),
    href: normalizeString(input.href, fallback.href),
  };
}

function normalizeCategoryItem(value: unknown, fallback: HomepageCategoryItem): HomepageCategoryItem {
  const input = typeof value === 'object' && value ? (value as Partial<HomepageCategoryItem>) : {};

  return {
    label: normalizeString(input.label, fallback.label),
    href: normalizeString(input.href, fallback.href),
  };
}

function normalizeBrandStoryCard(value: unknown, fallback: HomepageBrandStoryCard): HomepageBrandStoryCard {
  const input = typeof value === 'object' && value ? (value as Partial<HomepageBrandStoryCard>) : {};

  return {
    image: normalizeString(input.image, fallback.image),
    imageAlt: normalizeString(input.imageAlt, fallback.imageAlt),
    headline: normalizeString(input.headline, fallback.headline),
    ctaLabel: normalizeString(input.ctaLabel, fallback.ctaLabel),
    href: normalizeString(input.href, fallback.href),
  };
}

function normalizeFeaturedTab(value: unknown, fallback: HomepageFeaturedTab): HomepageFeaturedTab {
  const input = typeof value === 'object' && value ? (value as Partial<HomepageFeaturedTab>) : {};

  return {
    key: fallback.key,
    label: normalizeString(input.label, fallback.label),
    href: normalizeString(input.href, fallback.href),
    cta: normalizeString(input.cta, fallback.cta),
  };
}

function normalizeShopTheLookSection(value: unknown, fallback: HomepageShopTheLookSection): HomepageShopTheLookSection {
  const input = typeof value === 'object' && value ? (value as Partial<HomepageShopTheLookSection>) : {};

  return {
    backgroundImage: normalizeString(input.backgroundImage, fallback.backgroundImage),
    backgroundImageAlt: normalizeString(input.backgroundImageAlt, fallback.backgroundImageAlt),
    title: normalizeString(input.title, fallback.title),
    subtitle: normalizeString(input.subtitle, fallback.subtitle),
    ctaLabel: normalizeString(input.ctaLabel, fallback.ctaLabel),
    ctaHref: normalizeString(input.ctaHref, fallback.ctaHref),
  };
}

function normalizeRoomShowcaseItem(value: unknown, fallback: HomepageRoomShowcaseItem): HomepageRoomShowcaseItem {
  const input = typeof value === 'object' && value ? (value as Partial<HomepageRoomShowcaseItem>) : {};

  return {
    label: normalizeString(input.label, fallback.label),
    href: normalizeString(input.href, fallback.href),
    image: normalizeString(input.image, fallback.image),
    imageAlt: normalizeString(input.imageAlt, fallback.imageAlt),
    ctaLabel: normalizeString(input.ctaLabel, fallback.ctaLabel),
  };
}

function normalizeCollectionSection(value: unknown, fallback: HomepageCollectionSection): HomepageCollectionSection {
  const input = typeof value === 'object' && value ? (value as Partial<HomepageCollectionSection>) : {};

  return {
    eyebrow: normalizeString(input.eyebrow, fallback.eyebrow),
    heading: normalizeString(input.heading, fallback.heading),
    description: normalizeString(input.description, fallback.description),
    ctaLabel: normalizeString(input.ctaLabel, fallback.ctaLabel),
    ctaHref: normalizeString(input.ctaHref, fallback.ctaHref),
  };
}

function normalizeTestimonialItem(value: unknown, fallback: HomepageTestimonialsItem): HomepageTestimonialsItem {
  const input = typeof value === 'object' && value ? (value as Partial<HomepageTestimonialsItem>) : {};

  return {
    text: normalizeString(input.text, fallback.text),
    name: normalizeString(input.name, fallback.name),
  };
}

function normalizeTrustItem(value: unknown, fallback: HomepageTrustItem): HomepageTrustItem {
  const input = typeof value === 'object' && value ? (value as Partial<HomepageTrustItem>) : {};

  return {
    title: normalizeString(input.title, fallback.title),
    description: normalizeString(input.description, fallback.description),
  };
}

export function normalizeHomepageContent(value: unknown): HomepageContent {
  const defaults = cloneDefaultContent();
  const input = typeof value === 'object' && value ? (value as Partial<HomepageContent>) : {};

  return {
    hero: {
      slides: defaults.hero.slides.map((fallback, index) =>
        normalizeHeroSlide(input.hero?.slides?.[index], fallback),
      ),
    },
    categories: {
      heading: normalizeString(input.categories?.heading, defaults.categories.heading),
      items: defaults.categories.items.map((fallback, index) =>
        normalizeCategoryItem(input.categories?.items?.[index], fallback),
      ),
    },
    brandStory: {
      leftBadgeLabel: normalizeString(input.brandStory?.leftBadgeLabel, defaults.brandStory.leftBadgeLabel),
      leftBadgeYear: normalizeString(input.brandStory?.leftBadgeYear, defaults.brandStory.leftBadgeYear),
      leftCard: normalizeBrandStoryCard(input.brandStory?.leftCard, defaults.brandStory.leftCard),
      centerTitle: normalizeString(input.brandStory?.centerTitle, defaults.brandStory.centerTitle),
      centerSubtitle: normalizeString(input.brandStory?.centerSubtitle, defaults.brandStory.centerSubtitle),
      centerCtaLabel: normalizeString(input.brandStory?.centerCtaLabel, defaults.brandStory.centerCtaLabel),
      centerCtaHref: normalizeString(input.brandStory?.centerCtaHref, defaults.brandStory.centerCtaHref),
      rightCard: normalizeBrandStoryCard(input.brandStory?.rightCard, defaults.brandStory.rightCard),
    },
    featuredProducts: {
      tabs: defaults.featuredProducts.tabs.map((fallback, index) =>
        normalizeFeaturedTab(input.featuredProducts?.tabs?.[index], fallback),
      ),
    },
    shopTheLook: normalizeShopTheLookSection(input.shopTheLook, defaults.shopTheLook),
    roomShowcase: {
      items: defaults.roomShowcase.items.map((fallback, index) =>
        normalizeRoomShowcaseItem(input.roomShowcase?.items?.[index], fallback),
      ),
    },
    allProducts: normalizeCollectionSection(input.allProducts, defaults.allProducts),
    blogHighlights: normalizeCollectionSection(input.blogHighlights, defaults.blogHighlights),
    testimonials: {
      heading: normalizeString(input.testimonials?.heading, defaults.testimonials.heading),
      items: defaults.testimonials.items.map((fallback, index) =>
        normalizeTestimonialItem(input.testimonials?.items?.[index], fallback),
      ),
    },
    trustBar: {
      heading: normalizeString(input.trustBar?.heading, defaults.trustBar.heading),
      items: defaults.trustBar.items.map((fallback, index) =>
        normalizeTrustItem(input.trustBar?.items?.[index], fallback),
      ),
    },
  };
}
