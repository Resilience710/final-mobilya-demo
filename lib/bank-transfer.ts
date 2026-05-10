import { createServiceSupabaseClient } from '@/lib/supabase/service';

export interface BankTransferDetails {
  bankName: string;
  accountHolder: string;
  iban: string;
  branch?: string | null;
  accountNumber?: string | null;
  note: string;
}

export interface BankTransferSettingsLoadResult {
  details: BankTransferDetails | null;
  source: 'db' | 'env' | 'none';
  tableReady: boolean;
}

const DEFAULT_NOTE =
  'Havale açıklamasına sipariş numaranızı yazın. Ödeme admin tarafından kontrol edildikten sonra siparişiniz onaylanır.';

function isMissingSettingsTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;

  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    /app_settings/i.test(error.message || '')
  );
}

function normalizeDetails(input: Partial<BankTransferDetails> | null | undefined): BankTransferDetails | null {
  const bankName = input?.bankName?.trim();
  const accountHolder = input?.accountHolder?.trim();
  const iban = input?.iban?.trim();

  if (!bankName || !accountHolder || !iban) {
    return null;
  }

  return {
    bankName,
    accountHolder,
    iban,
    branch: input?.branch?.trim() || null,
    accountNumber: input?.accountNumber?.trim() || null,
    note: input?.note?.trim() || DEFAULT_NOTE,
  };
}

function getEnvDetails(): BankTransferDetails | null {
  return normalizeDetails({
    bankName: process.env.BANK_TRANSFER_BANK_NAME,
    accountHolder: process.env.BANK_TRANSFER_ACCOUNT_HOLDER,
    iban: process.env.BANK_TRANSFER_IBAN,
    branch: process.env.BANK_TRANSFER_BRANCH,
    accountNumber: process.env.BANK_TRANSFER_ACCOUNT_NUMBER,
    note: process.env.BANK_TRANSFER_NOTE,
  });
}

export async function loadBankTransferSettings(): Promise<BankTransferSettingsLoadResult> {
  const serviceSupabase = createServiceSupabaseClient();

  const { data, error } = await serviceSupabase
    .from('app_settings')
    .select('value')
    .eq('key', 'bank_transfer')
    .maybeSingle();

  if (error && error.code !== 'PGRST116' && !isMissingSettingsTable(error)) {
    throw new Error(error.message || 'Banka havalesi ayarları okunamadı.');
  }

  const tableReady = !isMissingSettingsTable(error);
  const dbDetails = normalizeDetails((data?.value as Partial<BankTransferDetails> | null | undefined) ?? null);
  if (dbDetails) {
    return { details: dbDetails, source: 'db', tableReady };
  }

  const envDetails = getEnvDetails();
  if (envDetails) {
    return { details: envDetails, source: 'env', tableReady };
  }

  return { details: null, source: 'none', tableReady };
}

export async function isBankTransferConfigured(): Promise<boolean> {
  const { details } = await loadBankTransferSettings();
  return Boolean(details);
}

export async function getBankTransferDetails(): Promise<BankTransferDetails> {
  const { details } = await loadBankTransferSettings();

  if (!details) {
    throw new Error('Banka havalesi bilgileri eksik.');
  }

  return details;
}
