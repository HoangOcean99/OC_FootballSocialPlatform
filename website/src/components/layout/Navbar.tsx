'use client';

import { useState } from 'react';
import { Link } from '@/navigation';
import { usePathname, useRouter } from '@/navigation';
import { LIVE_MATCHES } from '@/lib/mockData';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslations, useLocale } from 'next-intl';
import { Globe } from 'lucide-react';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const NAV_LINKS = [
    { href: '/home', label: t('nav_home'), icon: '🏠' },
    { href: '/matches', label: t('nav_matches'), icon: '⚽' },
    { href: '/competitions', label: t('nav_competitions'), icon: '🏆' },
    { href: '/communities', label: t('nav_communities'), icon: '👥' },
    { href: '/predictions', label: t('nav_predictions'), icon: '🎯' },
  ];
  const pathname = usePathname();
  const router = useRouter();
  const liveCount = LIVE_MATCHES.length;
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  const changeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'FV';

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#080d14]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center gap-4 lg:gap-6">
          
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 shrink-0 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain rounded-md group-hover:scale-105 transition-transform" />
            <span className="text-xl font-black tracking-tight">
              <span className="text-white">Pitch</span>
              <span className="text-emerald-400">Grid</span>
            </span>
          </Link>

          {/* Nav Links — Desktop */}
          <div className="hidden lg:flex items-center gap-1 flex-1 ms-5">
            {NAV_LINKS.map(({ href, label, icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'text-emerald-400 bg-emerald-400/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                    }
                  `}
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-400 rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Live Badge */}
            {liveCount > 0 && (
              <Link
                href="/matches"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 transition-all duration-200 ml-1"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                  LIVE
                </span>
                <span className="text-xs font-semibold text-red-300 bg-red-500/20 px-1.5 py-0.5 rounded-full">
                  {liveCount}
                </span>
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Language Switcher Desktop */}
            <div className="hidden sm:block relative group">
              <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all font-medium text-sm">
                <Globe className="w-4 h-4 mr-0.5" />
                <span className="uppercase">{locale}</span>
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute top-full mt-1 right-0 bg-[#0f1923] border border-white/10 rounded-xl p-1 min-w-[100px] opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto z-50 shadow-xl before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
                {['vi', 'en', 'ja'].map((l) => (
                  <button key={l} onClick={() => changeLanguage(l)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${locale === l ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <button className="hidden sm:block p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Unread dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#080d14]" />
            </button>

            {/* Divider Desktop */}
            <div className="hidden lg:block w-px h-6 bg-white/[0.08]" />

            {/* User Avatar / Login (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <div className="relative group cursor-pointer">
                  <Link
                    href="/profile"
                    className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-sm font-bold text-white ring-2 ring-emerald-400/30 group-hover:ring-emerald-400/60 transition-all duration-200 overflow-hidden"
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </Link>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#080d14]" />
                  <div className="absolute top-full mt-2 right-0 bg-[#0f1923] border border-white/10 rounded-xl p-2 min-w-[160px] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-50 shadow-xl before:absolute before:-top-3 before:left-0 before:right-0 before:h-3">
                    <p className="text-white text-sm font-medium px-2 py-1">@{user.username}</p>
                    <p className="text-gray-500 text-xs px-2 pb-1">{user.level}</p>
                    <hr className="border-white/10 my-1" />
                    <Link href="/profile" className="block w-full text-left px-2 py-1.5 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg text-sm transition-colors mb-1">
                      👤 Hồ sơ
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-2 py-1.5 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors">
                      🚪 {t('logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl transition-all">
                  {t('login')}
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 ml-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 top-16 bg-[#080d14]/98 backdrop-blur-3xl overflow-y-auto pb-20">
          <div className="p-4 flex flex-col gap-6">
            
            {/* Mobile User Profile */}
            {user ? (
              <div className="flex items-center gap-3 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.05]">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-lg font-bold text-white shrink-0 overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">@{user.username}</p>
                  <p className="text-emerald-400 text-sm font-medium">{user.level}</p>
                </div>
              </div>
            ) : (
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/login" className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center font-bold text-lg shadow-lg shadow-emerald-500/20">
                {t('login')}
              </Link>
            )}

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-1">Menu</p>
              {NAV_LINKS.map(({ href, label, icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-lg transition-all
                      ${isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'text-gray-300 hover:bg-white/[0.05]'
                      }
                    `}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Language Switcher */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-1">Ngôn ngữ</p>
              <div className="grid grid-cols-3 gap-2">
                {['vi', 'en', 'ja'].map((l) => (
                  <button
                    key={l}
                    onClick={() => { changeLanguage(l); setIsMobileMenuOpen(false); }}
                    className={`
                      py-2 rounded-xl text-sm font-bold uppercase transition-all
                      ${locale === l ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/[0.05] text-gray-400 hover:bg-white/10'}
                    `}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Logout */}
            {user && (
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold transition-all">
                🚪 {t('logout')}
              </button>
            )}

          </div>
        </div>
      )}
    </>
  );
}
