'use client';
import { useEffect, useState } from 'react';
import { Users, Shield, MessageSquare, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchAllCommunities } from '@/lib/api';
import { Community } from '@football-fan/shared-types';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCommunities()
      .then(setCommunities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-400" />
            Cộng Đồng
          </h1>
          <p className="text-gray-400 text-sm">Giao lưu và bàn luận với những người cùng đam mê</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#03060a] px-5 py-2.5 rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(52,211,153,0.3)]">
          <Plus className="w-5 h-5" />
          Tạo Cộng Đồng
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-400 py-10">Đang tải...</div>
        ) : communities.map((community, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={community.id} 
            className="group bg-[#0f1923] border border-white/[0.05] rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-colors cursor-pointer shadow-xl"
          >
            {/* Cover */}
            <div className="h-32 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1923] via-transparent to-transparent z-10" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {community.cover ? (
                <img src={community.cover} alt="Cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${community.coverColor}`} />
              )}
              
              <div className="absolute top-4 right-4 z-20">
                {community.isJoined ? (
                  <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    <Shield className="w-3 h-3" /> Đã tham gia
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white hover:bg-emerald-500 transition-colors">
                    Tham gia
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 pt-0 relative">
              <div className="w-16 h-16 bg-[#080d14] rounded-2xl flex items-center justify-center text-3xl border border-white/10 shadow-xl relative z-20 -mt-8 mb-4">
                {community.logo}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{community.name}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{community.members || community.memberCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span>{community.posts || community.postsToday}/ngày</span>
                  </div>
                  {community.isJoined && (
                    <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                      <span>Sôi động</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
