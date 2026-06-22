'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { placeBet, fetchUserProfile } from '@/lib/api';
import toast from 'react-hot-toast';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  matchTitle: string;
  betType: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' | 'EXACT_SCORE';
  odds: number;
  existingBet?: any;
  onSuccess: (newXp: number, wager: number) => void;
}

export default function BetModal({ isOpen, onClose, matchId, matchTitle, betType, odds, existingBet, onSuccess }: BetModalProps) {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const [wager, setWager] = useState<number>(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWager(existingBet ? existingBet.wager : 100);
    }
  }, [isOpen, existingBet]);

  const getBetLabel = () => {
    switch (betType) {
      case 'HOME_WIN': return 'Chủ thắng';
      case 'DRAW': return 'Hòa';
      case 'AWAY_WIN': return 'Khách thắng';
      case 'EXACT_SCORE': return 'Tỉ số chính xác';
    }
  };

  const currentXp = user?.xp || 0;
  
  const handleBet = async () => {
    if (wager <= 0) return toast.error('Số XP cược phải lớn hơn 0');
    
    const previousWager = existingBet ? existingBet.wager : 0;
    const netCost = wager - previousWager;
    if (netCost > 0 && netCost > currentXp) {
      return toast.error('Số dư XP không đủ');
    }

    setLoading(true);
    try {
      await placeBet(matchId, betType, wager);
      toast.success('Đặt cược thành công!');
      
      // Update local state by refetching profile
      if (user?.username) {
        const profile = await fetchUserProfile(user.username);
        updateUser(profile);
        onSuccess(profile.xp, wager);
      } else {
        const newXp = currentXp - wager;
        updateUser({ xp: newXp });
        onSuccess(newXp, wager);
      }
      
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi đặt cược';
      toast.error(msg);
      if (msg.includes('Hết lượt')) {
        onClose();
        router.push('/shop');
      }
    } finally {
      setLoading(false);
    }
  };

  const potentialWin = Math.floor(wager * odds);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-sm bg-[#1a2332] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-bold text-white text-lg">Xác nhận cược</h3>
            <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-white">{existingBet ? 'Cập Nhật Cược' : 'Đặt Cược'}</h2>
                <p className="text-sm text-gray-400">{matchTitle}</p>
              <p className="text-xl font-black text-emerald-400 uppercase tracking-wide">{getBetLabel()}</p>
              <div className="inline-block px-3 py-1 bg-white/5 rounded-full text-sm font-bold text-gray-300 mt-2">
                Tỷ lệ ăn: <span className="text-amber-400">x{odds.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Nhập số XP cược:</span>
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <Coins className="w-4 h-4" /> Dư: {currentXp.toLocaleString()}
                </span>
              </div>
              <input 
                type="number" 
                value={wager}
                onChange={e => setWager(Number(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold text-center focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <div className="flex gap-2">
                {[100, 500, 1000].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setWager(amt)}
                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-bold transition-colors"
                  >
                    +{amt}
                  </button>
                ))}
                <button 
                  onClick={() => setWager(currentXp)}
                  className="flex-1 py-2 rounded-lg bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 text-sm font-bold transition-colors"
                >
                  All in
                </button>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center">
              <span className="text-emerald-400/80 text-sm font-bold">Dự kiến nhận:</span>
              <span className="text-emerald-400 font-black text-xl">+{potentialWin.toLocaleString()} XP</span>
            </div>

              <button
                onClick={handleBet}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-amber-500 text-amber-950 font-black hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? 'Đang xử lý...' : existingBet ? 'Lưu Thay Đổi' : 'Chốt Đơn'}
              </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
