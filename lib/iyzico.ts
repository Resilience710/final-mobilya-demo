import Iyzipay from 'iyzipay';
import crypto from 'crypto';

let cached: Iyzipay | null = null;

export function getIyzipay(): Iyzipay {
  if (cached) return cached;

  const apiKey    = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const uri       = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error('IYZICO_API_KEY / IYZICO_SECRET_KEY env değişkenleri eksik.');
  }

  cached = new Iyzipay({ apiKey, secretKey, uri });
  return cached;
}

export function isIyzicoConfigured(): boolean {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

export interface CheckoutInitParams {
  orderId: string;
  totalPrice: number;
  userId: string;
  userEmail: string;
  buyerIdentityNumber?: string | null;
  buyerIp: string;
  shipping: {
    name: string;
    address: string;
    city: string;
    phone: string;
    zip?: string | null;
  };
  items: { id: string; name: string; price: number; category: string }[];
  callbackUrl: string;
}

export interface CheckoutInitResult {
  status: 'success' | 'failure';
  paymentPageUrl?: string;
  token?: string;
  errorMessage?: string;
}

function nameParts(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: parts[0] };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

/** sayıları iyzico'nun beklediği formatta string'e çevirir (en fazla 2 ondalık) */
export function moneyStr(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function resolveBuyerIdentityNumber(identityNumber?: string | null): string {
  const value = identityNumber?.trim() || process.env.IYZICO_BUYER_IDENTITY_NUMBER?.trim();

  if (!value || !/^\d{11}$/.test(value)) {
    throw new Error('IYZICO_BUYER_IDENTITY_NUMBER eksik veya gecersiz. Production için gercek bir kimlik numarasi stratejisi tanimlanmali.');
  }

  return value;
}

function resolveBuyerIp(ip: string): string {
  const value = ip.trim();

  if (/^[0-9]{1,3}(?:\.[0-9]{1,3}){3}$/.test(value) || /^[0-9a-fA-F:]+$/.test(value)) {
    return value;
  }

  if (process.env.NODE_ENV !== 'production') {
    return '127.0.0.1';
  }

  throw new Error('Buyer IP address could not be resolved for iyzico request.');
}

export async function initCheckoutForm(p: CheckoutInitParams): Promise<CheckoutInitResult> {
  const iyzipay = getIyzipay();
  const { first, last } = nameParts(p.shipping.name);

  // line-item fiyatlarının toplamı, kargo dahil totalPrice'a eşit olmalı
  // İlerleyen aşamada kargoyu ayrı bir BasketItem (VIRTUAL) olarak ekleyebilirsiniz.
  // Şimdilik shipping'i orantılayıp ürünlere dağıtmak yerine ürün toplamını
  // kullanıp kargoyu paidPrice farkı olarak iyzico tarafında kabul ediyoruz —
  // bu yüzden basket toplamı = totalPrice olmalı. Çağıran taraf bunu garanti etsin.

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: p.orderId,
    price: moneyStr(p.totalPrice),
    paidPrice: moneyStr(p.totalPrice),
    currency: Iyzipay.CURRENCY.TRY,
    basketId: p.orderId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: p.callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9, 12],
    buyer: {
      id: p.userId,
      name: first,
      surname: last,
      gsmNumber: p.shipping.phone,
      email: p.userEmail,
      identityNumber: resolveBuyerIdentityNumber(p.buyerIdentityNumber),
      registrationAddress: p.shipping.address,
      ip: resolveBuyerIp(p.buyerIp),
      city: p.shipping.city,
      country: 'Turkey',
      zipCode: p.shipping.zip || '00000',
    },
    shippingAddress: {
      contactName: p.shipping.name,
      city: p.shipping.city,
      country: 'Turkey',
      address: p.shipping.address,
      zipCode: p.shipping.zip || '00000',
    },
    billingAddress: {
      contactName: p.shipping.name,
      city: p.shipping.city,
      country: 'Turkey',
      address: p.shipping.address,
      zipCode: p.shipping.zip || '00000',
    },
    basketItems: p.items.map(it => ({
      id: it.id,
      name: it.name.slice(0, 250),
      category1: it.category,
      itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
      price: moneyStr(it.price),
    })),
  };

  return new Promise<CheckoutInitResult>((resolve) => {
    iyzipay.checkoutFormInitialize.create(request as any, (err: any, result: any) => {
      if (err || !result) {
        return resolve({ status: 'failure', errorMessage: err?.errorMessage || 'iyzico bağlantı hatası.' });
      }
      if (result.status !== 'success') {
        return resolve({ status: 'failure', errorMessage: result.errorMessage || 'Ödeme başlatılamadı.' });
      }
      resolve({
        status: 'success',
        paymentPageUrl: result.paymentPageUrl,
        token: result.token,
      });
    });
  });
}

export interface RetrieveResult {
  status: 'success' | 'failure';
  paymentStatus?: string;        // iyzico paymentStatus: SUCCESS / FAILURE
  paidPrice?: number;
  conversationId?: string;
  paymentId?: string;
  binNumber?: string;
  lastFourDigits?: string;
  installment?: number;
  cardType?: string;
  cardAssociation?: string;
  errorMessage?: string;
  raw?: any;
}

function normalizeSignatureValue(value: unknown): string {
  if (value == null) return '';
  const stringValue = String(value);
  if (!/^-?\d+(?:\.\d+)?$/.test(stringValue)) {
    return stringValue;
  }

  return stringValue
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '')
    .replace(/\.$/, '');
}

export function verifyCheckoutRetrieveSignature(raw: any, token: string): boolean {
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const signature = typeof raw?.signature === 'string' ? raw.signature : '';

  if (!secretKey || !signature) {
    return false;
  }

  const parts = [
    raw?.paymentStatus,
    raw?.paymentId,
    raw?.currency,
    raw?.basketId,
    raw?.conversationId,
    raw?.paidPrice,
    raw?.price,
    token,
  ].map(normalizeSignatureValue);

  const expected = crypto
    .createHmac('sha256', secretKey)
    .update(parts.join(':'))
    .digest('hex');

  return expected === signature;
}

export async function retrieveCheckoutForm(token: string): Promise<RetrieveResult> {
  const iyzipay = getIyzipay();
  return new Promise<RetrieveResult>((resolve) => {
    iyzipay.checkoutForm.retrieve({ locale: Iyzipay.LOCALE.TR, token } as any, (err: any, result: any) => {
      if (err || !result) {
        return resolve({ status: 'failure', errorMessage: err?.errorMessage || 'iyzico doğrulama hatası.' });
      }
      if (result.status !== 'success') {
        return resolve({ status: 'failure', errorMessage: result.errorMessage || 'Ödeme doğrulanamadı.', raw: result });
      }
      resolve({
        status: 'success',
        paymentStatus:   result.paymentStatus,
        paidPrice:       Number(result.paidPrice),
        conversationId:  result.conversationId,
        paymentId:       result.paymentId,
        binNumber:       result.binNumber,
        lastFourDigits:  result.lastFourDigits,
        installment:     Number(result.installment ?? 1),
        cardType:        result.cardType,
        cardAssociation: result.cardAssociation,
        raw: result,
      });
    });
  });
}
