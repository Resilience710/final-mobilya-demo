'use client';

import { useEffect, useState } from 'react';
import { DiscountCountdownParts, getDiscountCountdownParts } from '@/lib/product-discount-timer';

interface Props {
  endDate: string;
  className?: string;
  note?: string | null;
}

const units = [
  { key: 'days', label: 'GÜN' },
  { key: 'hours', label: 'SAAT' },
  { key: 'minutes', label: 'DAK' },
  { key: 'seconds', label: 'SAN' },
] as const;

const loadingParts: DiscountCountdownParts = {
  expired: false,
  days: '--',
  hours: '--',
  minutes: '--',
  seconds: '--',
};

export default function DiscountCountdown({
  endDate,
  className = '',
  note = 'İndirimli fiyat için süre devam ediyor.',
}: Props) {
  const [now, setNow] = useState<number | null>(null);
  const parts = now === null ? loadingParts : getDiscountCountdownParts(endDate, now);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex flex-col rounded-2xl border border-[#f2c5c0] bg-[#fff7f6] px-3 py-3 ${className}`.trim()}>
      <div className="flex items-center gap-1.5">
        {units.map((unit) => (
          <div key={unit.key} className="w-12 overflow-hidden rounded-md border border-[#e36b5a] bg-white text-center shadow-[0_6px_14px_rgba(227,107,90,0.08)]">
            <div className="py-1 text-base font-bold leading-none text-[#d25842]">
              {parts[unit.key]}
            </div>
            <div className="border-t border-[#f5d2cd] bg-[#fff2ef] py-1 text-[9px] font-semibold tracking-[0.12em] text-[#d25842]">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-brown/65">
        {parts.expired ? 'İndirim sona erdi.' : note}
      </p>
    </div>
  );
}
