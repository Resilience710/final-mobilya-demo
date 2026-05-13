'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import type { HomepagePopupSection } from '@/lib/types';

const STORAGE_KEY = 'finalmobilya-site-popup';

export default function SitePopup({ popup }: { popup: HomepagePopupSection }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const signature = useMemo(
    () =>
      JSON.stringify({
        isActive: popup.isActive,
        badge: popup.badge,
        title: popup.title,
        description: popup.description,
        ctaLabel: popup.ctaLabel,
        href: popup.href,
        image: popup.image,
      }),
    [popup],
  );

  const hiddenOnRoute =
    pathname?.startsWith('/admin') ||
    pathname === '/giris' ||
    pathname === '/kayit';

  useEffect(() => {
    if (!popup.isActive || !popup.href || !popup.title || hiddenOnRoute) return;

    try {
      const seenSignature = window.sessionStorage.getItem(STORAGE_KEY);
      if (seenSignature === signature) return;
      setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [popup, signature, hiddenOnRoute]);

  const closePopup = () => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, signature);
    } catch {
      // ignore storage issues
    }
    setOpen(false);
  };

  if (!popup.isActive || !open || hiddenOnRoute) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-charcoal/68 px-4 py-8 backdrop-blur-sm">
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-black/20 lg:grid-cols-[1.05fr_0.95fr]">
        <button
          type="button"
          onClick={closePopup}
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-md transition-colors hover:bg-gold hover:text-white"
          aria-label="Popup kapat"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative min-h-[260px] bg-stone/10">
          <Image
            src={popup.image}
            alt={popup.imageAlt || popup.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-charcoal/35 via-charcoal/10 to-transparent" />
        </div>

        <div className="flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
            {popup.badge}
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-charcoal sm:text-4xl">
            {popup.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-brown/75 sm:text-base">
            {popup.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={popup.href}
              onClick={closePopup}
              className="inline-flex items-center justify-center rounded-xl bg-charcoal px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold"
            >
              {popup.ctaLabel}
            </Link>
            <button
              type="button"
              onClick={closePopup}
              className="inline-flex items-center justify-center rounded-xl border border-stone/20 px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:border-charcoal"
            >
              Daha Sonra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
