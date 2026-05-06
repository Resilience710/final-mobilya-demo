const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv(filePath) {
  const abs = path.resolve(filePath);
  const text = fs.readFileSync(abs, 'utf8');

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const sep = line.indexOf('=');
    if (sep === -1) continue;

    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnv('.env.local');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const categories = [
  {
    name: 'Oturma Grubu',
    slug: 'oturma-grubu',
    description: 'Konfor ve şıklığı bir arada sunan oturma grupları',
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    sort_order: 1,
  },
  {
    name: 'Yatak Odası',
    slug: 'yatak-odasi',
    description: 'Huzurlu uykular için tasarlanan yatak odası takımları',
    image_url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
    sort_order: 2,
  },
  {
    name: 'Yemek Odası',
    slug: 'yemek-odasi',
    description: 'Şık ve fonksiyonel yemek odası takımları',
    image_url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
    sort_order: 3,
  },
  {
    name: 'Çalışma Odası',
    slug: 'calisma-odasi',
    description: 'Verimli çalışma ortamları için tasarlanmış mobilyalar',
    image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
    sort_order: 4,
  },
  {
    name: 'Genç Odası',
    slug: 'genc-odasi',
    description: 'Modern ve enerjik genç odası takımları',
    image_url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
    sort_order: 5,
  },
  {
    name: 'Aksesuar',
    slug: 'aksesuar',
    description: 'Evinize karakter katan dekoratif aksesuarlar',
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    sort_order: 6,
  },
];

const products = [
  {
    name: 'Milano Köşe Koltuk Takımı',
    slug: 'milano-kose-koltuk-takimi',
    category_slug: 'oturma-grubu',
    description: 'Milano Köşe Koltuk Takımı, modern ve lüks yaşam alanları için tasarlanmıştır. Premium kumaş döşeme, ergonomik tasarım ve dayanıklı yapısıyla yıllar boyu konfor sağlar. Geniş oturma alanı ile aileniz ve misafirleriniz için ideal bir tercih.',
    short_description: 'Modern tasarım, premium kumaş, ergonomik konfor',
    base_price: 45990,
    discount_price: 39990,
    is_active: true,
    is_featured: true,
    stock_quantity: 15,
    sku: 'MLN-KK-001',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800',
    ],
    tags: ['köşe koltuk', 'modern', 'premium'],
    specifications: {
      Renk: 'Gri',
      Garanti: '5 Yıl',
      Malzeme: 'Premium Kadife',
      Boyutlar: '320x220x85 cm',
      Ağırlık: '95 kg',
    },
    variants: [
      { name: 'Gri Kadife', sku: 'MLN-KK-001-GR', price_modifier: 0, stock_quantity: 5, color: 'Gri', material: 'Kadife' },
      { name: 'Lacivert Kadife', sku: 'MLN-KK-001-LC', price_modifier: 2000, stock_quantity: 4, color: 'Lacivert', material: 'Kadife' },
      { name: 'Bej Kadife', sku: 'MLN-KK-001-BJ', price_modifier: 0, stock_quantity: 6, color: 'Bej', material: 'Kadife' },
    ],
  },
  {
    name: 'Venezia Kanepe',
    slug: 'venezia-kanepe',
    category_slug: 'oturma-grubu',
    description: 'Venezia Kanepe, İtalyan tasarım ilkeleriyle üretilmiş premium bir üründür. Yüksek yoğunluklu sünger ve çelik iskelet yapısıyla uzun ömürlü kullanım sunar.',
    short_description: 'İtalyan tasarım, yüksek konfor, çelik iskelet',
    base_price: 28990,
    discount_price: null,
    is_active: true,
    is_featured: true,
    stock_quantity: 20,
    sku: 'VNZ-KN-001',
    images: ['https://images.unsplash.com/photo-1550254478-ead40cc54513?w=800'],
    tags: ['kanepe', 'İtalyan', 'premium'],
    specifications: {
      Renk: 'Kahverengi',
      Garanti: '3 Yıl',
      Malzeme: 'Deri',
      Boyutlar: '220x90x85 cm',
      Ağırlık: '65 kg',
    },
    variants: [
      { name: 'Kahverengi Deri', sku: 'VNZ-KN-001-KH', price_modifier: 0, stock_quantity: 10, color: 'Kahverengi', material: 'Deri' },
      { name: 'Siyah Deri', sku: 'VNZ-KN-001-SY', price_modifier: 1500, stock_quantity: 8, color: 'Siyah', material: 'Deri' },
      { name: 'Krem Deri', sku: 'VNZ-KN-001-KR', price_modifier: 1000, stock_quantity: 5, color: 'Krem', material: 'Deri' },
    ],
  },
  {
    name: 'Royal Yatak Odası Takımı',
    slug: 'royal-yatak-odasi-takimi',
    category_slug: 'yatak-odasi',
    description: 'Royal Yatak Odası Takımı, klasik ve modern çizgileri bir araya getiren zarif bir tasarıma sahiptir. Takım; yatak başlığı, komodinler, şifonyer ve gardıroptan oluşmaktadır.',
    short_description: 'Zarif tasarım, geniş depolama, kaliteli işçilik',
    base_price: 67990,
    discount_price: 59990,
    is_active: true,
    is_featured: true,
    stock_quantity: 8,
    sku: 'RYL-YO-001',
    images: ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800'],
    tags: ['yatak odası', 'takım', 'lüks'],
    specifications: {
      Renk: 'Beyaz / Ceviz',
      Garanti: '5 Yıl',
      Malzeme: 'MDF + Naturel Ahşap',
      Parçalar: 'Karyola, 2 Komodin, Şifonyer, Gardırop',
    },
    variants: [],
  },
  {
    name: 'Elegance Yemek Masası',
    slug: 'elegance-yemek-masasi',
    category_slug: 'yemek-odasi',
    description: 'Elegance Yemek Masası, 6 kişilik aileler için tasarlanmış geniş ve şık bir masadır. Doğal meşe ahşap ve mat siyah metal ayak kombinasyonu ile modern bir görünüm sunar.',
    short_description: '6 kişilik, doğal meşe, modern tasarım',
    base_price: 18990,
    discount_price: 15990,
    is_active: true,
    is_featured: false,
    stock_quantity: 25,
    sku: 'ELG-YM-001',
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800'],
    tags: ['yemek masası', 'meşe', 'modern'],
    specifications: {
      Renk: 'Doğal / Siyah',
      Garanti: '3 Yıl',
      Malzeme: 'Doğal Meşe + Metal',
      Boyutlar: '180x90x76 cm',
      'Kişi Sayısı': '6',
    },
    variants: [
      { name: 'Doğal Meşe', sku: 'ELG-YM-001-DM', price_modifier: 0, stock_quantity: 12, color: 'Doğal', material: 'Meşe' },
      { name: 'Koyu Ceviz', sku: 'ELG-YM-001-KC', price_modifier: 1000, stock_quantity: 8, color: 'Koyu Ceviz', material: 'Ceviz' },
    ],
  },
  {
    name: 'Nordic Çalışma Masası',
    slug: 'nordic-calisma-masasi',
    category_slug: 'calisma-odasi',
    description: 'Nordic Çalışma Masası, minimalist Skandinav tasarımıyla üretkenliğinizi artırmak için tasarlanmıştır. Geniş çalışma yüzeyi ve gizli kablo yönetim sistemi ile düzenli bir çalışma alanı sunar.',
    short_description: 'Skandinav tasarım, kablo yönetimi, geniş alan',
    base_price: 8990,
    discount_price: null,
    is_active: true,
    is_featured: false,
    stock_quantity: 40,
    sku: 'NRD-CM-001',
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'],
    tags: ['çalışma masası', 'Skandinav', 'minimalist'],
    specifications: {
      Renk: 'Doğal / Beyaz',
      Garanti: '2 Yıl',
      Malzeme: 'Bambu + Çelik',
      Boyutlar: '140x70x75 cm',
    },
    variants: [],
  },
  {
    name: 'Urban Genç Odası Takımı',
    slug: 'urban-genc-odasi-takimi',
    category_slug: 'genc-odasi',
    description: 'Urban Genç Odası Takımı, gençlerin ihtiyaçlarına uygun modern ve fonksiyonel bir takımdır. Çalışma masası, yatak, dolap ve raf ünitesinden oluşur.',
    short_description: 'Modern, fonksiyonel, genç dostu tasarım',
    base_price: 34990,
    discount_price: 29990,
    is_active: true,
    is_featured: true,
    stock_quantity: 12,
    sku: 'URB-GO-001',
    images: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800'],
    tags: ['genç odası', 'takım', 'modern'],
    specifications: {
      Renk: 'Beyaz / Antrasit',
      Garanti: '3 Yıl',
      Malzeme: 'MDF + Metal',
      Parçalar: 'Karyola, Çalışma Masası, Dolap, Raf Ünitesi',
    },
    variants: [],
  },
];

async function upsertCategory(category) {
  const existing = await supabase
    .from('categories')
    .select('id')
    .eq('slug', category.slug)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (existing.data?.id) {
    const updateRes = await supabase
      .from('categories')
      .update(category)
      .eq('id', existing.data.id)
      .select('id')
      .single();
    if (updateRes.error) throw updateRes.error;
    return updateRes.data.id;
  }

  const insertRes = await supabase
    .from('categories')
    .insert(category)
    .select('id')
    .single();

  if (insertRes.error) throw insertRes.error;
  return insertRes.data.id;
}

async function upsertProduct(product, categoryId) {
  const payload = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    short_description: product.short_description,
    category_id: categoryId,
    base_price: product.base_price,
    discount_price: product.discount_price,
    is_active: product.is_active,
    is_featured: product.is_featured,
    stock_quantity: product.stock_quantity,
    sku: product.sku,
    images: product.images,
    tags: product.tags,
    specifications: product.specifications,
  };

  const existing = await supabase
    .from('products')
    .select('id')
    .eq('slug', product.slug)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (existing.data?.id) {
    const updateRes = await supabase
      .from('products')
      .update(payload)
      .eq('id', existing.data.id)
      .select('id')
      .single();
    if (updateRes.error) throw updateRes.error;
    return updateRes.data.id;
  }

  const insertRes = await supabase
    .from('products')
    .insert(payload)
    .select('id')
    .single();

  if (insertRes.error) throw insertRes.error;
  return insertRes.data.id;
}

async function upsertVariant(variant, productId) {
  const payload = {
    product_id: productId,
    name: variant.name,
    sku: variant.sku,
    price_modifier: variant.price_modifier,
    stock_quantity: variant.stock_quantity,
    color: variant.color || null,
    material: variant.material || null,
    size: variant.size || null,
    image_url: variant.image_url || null,
    is_active: true,
  };

  const existing = await supabase
    .from('product_variants')
    .select('id')
    .eq('sku', variant.sku)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (existing.data?.id) {
    const updateRes = await supabase
      .from('product_variants')
      .update(payload)
      .eq('id', existing.data.id);
    if (updateRes.error) throw updateRes.error;
    return;
  }

  const insertRes = await supabase
    .from('product_variants')
    .insert(payload);

  if (insertRes.error) throw insertRes.error;
}

async function main() {
  const categoryIdBySlug = new Map();

  for (const category of categories) {
    const id = await upsertCategory(category);
    categoryIdBySlug.set(category.slug, id);
  }

  for (const product of products) {
    const categoryId = categoryIdBySlug.get(product.category_slug);
    if (!categoryId) {
      throw new Error(`Kategori bulunamadı: ${product.category_slug}`);
    }

    const productId = await upsertProduct(product, categoryId);

    for (const variant of product.variants) {
      await upsertVariant(variant, productId);
    }
  }

  console.log(`Kategori seed tamamlandı: ${categories.length}`);
  console.log(`Ürün seed tamamlandı: ${products.length}`);
  console.log(`Varyant seed tamamlandı: ${products.reduce((sum, product) => sum + product.variants.length, 0)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
