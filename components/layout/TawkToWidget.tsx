'use client';

import { useEffect } from 'react';

type TawkToWidgetProps = {
  propertyId: string;
  widgetId: string;
};

export default function TawkToWidget({ propertyId, widgetId }: TawkToWidgetProps) {
  useEffect(() => {
    const existingScript = document.getElementById('tawk-to-loader');
    if (existingScript) return;

    const win = window as Window & {
      Tawk_API?: Record<string, unknown>;
      Tawk_LoadStart?: Date;
    };

    win.Tawk_API = win.Tawk_API || {};
    win.Tawk_LoadStart = new Date();

    const script = document.createElement('script');
    script.id = 'tawk-to-loader';
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    document.body.appendChild(script);
  }, [propertyId, widgetId]);

  return null;
}
