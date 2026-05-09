import turkeyLocations from '@/lib/data/turkey-provinces-districts.json';

type RawDistrict = {
  id: number;
  name: string;
};

type RawProvince = {
  id: number;
  name: string;
  districts: RawDistrict[];
};

export interface TurkeyProvince {
  id: number;
  name: string;
  districts: string[];
}

function toTurkishTitleCase(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr-TR') + part.slice(1))
    .join(' ');
}

export const turkeyProvinces: TurkeyProvince[] = (turkeyLocations as RawProvince[]).map((province) => ({
  id: province.id,
  name: toTurkishTitleCase(province.name),
  districts: province.districts
    .map((district) => toTurkishTitleCase(district.name))
    .sort((a, b) => a.localeCompare(b, 'tr')),
}));
