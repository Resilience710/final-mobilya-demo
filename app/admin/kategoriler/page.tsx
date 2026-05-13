'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Loader2, X, FolderTree, Image as ImageIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Category } from '@/lib/types';

interface ProductCategoryRow {
  category_id: string | null;
}

type FormState = {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string;
  sort_order: string;
};

const emptyForm: FormState = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  parent_id: '',
  sort_order: '0',
};

type CategoryTreeRow = {
  category: Category;
  depth: number;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; data?: Category } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [categoryProductCounts, setCategoryProductCounts] = useState<Record<string, number>>({});

  const supabase = createClient();

  const load = async () => {
    setLoading(true);
    const [{ data: categoryRows }, { data: productRows }] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .order('sort_order')
        .order('created_at', { ascending: false }),
      supabase
        .from('products')
        .select('category_id'),
    ]);

    const counts: Record<string, number> = {};
    for (const row of (productRows as ProductCategoryRow[]) || []) {
      if (!row.category_id) continue;
      counts[row.category_id] = (counts[row.category_id] || 0) + 1;
    }

    setCategories((categoryRows as Category[]) ?? []);
    setCategoryProductCounts(counts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sortedPreview = useMemo(
    () => {
      const byParent = new Map<string | null, Category[]>();
      const sorted = [...categories].sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return a.name.localeCompare(b.name, 'tr');
      });

      for (const category of sorted) {
        const key = category.parent_id || null;
        byParent.set(key, [...(byParent.get(key) || []), category]);
      }

      const rows: CategoryTreeRow[] = [];

      const walk = (parentId: string | null, depth: number) => {
        for (const category of byParent.get(parentId) || []) {
          rows.push({ category, depth });
          walk(category.id, depth + 1);
        }
      };

      walk(null, 0);
      return rows;
    },
    [categories]
  );

  const parentOptions = useMemo(() => {
    if (!modal) return sortedPreview;

    const blockedIds = new Set<string>();
    if (modal.data) {
      blockedIds.add(modal.data.id);
      const queue = [modal.data.id];

      while (queue.length > 0) {
        const current = queue.shift()!;
        for (const category of categories) {
          if (category.parent_id === current && !blockedIds.has(category.id)) {
            blockedIds.add(category.id);
            queue.push(category.id);
          }
        }
      }
    }

    return sortedPreview.filter(({ category }) => !blockedIds.has(category.id));
  }, [categories, modal, sortedPreview]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setModal({ mode: 'create' });
  };

  const openEdit = (category: Category) => {
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      parent_id: category.parent_id || '',
      sort_order: String(category.sort_order),
    });
    setFormError('');
    setModal({ mode: 'edit', data: category });
  };

  const closeModal = () => {
    setModal(null);
    setFormError('');
  };

  const handleSave = async () => {
    const cleanName = form.name.trim();
    const cleanSlug = slugify(form.slug || form.name);

    if (!cleanName) {
      setFormError('Kategori adı zorunludur.');
      return;
    }

    if (!cleanSlug) {
      setFormError('Geçerli bir slug üretilemedi.');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      name: cleanName,
      slug: cleanSlug,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      parent_id: form.parent_id || null,
      sort_order: parseInt(form.sort_order, 10) || 0,
    };

    let error;

    if (modal?.mode === 'create') {
      ({ error } = await supabase.from('categories').insert(payload));
    } else if (modal?.data) {
      ({ error } = await supabase.from('categories').update(payload).eq('id', modal.data.id));
    }

    setSaving(false);

    if (error) {
      if (error.message.toLowerCase().includes('duplicate')) {
        setFormError('Bu slug zaten kullanılıyor.');
      } else {
        setFormError(`Kaydedilemedi: ${error.message}`);
      }
      return;
    }

    closeModal();
    load();
  };

  const handleDelete = async (category: Category) => {
    const productCount = categoryProductCounts[category.id] || 0;
    const hasChildren = categories.some((item) => item.parent_id === category.id);

    if (productCount > 0) {
      alert('Bu kategoriye bağlı ürünler var. Önce ürünleri taşıyın veya silin.');
      return;
    }

    if (hasChildren) {
      alert('Bu kategoriye bağlı alt kategoriler var. Önce alt kategorileri taşıyın veya silin.');
      return;
    }

    if (!confirm(`"${category.name}" kategorisini silmek istediğinize emin misiniz?`)) return;

    setDeleting(category.id);
    const { error } = await supabase.from('categories').delete().eq('id', category.id);
    setDeleting(null);

    if (error) {
      alert(`Silinemedi: ${error.message}`);
      return;
    }

    setCategories((prev) => prev.filter((item) => item.id !== category.id));
  };

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold text-charcoal/60 uppercase tracking-wider mb-2">
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  );

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif text-charcoal">Kategori Yönetimi</h1>
          <p className="text-sm text-brown/50 mt-1">Sitede görünen kategorileri düzenleyin</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white text-sm rounded-xl hover:bg-gold transition-colors"
        >
          <Plus className="w-4 h-4" /> Yeni Kategori
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-brown/30" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center">
            <FolderTree className="w-8 h-8 text-brown/20 mx-auto mb-2" />
            <p className="text-brown/30 text-sm">Henüz kategori yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-brown/50 uppercase tracking-wider border-b border-gray-50">
                  <th className="px-6 py-3 font-medium">Kategori</th>
                  <th className="px-6 py-3 font-medium">Slug</th>
                  <th className="px-6 py-3 font-medium">Ürün</th>
                  <th className="px-6 py-3 font-medium">Sıra</th>
                  <th className="px-6 py-3 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedPreview.map(({ category, depth }) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-beige overflow-hidden flex items-center justify-center flex-shrink-0">
                          {category.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-brown/30" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-charcoal font-medium">
                            {depth > 0 ? `${'— '.repeat(depth)}${category.name}` : category.name}
                          </p>
                          {category.parent_id && (
                            <p className="text-[11px] text-brown/35">Alt kategori</p>
                          )}
                          <p className="text-xs text-brown/40 max-w-sm truncate">{category.description || 'Açıklama yok'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-brown/60 font-mono">{category.slug}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold">
                        {categoryProductCounts[category.id] || 0} ürün
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-brown/50">{category.sort_order}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(category)}
                          className="p-2 text-brown/40 hover:text-charcoal hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          disabled={deleting === category.id}
                          className="p-2 text-brown/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          {deleting === category.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-modal w-full max-w-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                  <h2 className="font-serif text-lg text-charcoal">
                    {modal.mode === 'create' ? 'Yeni Kategori' : 'Kategoriyi Düzenle'}
                  </h2>
                  <button onClick={closeModal} className="p-1.5 text-brown/40 hover:text-charcoal rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-6 py-6 space-y-5">
                  {formError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{formError}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Kategori Adı" required>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                          slug: modal?.mode === 'create' ? slugify(e.target.value) : prev.slug,
                        }))}
                        placeholder="Oturma Grubu"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-charcoal placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                      />
                    </Field>
                    <Field label="Üst Kategori">
                      <select
                        value={form.parent_id}
                        onChange={(e) => setForm((prev) => ({ ...prev, parent_id: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                      >
                        <option value="">Ana kategori</option>
                        {parentOptions.map(({ category, depth }) => (
                          <option key={category.id} value={category.id}>
                            {depth > 0 ? `${'— '.repeat(depth)}${category.name}` : category.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Sıralama">
                      <input
                        type="number"
                        value={form.sort_order}
                        onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-charcoal placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                      />
                    </Field>
                  </div>

                  <Field label="Slug" required>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                      placeholder="oturma-grubu"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-charcoal placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                    />
                  </Field>

                  <Field label="Açıklama">
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="Kategori kartında görünecek kısa açıklama"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-charcoal placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all resize-none"
                    />
                  </Field>

                  <Field label="Görsel URL">
                    <input
                      type="text"
                      value={form.image_url}
                      onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-charcoal placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                    />
                  </Field>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
                  <button
                    onClick={closeModal}
                    className="px-5 py-2.5 text-sm text-brown/60 hover:text-charcoal border border-gray-200 rounded-xl transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm bg-charcoal text-white rounded-xl hover:bg-gold disabled:opacity-50 transition-colors"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {modal.mode === 'create' ? 'Oluştur' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
