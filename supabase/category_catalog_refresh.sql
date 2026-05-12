-- Normalize visible category catalog to the current 7-category structure.
-- Safe to re-run.

DO $$
DECLARE
  tamamlayici_id uuid;
  calisma_id uuid;
  baza_id uuid;
BEGIN
  SELECT id INTO tamamlayici_id
  FROM public.categories
  WHERE slug IN ('tamamlayici-urunler', 'aksesuar')
  ORDER BY CASE WHEN slug = 'tamamlayici-urunler' THEN 0 ELSE 1 END
  LIMIT 1;

  SELECT id INTO calisma_id
  FROM public.categories
  WHERE slug IN ('yatak', 'calisma-odasi')
  ORDER BY CASE WHEN slug = 'yatak' THEN 0 ELSE 1 END
  LIMIT 1;

  IF tamamlayici_id IS NOT NULL AND calisma_id IS NOT NULL AND tamamlayici_id <> calisma_id THEN
    UPDATE public.products
    SET category_id = tamamlayici_id
    WHERE category_id = calisma_id;
  END IF;

  UPDATE public.categories
  SET
    name = 'Oturma Grubu',
    slug = 'oturma-grubu',
    sort_order = 1,
    description = 'Konfor ve şıklığı bir arada sunan oturma grupları'
  WHERE slug = 'oturma-grubu';

  UPDATE public.categories
  SET
    name = 'Yatak Odası',
    slug = 'yatak-odasi',
    sort_order = 2,
    description = 'Huzurlu ve dengeli yaşam alanları için yatak odası koleksiyonları'
  WHERE slug = 'yatak-odasi';

  UPDATE public.categories
  SET
    name = 'Yemek Odası',
    slug = 'yemek-odasi',
    sort_order = 3,
    description = 'Şık sofralar ve davetkar yemek alanları için tasarlanan koleksiyonlar'
  WHERE slug = 'yemek-odasi';

  UPDATE public.categories
  SET
    name = 'Genç Odası',
    slug = 'genc-odasi',
    sort_order = 4,
    description = 'Modern, fonksiyonel ve enerjik genç odası çözümleri'
  WHERE slug = 'genc-odasi';

  IF EXISTS (SELECT 1 FROM public.categories WHERE slug = 'baza-baslik') THEN
    UPDATE public.categories
    SET
      name = 'Baza Başlık',
      slug = 'baza-baslik',
      sort_order = 5,
      description = 'Baza, başlık ve set çözümleriyle yatak odasını tamamlayan seçenekler'
    WHERE slug = 'baza-baslik';
  ELSE
    INSERT INTO public.categories (name, slug, description, image_url, sort_order)
    VALUES (
      'Baza Başlık',
      'baza-baslik',
      'Baza, başlık ve set çözümleriyle yatak odasını tamamlayan seçenekler',
      NULL,
      5
    );
  END IF;

  UPDATE public.categories
  SET
    name = 'Yatak',
    slug = 'yatak',
    sort_order = 6,
    description = 'Tek, çift ve özel ölçü yatak seçenekleri'
  WHERE slug IN ('calisma-odasi', 'yatak');

  UPDATE public.categories
  SET
    name = 'Tamamlayıcı Ürünler',
    slug = 'tamamlayici-urunler',
    sort_order = 7,
    description = 'Ayna, sehpa, dresuar, kitaplık ve yaşam alanını tamamlayan parçalar'
  WHERE slug IN ('aksesuar', 'tamamlayici-urunler');
END $$;
