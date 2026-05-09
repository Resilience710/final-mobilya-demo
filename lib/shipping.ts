import { ShippingRule } from '@/lib/types';

export const DEFAULT_SHIPPING_COST = 499;

const DEFAULT_CITY_SHIPPING_PRICES: Record<string, number> = {
  istanbul: 0,
  kocaeli: 1000,
  tekirdag: 1000,
  yalova: 1000,
  bursa: 1000,
  sakarya: 1000,
  edirne: 1500,
  kirklareli: 1500,
  canakkale: 1500,
  balikesir: 1500,
  bilecik: 1500,
  bolu: 1500,
  duzce: 1500,
  eskisehir: 1500,
  ankara: 2000,
  izmir: 2000,
  manisa: 2000,
  aydin: 2000,
  mugla: 2000,
  denizli: 2000,
  afyonkarahisar: 2000,
  kutahya: 2000,
  usak: 2000,
  konya: 2000,
  antalya: 2000,
  isparta: 2000,
  burdur: 2000,
  zonguldak: 2000,
  karabuk: 2000,
  bartin: 2000,
  kirikkale: 2000,
  kirsehir: 2000,
  corum: 2000,
  cankiri: 2000,
  yozgat: 2000,
  adana: 2500,
  mersin: 2500,
  hatay: 2500,
  osmaniye: 2500,
  kahramanmaras: 2500,
  kayseri: 2500,
  sivas: 2500,
  nigde: 2500,
  aksaray: 2500,
  nevsehir: 2500,
  karaman: 2500,
  samsun: 2500,
  ordu: 2500,
  giresun: 2500,
  tokat: 2500,
  amasya: 2500,
  sinop: 2500,
  kastamonu: 2500,
  trabzon: 2500,
  rize: 2500,
  artvin: 2500,
  gumushane: 2500,
  bayburt: 2500,
  erzincan: 2500,
  erzurum: 2500,
  malatya: 2500,
  elazig: 2500,
  tunceli: 2500,
  bingol: 2500,
  adiyaman: 3000,
  gaziantep: 3000,
  kilis: 3000,
  sanliurfa: 3000,
  diyarbakir: 3000,
  mardin: 3000,
  batman: 3000,
  siirt: 3000,
  sirnak: 3000,
  hakkari: 3000,
  van: 3000,
  bitlis: 3000,
  mus: 3000,
  agri: 3000,
  igdir: 3000,
  kars: 3000,
  ardahan: 3000,
};

export function normalizeLocation(value: string | null | undefined) {
  return (value || '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function getShippingQuote(
  rules: ShippingRule[] | null | undefined,
  city: string,
  district?: string | null,
) {
  const normalizedCity = normalizeLocation(city);
  const normalizedDistrict = normalizeLocation(district);

  const activeRules = (rules ?? []).filter((rule) => rule.is_active);
  const exactDistrictRule = activeRules.find(
    (rule) =>
      normalizeLocation(rule.city) === normalizedCity &&
      !!rule.district &&
      normalizeLocation(rule.district) === normalizedDistrict,
  );

  const cityRule = activeRules.find(
    (rule) => normalizeLocation(rule.city) === normalizedCity && !rule.district,
  );

  const matchedRule = exactDistrictRule ?? cityRule ?? null;
  const defaultPrice = DEFAULT_CITY_SHIPPING_PRICES[normalizedCity] ?? DEFAULT_SHIPPING_COST;
  const price = matchedRule ? Number(matchedRule.price) : defaultPrice;
  const note = matchedRule ? matchedRule.note : null;

  return {
    price,
    isFree: price <= 0,
    matchedRule,
    note,
  };
}
