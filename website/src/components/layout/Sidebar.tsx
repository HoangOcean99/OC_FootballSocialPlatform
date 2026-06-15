'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/navigation';
import { fetchTopCompetitions, fetchTopCommunities, fetchOnlineFriends, sendHeartbeat } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Competition, Community, User } from '@football-fan/shared-types';
import { useAuthStore } from '@/store/useAuthStore';
import { usePathname } from '@/navigation';

export default function Sidebar() {
  const t = useTranslations('Sidebar');
  const { user } = useAuthStore();
  const pathname = usePathname();
  
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<User[]>([]);

  const [loadingComps, setLoadingComps] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const fetchData = () => {
    fetchTopCompetitions().then(res => {
      setCompetitions(res.slice(0, 5));
      setLoadingComps(false);
    }).catch(err => {
      console.error(err);
      setLoadingComps(false);
    });
    
    fetchTopCommunities().then(res => setCommunities(res.filter((c: Community) => c.isJoined))).catch(console.error);
    
    fetchOnlineFriends().then(res => {
      const filtered = user ? res.filter((u: User) => u.id !== user.id) : res;
      setOnlineFriends(filtered.slice(0, 10)); // Show up to 10 online users
    }).catch(console.error)
      .finally(() => setLoadingFriends(false));
  };

  useEffect(() => {
    // Initial fetch
    setLoadingFriends(true);
    fetchData();
    if (user) sendHeartbeat().catch(console.error);

    // Polling every 10 seconds for heartbeat and data
    const interval = setInterval(() => {
      fetchData();
      if (user) sendHeartbeat().catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto scrollbar-thin py-4 px-3 gap-4 border-r border-white/[0.05]">

      {/* Giáº£i Ä‘áº¥u yÃªu thÃ­ch */}
      <section>
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest px-2 mb-2">
          {t('fav_competitions')}
        </h3>
        <ul className="space-y-0.5">
          {loadingComps ? (
            <li className="px-2 py-2 text-xs text-gray-500">Đang tải...</li>
          ) : competitions.length > 0 ? competitions.map((comp) => (
            <li key={comp.id}>
              <Link
                href={`/competitions`}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-150 group"
              >
                <span className="text-base w-6 text-center">{comp.logo}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white truncate transition-colors">
                    {comp.shortName}
                  </p>
                  <p className="text-[11px] text-gray-600 truncate">{comp.country}</p>
                </div>
              </Link>
            </li>
          )) : <li className="px-2 py-2 text-xs text-gray-500">Chưa có dữ liệu</li>}
        </ul>
        <Link
          href="/competitions"
          className="block text-center text-[11px] text-emerald-500 hover:text-emerald-400 py-1 mt-1 transition-colors"
        >
          {t('view_all')}
        </Link>
      </section>

      {/* Upgrade to PLUS Banner (Only for REGULAR users) */}
      {(!user || user.tier !== 'PLUS') && (
        <>
          <Link href="/plus" className="block mx-2 mt-2 p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 text-center relative overflow-hidden group cursor-pointer hover:bg-amber-500/20 transition-all">
            <div className="absolute inset-0 bg-amber-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h4 className="text-xs font-black text-amber-400 mb-1 flex items-center justify-center gap-1">
              <span>💎</span> Nâng cấp PLUS
            </h4>
            <p className="text-[10px] text-gray-400 leading-tight">
              Tham gia cộng đồng, dự đoán không giới hạn.
            </p>
          </Link>
          <div className="border-t border-white/[0.05] mt-2" />
        </>
      )}

      {/* Cá»™ng Ä‘á»“ng Ä‘Ã£ tham gia */}
      <section>
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest px-2 mb-2">
          {t('joined_communities')}
        </h3>
        <ul className="space-y-0.5">
          {communities.length > 0 ? communities.map((community) => (
            <li key={community.id}>
              <Link
                href={`/communities`}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.06] transition-all duration-150 group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-sm shrink-0">
                  {community.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white truncate transition-colors">
                    {community.name}
                  </p>
                  <p className="text-[11px] text-gray-600 truncate">
                    {community.postsToday} bài hôm nay
                  </p>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              </Link>
            </li>
          )) : <li className="px-2 py-2 text-xs text-gray-500">Đang tải...</li>}
        </ul>
        <Link
          href="/communities"
          className="block text-center text-[11px] text-emerald-500 hover:text-emerald-400 py-1 mt-1 transition-colors"
        >
          {t('discover_more')}
        </Link>
      </section>

      {/* Divider */}
      <div className="border-t border-white/[0.05]" />

      {/* Báº¡n bÃ¨ Ä‘ang online */}
      <section>
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest px-2 mb-2">
          {t('online_friends')}
        </h3>
        <ul className="space-y-0.5">
          {loadingFriends ? (
            <li className="px-2 py-2 text-xs text-gray-500">Đang tải...</li>
          ) : onlineFriends.length > 0 ? (
            onlineFriends.map((friend) => (
              <li key={friend.id}>
                <Link href={`/profile/${friend.username}`} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.06] transition-all duration-150 group text-left">
                  <div className="relative shrink-0">
                    <div
                      className={`w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-[11px] font-bold text-white`}
                    >
                      {friend.initials || friend.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080d14]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-300 group-hover:text-white truncate transition-colors">
                      {friend.displayName || friend.username}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">Online</p>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="px-2 py-2 text-xs text-gray-500">Chưa có bạn bè online</li>
          )}
        </ul>
      </section>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-white/[0.05]">
        <p className="text-[10px] text-gray-700 text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: t('copyright') }} />
      </div>

    </aside>
  );
}
