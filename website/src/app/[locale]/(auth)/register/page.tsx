'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from '@/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Mật khẩu xác nhận không khớp'); return; }
    if (form.password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      if (data.error) { setError(data.error); return; }
      setAuth(data.user, data.access_token);
      router.push('/onboarding');
    } catch {
      setError('Đã có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const { data } = await api.post('/auth/firebase', { idToken });
      if (data.error) { setError(data.error); return; }
      setAuth(data.user, data.access_token);
      router.push(data.requiresOnboarding ? '/onboarding' : '/');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Google Register Error:', err);
        setError('Đăng ký Google thất bại: ' + (err.message || err.toString()));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const getStrength = (pass: string) => {
    if (!pass) return null;
    if (pass.length < 6) return { label: 'Yếu', color: 'bg-red-500', w: 'w-1/4' };
    if (pass.length < 8 || !/[0-9]/.test(pass)) return { label: 'Trung bình', color: 'bg-yellow-500', w: 'w-2/4' };
    if (/[^a-zA-Z0-9]/.test(pass)) return { label: 'Mạnh', color: 'bg-emerald-500', w: 'w-full' };
    return { label: 'Tốt', color: 'bg-emerald-400', w: 'w-3/4' };
  };
  const strength = getStrength(form.password);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#080d14] py-8">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(52,211,153,1) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-xl">⚽</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Football<span className="text-emerald-400">Verse</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm">{t('register_desc')}</p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/50">
          <h1 className="text-xl font-semibold text-white mb-1">{t('register_title')}</h1>
          <p className="text-gray-400 text-sm mb-6">{t('register_desc')}</p>

          {/* Google Button */}
          <button
            id="btn-google-register"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-4 shadow-sm"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? t('google_processing') : t('google_register')}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs">{t('or_email_register')}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('username_label')}</label>
              <input
                id="input-register-username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder={t('username_placeholder')}
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                className="w-full bg-white/[0.06] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
              />
              <p className="text-gray-600 text-xs mt-1">{t('username_hint')}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('email_label')}</label>
              <input
                id="input-register-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('email_placeholder')}
                required
                className="w-full bg-white/[0.06] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('password_label')}</label>
              <div className="relative">
                <input
                  id="input-register-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder={t('password_placeholder')}
                  required
                  className="w-full bg-white/[0.06] border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all pr-12"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {strength && (
                <div className="mt-2">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.w} rounded-full transition-all duration-300`} />
                  </div>
                  <p className={`text-xs mt-1 ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('password_confirm_label')}</label>
              <input
                id="input-register-confirm"
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange}
                placeholder={t('password_placeholder')}
                required
                className={`w-full bg-white/[0.06] border text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                  form.confirm && form.confirm !== form.password
                    ? 'border-red-500/50'
                    : 'border-white/10 focus:border-emerald-500/50 focus:bg-white/[0.08]'
                }`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            <button
              id="btn-email-register"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-60 shadow-lg shadow-emerald-500/25 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t('register_loading')}
                </span>
              ) : t('register_btn')}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            {t('has_account')}{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              {t('login_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
