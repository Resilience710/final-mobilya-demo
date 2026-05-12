import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { HOMEPAGE_CONTENT_KEY, normalizeHomepageContent } from '@/lib/homepage-content';
import {
  loadHomepageContent,
} from '@/lib/homepage';

async function requireAdmin() {
  const authSupabase = createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await authSupabase.auth.getUser();

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await authSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Admin yetkisi gerekli.' }, { status: 403 }) };
  }

  return { user };
}

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const result = await loadHomepageContent();

    return NextResponse.json({
      values: result.content,
      source: result.source,
      tableReady: result.tableReady,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ana sayfa içeriği yüklenemedi.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  const content = normalizeHomepageContent(body);
  const serviceSupabase = createServiceSupabaseClient();

  const { error } = await serviceSupabase
    .from('app_settings')
    .upsert(
      {
        key: HOMEPAGE_CONTENT_KEY,
        value: content,
      },
      { onConflict: 'key' },
    );

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205' || /app_settings/i.test(error.message || '')) {
      return NextResponse.json(
        { error: 'Ayar tablosu bulunamadı. Önce `supabase/homepage_content_upgrade.sql` dosyasını çalıştırın.' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: error.message || 'Ana sayfa içeriği kaydedilemedi.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, values: content });
}
