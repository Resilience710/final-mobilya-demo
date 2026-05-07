import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';

const registerAttempts = new Map<string, { count: number; resetAt: number }>();
const REGISTER_RATE_LIMIT = 5;
const REGISTER_RATE_WINDOW = 10 * 60_000;

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = registerAttempts.get(ip);

  if (!entry || now >= entry.resetAt) {
    registerAttempts.set(ip, { count: 1, resetAt: now + REGISTER_RATE_WINDOW });
    return false;
  }

  entry.count += 1;
  return entry.count > REGISTER_RATE_LIMIT;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongEnoughPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: 'Çok fazla kayıt denemesi. Lütfen birkaç dakika sonra tekrar deneyin.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const fullName = String(body?.fullName || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (fullName.length < 2) {
      return NextResponse.json({ error: 'Ad soyad alanı en az 2 karakter olmalıdır.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
    }

    if (!isStrongEnoughPassword(password)) {
      return NextResponse.json(
        { error: 'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam içermelidir.' },
        { status: 400 }
      );
    }

    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error || !data.user) {
      const message = error?.message?.toLowerCase() || '';

      if (message.includes('already been registered') || message.includes('already registered') || message.includes('duplicate')) {
        return NextResponse.json({ error: 'Bu e-posta adresiyle zaten bir hesap var.' }, { status: 409 });
      }

      if (message.includes('password')) {
        return NextResponse.json(
          { error: 'Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam içermelidir.' },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: error?.message || 'Kayıt oluşturulamadı.' }, { status: 400 });
    }

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'customer',
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      return NextResponse.json({ error: 'Kullanıcı profili oluşturulamadı.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[register] Unexpected error:', error);
    return NextResponse.json({ error: 'Kayıt sırasında beklenmeyen bir hata oluştu.' }, { status: 500 });
  }
}
