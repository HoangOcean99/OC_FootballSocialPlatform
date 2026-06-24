'use client';
import { useEffect, useState } from 'react';
import { Trophy, Star, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fetchAllCompetitions } from '@/lib/api';
import { Competition } from '@football-fan/shared-types';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslations } from 'next-intl';

export default function CompetitionsPage() {
  const t = useTranslations('Competitions');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, toggleFavoriteCompetition } = useAuthStore();

  useEffect(() => {
    fetchAllCompetitions()
      .then(setCompetitions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const favoriteNames = user?.favoriteCompetitions || [];
  
  const order = ['World Cup', 'Euro', 'Copa America', 'Champions League', 'Ngoại hạng Anh', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'];
  const sortedComps = [...competitions].sort((a, b) => {
    const idxA = order.indexOf(a.name);
    const idxB = order.indexOf(b.name);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const following = sortedComps.filter(c => favoriteNames.includes(c.name));
  const discover = sortedComps.filter(c => !favoriteNames.includes(c.name));
  
  const nationalComps = discover.filter(c => ['World Cup', 'Euro', 'Copa America'].includes(c.name));
  const clubComps = discover.filter(c => !['World Cup', 'Euro', 'Copa America'].includes(c.name));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-emerald-400" />
            {t('title').replace('🏆 ', '')}
          </h1>
          <p className="text-gray-400 text-sm">{t('subtitle')}</p>
        </div>

      </div>

      {/* Following Grid */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{t('following')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center text-gray-400 py-4">Đang tải...</div>
          ) : following.length === 0 ? (
            <div className="col-span-full text-gray-500 text-sm">{t('no_following')}</div>
          ) : following.map((comp, i) => (
            <Link href={`/competitions/${comp.id}`} key={comp.id}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white/[0.02] border border-white/10 rounded-2xl p-4 overflow-hidden hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${comp.color || 'from-gray-600 to-gray-800'} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity`} />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white/90 p-1 flex items-center justify-center text-2xl shadow-lg shadow-black/20 group-hover:-translate-y-1 transition-transform duration-300">
                {comp.logo?.startsWith('http') ? <img src={comp.logo} alt={comp.name} className="w-full h-full object-contain" /> : comp.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{comp.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{comp.country}</p>
                </div>
                <button 
                  onClick={(e) => { e.preventDefault(); toggleFavoriteCompetition(comp.name); }}
                  className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-red-500 transition-colors shrink-0"
                  title="Hủy theo dõi"
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Discover Grid */}
      <div>
        {nationalComps.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 mt-8">{t('national_teams')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full text-center text-gray-400 py-4">Đang tải...</div>
              ) : nationalComps.map((comp, i) => (
                <Link href={`/competitions/${comp.id}`} key={comp.id}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="group relative bg-white/[0.02] border border-white/10 rounded-2xl p-4 overflow-hidden hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-white/90 p-1 flex items-center justify-center text-2xl shadow-lg shadow-black/20 group-hover:-translate-y-1 transition-transform duration-300">
                      {comp.logo?.startsWith('http') ? <img src={comp.logo} alt={comp.name} className="w-full h-full object-contain" /> : comp.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-300 truncate group-hover:text-white transition-colors">{comp.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{comp.followers || '1M'} {t('followers')}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); toggleFavoriteCompetition(comp.name); }}
                      className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-gray-300 text-sm font-bold hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors shrink-0"
                    >
                      {t('btn_follow')}
                    </button>
                  </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </>
        )}

        {clubComps.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 mt-12">{t('clubs')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full text-center text-gray-400 py-4">Đang tải...</div>
              ) : clubComps.map((comp, i) => (
                <Link href={`/competitions/${comp.id}`} key={comp.id}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="group relative bg-white/[0.02] border border-white/10 rounded-2xl p-4 overflow-hidden hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-white/90 p-1 flex items-center justify-center text-2xl shadow-lg shadow-black/20 group-hover:-translate-y-1 transition-transform duration-300">
                      {comp.logo?.startsWith('http') ? <img src={comp.logo} alt={comp.name} className="w-full h-full object-contain" /> : comp.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-300 truncate group-hover:text-white transition-colors">{comp.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{comp.followers || '1M'} {t('followers')}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); toggleFavoriteCompetition(comp.name); }}
                      className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-gray-300 text-sm font-bold hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors shrink-0"
                    >
                      {t('btn_follow')}
                    </button>
                  </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
