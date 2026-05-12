import { unstable_noStore as noStore } from 'next/cache';
import { HomepageContent } from '@/lib/types';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import {
  DEFAULT_HOMEPAGE_CONTENT,
  HOMEPAGE_CONTENT_KEY,
  normalizeHomepageContent,
} from '@/lib/homepage-content';

export interface HomepageContentLoadResult {
  content: HomepageContent;
  source: 'db' | 'default';
  tableReady: boolean;
}

function cloneDefaultContent(): HomepageContent {
  return JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE_CONTENT)) as HomepageContent;
}

function isMissingSettingsTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;

  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    /app_settings/i.test(error.message || '')
  );
}

function getServiceClient() {
  try {
    return createServiceSupabaseClient();
  } catch {
    return null;
  }
}

export async function loadHomepageContent(): Promise<HomepageContentLoadResult> {
  noStore();

  const serviceSupabase = getServiceClient();
  if (!serviceSupabase) {
    return {
      content: cloneDefaultContent(),
      source: 'default',
      tableReady: false,
    };
  }

  const { data, error } = await serviceSupabase
    .from('app_settings')
    .select('value')
    .eq('key', HOMEPAGE_CONTENT_KEY)
    .maybeSingle();

  if (error) {
    if (isMissingSettingsTable(error) || error.code === 'PGRST116') {
      return {
        content: cloneDefaultContent(),
        source: 'default',
        tableReady: !isMissingSettingsTable(error),
      };
    }

    return {
      content: cloneDefaultContent(),
      source: 'default',
      tableReady: true,
    };
  }

  return {
    content: normalizeHomepageContent(data?.value),
    source: data?.value ? 'db' : 'default',
    tableReady: true,
  };
}
