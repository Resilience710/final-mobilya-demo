import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. RLS bypasses.
 *
 * USE ONLY IN SERVER ROUTES that absolutely need to bypass RLS
 * (e.g. payment webhooks updating order status on behalf of users).
 *
 * Never import from client components or pages.
 */
export function createServiceSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Service-role client missing env: SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
