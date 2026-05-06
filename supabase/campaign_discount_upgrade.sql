-- ============================================================
-- FINAL MOBILYA - Campaign Discount Upgrade
-- Adds timed discount fields to campaigns and keeps the script
-- safe to re-run on existing projects.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text        NOT NULL,
  subtitle            text,
  badge_text          text,
  cta_label           text,
  cta_href            text,
  theme               text        NOT NULL DEFAULT 'sunset'
                                   CHECK (theme IN ('sunset', 'forest', 'midnight')),
  discount_percentage numeric     CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 90)),
  scope               text        NOT NULL DEFAULT 'all'
                                   CHECK (scope IN ('all', 'featured', 'category')),
  category_id         uuid        REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active           boolean     NOT NULL DEFAULT true,
  start_date          timestamptz,
  end_date            timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS badge_text text,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_href text,
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'sunset',
  ADD COLUMN IF NOT EXISTS discount_percentage numeric,
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'campaigns_theme_check'
  ) THEN
    ALTER TABLE public.campaigns
      ADD CONSTRAINT campaigns_theme_check
      CHECK (theme IN ('sunset', 'forest', 'midnight'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'campaigns_scope_check'
  ) THEN
    ALTER TABLE public.campaigns
      ADD CONSTRAINT campaigns_scope_check
      CHECK (scope IN ('all', 'featured', 'category'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'campaigns_discount_percentage_check'
  ) THEN
    ALTER TABLE public.campaigns
      ADD CONSTRAINT campaigns_discount_percentage_check
      CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 90));
  END IF;
END $$;

DROP TRIGGER IF EXISTS campaigns_set_updated_at ON public.campaigns;

CREATE TRIGGER campaigns_set_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaigns_public_read" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_admin_all" ON public.campaigns;

CREATE POLICY "campaigns_public_read"
  ON public.campaigns
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "campaigns_admin_all"
  ON public.campaigns
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT ON public.campaigns TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
