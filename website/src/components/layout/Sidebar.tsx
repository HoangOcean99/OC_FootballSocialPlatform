'use client';

import { Link } from '@/navigation';
import { COMPETITIONS, TOP_COMMUNITIES } from '@/lib/mockData';
import { useTranslations } from 'next-intl';

const JOINED_COMPETITIONS = COMPETITIONS.slice(0, 5);
const JOINED_COMMUNITIES = TOP_COMMUNITIES.filter((c) => c.isJoined);

const ONLINE_FRIENDS = [
  { id: 'f1', name: 'Minh Tuấn', initials: 'MT', color: 'bg-sky-600' },
  { id: 'f2', name: 'Hoàng Nam', initials: 'HN', color: 'bg-violet-600' },
  { id: 'f3', name: 'Thanh Hà', initials: 'TH', color: 'bg-rose-600' },
  { id: 'f4', name: 'Quốc Anh', initials: 'QA', color: 'bg-amber-600' },
];

export default function Sidebar() {
  const t = useTranslations('Sidebar');
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto scrollbar-thin py-4 px-3 gap-4 border-r border-white/[0.05]">

      {/* Giáº£i Ä‘áº¥u yÃªu thÃ­ch */}
      <section>
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest px-2 mb-2">
          {t('fav_competitions')}
        </h3>
        <ul className="space-y-0.5">
          {JOINED_COMPETITIONS.map((comp) => (
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
          ))}
        </ul>
        <Link
          href="/competitions"
          className="block text-center text-[11px] text-emerald-500 hover:text-emerald-400 py-1 mt-1 transition-colors"
        >
          {t('view_all')}
        </Link>
      </section>

      {/* Divider */}
      <div className="border-t border-white/[0.05]" />

      {/* Cá»™ng Ä‘á»“ng Ä‘Ã£ tham gia */}
      <section>
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest px-2 mb-2">
          {t('joined_communities')}
        </h3>
        <ul className="space-y-0.5">
          {JOINED_COMMUNITIES.map((community) => (
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
          ))}
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
          {ONLINE_FRIENDS.map((friend) => (
            <li key={friend.id}>
              <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.06] transition-all duration-150 group text-left">
                <div className="relative shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full ${friend.color} flex items-center justify-center text-[11px] font-bold text-white`}
                  >
                    {friend.initials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080d14]" />
                </div>
                <p className="text-sm text-gray-300 group-hover:text-white truncate transition-colors">
                  {friend.name}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-white/[0.05]">
        <p className="text-[10px] text-gray-700 text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: t('copyright') }} />
      </div>

    </aside>
  );
}
