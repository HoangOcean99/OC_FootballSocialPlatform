'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchUserProfile } from '@/lib/api';
import { UserProfile, Achievement, UserActivity } from '@football-fan/shared-types';

const rarityStyles: Record<Achievement['rarity'], string> = {
  common: 'border-gray-600/50 bg-gray-800/40 text-gray-300',
  rare: 'border-blue-500/40 bg-blue-900/30 text-blue-300',
  epic: 'border-purple-500/40 bg-purple-900/30 text-purple-300',
  legendary: 'border-amber-500/40 bg-amber-900/30 text-amber-300',
};

const activityIcon: Record<UserActivity['type'], string> = {
  prediction: '🎯',
  match_watched: '📺',
  post: '📝',
  joined_community: '👥',
  achievement: '🏆',
};

const activityColor: Record<UserActivity['type'], string> = {
  prediction: 'bg-emerald-500/20 border-emerald-500/30',
  match_watched: 'bg-blue-500/20 border-blue-500/30',
  post: 'bg-purple-500/20 border-purple-500/30',
  joined_community: 'bg-cyan-500/20 border-cyan-500/30',
  achievement: 'bg-amber-500/20 border-amber-500/30',
};

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const [journalOpen, setJournalOpen] = useState<string | null>(null);
  const { user } = useAuthStore();
  const [u, setU] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For demo purposes, we fetch 'HoangOcean' if user is not available or hardcoded
    const usernameToFetch = user?.username || 'HoangOcean';
    fetchUserProfile(usernameToFetch)
      .then(data => {
        if (!data) setError('User not found');
        else setU(data);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load profile: ' + err.message);
      });
  }, [user]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#080d14] text-white flex flex-col items-center justify-center gap-4">
        <div className="text-red-400 font-bold">{error}</div>
        <p className="text-gray-400 text-sm text-center max-w-sm">
          Có thể tài khoản của bạn đã bị xóa khỏi cơ sở dữ liệu do việc reset/seed lại dữ liệu. Hãy đăng xuất và đăng nhập lại.
        </p>
        <button
          onClick={() => {
            useAuthStore.getState().logout();
            window.location.href = '/';
          }}
          className="px-6 py-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.15] rounded-xl transition"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  if (!u) {
    return <div className="min-h-screen bg-[#080d14] text-white flex items-center justify-center">Đang tải...</div>;
  }

  const xpPercent = Math.round(((u.xp || 0) / (u.xpToNextLevel || 1000)) * 100) || 0;
  const displayInitials = user?.username ? user.username.slice(0, 2).toUpperCase() : (u.initials || u.username?.slice(0, 2).toUpperCase() || 'FV');
  const displayName = user?.username || u.displayName;
  const displayUsername = user?.username || u.username;

  return (
    <div className="min-h-screen bg-[#080d14] text-white">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[800px] h-[500px] bg-emerald-500/4 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-purple-500/4 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* ─────────────────────────────────────────────── */}
        {/* Hero Banner                                    */}
        {/* ─────────────────────────────────────────────── */}
        <div className="relative h-52 bg-gradient-to-br from-slate-900 via-emerald-950/60 to-slate-900 overflow-hidden">
          {/* Football hex pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 5 L55 20 L55 45 L30 55 L5 45 L5 20 Z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px',
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080d14] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10" />

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="px-3 py-1.5 bg-white/[0.08] border border-white/[0.12] rounded-lg text-xs text-gray-300 hover:bg-white/[0.12] transition">
              ✏️ {t('btn_edit')}
            </button>
            <button className="px-3 py-1.5 bg-white/[0.08] border border-white/[0.12] rounded-lg text-xs text-gray-300 hover:bg-white/[0.12] transition">
              ⚙️ {t('btn_settings')}
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────── */}
        {/* Avatar & Identity strip                        */}
        {/* ─────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 ring-4 ring-emerald-500/50 ring-offset-4 ring-offset-[#080d14] flex items-center justify-center shadow-2xl shadow-emerald-500/30 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-4xl font-black text-white">{displayInitials}</span>
                )}
              </div>
              {/* Online dot */}
              <span className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-emerald-400 border-2 border-[#080d14] rounded-full" />
            </div>

            {/* Name & badge */}
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{displayName}</h1>
                {u.role === 'ADMIN' && (
                  <span className="text-xs px-2.5 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold rounded-full">
                    ADMIN
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full font-semibold">
                  Lv.{u.level || 1}
                </span>
                <span className="text-xs px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full">
                  {u.levelName || 'Người mới'}
                </span>
                <span className="text-xs px-2.5 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full">
                  {u.levelTitle || 'Chuyên gia'}
                </span>
                {u.tier === 'PLUS' && (
                  <span className="text-xs px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black rounded-full uppercase tracking-wider">
                    PLUS
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm">@{displayUsername} · {t('joined', { date: u.joinDate || 'Tháng này' })}</p>

              {/* XP Bar */}
              <div className="mt-3 max-w-xs">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400">XP: <span className="text-emerald-400 font-semibold">{(u.xp || 0).toLocaleString()}</span></span>
                  <span className="text-gray-500">{(u.xpToNextLevel || 1000).toLocaleString()} XP → Lv.{(u.level || 1) + 1}</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-1000 relative"
                    style={{ width: `${xpPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  </div>
                </div>
                <p className="text-gray-600 text-[10px] mt-1">{t('xp_to_next_level', { percent: xpPercent })}</p>
              </div>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: t('stat_posts'), value: u.stats?.posts || 0, icon: '📝', color: 'text-purple-400' },
              { label: t('stat_comments'), value: u.stats?.comments || 0, icon: '💬', color: 'text-blue-400' },
              { label: t('stat_correct_preds'), value: u.stats?.correctPredictions || 0, icon: '🎯', color: 'text-emerald-400' },
              { label: t('stat_matches_watched'), value: u.stats?.matchesWatched || 0, icon: '📺', color: 'text-amber-400' },
            ].map((s) => (
              <div key={s.label} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-center hover:border-white/[0.15] transition-colors">
                <span className="text-2xl block mb-1">{s.icon}</span>
                <p className={`text-2xl font-black ${s.color}`}>{s.value.toLocaleString()}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ─────────────────────────────────────────────── */}
          {/* Two Column Layout                              */}
          {/* ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 pb-16">

            {/* ═══════════════ LEFT COLUMN ═══════════════ */}
            <div className="flex flex-col gap-6">

              {/* 🏆 Achievements */}
              <section className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span>{t('achievements')}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {t('achievements_unlocked', { count: (u.achievements || []).filter((a) => a.unlocked).length, total: (u.achievements || []).length })}
                  </span>
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {(u.achievements || []).map((a) => (
                    <div
                      key={a.id}
                      title={`${a.name}: ${a.description}`}
                      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 cursor-default ${a.unlocked
                        ? `${rarityStyles[a.rarity]} hover:scale-105`
                        : 'border-white/[0.05] bg-white/[0.02] opacity-40'
                        }`}
                    >
                      <span className={`text-2xl ${!a.unlocked ? 'grayscale' : ''}`}>{a.icon}</span>
                      <span className="text-[10px] font-medium text-center leading-tight">{a.name}</span>
                      {a.rarity === 'legendary' && a.unlocked && (
                        <span className="absolute -top-1 -right-1 text-[8px] bg-amber-500 text-black px-1 rounded-full font-bold">LEG</span>
                      )}
                      {a.rarity === 'epic' && a.unlocked && (
                        <span className="absolute -top-1 -right-1 text-[8px] bg-purple-500 text-white px-1 rounded-full font-bold">EPIC</span>
                      )}
                      {!a.unlocked && (
                        <span className="text-[10px] text-gray-600">🔒</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* ⚽ Favourite Teams */}
              <section className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span>{t('fav_teams')}</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(u.favoriteClubs || []).map((team) => (
                    <span
                      key={team}
                      className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-full font-medium hover:bg-emerald-500/20 transition cursor-pointer"
                    >
                      {team}
                    </span>
                  ))}
                  {(u.favoriteNationalTeams || []).map((team) => (
                    <span
                      key={team}
                      className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm rounded-full font-medium hover:bg-blue-500/20 transition cursor-pointer"
                    >
                      {team}
                    </span>
                  ))}
                  {(!u.favoriteClubs?.length && !u.favoriteNationalTeams?.length) && (u.favoriteTeams || []).map((team) => (
                    <span
                      key={team}
                      className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-full font-medium hover:bg-emerald-500/20 transition cursor-pointer"
                    >
                      {team}
                    </span>
                  ))}
                  <button className="px-3 py-1.5 border border-dashed border-white/[0.15] text-gray-500 text-sm rounded-full hover:border-emerald-500/40 hover:text-emerald-400 transition">
                    + {t('btn_add')}
                  </button>
                </div>
              </section>

              {/* 📰 Football Journal */}
              <section className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                  <span>{t('football_journal')}</span>
                  <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{t('last_5_days')}</span>
                </h2>
                <div className="relative flex flex-col gap-0">
                  {/* Timeline line */}
                  <div className="absolute left-[17px] top-0 bottom-0 w-px bg-white/[0.06]" />

                  {(u.journal || []).map((day, i) => (
                    <div key={day.date} className="relative flex gap-4 pb-5 last:pb-0">
                      {/* Dot */}
                      <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${i === 0
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-white/[0.05] border-white/[0.10] text-gray-400'
                        }`}>
                        {day.date.split('/')[0]}
                      </div>

                      {/* Content */}
                      <div
                        className="flex-1 mt-1 cursor-pointer"
                        onClick={() => setJournalOpen(journalOpen === day.date ? null : day.date)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-white">{day.date}</span>
                          <span className="text-xs text-gray-500">
                            {day.matches.length > 0 ? t('journal_matches', { count: day.matches.length }) : ''}
                            {day.predictions > 0 ? (day.matches.length > 0 ? ` · ${t('journal_preds', { count: day.predictions })}` : t('journal_preds', { count: day.predictions })) : ''}
                            {day.posts > 0 ? ((day.matches.length > 0 || day.predictions > 0) ? ` · ${t('journal_posts', { count: day.posts })}` : t('journal_posts', { count: day.posts })) : ''}
                          </span>
                        </div>

                        {/* Pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {day.matches.map((m) => (
                            <span key={m} className="text-xs px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full">
                              📺 {m}
                            </span>
                          ))}
                          {day.predictions > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full">
                              🎯 {t('journal_preds', { count: day.predictions })}
                            </span>
                          )}
                          {day.posts > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full">
                              📝 {t('journal_posts', { count: day.posts })}
                            </span>
                          )}
                          {day.matches.length === 0 && day.predictions === 0 && day.posts === 0 && (
                            <span className="text-xs text-gray-600 italic">{t('journal_no_activity')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ═══════════════ RIGHT COLUMN ═══════════════ */}
            <div className="flex flex-col gap-6">

              {/* 🎯 Prediction Stats */}
              <section className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                  <span>{t('prediction_stats')}</span>
                </h2>

                {/* Donut-style accuracy visual */}
                <div className="flex items-center gap-5 mb-5">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke="url(#grad)"
                        strokeWidth="3"
                        strokeDasharray={`${u.predictionStats?.accuracy || 0} ${100 - (u.predictionStats?.accuracy || 0)}`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-emerald-400">{u.predictionStats?.accuracy || 0}%</span>
                      <span className="text-[9px] text-gray-500">{t('accuracy')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">{t('pred_total')}</span>
                      <span className="text-white font-semibold">{u.predictionStats?.total || 0}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">{t('pred_correct')}</span>
                      <span className="text-emerald-400 font-semibold">{u.predictionStats?.correct || 0}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">{t('pred_streak')}</span>
                      <span className="text-amber-400 font-semibold">🔥 {u.predictionStats?.streak || 0}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">{t('pred_best_streak')}</span>
                      <span className="text-purple-400 font-semibold">{u.predictionStats?.bestStreak || 0}</span>
                    </div>
                  </div>
                </div>

                {/* XP from predictions */}
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-gray-400">{t('xp_from_preds')}</span>
                  <span className="text-emerald-400 font-bold text-sm">+{(u.predictionStats?.xpEarned || 0).toLocaleString()} XP</span>
                </div>
              </section>

              {/* 🔥 Recent Activity */}
              <section className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span>{t('recent_activity')}</span>
                </h2>
                <div className="flex flex-col gap-3">
                  {(u.recentActivity || []).map((act) => (
                    <div key={act.id} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base border ${activityColor[act.type]}`}>
                        {activityIcon[act.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{act.title}</p>
                        <p className="text-xs text-gray-500 truncate">{act.detail}</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">{act.time}</p>
                      </div>
                      {act.xp && (
                        <span className="text-xs text-emerald-400 font-bold whitespace-nowrap">+{act.xp} XP</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* 👥 Communities */}
              <section className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span>{t('joined_communities')}</span>
                  <span className="ml-auto text-xs text-gray-500">{(u.joinedCommunities || []).length}</span>
                </h2>
                <div className="flex flex-col gap-2">
                  {(u.joinedCommunities || []).map((name, i) => (
                    <div
                      key={name}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition cursor-pointer group"
                    >
                      <span className="text-xl">{(u.communityEmojis || [])[i]}</span>
                      <span className="text-sm text-gray-300 group-hover:text-white transition flex-1">{name}</span>
                      <span className="text-gray-600 group-hover:text-gray-400 transition text-xs">→</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
