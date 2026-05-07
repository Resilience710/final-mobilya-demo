import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { limited, retryAfterMs } = rateLimit(`newsletter:${ip}`, 5, 60_000);

  if (limited) {
    return NextResponse.json(
      { error: 'Çok fazla istek. Lütfen biraz bekleyin.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRe.test(email)) {
    return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  const primaryInsert = await supabase
    .from('newsletter_subscribers')
    .upsert(
      {
        email,
        source: 'website-footer',
        is_active: true,
      },
      { onConflict: 'email' }
    );

  if (!primaryInsert.error) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  if (primaryInsert.error.code !== 'PGRST205') {
    console.error('[POST /api/newsletter] newsletter_subscribers insert failed:', primaryInsert.error);
    return NextResponse.json({ error: 'Abonelik kaydedilemedi. Lütfen tekrar deneyin.' }, { status: 500 });
  }

  // Fallback for environments where the dedicated newsletter table has not
  // been migrated yet. We persist subscriptions into the existing leads table
  // with a marker so the admin panel can still list them separately.
  const fallbackInsert = await supabase
    .from('dealer_applications')
    .insert({
      full_name: 'Newsletter Abonesi',
      company_name: '__newsletter__',
      city: 'Website',
      phone: '-',
      email,
      message: 'Footer newsletter aboneliği',
      status: 'pending',
    });

  if (fallbackInsert.error) {
    console.error('[POST /api/newsletter] fallback insert failed:', fallbackInsert.error);
    return NextResponse.json({ error: 'Abonelik kaydedilemedi. Lütfen tekrar deneyin.' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
