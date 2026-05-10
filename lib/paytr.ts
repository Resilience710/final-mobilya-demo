import crypto from 'crypto';

export interface PaytrBasketItem {
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface CreatePaytrIframeTokenParams {
  merchantOid: string;
  userIp: string;
  email: string;
  paymentAmount: number;
  userName: string;
  userAddress: string;
  userPhone: string;
  userBasket: PaytrBasketItem[];
  merchantOkUrl: string;
  merchantFailUrl: string;
  timeoutLimit?: number;
  debugOn?: 0 | 1;
  testMode?: 0 | 1;
  noInstallment?: 0 | 1;
  maxInstallment?: 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  currency?: 'TL' | 'TRY' | 'EUR' | 'USD' | 'GBP' | 'RUB';
  lang?: 'tr' | 'en';
}

interface PaytrTokenResult {
  status: 'success' | 'failure';
  token?: string;
  reason?: string;
}

function getRequiredConfig() {
  const merchantId = process.env.PAYTR_MERCHANT_ID?.trim();
  const merchantKey = process.env.PAYTR_MERCHANT_KEY?.trim();
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT?.trim();

  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error('PAYTR_MERCHANT_ID / PAYTR_MERCHANT_KEY / PAYTR_MERCHANT_SALT env değişkenleri eksik.');
  }

  return { merchantId, merchantKey, merchantSalt };
}

export function isPaytrConfigured(): boolean {
  return Boolean(
    process.env.PAYTR_MERCHANT_ID &&
      process.env.PAYTR_MERCHANT_KEY &&
      process.env.PAYTR_MERCHANT_SALT
  );
}

export function moneyToMinorUnits(amount: number): string {
  return String(Math.round(amount * 100));
}

export function createPaytrMerchantOid(orderId: string): string {
  const sanitized = orderId.replace(/-/g, '');
  const merchantOid = `ord${sanitized}`;

  if (!/^[a-zA-Z0-9]{10,64}$/.test(merchantOid)) {
    throw new Error('PayTR merchant_oid üretilemedi.');
  }

  return merchantOid;
}

export function resolvePaytrBuyerIp(ip: string): string {
  const value = ip.trim();

  if (/^[0-9]{1,3}(?:\.[0-9]{1,3}){3}$/.test(value) || /^[0-9a-fA-F:]+$/.test(value)) {
    return value;
  }

  if (process.env.NODE_ENV !== 'production') {
    return '127.0.0.1';
  }

  throw new Error('Buyer IP address could not be resolved for PayTR request.');
}

function base64Basket(items: PaytrBasketItem[]): string {
  const basket = items.map((item) => [
    item.name.slice(0, 250),
    (Math.round(item.unitPrice * 100) / 100).toFixed(2),
    item.quantity,
  ]);

  return Buffer.from(JSON.stringify(basket), 'utf8').toString('base64');
}

export async function createPaytrIframeToken(params: CreatePaytrIframeTokenParams): Promise<PaytrTokenResult> {
  const { merchantId, merchantKey, merchantSalt } = getRequiredConfig();
  const paymentAmount = moneyToMinorUnits(params.paymentAmount);
  const userBasket = base64Basket(params.userBasket);
  const currency = params.currency === 'TRY' ? 'TL' : params.currency || 'TL';
  const testMode =
    params.testMode ??
    (process.env.PAYTR_TEST_MODE === '1' ? 1 : 0);
  const debugOn =
    params.debugOn ??
    (process.env.PAYTR_DEBUG_ON === '1' ? 1 : 0);
  const timeoutLimit = params.timeoutLimit ?? 30;
  const noInstallment = params.noInstallment ?? 0;
  const maxInstallment = params.maxInstallment ?? 0;
  const lang = params.lang || 'tr';

  const hashStr = [
    merchantId,
    params.userIp,
    params.merchantOid,
    params.email,
    paymentAmount,
    userBasket,
    String(noInstallment),
    String(maxInstallment),
    currency,
    String(testMode),
  ].join('');

  const paytrToken = crypto
    .createHmac('sha256', merchantKey)
    .update(hashStr + merchantSalt)
    .digest('base64');

  const postVals = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: params.userIp,
    merchant_oid: params.merchantOid,
    email: params.email,
    payment_amount: paymentAmount,
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: String(debugOn),
    no_installment: String(noInstallment),
    max_installment: String(maxInstallment),
    user_name: params.userName.slice(0, 60),
    user_address: params.userAddress.slice(0, 400),
    user_phone: params.userPhone.slice(0, 20),
    merchant_ok_url: params.merchantOkUrl,
    merchant_fail_url: params.merchantFailUrl,
    timeout_limit: String(timeoutLimit),
    currency,
    test_mode: String(testMode),
    lang,
    iframe_v2: '1',
    iframe_v2_dark: process.env.PAYTR_IFRAME_V2_DARK === '1' ? '1' : '0',
  });

  let response: Response;
  try {
    response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postVals.toString(),
      cache: 'no-store',
    });
  } catch (error) {
    return { status: 'failure', reason: 'PayTR bağlantı hatası.' };
  }

  let result: any = null;
  try {
    result = await response.json();
  } catch {
    return { status: 'failure', reason: 'PayTR yanıtı okunamadı.' };
  }

  if (!response.ok || result?.status !== 'success' || typeof result?.token !== 'string') {
    return {
      status: 'failure',
      reason: result?.reason || result?.err_msg || 'PayTR ödeme oturumu başlatılamadı.',
    };
  }

  return { status: 'success', token: result.token };
}

export function verifyPaytrCallbackHash(input: {
  merchantOid: string;
  status: string;
  totalAmount: string;
  hash: string;
}): boolean {
  const { merchantKey, merchantSalt } = getRequiredConfig();
  const expected = crypto
    .createHmac('sha256', merchantKey)
    .update(input.merchantOid + merchantSalt + input.status + input.totalAmount)
    .digest('base64');

  return expected === input.hash;
}
