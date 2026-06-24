'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/navigation';
import { fetchAllCompetitions, fetchAllCommunities, fetchOnlineFriends, sendHeartbeat } from '@/lib/api';
import { Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Competition, Community, User } from '@football-fan/shared-types';
import { useAuthStore } from '@/store/useAuthStore';
import { usePathname } from '@/navigation';
import UserPopover from '@/components/chat/UserPopover';

export default function Sidebar() {
  const t = useTranslations('Sidebar');
  const { user } = useAuthStore();
  const pathname = usePathname();
  
  const [allCompetitions, setAllCompetitions] = useState<Competition[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<User[]>([]);

  const [loadingComps, setLoadingComps] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  const fetchData = () => {
    fetchAllCompetitions().then(res => {
      setAllCompetitions(res);
      setLoadingComps(false);
    }).catch(err => {
      console.error(err);
      setLoadingComps(false);
    });
    
    setLoadingCommunities(true);
    fetchAllCommunities().then(res => {
      setCommunities(res.filter((c: Community) => 
        c.isJoined || c.creatorId === user?.id || (c.adminIds && c.adminIds.includes(user?.id))
      ));
    }).catch(console.error).finally(() => setLoadingCommunities(false));
    
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

      {/* Giải đấu yêu thích */}
      <section>
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest px-2 mb-2">
          {t('fav_competitions')}
        </h3>
        <ul className="space-y-0.5">
          {loadingComps ? (
            <li className="px-2 py-2 text-xs text-gray-500">{t('loading')}</li>
          ) : (() => {
            const favoriteNames = user?.favoriteCompetitions || [];
            const displayCompetitions = favoriteNames.length > 0 
              ? allCompetitions.filter(c => favoriteNames.includes(c.name))
              : allCompetitions.slice(0, 5);

            return displayCompetitions.length > 0 ? displayCompetitions.map((comp) => (
            <li key={comp.id}>
              <Link
                href={`/competitions`}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-150 group"
              >
                <span className="text-base w-6 text-center flex items-center justify-center">
                  {comp.logo?.startsWith('http') ? (
                    <div className="w-6 h-6 rounded-md bg-white/90 p-0.5 shadow-sm">
                      <img src={comp.logo} alt={comp.shortName} className="w-full h-full object-contain inline-block" />
                    </div>
                  ) : comp.logo}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white truncate transition-colors">
                    {comp.shortName}
                  </p>
                  <p className="text-[11px] text-gray-600 truncate">{comp.country}</p>
                </div>
              </Link>
            </li>
          )) : <li className="px-2 py-2 text-xs text-gray-500">{t('no_data')}</li>;
          })()}
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
              <span>💎</span> {t('upgrade_plus')}
            </h4>
            <p className="text-[10px] text-gray-400 leading-tight">
              {t('upgrade_desc')}
            </p>
          </Link>
          <div className="border-t border-white/[0.05] mt-2" />
        </>
      )}

      {/* Cộng đồng tham gia / quản lý */}
      <section>
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest px-2 mb-2">
          {t('manage_communities')}
        </h3>
        <ul className="space-y-0.5">
          {loadingCommunities ? (
            <li className="px-2 py-2 text-xs text-gray-500">{t('loading')}</li>
          ) : communities.length > 0 ? (
            communities.map((community) => {
              const isAdmin = community.creatorId === user?.id || (community.adminIds && community.adminIds.includes(user?.id));
              return (
                <li key={community.id}>
                  <Link
                    href={`/communities/${community.id}`}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.06] transition-all duration-150 group"
                  >
                    <div className={`w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-sm shrink-0 border overflow-hidden ${isAdmin ? 'border-amber-500/50 shadow-[0_0_5px_rgba(245,158,11,0.3)] text-amber-500' : 'border-transparent'}`}>
                      {community.logo?.startsWith('http') || community.logo?.includes('/') ? (
                        <img src={community.logo} alt={community.name} className="w-full h-full object-cover" />
                      ) : (
                        community.logo
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-300 group-hover:text-white truncate transition-colors flex items-center gap-1">
                        {community.name}
                        {isAdmin && <Shield className="w-3 h-3 text-amber-500 shrink-0" />}
                      </p>
                      <p className="text-[11px] text-gray-600 truncate">
                        {community.postsToday} bài hôm nay
                      </p>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  </Link>
                </li>
              );
            })
          ) : (
            <li className="px-2 py-2 text-xs text-gray-500">{t('no_communities')}</li>
          )}
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
            <li className="px-2 py-2 text-xs text-gray-500">{t('loading')}</li>
          ) : onlineFriends.length > 0 ? (
            onlineFriends.map((friend) => (
              <li key={friend.id}>
                <UserPopover user={friend}>
                  <div className="cursor-pointer w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.06] transition-all duration-150 group text-left">
                    <div className="relative shrink-0 w-7 h-7">
                      <div
                        className={`w-full h-full rounded-full flex items-center justify-center text-[11px] font-bold text-white overflow-hidden ${
                          friend.purchasedItems?.includes('frame_dragon') ? 'border border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] bg-emerald-600' : 'bg-emerald-600'
                        }`}
                      >
                        {friend.avatarUrl ? <img src={friend.avatarUrl} alt="" className="w-full h-full object-cover" /> : friend.initials || friend.username?.charAt(0).toUpperCase()}
                      </div>
                      {friend.purchasedItems?.includes('frame_dragon') && (
                        <div className="absolute -inset-1 border border-amber-500/50 rounded-full animate-pulse pointer-events-none" />
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080d14]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className={`text-sm group-hover:text-white truncate transition-colors ${
                          friend.purchasedItems?.includes('name_vip_red')
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] font-bold'
                            : 'text-gray-300'
                        }`}>
                          {friend.displayName || friend.username}
                        </p>
                        {friend.purchasedItems?.includes('badge_wizard') && (
                          <span className="text-xs drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse" title="Huy Hiệu Phù Thuỷ Dự Đoán">🌟</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">Online</p>
                    </div>
                  </div>
                </UserPopover>
              </li>
            ))
          ) : (
            <li className="px-2 py-2 text-xs text-gray-500">{t('no_online_friends')}</li>
          )}
        </ul>
        <Link
          href="/friends"
          className="block text-center text-[11px] text-emerald-500 hover:text-emerald-400 py-1 mt-1 transition-colors"
        >
          {t('manage_friends')}
        </Link>
      </section>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-white/[0.05]">
        <p className="text-[10px] text-gray-700 text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: t('copyright') }} />
      </div>

    </aside>
  );
}
