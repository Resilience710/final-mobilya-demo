-- ============================================================
-- HOMEPAGE CONTENT MANAGEMENT UPGRADE
-- Run AFTER schema.sql and other upgrade files.
-- Safe to re-run (uses IF NOT EXISTS + ON CONFLICT DO NOTHING).
-- ============================================================

-- ============================================================
-- 1. HERO SLIDES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order  integer     NOT NULL DEFAULT 0,
  image_url   text,
  title1      text        NOT NULL DEFAULT '',
  title2      text        NOT NULL DEFAULT '',
  italic_text text        NOT NULL DEFAULT '',
  cta_text    text        NOT NULL DEFAULT '',
  cta_href    text        NOT NULL DEFAULT '/',
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hero_slides_public_read" ON public.hero_slides;
DROP POLICY IF EXISTS "hero_slides_admin_all"   ON public.hero_slides;

CREATE POLICY "hero_slides_public_read"
  ON public.hero_slides FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "hero_slides_admin_all"
  ON public.hero_slides FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT ON public.hero_slides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hero_slides TO authenticated;

INSERT INTO public.hero_slides (sort_order, image_url, title1, title2, italic_text, cta_text, cta_href) VALUES
  (1, 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1920&q=85', 'ALANINIZI',  'DÖNÜŞTÜRÜN',   'Hayalinizdeki Mobilya',          'OTURMA ODALARIMIZI KEŞFEDİN', '/kategori/oturma-grubu'),
  (2, 'https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?w=1920&q=85', 'ZARAFETLE',  'YAŞAYIN',      'Premium Tasarımın İmzası',       'YATAK ODALARINI GÖRÜN',       '/kategori/yatak-odasi'),
  (3, 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1920&q=85', 'EVİNİZE',    'DEĞER KATIN',  'Yıllara Meydan Okuyan İşçilik',  'TÜM ÜRÜNLERİ GÖR',           '/urunler')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text        NOT NULL DEFAULT '',
  review_text text        NOT NULL DEFAULT '',
  rating      integer     NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  sort_order  integer     NOT NULL DEFAULT 0,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "testimonials_public_read" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_admin_all"   ON public.testimonials;

CREATE POLICY "testimonials_public_read"
  ON public.testimonials FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "testimonials_admin_all"
  ON public.testimonials FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;

INSERT INTO public.testimonials (sort_order, author_name, review_text, rating) VALUES
  (1, 'Selin Yıldız', 'Final Mobilya yaşam alanımı eşsiz koleksiyonuyla bambaşka bir yere taşıdı. Kesinlikle tavsiye ederim.', 5),
  (2, 'Mehmet Kaya',  'Yakın zamanda Final Mobilya''dan ilk alışverişimi yaptım, deneyim tüm beklentilerimi aştı diyebilirim!', 5),
  (3, 'Ayşe Demir',  'Final Mobilya''nın ürünleri evimizi sıcak bir yuvaya dönüştürdü. Şık tasarımlar beklediğimden çok daha iyi.', 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. TRUST FEATURES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trust_features (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_name   text        NOT NULL DEFAULT 'Shield',
  title       text        NOT NULL DEFAULT '',
  description text        NOT NULL DEFAULT '',
  sort_order  integer     NOT NULL DEFAULT 0,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trust_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trust_features_public_read" ON public.trust_features;
DROP POLICY IF EXISTS "trust_features_admin_all"   ON public.trust_features;

CREATE POLICY "trust_features_public_read"
  ON public.trust_features FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "trust_features_admin_all"
  ON public.trust_features FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT ON public.trust_features TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.trust_features TO authenticated;

INSERT INTO public.trust_features (sort_order, icon_name, title, description) VALUES
  (1, 'Hammer',        'USTALIK GARANTİSİ',    'Her parça, deneyimli ustalarımız tarafından özenle el işçiliğiyle hazırlanır.'),
  (2, 'Leaf',          'DOĞAYA SAYGI',          'Üretimimizde çevre dostu malzemeleri ve sürdürülebilir uygulamaları önceliklendiriyoruz.'),
  (3, 'Heart',         'KİŞİYE ÖZEL TASARIM',  'Mobilyalarınızı yaşam alanınıza ve tarzınıza tam uyacak şekilde özelleştirin.'),
  (4, 'Sofa',          'DAYANIKLILIK ODAĞI',    'Yıllarca kullanım için tasarlandı; yalnızca en kaliteli malzemeleri kullanırız.'),
  (5, 'MessageCircle', 'MÜŞTERİ DESTEĞİ',      'Sorunsuz bir alışveriş deneyimi için 7/24 yanınızdayız.')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. ROOM COLLECTIONS (Instagram-style grid)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.room_collections (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  label       text        NOT NULL DEFAULT '',
  href        text        NOT NULL DEFAULT '/',
  image_url   text,
  sort_order  integer     NOT NULL DEFAULT 0,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.room_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "room_collections_public_read" ON public.room_collections;
DROP POLICY IF EXISTS "room_collections_admin_all"   ON public.room_collections;

CREATE POLICY "room_collections_public_read"
  ON public.room_collections FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "room_collections_admin_all"
  ON public.room_collections FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT ON public.room_collections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.room_collections TO authenticated;

INSERT INTO public.room_collections (sort_order, label, href, image_url) VALUES
  (1, 'OTURMA ODALARI', '/kategori/oturma-grubu', 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=900&q=85'),
  (2, 'YATAK ODALARI',  '/kategori/yatak-odasi',  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=85'),
  (3, 'YEMEK ODALARI',  '/kategori/yemek-odasi',  'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=900&q=85')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. APP SETTINGS: announcement + brand_story
-- ============================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  key        text        PRIMARY KEY,
  value      jsonb       NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_settings_public_read" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_admin_all"   ON public.app_settings;

CREATE POLICY "app_settings_public_read"
  ON public.app_settings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "app_settings_admin_all"
  ON public.app_settings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.app_settings TO authenticated;

INSERT INTO public.app_settings (key, value) VALUES
  ('announcement', '{"text": "5.000 ₺ üzeri siparişlerde ücretsiz kargo · Tüm Türkiye'\''ye teslimat", "is_active": true}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.app_settings (key, value) VALUES
  ('brand_story', '{
    "heading_line1": "ÖDÜLLÜ",
    "heading_line2": "MOBİLYA",
    "heading_line3": "TASARIMLARI!",
    "subtitle_line1": "Yenilikçi Tasarım,",
    "subtitle_line2": "Sınırsız Konfor",
    "cta_text": "TÜM ÜRÜNLERİ GÖRÜN",
    "cta_href": "/urunler",
    "left_image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85",
    "left_image_label": "BEJ İÇ MEKAN",
    "left_image_href": "/kategori/oturma-grubu",
    "right_image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85",
    "right_image_label": "MUTFAK MOBİLYALARI",
    "right_image_href": "/kategori/yemek-odasi"
  }')
ON CONFLICT (key) DO NOTHING;
