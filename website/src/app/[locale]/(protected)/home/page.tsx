'use client';

import { useState } from 'react';
import {
  LIVE_MATCHES,
  UPCOMING_MATCHES,
  TRENDING_POSTS,
  TOP_COMMUNITIES,
  TOP_PREDICTORS,
  formatKickoff,
  formatNumber,
} from '@/lib/mockData';
import { useTranslations } from 'next-intl';

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Pulsing LIVE indicator */
function LiveBadge({ minute, status }: { minute: number; status: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      <span className="text-[11px] font-bold text-red-400 uppercase tracking-wide">
        {status === 'HT' ? 'HT' : `${minute}'`}
      </span>
    </div>
  );
}

/** Single Live Match card */
function LiveMatchCard({ match }: { match: (typeof LIVE_MATCHES)[0] }) {
  return (
    <div className="relative shrink-0 w-56 rounded-2xl bg-white/[0.04] border border-red-500/20 backdrop-blur-xl overflow-hidden group hover:border-red-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] cursor-pointer">
      {/* Red glow top stripe */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

      <div className="p-4">
        {/* Competition + Live badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{match.competitionLogo}</span>
            <span className="text-[11px] font-medium text-gray-500 truncate max-w-[90px]">
              {match.competition}
            </span>
          </div>
          <LiveBadge minute={match.minute} status={match.status} />
        </div>

        {/* Teams & Score */}
        <div className="space-y-2">
          {/* Home team */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">{match.homeTeam.logo}</span>
              <span className="text-sm font-semibold text-white truncate">
                {match.homeTeam.shortName}
              </span>
            </div>
            <span className="text-xl font-black text-white tabular-nums">{match.homeScore}</span>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] text-gray-600 font-medium">VS</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Away team */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">{match.awayTeam.logo}</span>
              <span className="text-sm font-semibold text-white truncate">
                {match.awayTeam.shortName}
              </span>
            </div>
            <span className="text-xl font-black text-gray-400 tabular-nums">{match.awayScore}</span>
          </div>
        </div>

        {/* Stadium */}
        <p className="mt-3 text-[10px] text-gray-600 truncate text-center">{match.stadium}</p>
      </div>
    </div>
  );
}

/** Post card */
function PostCard({ post }: { post: (typeof TRENDING_POSTS)[0] }) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);

  function toggleLike() {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  }

  return (
    <article className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl p-5 hover:border-white/[0.14] hover:bg-white/[0.06] transition-all duration-300 group">
      {/* Author row */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-xl ${post.author.avatarColor} flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg`}
        >
          {post.author.initials}
        </div>

        {/* Author info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{post.author.displayName}</span>
            {/* Level badge */}
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-400/10 border border-emerald-400/20 text-[10px] font-bold text-emerald-400">
              Lv.{post.author.level}
            </span>
            <span className="text-[11px] text-gray-600">{post.author.levelTitle}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* Community */}
            <span className="text-sm">{post.community.emoji}</span>
            <span className="text-[11px] text-emerald-500 hover:text-emerald-400 cursor-pointer transition-colors">
              {post.community.name}
            </span>
            <span className="text-gray-700">·</span>
            <span className="text-[11px] text-gray-600">{post.timeAgo}</span>
          </div>
        </div>

        {/* Options */}
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-600 hover:text-white">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-300 leading-relaxed mb-3">{post.content}</p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-sky-400 hover:text-sky-300 cursor-pointer transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-white/[0.05] mb-3" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Like */}
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
            ${liked
              ? 'text-rose-400 bg-rose-400/10 hover:bg-rose-400/20'
              : 'text-gray-500 hover:text-white hover:bg-white/[0.06]'
            }`}
        >
          <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{formatNumber(likeCount)}</span>
        </button>

        {/* Comment */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{formatNumber(post.comments)}</span>
        </button>

        {/* Share */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{formatNumber(post.shares)}</span>
        </button>

        {/* Bookmark */}
        <button className="ml-auto p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
          </svg>
        </button>
      </div>
    </article>
  );
}

/** Upcoming match row */
function UpcomingMatchRow({ match }: { match: (typeof UPCOMING_MATCHES)[0] }) {
  return (
    <div className="flex items-center gap-3 py-2.5 hover:bg-white/[0.03] rounded-xl px-2 -mx-2 transition-colors cursor-pointer group">
      {/* Teams */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{match.homeTeam.logo}</span>
          <span className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors">
            {match.homeTeam.shortName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">{match.awayTeam.logo}</span>
          <span className="text-sm font-medium text-gray-400 truncate">
            {match.awayTeam.shortName}
          </span>
        </div>
      </div>

      {/* Time & Competition */}
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-emerald-400">{formatKickoff(match.kickoff)}</p>
        <div className="flex items-center gap-1 justify-end mt-0.5">
          <span className="text-xs">{match.competitionLogo}</span>
          <span className="text-[10px] text-gray-600">{match.round}</span>
        </div>
      </div>
    </div>
  );
}

/** Community card in right sidebar */
function CommunityCard({ community }: { community: (typeof TOP_COMMUNITIES)[0] }) {
  const t = useTranslations('Home');
  const [joined, setJoined] = useState(community.isJoined);

  return (
    <div className="flex items-center gap-3 py-2 group">
      {/* Logo */}
      <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-base shrink-0">
        {community.logo}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate">
          {community.name}
        </p>
        <p className="text-[11px] text-gray-600">{formatNumber(community.memberCount)} {t('members')}</p>
      </div>

      {/* Join button */}
      <button
        onClick={() => setJoined((j) => !j)}
        className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200
          ${joined
            ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/30'
            : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
      >
        {joined ? t('btn_joined') : t('btn_join')}
      </button>
    </div>
  );
}

/** Predictor rank row */
function PredictorRow({ predictor }: { predictor: (typeof TOP_PREDICTORS)[0] }) {
  const t = useTranslations('Home');
  const rankColors: Record<number, string> = {
    1: 'text-yellow-400',
    2: 'text-gray-300',
    3: 'text-amber-600',
  };
  const rankBg: Record<number, string> = {
    1: 'bg-yellow-400/10 border-yellow-400/30',
    2: 'bg-gray-300/10 border-gray-300/30',
    3: 'bg-amber-600/10 border-amber-600/30',
  };

  return (
    <div className="flex items-center gap-3 py-2 group cursor-pointer">
      {/* Rank */}
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border
          ${rankBg[predictor.rank] ?? 'bg-white/[0.04] border-white/[0.08]'}
          ${rankColors[predictor.rank] ?? 'text-gray-500'}
        `}
      >
        {predictor.rank}
      </div>

      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg ${predictor.avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}
      >
        {predictor.initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate">
          {predictor.displayName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {/* Accuracy bar */}
          <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden max-w-[60px]">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${predictor.accuracy}%` }}
            />
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">{predictor.accuracy}%</span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-white">{formatNumber(predictor.points)}</p>
        <p className="text-[10px] text-gray-600">{t('points')}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Home Page
// ─────────────────────────────────────────────

export default function HomePage() {
  const t = useTranslations('Home');
  const [activeTab, setActiveTab] = useState('all');

  const FEED_TABS = [
    { id: 'all', label: t('tab_all') },
    { id: 'following', label: t('tab_following') },
    { id: 'hot', label: t('tab_hot') },
  ];

  return (
    <div className="px-4 py-6 space-y-6 max-w-[1200px]">

      {/* ═══════════════════════════════════════════
          A. LIVE MATCHES BANNER
      ════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <h2 className="text-base font-bold text-white">{t('live_now')}</h2>
          </div>
          <span className="text-xs text-gray-600">
            {t('live_count', { count: LIVE_MATCHES.length })}
          </span>
          <div className="flex-1 h-px bg-white/[0.05]" />
          <button className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
            {t('view_all')}
          </button>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {LIVE_MATCHES.map((match) => (
            <LiveMatchCard key={match.id} match={match} />
          ))}

          {/* Placeholder card */}
          <div className="shrink-0 w-40 rounded-2xl border border-dashed border-white/[0.08] flex flex-col items-center justify-center gap-2 text-gray-700 hover:text-gray-500 hover:border-white/[0.15] transition-all cursor-pointer p-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xs font-medium text-center">{t('view_all_matches')}</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          B. TWO-COLUMN LAYOUT
      ════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ─── LEFT: Main Feed (60%) ─── */}
        <div className="flex-[3] min-w-0 space-y-4">

          {/* Create post box */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
              FV
            </div>
            <button className="flex-1 text-left text-sm text-gray-600 hover:text-gray-400 transition-colors bg-white/[0.04] hover:bg-white/[0.07] rounded-xl px-4 py-2.5 border border-white/[0.06]">
              {t('share_thoughts')}
            </button>
            <button className="shrink-0 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors">
              {t('post_btn')}
            </button>
          </div>

          {/* Feed Header + Tabs */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              🔥 <span>{t('trending_posts')}</span>
            </h2>
            <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
              {FEED_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-gray-500 hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {TRENDING_POSTS.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Load more */}
          <button className="w-full py-3 rounded-2xl border border-white/[0.08] text-sm text-gray-500 hover:text-white hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-200 font-medium">
            {t('load_more_posts')}
          </button>
        </div>

        {/* ─── RIGHT: Sidebar (40%) ─── */}
        <div className="flex-[2] min-w-0 space-y-4 max-w-sm">

          {/* Trận đấu sắp diễn ra */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>⚽</span>
                <span>{t('upcoming_matches')}</span>
              </h3>
              <button className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
                {t('view_all')}
              </button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {UPCOMING_MATCHES.slice(0, 3).map((match) => (
                <UpcomingMatchRow key={match.id} match={match} />
              ))}
            </div>
          </div>

          {/* Cộng đồng nổi bật */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🏆</span>
                <span>{t('top_communities')}</span>
              </h3>
              <button className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
                {t('discover')}
              </button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {TOP_COMMUNITIES.slice(0, 4).map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </div>

          {/* Bảng xếp hạng dự đoán */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🎯</span>
                <span>{t('predictions_board')}</span>
              </h3>
              <button className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
                {t('view_board')}
              </button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {TOP_PREDICTORS.slice(0, 3).map((predictor) => (
                <PredictorRow key={predictor.id} predictor={predictor} />
              ))}
            </div>

            {/* CTA */}
            <button className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30">
              {t('join_prediction')}
            </button>
          </div>

          {/* Stats card */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/20 backdrop-blur-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span>📊</span>
              <span>{t('today_stats')}</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('stat_live'), value: LIVE_MATCHES.length, color: 'text-red-400' },
                { label: t('stat_new_posts'), value: '1.2K', color: 'text-sky-400' },
                { label: t('stat_predictions'), value: '8.4K', color: 'text-violet-400' },
                { label: t('stat_online'), value: '24K', color: 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.05]">
                  <p className={`text-lg font-black ${color}`}>{value}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
        {/* END RIGHT */}
      </div>
      {/* END TWO-COLUMN */}

    </div>
  );
}
