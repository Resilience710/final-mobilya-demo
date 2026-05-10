-- ============================================================
-- APP SETTINGS TABLE + BANK TRANSFER ADMIN STORAGE
-- Run once in Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS app_settings_set_updated_at ON public.app_settings;

CREATE TRIGGER app_settings_set_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_settings_admin_all" ON public.app_settings;

CREATE POLICY "app_settings_admin_all"
  ON public.app_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;

INSERT INTO public.app_settings (key, value)
VALUES (
  'bank_transfer',
  jsonb_build_object(
    'bankName', '',
    'accountHolder', '',
    'iban', '',
    'branch', '',
    'accountNumber', '',
    'note', ''
  )
)
ON CONFLICT (key) DO NOTHING;
