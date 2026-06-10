'use client';

import { useState } from 'react';
import { COMMUNITY_CARDS, type CommunityCard as CommunityCardData, formatNumber } from '@/lib/mockData';

type Tab = 'joined' | 'team' | 'competition' | 'fanmade' | 'all';

const TABS: { id: Tab; label: string }[] = [
  { id: 'joined', label: 'Đang tham gia' },
  { id: 'team', label: 'Đội bóng' },
  { id: 'competition', label: 'Giải đấu' },
  { id: 'fanmade', label: 'Fan-made' },
  { id: 'all', label: 'Tất cả' },
];

export default function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [communities, setCommunities] = useState<CommunityCardData[]>(COMMUNITY_CARDS);

  const filtered = communities.filter((c) => {
    const matchSearch =
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'joined' && c.joined) ||
      activeTab === c.category;
    return matchSearch && matchTab;
  });

  const toggleJoin = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, joined: !c.joined } : c))
    );
  };

  return (
    <div className="min-h-screen bg-[#080d14] text-white">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              👥 <span>Cộng đồng Fan</span>
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Tìm và tham gia cộng đồng fan bóng đá yêu thích của bạn
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 text-sm whitespace-nowrap">
            <span className="text-base">+</span> Tạo cộng đồng
          </button>
        </div>

        {/* ── Search bar ── */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm cộng đồng, hashtag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06] w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {tab.label}
              {tab.id === 'joined' && (
                <span className="ml-1.5 text-xs bg-white/20 rounded-full px-1.5 py-0.5">
                  {communities.filter((c) => c.joined).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Count ── */}
        <p className="text-gray-500 text-xs mb-5">
          Hiển thị{' '}
          <span className="text-emerald-400 font-semibold">{filtered.length}</span> cộng đồng
        </p>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <div className="text-5xl mb-4">🔍</div>
            <p>Không tìm thấy cộng đồng nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onToggleJoin={toggleJoin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Community Card Component
// ────────────────────────────────────────────────────────────
function CommunityCard({
  community,
  onToggleJoin,
}: {
  community: CommunityCardData;
  onToggleJoin: (id: string) => void;
}) {
  const rarityBadge =
    community.category === 'competition'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : community.category === 'fanmade'
      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

  const categoryLabel =
    community.category === 'competition'
      ? 'Giải đấu'
      : community.category === 'fanmade'
      ? 'Fan-made'
      : 'Đội bóng';

  return (
    <div className="group relative flex flex-col bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-emerald-500/40 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer">

      {/* Banner */}
      <div className={`relative h-24 bg-gradient-to-br ${community.banner} flex items-center justify-center overflow-hidden`}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

        {/* Category badge */}
        <span className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm ${rarityBadge}`}>
          {categoryLabel}
        </span>

        {/* Joined indicator */}
        {community.joined && (
          <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm">
            ✓ Đã tham gia
          </span>
        )}

        {/* Large emoji */}
        <span className="text-5xl drop-shadow-xl z-10">{community.emoji}</span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name */}
        <h3 className="font-bold text-white text-base leading-tight group-hover:text-emerald-300 transition-colors">
          {community.name}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
          {community.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span>👥</span>
            <span className="text-gray-300 font-medium">{formatNumber(community.members)}</span>
            <span>thành viên</span>
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1">
            <span>📝</span>
            <span className="text-gray-300 font-medium">{community.postsPerDay}</span>
            <span>bài/ngày</span>
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {community.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-400 border border-white/[0.06] hover:border-emerald-500/30 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Join button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleJoin(community.id);
          }}
          className={`mt-auto w-full py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            community.joined
              ? 'bg-white/[0.06] text-gray-300 border border-white/[0.10] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
              : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
          }`}
        >
          {community.joined ? '✓ Đã tham gia' : '+ Tham gia'}
        </button>
      </div>
    </div>
  );
}
