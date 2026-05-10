export type DiscountCountdownParts = {
  expired: boolean;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

function pad(value: number) {
  return String(Math.max(0, value)).padStart(2, '0');
}

export function getDiscountCountdownParts(endDate: string, now: number): DiscountCountdownParts {
  const remaining = new Date(endDate).getTime() - now;

  if (remaining <= 0) {
    return {
      expired: true,
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
    };
  }

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return {
    expired: false,
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
}
