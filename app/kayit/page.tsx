'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 120;
const MIN_PASSWORD_LENGTH = 8;

function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const lockoutTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') ?? '';
  const redirect = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/hesabim';
  const loginHref = redirect === '/hesabim' ? '/giris' : `/giris?redirect=${encodeURIComponent(redirect)}`;

  useEffect(() => {
    return () => { if (lockoutTimer.current) clearInterval(lockoutTimer.current); };
  }, []);

  useEffect(() => {
    if (searchParams.get('error') === 'google_auth_failed') {
      setError('Google ile kayıt tamamlanamadı. Lütfen tekrar deneyin.');
    }
  }, [searchParams]);

  const startLockout = () => {
    setLockoutRemaining(LOCKOUT_SECONDS);
    lockoutTimer.current = setInterval(() => {
      setLockoutRemaining(prev => {
        if (prev <= 1) {
          clearInterval(lockoutTimer.current!);
          lockoutTimer.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isLockedOut = lockoutRemaining > 0;

  const handleGoogleSignIn = async () => {
    if (isLockedOut || loading || googleLoading) return;

    setError('');
    setGoogleLoading(true);

    const { error } = await signInWithGoogle(redirect);
    if (error) {
      setError('Google ile kayıt başlatılamadı. Lütfen tekrar deneyin.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.`);
      return;
    }

    // Password complexity enforcement
    if (!/[A-Z]/.test(password)) {
      setError('Şifre en az bir büyük harf içermelidir.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Şifre en az bir küçük harf içermelidir.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Şifre en az bir rakam içermelidir.');
      return;
    }

    setLoading(true);
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const next = failedAttempts + 1;
      setFailedAttempts(next);

      if (next >= MAX_ATTEMPTS) {
        setFailedAttempts(0);
        startLockout();
        setError(`Çok fazla başarısız deneme. ${LOCKOUT_SECONDS} saniye bekleyin.`);
      } else {
        const msg = String(data?.error || '').toLowerCase();
        if (msg.includes('already registered') || msg.includes('user already')) {
          setError('Kayıt tamamlanamadı. Lütfen e-postanızı kontrol edin.');
        } else if (msg.includes('zaten bir hesap var')) {
          setError('Bu e-posta adresiyle zaten bir hesap var.');
        } else if (msg.includes('rate limit') || msg.includes('only request this once')) {
          setError('Çok fazla deneme. Lütfen birkaç dakika bekleyip tekrar deneyin.');
        } else if (msg.includes('birkaç dakika sonra')) {
          setError('Çok fazla deneme. Lütfen birkaç dakika sonra tekrar deneyin.');
        } else if (msg.includes('password') && msg.includes('weak')) {
          setError('Şifreniz çok zayıf. Lütfen daha güçlü bir şifre seçin.');
        } else if (msg.includes('invalid email')) {
          setError('Geçersiz e-posta adresi.');
        } else {
          setError(data?.error || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        }
      }
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white rounded-2xl shadow-card p-10 border border-stone/30">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-charcoal mb-3">Kayıt Başarılı!</h2>
            <p className="text-brown/70 text-sm mb-6">
              Hesabınız oluşturuldu. Artık giriş yapabilirsiniz.
            </p>
            <Link
              href={loginHref}
              className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors"
            >
              Giriş Yap <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-3xl tracking-tight text-charcoal">FINAL MOBİLYA</h1>
          </Link>
          <p className="mt-3 text-brown/70 text-sm tracking-wide">Yeni hesap oluşturun</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-card p-8 border border-stone/30">
          <div className="space-y-4">
            <GoogleAuthButton
              onClick={handleGoogleSignIn}
              loading={googleLoading}
              disabled={loading || isLockedOut}
              label="Google ile devam et"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.24em] text-brown/45">
                <span className="bg-white px-3">veya e-posta ile</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Ad Soyad</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-cream/50 border border-stone/40 rounded-xl text-charcoal placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
                  placeholder="Adınız Soyadınız"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-cream/50 border border-stone/40 rounded-xl text-charcoal placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-cream/50 border border-stone/40 rounded-xl text-charcoal placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
                  placeholder="En az 8 karakter"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown/40 hover:text-brown transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs px-1 -mt-2">
                <span className={`flex items-center gap-1 ${password.length >= MIN_PASSWORD_LENGTH ? 'text-green-600' : 'text-brown/40'}`}>
                  {password.length >= MIN_PASSWORD_LENGTH ? '✓' : '○'} En az {MIN_PASSWORD_LENGTH} karakter
                </span>
                <span className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-brown/40'}`}>
                  {/[A-Z]/.test(password) ? '✓' : '○'} Büyük harf
                </span>
                <span className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-brown/40'}`}>
                  {/[a-z]/.test(password) ? '✓' : '○'} Küçük harf
                </span>
                <span className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-brown/40'}`}>
                  {/[0-9]/.test(password) ? '✓' : '○'} Rakam
                </span>
                <span className="flex items-center gap-1 text-brown/50">
                  ○ Özel karakter opsiyonel
                </span>
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Şifre Tekrar</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-cream/50 border border-stone/40 rounded-xl text-charcoal placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
                  placeholder="Şifrenizi tekrar girin"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading || isLockedOut}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-charcoal text-white font-medium rounded-xl hover:bg-charcoal/90 disabled:opacity-50 transition-all duration-300"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLockedOut ? (
                `${lockoutRemaining}s bekleyin`
              ) : (
                <>
                  Kayıt Ol
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-stone/30 text-center">
            <p className="text-sm text-brown/60">
              Zaten hesabınız var mı?{' '}
              <Link href={loginHref} className="text-gold font-medium hover:text-gold-light transition-colors">
                Giriş Yapın
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal/40" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
