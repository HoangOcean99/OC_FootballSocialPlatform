'use client';

import { useState } from 'react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

// ─── Mock Data ────────────────────────────────────────────────────────────────
type MatchStatus = 'live' | 'upcoming' | 'finished';

interface Match {
  id: string;
  competition: string;
  competitionEmoji: string;
  country: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  time: string;
  status: MatchStatus;
  minute?: number;
}

const MATCHES: Match[] = [
  // Premier League
  { id: 'epl-1', competition: 'Premier League', competitionEmoji: '🏴', country: 'Anh', homeTeam: 'Manchester City', awayTeam: 'Arsenal', homeScore: 2, awayScore: 1, time: '18:30', status: 'finished', minute: 90 },
  { id: 'epl-2', competition: 'Premier League', competitionEmoji: '🏴', country: 'Anh', homeTeam: 'Liverpool', awayTeam: 'Chelsea', homeScore: 1, awayScore: 1, time: '21:00', status: 'live', minute: 67 },
  { id: 'epl-3', competition: 'Premier League', competitionEmoji: '🏴', country: 'Anh', homeTeam: 'Tottenham', awayTeam: 'Newcastle', homeScore: null, awayScore: null, time: '23:30', status: 'upcoming' },
  // Champions League
  { id: 'ucl-1', competition: 'Champions League', competitionEmoji: '🏆', country: 'Châu Âu', homeTeam: 'Real Madrid', awayTeam: 'Bayern Munich', homeScore: 3, awayScore: 2, time: '02:00', status: 'finished', minute: 90 },
  { id: 'ucl-2', competition: 'Champions League', competitionEmoji: '🏆', country: 'Châu Âu', homeTeam: 'PSG', awayTeam: 'Inter Milan', homeScore: 0, awayScore: 2, time: '02:00', status: 'finished', minute: 90 },
  { id: 'ucl-3', competition: 'Champions League', competitionEmoji: '🏆', country: 'Châu Âu', homeTeam: 'Barcelona', awayTeam: 'Dortmund', homeScore: null, awayScore: null, time: '23:45', status: 'upcoming' },
  // La Liga
  { id: 'lla-1', competition: 'La Liga', competitionEmoji: '🇪🇸', country: 'Tây Ban Nha', homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla', homeScore: 1, awayScore: 0, time: '20:00', status: 'live', minute: 54 },
  { id: 'lla-2', competition: 'La Liga', competitionEmoji: '🇪🇸', country: 'Tây Ban Nha', homeTeam: 'Valencia', awayTeam: 'Villarreal', homeScore: null, awayScore: null, time: '22:15', status: 'upcoming' },
  // Bundesliga
  { id: 'bun-1', competition: 'Bundesliga', competitionEmoji: '🇩🇪', country: 'Đức', homeTeam: 'Bayern Munich', awayTeam: 'Borussia Dortmund', homeScore: 4, awayScore: 2, time: '17:30', status: 'finished', minute: 90 },
  { id: 'bun-2', competition: 'Bundesliga', competitionEmoji: '🇩🇪', country: 'Đức', homeTeam: 'Bayer Leverkusen', awayTeam: 'RB Leipzig', homeScore: 1, awayScore: 1, time: '20:30', status: 'live', minute: 38 },
  { id: 'bun-3', competition: 'Bundesliga', competitionEmoji: '🇩🇪', country: 'Đức', homeTeam: 'Wolfsburg', awayTeam: 'Freiburg', homeScore: null, awayScore: null, time: '22:30', status: 'upcoming' },
  // Serie A
  { id: 'sa-1', competition: 'Serie A', competitionEmoji: '🇮🇹', country: 'Ý', homeTeam: 'Juventus', awayTeam: 'AC Milan', homeScore: 0, awayScore: 0, time: '18:00', status: 'finished', minute: 90 },
  { id: 'sa-2', competition: 'Serie A', competitionEmoji: '🇮🇹', country: 'Ý', homeTeam: 'Inter Milan', awayTeam: 'Napoli', homeScore: 2, awayScore: 0, time: '20:45', status: 'live', minute: 72 },
  { id: 'sa-3', competition: 'Serie A', competitionEmoji: '🇮🇹', country: 'Ý', homeTeam: 'Roma', awayTeam: 'Lazio', homeScore: null, awayScore: null, time: '23:00', status: 'upcoming' },
  // V.League
  { id: 'vl-1', competition: 'V.League', competitionEmoji: '🇻🇳', country: 'Việt Nam', homeTeam: 'Hà Nội FC', awayTeam: 'HAGL', homeScore: 2, awayScore: 1, time: '17:00', status: 'finished', minute: 90 },
  { id: 'vl-2', competition: 'V.League', competitionEmoji: '🇻🇳', country: 'Việt Nam', homeTeam: 'TPHCM', awayTeam: 'Becamex', homeScore: null, awayScore: null, time: '19:00', status: 'upcoming' },
];

const TOP_SCORERS = [
  { name: 'Erling Haaland', club: 'Man City', goals: 27, emoji: '🇳🇴' },
  { name: 'Kylian Mbappé', club: 'Real Madrid', goals: 24, emoji: '🇫🇷' },
  { name: 'Harry Kane', club: 'Bayern', goals: 22, emoji: '🏴' },
  { name: 'Robert Lewandowski', club: 'Barcelona', goals: 19, emoji: '🇵🇱' },
];

const COMPETITIONS_LIST = ['all', 'Premier League', 'Champions League', 'La Liga', 'Bundesliga', 'Serie A', 'V.League'];
const STATUS_TABS = ['all', 'live', 'upcoming', 'finished'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d: Date) {
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function groupByCompetition(matches: Match[]) {
  return matches.reduce<Record<string, Match[]>>((acc, m) => {
    if (!acc[m.competition]) acc[m.competition] = [];
    acc[m.competition].push(m);
    return acc;
  }, {});
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ match }: { match: Match }) {
  if (match.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        {match.minute}&apos;
      </span>
    );
  }
  if (match.status === 'finished') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-700/50 border border-white/10 text-gray-400 text-xs font-medium">
        {match.status === 'finished' ? 'FT' : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-medium">
      {match.time}
    </span>
  );
}

function MatchRow({ match }: { match: Match }) {
  const isLive = match.status === 'live';
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <Link href={`/matches/${match.id}`}>
      <div className={`group flex flex-col md:flex-row md:items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
        hover:bg-white/[0.06] border border-transparent hover:border-white/[0.10]
        ${isLive ? 'bg-red-500/[0.04]' : ''}`}>

        {/* Time / Status (Top row on mobile) */}
        <div className="flex items-center justify-between md:justify-start w-full md:w-16 flex-shrink-0">
          <StatusBadge match={match} />
          <div className="md:hidden w-5 text-gray-600 group-hover:text-emerald-400 transition-colors text-sm">›</div>
        </div>

        <div className="flex items-center justify-between md:contents w-full">
          {/* Home team */}
          <div className="flex-1 flex items-center md:justify-end gap-2">
            <span className={`text-sm font-semibold truncate ${isLive ? 'text-white' : 'text-gray-200'}`}>
              {match.homeTeam}
            </span>
          </div>

          {/* Score or VS */}
          <div className="w-20 flex-shrink-0 flex items-center justify-center">
            {hasScore ? (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-base
                ${isLive ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-white/[0.08] text-white border border-white/[0.10]'}`}>
                <span>{match.homeScore}</span>
                <span className="text-gray-500 text-xs font-normal">:</span>
                <span>{match.awayScore}</span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
                VS
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex items-center md:justify-start gap-2">
            <span className={`text-sm font-semibold truncate ${isLive ? 'text-white' : 'text-gray-200'}`}>
              {match.awayTeam}
            </span>
          </div>
        </div>

        {/* Arrow indicator (Desktop) */}
        <div className="hidden md:block w-5 flex-shrink-0 text-gray-600 group-hover:text-emerald-400 transition-colors text-sm">›</div>
      </div>
    </Link>
  );
}

function CompetitionGroup({ name, matches }: { name: string; matches: Match[] }) {
  const first = matches[0];
  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-xl mb-4">
      {/* Competition Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
        <span className="text-xl">{first.competitionEmoji}</span>
        <div>
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="text-xs text-gray-500">{first.country}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">{matches.length}</span>
        </div>
      </div>
      {/* Match rows */}
      <div className="divide-y divide-white/[0.04] px-1 py-1">
        {matches.map(m => <MatchRow key={m.id} match={m} />)}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MatchesPage() {
  const t = useTranslations('Matches');
  const [dateOffset, setDateOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [competitionFilter, setCompetitionFilter] = useState('all');

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + dateOffset);

  // Filter matches
  const filtered = MATCHES.filter(m => {
    const statusOk = statusFilter === 'all' || m.status === statusFilter;
    const compOk = competitionFilter === 'all' || m.competition === competitionFilter;
    return statusOk && compOk;
  });

  const grouped = groupByCompetition(filtered);

  const liveCount = MATCHES.filter(m => m.status === 'live').length;
  const finishedCount = MATCHES.filter(m => m.status === 'finished').length;
  const upcomingCount = MATCHES.filter(m => m.status === 'upcoming').length;

  return (
    <div className="min-h-screen" style={{ background: '#080d14' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {t('title')}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{t('subtitle')}</p>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 backdrop-blur-xl">
            <button
              onClick={() => setDateOffset(d => d - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white transition-all text-lg font-bold"
            >
              ‹
            </button>
            <div className="text-center px-3 min-w-[180px]">
              <p className="text-white font-semibold text-sm capitalize">
                {formatDate(currentDate)}
              </p>
              {dateOffset === 0 && (
                <span className="text-emerald-400 text-xs font-medium">{t('today')}</span>
              )}
            </div>
            <button
              onClick={() => setDateOffset(d => d + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white transition-all text-lg font-bold"
            >
              ›
            </button>
            {dateOffset !== 0 && (
              <button
                onClick={() => setDateOffset(0)}
                className="ml-2 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 transition-all"
              >
                {t('today')}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Left: Main Content ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                    ${statusFilter === tab
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]'}`}
                >
                  {tab === 'live' && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  {t(`tab_${tab}`)}
                  {tab === 'live' && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-md bg-red-500/30 text-red-300 text-xs font-bold">
                      {liveCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Competition Filter Pills */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {COMPETITIONS_LIST.map(comp => (
                <button
                  key={comp}
                  onClick={() => setCompetitionFilter(comp)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border
                    ${competitionFilter === comp
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                      : 'bg-white/[0.03] border-white/[0.08] text-gray-500 hover:text-gray-300 hover:border-white/[0.18]'}`}
                >
                  {comp === 'all' ? t('tab_all') : comp}
                </button>
              ))}
            </div>

            {/* Match Groups */}
            {Object.keys(grouped).length === 0 ? (
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-12 text-center backdrop-blur-xl">
                <p className="text-4xl mb-3">⚽</p>
                <p className="text-gray-400 font-semibold">{t('no_matches')}</p>
                <p className="text-gray-600 text-sm mt-1">{t('try_filter')}</p>
              </div>
            ) : (
              Object.entries(grouped).map(([comp, matches]) => (
                <CompetitionGroup key={comp} name={comp} matches={matches} />
              ))
            )}
          </div>

          {/* ── Right Sidebar ──────────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">

            {/* Stats Card */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <span className="text-lg">📊</span> {t('stats_today')}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-white">{MATCHES.length}</p>
                  <p className="text-gray-500 text-xs mt-1">{t('total_matches')}</p>
                </div>
                <div className="bg-red-500/[0.08] border border-red-500/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-red-400">{liveCount}</p>
                  <p className="text-gray-500 text-xs mt-1">{t('live_matches')}</p>
                </div>
                <div className="bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-emerald-400">{upcomingCount}</p>
                  <p className="text-gray-500 text-xs mt-1">{t('upcoming_matches')}</p>
                </div>
              </div>
              <div className="mt-3 bg-white/[0.04] rounded-xl p-3 flex items-center justify-between">
                <span className="text-gray-400 text-xs">{t('finished_matches')}</span>
                <span className="text-white font-bold text-sm">{t('matches_count', { count: finishedCount })}</span>
              </div>
            </div>

            {/* Live Matches Quick View */}
            {liveCount > 0 && (
              <div className="bg-white/[0.04] border border-red-500/20 rounded-2xl p-5 backdrop-blur-xl">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {t('live_now')}
                </h3>
                <div className="space-y-3">
                  {MATCHES.filter(m => m.status === 'live').map(m => (
                    <Link key={m.id} href={`/matches/${m.id}`}>
                      <div className="group bg-red-500/[0.06] hover:bg-red-500/[0.12] border border-red-500/20 rounded-xl p-3 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-red-400 font-bold">{m.competitionEmoji} {m.competition}</span>
                          <span className="text-xs text-red-400 font-bold animate-pulse">{m.minute}&apos;</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white font-semibold">
                          <span className="truncate flex-1">{m.homeTeam}</span>
                          <span className="px-2 font-black text-red-300">{m.homeScore} : {m.awayScore}</span>
                          <span className="truncate flex-1 text-right">{m.awayTeam}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Top Scorers */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <span className="text-lg">👟</span> {t('top_scorers')}
              </h3>
              <div className="space-y-3">
                {TOP_SCORERS.map((scorer, i) => (
                  <div key={scorer.name} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0
                      ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-amber-600 text-white' : 'bg-white/[0.08] text-gray-400'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{scorer.emoji} {scorer.name}</p>
                      <p className="text-gray-500 text-xs">{scorer.club}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1">
                      <span className="text-white font-black text-sm">{scorer.goals}</span>
                      <span className="text-gray-600 text-xs">⚽</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
