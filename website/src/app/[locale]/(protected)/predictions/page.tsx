'use client';
import { useEffect, useState } from 'react';
import { Target, Trophy, Flame, Coins, CheckCircle2, Filter, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchPredictionsByDate, fetchTopPredictors, fetchMyBets, fetchUserProfile } from '@/lib/api';
import { PredMatch, Predictor, UserBet } from '@football-fan/shared-types';
import { useAuthStore } from '@/store/useAuthStore';
import BetModal from '@/components/BetModal';
import CompetitionFilterModal from '@/components/CompetitionFilterModal';

export default function PredictionsPage() {
  const { user, updateUser } = useAuthStore();
  const [predictions, setPredictions] = useState<PredMatch[]>([]);
  const [leaderboard, setLeaderboard] = useState<Predictor[]>([]);
  const [myBets, setMyBets] = useState<UserBet[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<PredMatch | null>(null);
  const [selectedType, setSelectedType] = useState<'HOME_WIN' | 'DRAW' | 'AWAY_WIN' | 'EXACT_SCORE'>('HOME_WIN');
  const [selectedOdds, setSelectedOdds] = useState<number>(1.0);
  const [selectedBet, setSelectedBet] = useState<UserBet | null>(null);

  // Filter State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [filterCompetition, setFilterCompetition] = useState<string>('all');
  const [sortOption, setSortOption] = useState<'time' | 'status'>('status');
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);

  useEffect(() => {
    // Initial load for leaderboard and bets
    Promise.all([
      fetchTopPredictors(),
      fetchMyBets().catch(() => [])
    ])
    .then(([leadersData, betsData]) => {
      setLeaderboard(leadersData);
      setMyBets(betsData);
    })
    .catch(console.error);

    if (user?.username) {
      fetchUserProfile(user.username).then(u => {
        if (u && typeof u.xp === 'number') {
          updateUser({ xp: u.xp });
        }
      }).catch(console.error);
    }
  }, [user?.username]);

  useEffect(() => {
    // Fetch predictions dynamically when currentDate changes
    const fetchMatchesByDate = async () => {
      setLoading(true);
      try {
        const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
        const predsData = await fetchPredictionsByDate(dateStr);
        setPredictions(predsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatchesByDate();
  }, [currentDate]);

  const openBetModal = (match: PredMatch, type: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' | 'EXACT_SCORE', odds: number, existingBet?: UserBet) => {
    setSelectedMatch(match);
    setSelectedType(type);
    setSelectedOdds(odds);
    setSelectedBet(existingBet || null);
    setBetModalOpen(true);
  };

  const handleBetSuccess = (newXp: number, wager: number) => {
    // Refresh my bets
    fetchMyBets().then(setMyBets);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const getDayLabel = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((compareDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Ngày mai';
    if (diffDays === -1) return 'Hôm qua';
    
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };

  const formatDisplayDate = (date: Date) => {
    return `${date.getDate()} THG ${date.getMonth() + 1}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20 flex flex-col xl:flex-row gap-8">
      {/* Left: Active Predictions */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Target className="w-8 h-8 text-emerald-400" />
              Sàn Cá Cược
            </h1>
            <p className="text-gray-400 text-sm">Xuống tiền đặt cược vào đội bóng yêu thích để nhân X tài sản</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl border border-emerald-500/20 shrink-0">
            <Target className="w-5 h-5" />
            <span className="font-bold">Còn lại: {Math.max(0, 3 - (user?.dailyPredictionsCount || 0)) + (user?.extraPredictions || 0)} lượt</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          {/* Date Selector */}
          <div className="flex-1 flex justify-center bg-[#080d14] rounded-2xl p-2 border border-white/10">
            <div className="flex items-center justify-between w-full max-w-[200px]">
              <button 
                onClick={() => changeDate(-1)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
              </button>
              
              <div className="flex flex-col items-center">
                <span className="font-bold text-white">
                  {getDayLabel(currentDate)}
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">
                  {formatDisplayDate(currentDate)}
                </span>
              </div>

              <button 
                onClick={() => changeDate(1)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Giải đấu
            </label>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setIsCompModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#080d14] rounded-xl border border-white/10 hover:border-emerald-500/50 transition-colors text-sm font-bold text-white flex-1 sm:flex-none justify-between"
              >
                <span className="truncate">{filterCompetition === 'all' ? 'Tất cả giải đấu' : filterCompetition}</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/30 text-sm font-bold flex-1 sm:flex-none justify-center">
                <span>Còn lại: {(() => {
                  const todayStr = new Date().toISOString().slice(0, 10);
                  const isNewDay = user?.lastPredictionDate !== todayStr;
                  const count = isNewDay ? 0 : (user?.dailyPredictionsCount || 0);
                  return Math.max(0, 3 - count) + (user?.extraPredictions || 0);
                })()} lượt</span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Sắp xếp
            </label>
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="w-full bg-[#080d14] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
            >
              <option value="status">Chưa đá ưu tiên</option>
              <option value="time">Theo thời gian</option>
            </select>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          {loading ? (
            <div className="text-center text-gray-400 py-10">Đang tải kèo...</div>
          ) : (() => {
            let filtered = predictions;
            if (filterCompetition !== 'all') {
              filtered = filtered.filter(p => p.competition.split(',')[0] === filterCompetition);
            }

            const checkDateMatch = (kickoff: string, target: Date) => {
              const targetDateStr = target.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' });
              
              const matchDate = new Date(kickoff);
              if (kickoff.length === 10) {
                return target.toISOString().slice(0, 10) === kickoff;
              }
              const matchDateStr = matchDate.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' });
              
              return targetDateStr === matchDateStr;
            };

            // Filter by currentDate
            filtered = filtered.filter(p => checkDateMatch(p.kickoff, currentDate));

            // Sort
            filtered.sort((a, b) => {
              if (sortOption === 'status') {
                const statusOrder = { 'OPEN': 1, 'LIVE': 2, 'FINISHED': 3, 'RESOLVED': 4, 'CLOSED': 5 };
                const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 99;
                const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 99;
                if (aOrder !== bOrder) return aOrder - bOrder;
                return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
              }
              // time (default)
              return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
            });

            if (filtered.length === 0) {
              return <div className="text-center text-gray-400 py-10">Không có kèo nào phù hợp.</div>;
            }

            const formatTime = (isoString: string) => {
              if (!isoString || isoString.length === 10) return '--:--';
              try {
                const d = new Date(isoString);
                return d.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
              } catch {
                return '--:--';
              }
            };

            return filtered.map((pred, i) => {
            const myBet = myBets.find(b => b.matchId === pred.id);

            let cardClass = "bg-gradient-to-br from-emerald-900/30 to-[#080d14] border-emerald-500/30";
            let glowClass = "bg-emerald-500/10";
            if (myBet) {
              cardClass = "bg-gradient-to-br from-amber-900/40 to-[#120b03] border-amber-500/50";
              glowClass = "bg-amber-500/15";
            } else if (pred.status !== 'OPEN') {
              cardClass = "bg-[#141418] border-gray-700/50 opacity-80";
              glowClass = "hidden";
            }

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={pred.id} 
                className={`border rounded-3xl p-6 relative overflow-hidden shadow-2xl transition-all ${cardClass}`}
              >
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none ${glowClass}`} />

                <div className="flex justify-between items-center mb-6 relative z-10">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">{pred.competition}</span>
                  {pred.status === 'OPEN' ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      KÈO ĐANG MỞ
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-500/10 px-3 py-1 rounded-full border border-gray-500/20">
                      ĐÃ KẾT THÚC
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 relative z-10">
                  {/* Team 1 */}
                  <div className="flex-1 w-full flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl hover:scale-105 transition-transform cursor-pointer p-3">
                      {pred.homeLogo ? (
                        <img src={pred.homeLogo} alt={pred.homeTeam} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-4xl">{pred.homeEmoji}</span>
                      )}
                    </div>
                    <span className="font-bold text-white text-center">{pred.homeTeam}</span>
                    <button 
                      onClick={() => openBetModal(pred, 'HOME_WIN', pred.homeOdds || 2.0, myBet)}
                      disabled={pred.status !== 'OPEN'}
                      className={`w-full py-2.5 rounded-xl border font-bold transition-all flex justify-between px-4 items-center 
                        ${myBet?.type === 'HOME_WIN' ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 
                          pred.status !== 'OPEN' ? 'bg-white/5 border-white/5 text-gray-500 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'}`}
                    >
                      <span>Thắng</span>
                      <span>{myBet?.type === 'HOME_WIN' ? <CheckCircle2 className="w-4 h-4" /> : `x${(pred.homeOdds || 2.0).toFixed(2)}`}</span>
                    </button>
                  </div>

                  {/* Draw / Score */}
                  <div className="w-full sm:w-32 shrink-0 flex flex-col items-center justify-center gap-3">
                    <div className="text-center bg-[#080d14] py-2 px-4 rounded-xl border border-white/5 w-full">
                      {pred.status === 'FINISHED' && pred.homeScore !== undefined && pred.awayScore !== undefined ? (
                        <span className="block text-2xl font-black text-white mb-1 tracking-widest">{pred.homeScore} - {pred.awayScore}</span>
                      ) : (
                        <span className="block text-sm font-black text-gray-500 mb-1">VS</span>
                      )}
                      <span className="block text-xs font-bold text-emerald-500 uppercase tracking-wider">{formatTime(pred.kickoff)}</span>
                    </div>
                    <button 
                      onClick={() => openBetModal(pred, 'DRAW', pred.drawOdds || 3.0, myBet)}
                      disabled={pred.status !== 'OPEN'}
                      className={`w-full py-2.5 rounded-xl border font-bold transition-all flex justify-between px-4 items-center 
                        ${myBet?.type === 'DRAW' ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 
                          pred.status !== 'OPEN' ? 'bg-white/5 border-white/5 text-gray-500 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'}`}
                    >
                      <span>Hòa</span>
                      <span>{myBet?.type === 'DRAW' ? <CheckCircle2 className="w-4 h-4" /> : `x${(pred.drawOdds || 3.0).toFixed(2)}`}</span>
                    </button>
                  </div>

                  {/* Team 2 */}
                  <div className="flex-1 w-full flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl hover:scale-105 transition-transform cursor-pointer p-3">
                      {pred.awayLogo ? (
                        <img src={pred.awayLogo} alt={pred.awayTeam} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-4xl">{pred.awayEmoji}</span>
                      )}
                    </div>
                    <span className="font-bold text-white text-center">{pred.awayTeam}</span>
                    <button 
                      onClick={() => openBetModal(pred, 'AWAY_WIN', pred.awayOdds || 2.5, myBet)}
                      disabled={pred.status !== 'OPEN'}
                      className={`w-full py-2.5 rounded-xl border font-bold transition-all flex justify-between px-4 items-center 
                        ${myBet?.type === 'AWAY_WIN' ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 
                          pred.status !== 'OPEN' ? 'bg-white/5 border-white/5 text-gray-500 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'}`}
                    >
                      <span>Thắng</span>
                      <span>{myBet?.type === 'AWAY_WIN' ? <CheckCircle2 className="w-4 h-4" /> : `x${(pred.awayOdds || 2.5).toFixed(2)}`}</span>
                    </button>
                  </div>
                </div>

                {myBet && (
                  <div className="mt-4 py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center relative z-10">
                    <span className="text-amber-500/80 text-sm font-bold">Bạn đã cược kèo này</span>
                    <span className="text-amber-400 font-black text-lg">{myBet.wager.toLocaleString()} XP</span>
                  </div>
                )}
              </motion.div>
            );
          });
          })()
          }
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
                    {leader.points.toLocaleString()} trận đúng
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

      {selectedMatch && (
        <BetModal
          isOpen={betModalOpen}
          onClose={() => setBetModalOpen(false)}
          matchId={selectedMatch.id}
          matchTitle={`${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}`}
          betType={selectedType}
          odds={selectedOdds}
          existingBet={selectedBet}
          onSuccess={handleBetSuccess}
        />
      )}

      <CompetitionFilterModal 
        isOpen={isCompModalOpen}
        onClose={() => setIsCompModalOpen(false)}
        availableCompetitions={Array.from(new Set(predictions.map(p => p.competition.split(',')[0])))}
        selectedCompetition={filterCompetition}
        onSelect={setFilterCompetition}
      />
    </div>
  );
}
