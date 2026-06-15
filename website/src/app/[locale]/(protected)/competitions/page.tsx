'use client';
import { useEffect, useState } from 'react';
import { Trophy, Star, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchAllCompetitions } from '@/lib/api';
import { Competition } from '@football-fan/shared-types';
import { useAuthStore } from '@/store/useAuthStore';

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAllCompetitions()
      .then(setCompetitions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const favoriteNames = user?.favoriteCompetitions || [];
  const following = competitions.filter(c => favoriteNames.includes(c.name));
  const discover = competitions.filter(c => !favoriteNames.includes(c.name));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-emerald-400" />
            Giải Đấu
          </h1>
          <p className="text-gray-400 text-sm">Theo dõi các giải đấu hàng đầu thế giới</p>
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Tìm kiếm giải đấu..." 
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Following Grid */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Đang theo dõi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center text-gray-400 py-4">Đang tải...</div>
          ) : following.length === 0 ? (
            <div className="col-span-full text-gray-500 text-sm">Chưa theo dõi giải đấu nào.</div>
          ) : following.map((comp, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={comp.id} 
              className="group relative bg-white/[0.02] border border-white/10 rounded-2xl p-4 overflow-hidden hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${comp.color || 'from-gray-600 to-gray-800'} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity`} />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                  {comp.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{comp.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{comp.country}</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors shrink-0">
                  <Star className="w-5 h-5 fill-current" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Discover Grid */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 mt-8">Khám phá</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center text-gray-400 py-4">Đang tải...</div>
          ) : discover.map((comp, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              key={comp.id} 
              className="group relative bg-white/[0.02] border border-white/10 rounded-2xl p-4 overflow-hidden hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-2xl shadow-inner grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                  {comp.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-300 truncate group-hover:text-white transition-colors">{comp.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{comp.followers || '1M'} người theo dõi</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-gray-300 text-sm font-bold hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors shrink-0">
                  Theo dõi
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
