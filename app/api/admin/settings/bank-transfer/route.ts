import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { loadBankTransferSettings } from '@/lib/bank-transfer';

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
    const result = await loadBankTransferSettings();

    return NextResponse.json({
      values: result.details || {
        bankName: '',
        accountHolder: '',
        iban: '',
        branch: '',
        accountNumber: '',
        note: '',
      },
      source: result.source,
      tableReady: result.tableReady,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ayarlar yüklenemedi.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  let body: {
    bankName?: string;
    accountHolder?: string;
    iban?: string;
    branch?: string;
    accountNumber?: string;
    note?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  const bankName = body.bankName?.trim() || '';
  const accountHolder = body.accountHolder?.trim() || '';
  const iban = body.iban?.trim() || '';
  const branch = body.branch?.trim() || null;
  const accountNumber = body.accountNumber?.trim() || null;
  const note = body.note?.trim() || null;

  if (!bankName || !accountHolder || !iban) {
    return NextResponse.json(
      { error: 'Banka adı, hesap sahibi ve IBAN zorunludur.' },
      { status: 400 }
    );
  }

  const serviceSupabase = createServiceSupabaseClient();
  const payload = {
    key: 'bank_transfer',
    value: {
      bankName,
      accountHolder,
      iban,
      branch,
      accountNumber,
      note,
    },
  };

  const { error } = await serviceSupabase
    .from('app_settings')
    .upsert(payload, { onConflict: 'key' });

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205' || /app_settings/i.test(error.message || '')) {
      return NextResponse.json(
        { error: 'Ayar tablosu bulunamadı. Önce `supabase/app_settings_bank_transfer_upgrade.sql` dosyasını çalıştırın.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Ayarlar kaydedilemedi.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
