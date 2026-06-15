'use client';
import { useEffect, useState } from 'react';
import { Target, Trophy, Flame, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchActivePredictions, fetchTopPredictors } from '@/lib/api';
import { PredMatch, Predictor } from '@football-fan/shared-types';
import { useAuthStore } from '@/store/useAuthStore';

export default function PredictionsPage() {
  const { user } = useAuthStore();
  const [predictions, setPredictions] = useState<PredMatch[]>([]);
  const [leaderboard, setLeaderboard] = useState<Predictor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchActivePredictions(),
      fetchTopPredictors()
    ])
    .then(([predsData, leadersData]) => {
      setPredictions(predsData);
      setLeaderboard(leadersData);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20 flex flex-col xl:flex-row gap-8">
      {/* Left: Active Predictions */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Target className="w-8 h-8 text-emerald-400" />
              Dự Đoán
            </h1>
            <p className="text-gray-400 text-sm">Trổ tài dự đoán kết quả và nhận phần thưởng XP</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-500 px-4 py-2 rounded-xl border border-amber-500/20 shrink-0">
            <Coins className="w-5 h-5" />
            <span className="font-bold">Ví: {user?.xp?.toLocaleString() || 0} XP</span>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          {loading ? (
            <div className="text-center text-gray-400 py-10">Đang tải dự đoán...</div>
          ) : predictions.map((pred, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={pred.id} 
              className="bg-gradient-to-br from-[#0f1923] to-[#080d14] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

              <div className="flex justify-between items-center mb-6 relative z-10">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">{pred.competition}</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <Flame className="w-3 h-3" /> Thưởng {pred.xpReward} XP
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 relative z-10">
                {/* Team 1 */}
                <div className="flex-1 w-full flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-xl hover:scale-105 transition-transform cursor-pointer">
                    {pred.homeEmoji}
                  </div>
                  <span className="font-bold text-white text-center">{pred.homeTeam}</span>
                  <button className="w-full py-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 text-gray-300 font-bold transition-colors">
                    Thắng
                  </button>
                </div>

                {/* Draw */}
                <div className="w-full sm:w-24 shrink-0 flex flex-col items-center justify-center gap-3">
                  <div className="text-center bg-[#080d14] py-2 px-4 rounded-xl border border-white/5 w-full">
                    <span className="block text-sm font-black text-gray-500 mb-1">VS</span>
                    <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{pred.kickoff}</span>
                  </div>
                  <button className="w-full py-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 text-gray-300 font-bold transition-colors">
                    Hòa
                  </button>
                </div>

                {/* Team 2 */}
                <div className="flex-1 w-full flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-xl hover:scale-105 transition-transform cursor-pointer">
                    {pred.awayEmoji}
                  </div>
                  <span className="font-bold text-white text-center">{pred.awayTeam}</span>
                  <button className="w-full py-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 text-gray-300 font-bold transition-colors">
                    Thắng
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 relative z-10">
                <button className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-black text-lg shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all transform hover:scale-[1.02]">
                  Dự Đoán Tỉ Số Chính Xác
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Leaderboard */}
      <div className="w-full xl:w-80 shrink-0">
        <div className="bg-[#0f1923] border border-white/10 rounded-3xl p-6 sticky top-24 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black text-white">Bảng Xếp Hạng</h2>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="text-center text-gray-400 py-4">Đang tải...</div>
            ) : leaderboard.map((leader, index) => {
              const isMe = user?.username === leader.username;
              const rank = index + 1; // Or leader.rank if it's already sorted and ranked
              return (
                <div 
                  key={leader.id} 
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${isMe ? 'bg-emerald-500/10 border border-emerald-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${rank === 1 ? 'bg-amber-400 text-amber-900 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : rank === 2 ? 'bg-gray-300 text-gray-800' : rank === 3 && !isMe ? 'bg-orange-400 text-orange-950' : isMe ? 'bg-emerald-500 text-[#03060a]' : 'bg-white/10 text-gray-400'}`}>
                    {rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isMe ? 'text-emerald-400' : 'text-gray-200'}`}>{leader.displayName}</p>
                  </div>
                  <div className="text-sm font-black text-amber-400 shrink-0">
                    {leader.points.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          <button className="w-full mt-6 py-2 rounded-xl border border-white/10 text-gray-400 text-sm font-bold hover:bg-white/5 hover:text-white transition-colors">
            Xem toàn bộ
          </button>
        </div>
      </div>
    </div>
  );
}
