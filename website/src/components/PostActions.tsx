'use client';
import { useState, useRef } from 'react';
import { reactPost } from '@/lib/api';
import { toast } from 'react-hot-toast';
import ReactionListModal from './ReactionListModal';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'like',  emoji: '👍', label: 'Thích',      color: '#3b82f6' },
  { type: 'love',  emoji: '❤️', label: 'Yêu thích', color: '#ef4444' },
  { type: 'haha',  emoji: '😂', label: 'Haha',       color: '#f59e0b' },
  { type: 'wow',   emoji: '😮', label: 'Wow',        color: '#f59e0b' },
  { type: 'sad',   emoji: '😢', label: 'Buồn',       color: '#60a5fa' },
  { type: 'angry', emoji: '😡', label: 'Phẫn nộ',   color: '#f97316' },
];

interface PostActionsProps {
  postId: string;
  initialCount: number;
  initialReaction?: string | null;
  initialReactionCounts?: Record<string, number>;
  /** Extra buttons (Comment, Share, Bookmark…) placed inline after the reaction button */
  children?: React.ReactNode;
}

/**
 * Facebook-style post actions:
 *  ─ Summary row: stacked emoji circles + total count  (hidden when 0)
 *  ─ Divider
 *  ─ Action row: [👍 Thích] + {children}
 */
export default function PostActions({
  postId,
  initialCount,
  initialReaction = null,
  initialReactionCounts = {},
  children,
}: PostActionsProps) {
  const [myReaction, setMyReaction] = useState<string | null>(initialReaction);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(initialReactionCounts);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);

  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentReaction = REACTIONS.find(r => r.type === myReaction);

  // Top ≤ 3 reactions by count (for summary row)
  const topReactions = Object.entries(reactionCounts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => REACTIONS.find(r => r.type === type))
    .filter(Boolean) as typeof REACTIONS;

  /* ─── Hover handlers ─────────────────────────── */
  const onButtonEnter = () => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    hoverTimeout.current = setTimeout(() => setShowPicker(true), 500);
  };
  const onButtonLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    leaveTimeout.current = setTimeout(() => setShowPicker(false), 350);
  };
  const onPickerEnter = () => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
  };

  /* ─── React handler ──────────────────────────── */
  const handleReact = async (type: ReactionType | null) => {
    setShowPicker(false);
    if (isLoading) return;

    // Toggle off if same reaction
    const newReaction = type === myReaction ? null : type;
    const prev = { myReaction, totalCount, reactionCounts: { ...reactionCounts } };

    // Optimistic update
    setMyReaction(newReaction);
    const nc = { ...reactionCounts };
    if (prev.myReaction) nc[prev.myReaction] = Math.max(0, (nc[prev.myReaction] || 1) - 1);
    if (newReaction)     nc[newReaction]     = (nc[newReaction] || 0) + 1;
    setReactionCounts(nc);
    const delta = newReaction ? (prev.myReaction ? 0 : 1) : -1;
    setTotalCount(Math.max(0, prev.totalCount + delta));

    try {
      setIsLoading(true);
      const res = await reactPost(postId, newReaction);
      setTotalCount(res.likes);
      setMyReaction(res.myReaction ?? null);
      setReactionCounts(res.reactionCounts ?? {});
    } catch {
      // Rollback
      setMyReaction(prev.myReaction);
      setTotalCount(prev.totalCount);
      setReactionCounts(prev.reactionCounts);
      toast.error('Lỗi khi bày tỏ cảm xúc');
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Render ─────────────────────────────────── */
  return (
    <div className="w-full">

      {/* ── Summary row: stacked emojis + count ── */}
      {totalCount > 0 && (
        <div 
          className="flex items-center gap-2 py-2.5 select-none cursor-pointer hover:bg-white/[0.03] rounded-lg px-2 -mx-2 transition-colors"
          onClick={() => setShowReactionsModal(true)}
        >
          {/* Overlapping emoji circles */}
          <div className="flex -space-x-1.5">
            {topReactions.map((r, i) => (
              <span
                key={r.type}
                title={`${reactionCounts[r.type] ?? 0} ${r.label}`}
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[13px]
                           bg-[#1e2c3a] border-2 border-[#0d1017] shadow-sm"
                style={{ zIndex: 10 - i }}
              >
                {r.emoji}
              </span>
            ))}
          </div>
          <span className="text-gray-400 text-[13px]">{totalCount}</span>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="h-px bg-white/[0.06]" />

      {/* ── Action row ── */}
      <div className="flex items-center">

        {/* Reaction button + hover picker */}
        <div
          className="relative"
          onMouseEnter={onButtonEnter}
          onMouseLeave={onButtonLeave}
        >
          {/* ── Emoji picker popup ── */}
          {showPicker && (
            <div
              className="absolute bottom-full left-0 mb-2 z-50"
              onMouseEnter={onPickerEnter}
              onMouseLeave={onButtonLeave}
            >
              <div className="flex items-end gap-1.5 bg-[#1a2332]/95 border border-white/[0.12]
                              rounded-full px-4 py-2.5 shadow-2xl backdrop-blur-xl">
                {REACTIONS.map((r, i) => (
                  <button
                    key={r.type}
                    onClick={() => handleReact(r.type)}
                    className="relative group/r outline-none"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <span
                      className={`text-[28px] leading-none block transition-all duration-150
                                  hover:-translate-y-2 hover:scale-[1.3]
                                  ${myReaction === r.type ? 'scale-110' : ''}`}
                    >
                      {r.emoji}
                    </span>
                    {/* Label tooltip */}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                                     bg-black/90 text-white text-[10px] px-2 py-0.5 rounded-full
                                     opacity-0 group-hover/r:opacity-100 transition-opacity
                                     pointer-events-none">
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Main reaction button ── */}
          <button
            onClick={() => handleReact(myReaction === 'like' ? null : 'like')}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                        transition-all duration-200 hover:bg-white/[0.08] active:scale-[0.96]
                        select-none outline-none min-w-[80px]
                        ${myReaction ? '' : 'text-gray-400 hover:text-gray-200'}`}
            style={myReaction ? { color: currentReaction?.color } : {}}
          >
            {myReaction ? (
              <span className="text-[18px] leading-none">{currentReaction?.emoji}</span>
            ) : (
              /* Clean thumbs-up outline icon */
              <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11m7-1v10M7 20a2 2 0 01-2-2v-6a2 2 0 012-2h2.924" />
              </svg>
            )}
            <span>{myReaction ? currentReaction?.label : 'Thích'}</span>
          </button>
        </div>

        {/* Injected comment / share / bookmark buttons */}
        {children}
      </div>

      <ReactionListModal
        isOpen={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        postId={postId}
      />
    </div>
  );
}
