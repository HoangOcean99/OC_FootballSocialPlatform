'use client';
import { useEffect, useState } from 'react';
import { fetchMyBets } from '@/lib/api';
import { UserBet, PredMatch } from '@football-fan/shared-types';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface HistoryBet extends UserBet {
  match?: PredMatch;
}

export default function BetHistoryPage() {
  const { locale } = useParams();
  const [bets, setBets] = useState<HistoryBet[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Predictions');

  useEffect(() => {
    loadBets();
  }, []);

  const loadBets = async () => {
    try {
      const data = await fetchMyBets();
      setBets(data);
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
      case 'WON': return <CheckCircle2 className="w-5 h-5" />;
      case 'LOST': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const formatType = (type: string, homeTeam?: string, awayTeam?: string) => {
    switch(type) {
      case 'HOME_WIN': return t('team_win', { team: homeTeam || t('home_team_default') });
      case 'AWAY_WIN': return t('team_win', { team: awayTeam || t('away_team_default') });
      case 'DRAW': return t('draw');
      default: return type;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/${locale}/predictions`} className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-2 text-sm font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back_to_predictions')}
          </Link>
          <h1 className="text-3xl font-black text-white">{t('history_title')}</h1>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải lịch sử...</div>
      ) : bets.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
          <p className="text-gray-400 font-bold mb-4">{t('no_bets')}</p>
          <Link href={`/${locale}/predictions`} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl transition-colors">
            {t('join_now')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bets.map((bet, index) => (
            <Link href={`/${locale}/predictions/history/${bet.id}`} key={bet.id} className="block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-5 rounded-2xl border flex flex-col md:flex-row gap-6 items-center justify-between transition-all hover:scale-[1.01] cursor-pointer ${
                  bet.status === 'WON' ? 'bg-[#0f1f1a] border-emerald-500/20 hover:border-emerald-500/40' : 
                  bet.status === 'LOST' ? 'bg-[#1f0f0f] border-red-500/20 hover:border-red-500/40' : 
                  'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className={`p-3 rounded-full flex shrink-0 items-center justify-center ${getStatusColor(bet.status)}`}>
                    {getStatusIcon(bet.status)}
                  </div>
                  <div className="flex-1">
                    {bet.match ? (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {bet.match.homeLogo ? <img src={bet.match.homeLogo} alt="" className="w-6 h-6 object-contain" /> : <span>{bet.match.homeEmoji}</span>}
                          <span className="font-bold text-gray-200">{bet.match.homeTeam}</span>
                        </div>
                        <span className="font-black text-gray-500">VS</span>
                        <div className="flex items-center gap-2">
                          {bet.match.awayLogo ? <img src={bet.match.awayLogo} alt="" className="w-6 h-6 object-contain" /> : <span>{bet.match.awayEmoji}</span>}
                          <span className="font-bold text-gray-200">{bet.match.awayTeam}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="font-bold text-gray-200">Trận đấu đã ẩn</div>
                    )}
                    
                    <div className="mt-2 flex flex-wrap gap-3 items-center text-sm font-bold">
                      <span className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded">{t('bet_label')}: {formatType(bet.type, bet.match?.homeTeam, bet.match?.awayTeam)}</span>
                      <span className="text-gray-400">{t('odds_label')}: x{bet.odds}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-300">{t('wager_label')}: {bet.wager.toLocaleString()} XP</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`shrink-0 flex flex-col items-end text-right px-4 py-2 rounded-xl border ${getStatusColor(bet.status)}`}>
                    <span className="text-xs font-black uppercase opacity-80 mb-1">
                      {bet.status === 'WON' ? t('status_won') : bet.status === 'LOST' ? t('status_lost') : t('status_pending')}
                    </span>
                    <span className="text-xl font-black">
                      {bet.status === 'WON' ? `+${Math.floor(bet.wager * bet.odds).toLocaleString()} XP` : 
                       bet.status === 'LOST' ? `-${bet.wager.toLocaleString()} XP` : 
                       `${bet.wager.toLocaleString()} XP`}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
