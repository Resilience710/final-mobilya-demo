'use client';

import { Loader2 } from 'lucide-react';

interface GoogleAuthButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void | Promise<void>;
  label: string;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M21.8 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.5a4.7 4.7 0 0 1-2.04 3.09v2.56h3.3c1.94-1.79 3.04-4.43 3.04-7.39Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.07-.92 6.76-2.49l-3.3-2.56c-.92.62-2.09.98-3.46.98-2.66 0-4.92-1.79-5.72-4.2H2.86v2.64A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.28 13.73A5.98 5.98 0 0 1 5.96 12c0-.6.11-1.17.32-1.73V7.63H2.86A10 10 0 0 0 2 12c0 1.61.39 3.13 1.08 4.37l3.2-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.07c1.5 0 2.84.52 3.9 1.53l2.92-2.92C17.06 3.04 14.75 2 12 2A10 10 0 0 0 2.86 7.63l3.42 2.64c.8-2.41 3.06-4.2 5.72-4.2Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function GoogleAuthButton({
  disabled = false,
  loading = false,
  onClick,
  label,
}: GoogleAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-charcoal font-medium rounded-xl border border-stone/40 hover:border-gold/50 hover:bg-cream/40 disabled:opacity-50 transition-all duration-300"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
      <span>{label}</span>
    </button>
  );
}
