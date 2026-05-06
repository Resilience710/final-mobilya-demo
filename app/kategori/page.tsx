import type { Metadata } from 'next';
import KategoriContent from './KategoriContent';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Category } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Tüm Kategoriler',
  description: 'Oturma odası, yatak odası, yemek odası ve daha fazlası için premium mobilya koleksiyonları.',
};

export default async function KategoriPage() {
  const supabase = createServerSupabaseClient();

  const [{ data: categories }, { data: productsByCategory }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .order('sort_order'),
    supabase
      .from('products')
      .select('category_id')
      .eq('is_active', true),
  ]);

  const counts = new Map<string, number>();
  for (const row of productsByCategory || []) {
    const categoryId = row.category_id as string | null;
    if (!categoryId) continue;
    counts.set(categoryId, (counts.get(categoryId) || 0) + 1);
  }

  const categoryList: Category[] = ((categories as Category[]) || []).map((category) => ({
    ...category,
    product_count: counts.get(category.id) || 0,
  }));

  return <KategoriContent categories={categoryList} />;
}
