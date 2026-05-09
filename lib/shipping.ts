import { ShippingRule } from '@/lib/types';

export const DEFAULT_SHIPPING_COST = 499;

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
  const price = matchedRule ? Number(matchedRule.price) : DEFAULT_SHIPPING_COST;

  return {
    price,
    isFree: price <= 0,
    matchedRule,
  };
}
