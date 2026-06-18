'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  fetchLiveMatches,
  fetchUpcomingMatches,
  fetchTrendingPosts,
  fetchTopCommunities,
  fetchTopPredictors,
  fetchTodayStats
} from '@/lib/api';
import { Match, Post, Community, Predictor } from '@football-fan/shared-types';

import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ReactionButton from '@/components/ReactionButton';

export function formatTimeAgo(dateStr: string | Date): string {
  if (!dateStr) return 'Vừa xong';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

function formatKickoff(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const timeStr = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (diffDays === 0) return `Hôm nay ${timeStr}`;
  if (diffDays === 1) return `Ngày mai ${timeStr}`;
  return `${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ${timeStr}`;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Helper to render logo image or emoji */
function Logo({ src, className }: { src: string; className?: string }) {
  if (!src) return null;
  if (src.startsWith('http')) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={src} alt="logo" className={`object-contain ${className}`} />
    );
  }
  return <span className={className}>{src}</span>;
}

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
function LiveMatchCard({ match }: { match: Match }) {
  return (
    <div className="relative shrink-0 w-56 rounded-2xl bg-white/[0.04] border border-red-500/20 backdrop-blur-xl overflow-hidden group hover:border-red-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] cursor-pointer">
      {/* Red glow top stripe */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

      <div className="p-4">
        {/* Competition + Live badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Logo src={match.competitionLogo} className="w-4 h-4" />
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
              <Logo src={match.homeTeam.logo} className="w-5 h-5" />
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
              <Logo src={match.awayTeam.logo} className="w-5 h-5" />
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
function PostCard({ post }: { post: Post }) {
  const router = useRouter();

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Đã copy link bài viết');
    }).catch(() => {
      toast.error('Lỗi copy link');
    });
  }

  return (
    <article 
      className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl p-5 hover:border-white/[0.14] hover:bg-white/[0.06] transition-all duration-300 group cursor-pointer"
      onClick={() => router.push(`/post/${post.id}`)}
    >
      {/* Author row */}
      <div className="flex items-start gap-3 mb-4" onClick={e => e.stopPropagation()}>
        {/* Avatar */}
        <img
          src={post.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`}
          alt="Avatar"
          className="w-10 h-10 rounded-xl border border-white/10 shrink-0 shadow-lg object-cover bg-white/5"
        />

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
            <span className="text-[11px] text-emerald-500 hover:text-emerald-400 cursor-pointer transition-colors" onClick={(e) => { e.stopPropagation(); router.push(`/communities/${post.community.slug}`); }}>
              {post.community.name}
            </span>
            <span className="text-gray-700">·</span>
            <span className="text-[11px] text-gray-600">{formatTimeAgo(post.createdAt)}</span>
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
      <p className="text-sm text-gray-300 leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
      {post.image && (
        <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
          <img src={post.image} alt="Post image" className="w-full h-auto max-h-[500px] object-cover" />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              onClick={(e) => { e.stopPropagation(); }}
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
        {/* Reaction */}
        <ReactionButton
          postId={post.id}
          initialCount={post.likes}
          initialReaction={post.isLiked ? 'like' : null}
          size="sm"
        />

        {/* Comment */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{formatNumber(post.comments)}</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{formatNumber(post.shares)}</span>
        </button>

        {/* Bookmark */}
        <button onClick={(e) => { e.stopPropagation(); }} className="ml-auto p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
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
function UpcomingMatchRow({ match }: { match: Match }) {
  return (
    <div className="flex items-center gap-3 py-2.5 hover:bg-white/[0.03] rounded-xl px-2 -mx-2 transition-colors cursor-pointer group">
      {/* Teams */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5">
          <Logo src={match.homeTeam.logo} className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors">
            {match.homeTeam.shortName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Logo src={match.awayTeam.logo} className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-400 truncate">
            {match.awayTeam.shortName}
          </span>
        </div>
      </div>

      {/* Time & Competition */}
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-emerald-400">{formatKickoff(match.kickoff)}</p>
        <div className="flex items-center gap-1 justify-end mt-0.5">
          <Logo src={match.competitionLogo} className="w-3.5 h-3.5" />
          <span className="text-[10px] text-gray-600">{match.round}</span>
        </div>
      </div>
    </div>
  );
}

/** Community card in right sidebar */
function CommunityCard({ community }: { community: Community }) {
  const t = useTranslations('Home');
  const [joined, setJoined] = useState(community.isJoined);

  return (
    <div className="flex items-center gap-3 py-2 group">
      {/* Logo */}
      <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-base shrink-0 overflow-hidden">
        {community.logo && community.logo.startsWith('http') ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={community.logo} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          community.logo
        )}
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
function PredictorRow({ predictor }: { predictor: Predictor }) {
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

  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [topCommunities, setTopCommunities] = useState<Community[]>([]);
  const [topPredictors, setTopPredictors] = useState<Predictor[]>([]);
  const [todayStats, setTodayStats] = useState({ newPosts: 0, predictionsToday: 0, onlineCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [live, upcoming, posts, communities, predictors, stats] = await Promise.all([
          fetchLiveMatches(),
          fetchUpcomingMatches(),
          fetchTrendingPosts(),
          fetchTopCommunities(),
          fetchTopPredictors(),
          fetchTodayStats()
        ]);
        setLiveMatches(live);
        setUpcomingMatches(upcoming);
        setTrendingPosts(posts);
        setTopCommunities(communities);
        setTopPredictors(predictors);
        if (stats) setTodayStats(stats);
      } catch (error) {
        console.error('Failed to load home page data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
            {t('live_count', { count: liveMatches.length })}
          </span>
          <div className="flex-1 h-px bg-white/[0.05]" />
          <button className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
            {t('view_all')}
          </button>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {loading ? (
            <div className="text-sm text-gray-400 p-4">Loading matches...</div>
          ) : (
            liveMatches.map((match) => (
              <LiveMatchCard key={match.id} match={match} />
            ))
          )}

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
            {loading ? (
              <div className="text-sm text-gray-400">Loading posts...</div>
            ) : (
              trendingPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
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
              {loading ? (
                <div className="text-sm text-gray-400 p-2">Loading...</div>
              ) : (
                upcomingMatches.slice(0, 3).map((match) => (
                  <UpcomingMatchRow key={match.id} match={match} />
                ))
              )}
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
              {loading ? (
                <div className="text-sm text-gray-400 p-2">Loading...</div>
              ) : (
                topCommunities.slice(0, 4).map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))
              )}
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
              {loading ? (
                <div className="text-sm text-gray-400 p-2">Loading...</div>
              ) : (
                topPredictors.slice(0, 3).map((predictor) => (
                  <PredictorRow key={predictor.id} predictor={predictor} />
                ))
              )}
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
                { label: t('stat_live'), value: liveMatches.length, color: 'text-red-400' },
                { label: t('stat_new_posts'), value: formatNumber(todayStats.newPosts), color: 'text-sky-400' },
                { label: t('stat_predictions'), value: formatNumber(todayStats.predictionsToday), color: 'text-violet-400' },
                { label: t('stat_online'), value: formatNumber(todayStats.onlineCount), color: 'text-emerald-400' },
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
