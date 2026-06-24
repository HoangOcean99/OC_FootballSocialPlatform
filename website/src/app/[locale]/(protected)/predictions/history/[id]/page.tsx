'use client';
import { useEffect, useState } from 'react';
import { fetchBetById } from '@/lib/api';
import { UserBet, PredMatch } from '@football-fan/shared-types';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Target, Shield, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface HistoryBet extends UserBet {
  match?: PredMatch;
}

export default function BetDetailsPage() {
  const { locale, id } = useParams();
  const [bet, setBet] = useState<HistoryBet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBet(id as string);
    }
  }, [id]);

  const loadBet = async (betId: string) => {
    try {
      const data = await fetchBetById(betId);
      setBet(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WON': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'LOST': return 'bg-red-500/10 border-red-500/30 text-red-400';
      default: return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WON': return <CheckCircle2 className="w-8 h-8" />;
      case 'LOST': return <XCircle className="w-8 h-8" />;
      default: return <Clock className="w-8 h-8" />;
    }
  };

  const formatType = (type: string, homeTeam?: string, awayTeam?: string) => {
    switch(type) {
      case 'HOME_WIN': return homeTeam ? `${homeTeam} thắng` : 'Chủ nhà thắng';
      case 'AWAY_WIN': return awayTeam ? `${awayTeam} thắng` : 'Đội khách thắng';
      case 'DRAW': return 'Hòa';
      default: return type;
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Đang tải chi tiết cược...</div>;
  }

  if (!bet) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl text-white font-bold mb-4">Không tìm thấy mã cược này.</h1>
        <Link href={`/${locale}/predictions/history`} className="text-amber-500 hover:underline">Quay lại lịch sử</Link>
      </div>
    );
  }

  const { match } = bet;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <Link href={`/${locale}/predictions/history`} className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6 text-sm font-bold">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Trở lại danh sách
      </Link>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0f1923] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Background glow based on status */}
        <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[100px] rounded-full opacity-20 pointer-events-none ${
          bet.status === 'WON' ? 'bg-emerald-500' : bet.status === 'LOST' ? 'bg-red-500' : 'bg-amber-500'
        }`} />

        <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl flex items-center justify-center ${getStatusColor(bet.status)}`}>
              {getStatusIcon(bet.status)}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Chi tiết vé cược</h1>
              <p className="text-gray-400 font-bold mt-1">Mã vé: #{bet.id?.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          
          <div className={`px-6 py-3 rounded-2xl border flex flex-col items-end ${getStatusColor(bet.status)}`}>
            <span className="text-sm font-black uppercase opacity-80 mb-1">
              {bet.status === 'WON' ? 'Nhận về' : bet.status === 'LOST' ? 'Đã mất' : 'Tiền cược'}
            </span>
            <span className="text-3xl font-black tracking-wider">
              {bet.status === 'WON' ? `+${Math.floor(bet.wager * bet.odds).toLocaleString()}` : 
               bet.status === 'LOST' ? `-${bet.wager.toLocaleString()}` : 
               `${bet.wager.toLocaleString()}`} XP
            </span>
          </div>
        </div>

        {/* Match Details Section */}
        {match ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 relative z-10">
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-500/20">
                {match.competition}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center p-4">
                  {match.homeLogo ? <img src={match.homeLogo} alt={match.homeTeam} className="w-full h-full object-contain" /> : <span className="text-4xl">{match.homeEmoji}</span>}
                </div>
                <span className="font-black text-xl text-center text-white">{match.homeTeam}</span>
              </div>

              {/* Score / VS */}
              <div className="px-8 flex flex-col items-center justify-center">
                <div className="bg-[#080d14] px-6 py-3 rounded-xl border border-white/5 text-center">
                  {(match.status === 'FINISHED' || match.status === 'RESOLVED') && match.homeScore !== undefined && match.awayScore !== undefined ? (
                    <span className="block text-4xl font-black text-white tracking-widest mb-1">
                      {match.homeScore} - {match.awayScore}
                    </span>
                  ) : (
                    <span className="block text-2xl font-black text-gray-500 mb-1">VS</span>
                  )}
                  <span className="text-sm font-bold text-gray-400">
                    {new Date(match.kickoff).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              {/* Away Team */}
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center p-4">
                  {match.awayLogo ? <img src={match.awayLogo} alt={match.awayTeam} className="w-full h-full object-contain" /> : <span className="text-4xl">{match.awayEmoji}</span>}
                </div>
                <span className="font-black text-xl text-center text-white">{match.awayTeam}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-gray-400 mb-8 font-bold">
            Thông tin trận đấu không hiển thị hoặc đã bị xóa.
          </div>
        )}

        {/* Bet Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          <div className="bg-[#080d14] rounded-2xl p-5 border border-white/5 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Lựa chọn</p>
              <p className="text-lg font-black text-white">{formatType(bet.type, match?.homeTeam, match?.awayTeam)}</p>
            </div>
          </div>
          <div className="bg-[#080d14] rounded-2xl p-5 border border-white/5 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Tỉ lệ</p>
              <p className="text-lg font-black text-white">x{bet.odds.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-[#080d14] rounded-2xl p-5 border border-white/5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Tiền cược gốc</p>
              <p className="text-lg font-black text-white">{bet.wager.toLocaleString()} XP</p>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
