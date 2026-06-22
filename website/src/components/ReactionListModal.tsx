'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPostReactions } from '@/lib/api';
import { X } from 'lucide-react';
import { REACTIONS } from './PostActions';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';

interface ReactionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

interface ReactionUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  avatarColor?: string;
  initials?: string;
  reaction: string;
  purchasedItems?: string[];
}

export default function ReactionListModal({ isOpen, onClose, postId }: ReactionListModalProps) {
  const [users, setUsers] = useState<ReactionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all'); // 'all' or reaction type
  
  const { user: currentUser } = useAuthStore();
  const locale = useLocale();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchPostReactions(postId)
        .then(data => {
          setUsers(data);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, postId]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  const reactionCounts: Record<string, number> = {};
  users.forEach(u => {
    reactionCounts[u.reaction] = (reactionCounts[u.reaction] || 0) + 1;
  });

  const availableFilters = ['all', ...Object.keys(reactionCounts).sort((a, b) => reactionCounts[b] - reactionCounts[a])];

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.reaction === filter);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
            className="fixed left-1/2 top-1/2 w-full max-w-md 
                       bg-[#1a2332] rounded-2xl border border-white/10 z-50 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
                {availableFilters.map(f => {
                  if (f === 'all') {
                    return (
                      <button
                        key="all"
                        onClick={() => setFilter('all')}
                        className={`text-sm font-semibold whitespace-nowrap px-1 pb-1 border-b-2 transition-colors ${filter === 'all' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                      >
                        Tất cả {users.length}
                      </button>
                    );
                  }
                  const rInfo = REACTIONS.find(r => r.type === f);
                  if (!rInfo) return null;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap px-1 pb-1 border-b-2 transition-colors ${filter === f ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                      <span className="text-lg">{rInfo.emoji}</span>
                      <span>{reactionCounts[f]}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={onClose}
                className="p-2 ml-4 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="flex flex-col">
                  {filteredUsers.map(user => {
                    const rInfo = REACTIONS.find(r => r.type === user.reaction);
                    return (
                      <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-white/[0.03] rounded-xl transition-colors">
                        <div className="relative shrink-0 w-10 h-10">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.displayName} className={`w-full h-full rounded-full object-cover ${
                              user.purchasedItems?.includes('frame_dragon') ? 'border border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : ''
                            }`} />
                          ) : (
                            <div
                              className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                user.purchasedItems?.includes('frame_dragon') ? 'border border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : ''
                              }`}
                              style={{ backgroundColor: user.avatarColor || '#3b82f6' }}
                            >
                              {user.initials || user.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {user.purchasedItems?.includes('frame_dragon') && (
                            <div className="absolute -inset-1 border border-amber-500/50 rounded-full animate-pulse pointer-events-none" />
                          )}
                          {rInfo && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1a2332] flex items-center justify-center text-[10px] border border-[#1a2332]">
                              {rInfo.emoji}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className={`text-sm ${
                              user.purchasedItems?.includes('name_vip_red')
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] font-bold tracking-wide'
                                : 'font-semibold text-gray-200'
                            }`}>
                              {user.displayName}
                            </span>
                            {user.purchasedItems?.includes('badge_wizard') && (
                              <span className="text-xs drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse" title="Huy Hiệu Phù Thuỷ Dự Đoán">🌟</span>
                            )}
                            {currentUser?.id === user.id && (
                              <span className="text-gray-400 text-sm font-normal ml-1">
                                ({locale === 'vi' ? 'Bạn' : 'You'})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có ai bày tỏ cảm xúc.
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
