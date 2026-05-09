-- ============================================================
-- FINAL MOBILYA - SHIPPING RULES, PRODUCT DISCOUNTS, HOMEPAGE GALLERY
-- Run in Supabase SQL Editor after schema.sql and campaign_discount_upgrade.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shipping_rules (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  city       text        NOT NULL,
  district   text,
  price      numeric     NOT NULL DEFAULT 0 CHECK (price >= 0),
  note       text,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS shipping_rules_set_updated_at ON public.shipping_rules;
CREATE TRIGGER shipping_rules_set_updated_at
  BEFORE UPDATE ON public.shipping_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.shipping_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shipping_rules_public_read" ON public.shipping_rules;
DROP POLICY IF EXISTS "shipping_rules_admin_all" ON public.shipping_rules;

CREATE POLICY "shipping_rules_public_read"
  ON public.shipping_rules
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "shipping_rules_admin_all"
  ON public.shipping_rules
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT ON public.shipping_rules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.shipping_rules TO authenticated;

CREATE TABLE IF NOT EXISTS public.product_discounts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title           text,
  discount_type   text        NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  numeric     NOT NULL CHECK (discount_value >= 0),
  is_active       boolean     NOT NULL DEFAULT true,
  start_date      timestamptz,
  end_date        timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS product_discounts_set_updated_at ON public.product_discounts;
CREATE TRIGGER product_discounts_set_updated_at
  BEFORE UPDATE ON public.product_discounts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.product_discounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_discounts_public_read" ON public.product_discounts;
DROP POLICY IF EXISTS "product_discounts_admin_all" ON public.product_discounts;

CREATE POLICY "product_discounts_public_read"
  ON public.product_discounts
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "product_discounts_admin_all"
  ON public.product_discounts
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT ON public.product_discounts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_discounts TO authenticated;

CREATE TABLE IF NOT EXISTS public.homepage_gallery_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_index  integer     NOT NULL UNIQUE CHECK (slot_index BETWEEN 1 AND 4),
  image_url   text,
  alt_text    text,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS homepage_gallery_items_set_updated_at ON public.homepage_gallery_items;
CREATE TRIGGER homepage_gallery_items_set_updated_at
  BEFORE UPDATE ON public.homepage_gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.homepage_gallery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "homepage_gallery_items_public_read" ON public.homepage_gallery_items;
DROP POLICY IF EXISTS "homepage_gallery_items_admin_all" ON public.homepage_gallery_items;

CREATE POLICY "homepage_gallery_items_public_read"
  ON public.homepage_gallery_items
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "homepage_gallery_items_admin_all"
  ON public.homepage_gallery_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT ON public.homepage_gallery_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.homepage_gallery_items TO authenticated;

INSERT INTO public.homepage_gallery_items (slot_index, image_url, alt_text, is_active)
VALUES
  (1, NULL, 'Ana sayfa galeri görseli 1', true),
  (2, NULL, 'Ana sayfa galeri görseli 2', true),
  (3, NULL, 'Ana sayfa galeri görseli 3', true),
  (4, NULL, 'Ana sayfa galeri görseli 4', true)
ON CONFLICT (slot_index) DO NOTHING;
