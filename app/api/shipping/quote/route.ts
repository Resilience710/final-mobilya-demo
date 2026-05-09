import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getShippingQuote } from '@/lib/shipping';
import { ShippingRule } from '@/lib/types';

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city') || '';
  const district = req.nextUrl.searchParams.get('district') || '';
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('shipping_rules')
    .select('*')
    .eq('is_active', true);
  const rules = error ? [] : ((data as ShippingRule[]) || []);
  const quote = getShippingQuote(rules, city, district);

  return NextResponse.json({
    price: quote.price,
    isFree: quote.isFree,
    matchedRule: quote.matchedRule,
    note: quote.note,
    rulesFallbackUsed: !!error,
  });
}
