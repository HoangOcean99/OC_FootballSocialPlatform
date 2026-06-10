'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

// ─── Mock Data ────────────────────────────────────────────────────────────────
type Region = 'Châu Âu' | 'Nam Mỹ' | 'Châu Á' | 'Quốc tế';

interface Competition {
  id: string;
  emoji: string;
  name: string;
  country: string;
  region: Region;
  season: string;
  matchday: string;
  teams: number;
  members: number;
  color: string; // accent color class
  isPopular?: boolean;
}

const COMPETITIONS: Competition[] = [
  {
    id: 'world-cup-2026',
    emoji: '🌍',
    name: 'World Cup 2026',
    country: 'USA / Canada / Mexico',
    region: 'Quốc tế',
    season: '2026',
    matchday: 'Sắp diễn ra',
    teams: 48,
    members: 284000,
    color: 'from-yellow-500/20 to-orange-500/20',
    isPopular: true,
  },
  {
    id: 'premier-league',
    emoji: '🏴',
    name: 'Premier League',
    country: 'Anh',
    region: 'Châu Âu',
    season: '2025/26',
    matchday: 'Vòng 38',
    teams: 20,
    members: 152300,
    color: 'from-purple-500/20 to-blue-500/20',
    isPopular: true,
  },
  {
    id: 'champions-league',
    emoji: '🏆',
    name: 'Champions League',
    country: 'Châu Âu',
    region: 'Châu Âu',
    season: '2025/26',
    matchday: 'Tứ kết',
    teams: 32,
    members: 198700,
    color: 'from-blue-500/20 to-indigo-500/20',
    isPopular: true,
  },
  {
    id: 'la-liga',
    emoji: '🇪🇸',
    name: 'La Liga',
    country: 'Tây Ban Nha',
    region: 'Châu Âu',
    season: '2025/26',
    matchday: 'Vòng 36',
    teams: 20,
    members: 89400,
    color: 'from-red-500/20 to-yellow-500/20',
  },
  {
    id: 'bundesliga',
    emoji: '🇩🇪',
    name: 'Bundesliga',
    country: 'Đức',
    region: 'Châu Âu',
    season: '2025/26',
    matchday: 'Vòng 34',
    teams: 18,
    members: 67800,
    color: 'from-gray-500/20 to-red-500/20',
  },
  {
    id: 'serie-a',
    emoji: '🇮🇹',
    name: 'Serie A',
    country: 'Ý',
    region: 'Châu Âu',
    season: '2025/26',
    matchday: 'Vòng 37',
    teams: 20,
    members: 71200,
    color: 'from-blue-600/20 to-blue-400/20',
  },
  {
    id: 'ligue-1',
    emoji: '🇫🇷',
    name: 'Ligue 1',
    country: 'Pháp',
    region: 'Châu Âu',
    season: '2025/26',
    matchday: 'Vòng 34',
    teams: 18,
    members: 43500,
    color: 'from-blue-500/20 to-red-500/20',
  },
  {
    id: 'afc-champions',
    emoji: '🌏',
    name: 'AFC Champions Elite',
    country: 'Châu Á',
    region: 'Châu Á',
    season: '2025/26',
    matchday: 'Bán kết',
    teams: 24,
    members: 31600,
    color: 'from-orange-500/20 to-red-500/20',
  },
  {
    id: 'v-league',
    emoji: '🇻🇳',
    name: 'V.League 1',
    country: 'Việt Nam',
    region: 'Châu Á',
    season: '2025',
    matchday: 'Vòng 22',
    teams: 14,
    members: 28900,
    color: 'from-red-600/20 to-yellow-500/20',
    isPopular: true,
  },
  {
    id: 'copa-america',
    emoji: '🌎',
    name: 'Copa América',
    country: 'Nam Mỹ',
    region: 'Nam Mỹ',
    season: '2024',
    matchday: 'Đã kết thúc',
    teams: 16,
    members: 87300,
    color: 'from-green-500/20 to-blue-500/20',
  },
  {
    id: 'euro-2028',
    emoji: '🇪🇺',
    name: 'UEFA Euro 2028',
    country: 'Anh & Ireland',
    region: 'Châu Âu',
    season: '2028',
    matchday: 'Sắp diễn ra',
    teams: 24,
    members: 52100,
    color: 'from-blue-400/20 to-yellow-400/20',
  },
];

const REGION_TABS = [
  { id: 'all', labelKey: 'tab_all', dbMatch: 'Tất cả' },
  { id: 'europe', labelKey: 'tab_europe', dbMatch: 'Châu Âu' },
  { id: 'america', labelKey: 'tab_america', dbMatch: 'Nam Mỹ' },
  { id: 'asia', labelKey: 'tab_asia', dbMatch: 'Châu Á' },
  { id: 'intl', labelKey: 'tab_intl', dbMatch: 'Quốc tế' }
] as const;

function formatMembers(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

// ─── Competition Card ─────────────────────────────────────────────────────────
function CompetitionCard({ comp }: { comp: Competition }) {
  const t = useTranslations('Competitions');
  return (
    <div className={`group relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl
      hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer
      overflow-hidden`}>

      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${comp.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      {/* Popular badge */}
      {comp.isPopular && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
          🔥 Hot
        </div>
      )}

      {/* Competition Logo */}
      <div className="relative z-10 flex flex-col items-center mb-5">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center
          group-hover:border-emerald-500/30 group-hover:bg-white/[0.09] transition-all duration-300 shadow-lg mb-4">
          <span className="text-4xl select-none">{comp.emoji}</span>
        </div>
        <h3 className="text-white font-black text-base text-center leading-tight group-hover:text-emerald-100 transition-colors">
          {comp.name}
        </h3>
        <p className="text-gray-500 text-xs mt-1 text-center">{comp.country}</p>
      </div>

      {/* Info Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-2.5 text-center group-hover:border-emerald-500/20 transition-colors">
          <p className="text-white font-bold text-sm truncate">{comp.matchday}</p>
          <p className="text-gray-600 text-xs mt-0.5">{/* Optional: translate matchday label? It's fine */}</p>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-2.5 text-center group-hover:border-emerald-500/20 transition-colors">
          <p className="text-white font-bold text-sm">{comp.teams}</p>
          <p className="text-gray-600 text-xs mt-0.5">{t('teams')}</p>
        </div>
      </div>

      {/* Community Members */}
      <div className="relative z-10 flex items-center justify-center gap-2 mb-5">
        <div className="flex -space-x-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border border-[#080d14] text-[8px] flex items-center justify-center text-white font-bold">
              {['⚽','🏆','⭐'][i]}
            </div>
          ))}
        </div>
        <span className="text-gray-400 text-xs">
          <span className="text-emerald-400 font-bold">{formatMembers(comp.members)}</span> {t('members')}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 grid grid-cols-2 gap-2">
        <Link href={`/competitions/${comp.id}/table`} onClick={e => e.stopPropagation()}>
          <button className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.10] text-gray-300 text-xs font-semibold
            hover:bg-white/[0.12] hover:text-white hover:border-white/[0.20] transition-all duration-200">
            📊 {t('view_table')}
          </button>
        </Link>
        <Link href={`/communities?comp=${comp.id}`} onClick={e => e.stopPropagation()}>
          <button className="w-full px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold
            hover:bg-emerald-500/30 hover:border-emerald-500/60 hover:text-emerald-200 transition-all duration-200">
            👥 {t('join_community')}
          </button>
        </Link>
      </div>

      {/* Emerald glow on hover */}
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, transparent 60%)' }} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CompetitionsPage() {
  const t = useTranslations('Competitions');
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return COMPETITIONS.filter(c => {
      const activeRegionDb = REGION_TABS.find(r => r.id === activeRegion)?.dbMatch || 'Tất cả';
      const regionOk = activeRegionDb === 'Tất cả' || c.region === activeRegionDb;
      const searchOk = search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase());
      return regionOk && searchOk;
    });
  }, [activeRegion, search]);

  const totalMembers = COMPETITIONS.reduce((a, c) => a + c.members, 0);

  return (
    <div className="min-h-screen" style={{ background: '#080d14' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">{t('title')}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {COMPETITIONS.length} ·{' '}
                <span className="text-emerald-400 font-semibold">{formatMembers(totalMembers)}</span> {t('members')}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 text-sm">
                🔍
              </div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm
                  placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 focus:bg-white/[0.06] transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: t('title').replace('🏆 ', ''), value: COMPETITIONS.length, icon: '🏆' },
              { label: 'Khu vực', value: 12, icon: '🌍' }, // hardcoded for demo
              { label: 'Cộng đồng', value: COMPETITIONS.length, icon: '👥' },
              { label: t('members'), value: formatMembers(totalMembers), icon: '⭐' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 flex items-center gap-3 backdrop-blur-xl">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-white font-black text-lg leading-none">{stat.value}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Region Tabs ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {REGION_TABS.map(region => {
            const count = region.dbMatch === 'Tất cả'
              ? COMPETITIONS.length
              : COMPETITIONS.filter(c => c.region === region.dbMatch).length;
            return (
              <button
                key={region.id}
                onClick={() => setActiveRegion(region.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${activeRegion === region.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]'}`}
              >
                {t(region.labelKey as Parameters<typeof t>[0])}
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold
                  ${activeRegion === region.id ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Competition Grid ─────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-16 text-center backdrop-blur-xl">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-400 font-semibold">Không tìm thấy</p>
            <button
              onClick={() => { setSearch(''); setActiveRegion('all'); }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/30 transition-all"
            >
              {t('tab_all')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(comp => (
              <CompetitionCard key={comp.id} comp={comp} />
            ))}
          </div>
        )}

        {/* ── Footer note ──────────────────────────────────────────────────── */}
        <div className="mt-10 text-center">
          <p className="text-gray-700 text-xs">
            Dữ liệu được cập nhật liên tục · PitchGrid &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
