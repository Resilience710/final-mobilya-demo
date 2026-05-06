'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Campaign } from '@/lib/types';
import { pickActiveCampaign } from '@/lib/campaigns';

const DISMISS_KEY = 'final_dismissed_campaign';

const themeClasses: Record<string, string> = {
  sunset: 'from-[#1f1410] via-[#7a4e37] to-[#d7aa71]',
  forest: 'from-[#132019] via-[#315244] to-[#7c9d7a]',
  midnight: 'from-[#101320] via-[#26385e] to-[#6a79ab]',
};

function getRemaining(endDate: string | null) {
  if (!endDate) return null;

  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;

  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  return { hours, minutes };
}

export default function CampaignBar() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [visible, setVisible] = useState(false);
  const [remaining, setRemaining] = useState<{ hours: number; minutes: number } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const loadCampaign = async () => {
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true);

      if (!mounted) return;

      const activeCampaign = pickActiveCampaign((data as Campaign[]) ?? []);

      if (!activeCampaign) return;
      if (sessionStorage.getItem(DISMISS_KEY) === activeCampaign.id) return;

      setCampaign(activeCampaign);
      setVisible(true);
      setRemaining(getRemaining(activeCampaign.end_date));
    };

    void loadCampaign();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!campaign?.end_date) return;

    const timer = window.setInterval(() => {
      setRemaining(getRemaining(campaign.end_date));
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [campaign]);

  const dismiss = () => {
    if (campaign) sessionStorage.setItem(DISMISS_KEY, campaign.id);
    setVisible(false);
  };

  const themeClass = useMemo(() => themeClasses[campaign?.theme ?? 'sunset'] ?? themeClasses.sunset, [campaign?.theme]);

  return (
    <AnimatePresence>
      {visible && campaign && (
        <motion.div
          key={campaign.id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.32, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className={`relative bg-gradient-to-r ${themeClass}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_30%)]" />
            <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/85">
                      {campaign.badge_text || 'Sınırlı Süre'}
                    </span>
                    {campaign.discount_percentage ? (
                      <span className="rounded-full bg-black/15 px-3 py-1 text-xs font-semibold text-white">
                        %{campaign.discount_percentage} indirim
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-white sm:text-[15px]">
                    {campaign.title}
                  </p>
                  {campaign.subtitle ? (
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/72 sm:text-sm">
                      {campaign.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                {remaining ? (
                  <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/88 backdrop-blur-sm">
                    Bitişe {remaining.hours}s {remaining.minutes}dk
                  </div>
                ) : null}
                {campaign.cta_label && campaign.cta_href ? (
                  <Link
                    href={campaign.cta_href}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-charcoal transition-colors hover:bg-gold hover:text-white"
                  >
                    {campaign.cta_label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
                <button
                  onClick={dismiss}
                  aria-label="Kapat"
                  className="rounded-full p-2 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
