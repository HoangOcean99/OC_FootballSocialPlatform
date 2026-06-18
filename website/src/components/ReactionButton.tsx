'use client';
import { useState, useRef } from 'react';
import { reactPost } from '@/lib/api';
import { toast } from 'react-hot-toast';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'like',  emoji: '👍', label: 'Thích',       color: '#3b82f6' },
  { type: 'love',  emoji: '❤️', label: 'Yêu thích',  color: '#ef4444' },
  { type: 'haha',  emoji: '😂', label: 'Haha',        color: '#f59e0b' },
  { type: 'wow',   emoji: '😮', label: 'Wow',         color: '#f59e0b' },
  { type: 'sad',   emoji: '😢', label: 'Buồn',        color: '#3b82f6' },
  { type: 'angry', emoji: '😡', label: 'Phẫn nộ',    color: '#ef4444' },
];

interface ReactionButtonProps {
  postId: string;
  initialCount: number;
  initialReaction?: string | null;
  initialReactionCounts?: Record<string, number>;
  size?: 'sm' | 'md';
}

export default function ReactionButton({
  postId,
  initialCount,
  initialReaction = null,
  initialReactionCounts = {},
  size = 'md',
}: ReactionButtonProps) {
  const [myReaction, setMyReaction] = useState<string | null>(initialReaction);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [reactionCounts, setReactionCounts] = useState(initialReactionCounts);
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const pickerTimeout = useRef<NodeJS.Timeout | null>(null);

  const currentReaction = REACTIONS.find(r => r.type === myReaction);

  const handleMouseEnter = () => {
    if (pickerTimeout.current) clearTimeout(pickerTimeout.current);
    hoverTimeout.current = setTimeout(() => setShowPicker(true), 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    pickerTimeout.current = setTimeout(() => setShowPicker(false), 300);
  };

  const handleReact = async (type: ReactionType | null) => {
    setShowPicker(false);
    if (isLoading) return;
    
    const newReaction = type === myReaction ? null : type;
    
    // Optimistic update
    const oldReaction = myReaction;
    const oldCount = likeCount;
    const oldCounts = { ...reactionCounts };

    setMyReaction(newReaction);

    const newCounts = { ...reactionCounts };
    if (oldReaction) newCounts[oldReaction] = Math.max(0, (newCounts[oldReaction] || 1) - 1);
    if (newReaction) newCounts[newReaction] = (newCounts[newReaction] || 0) + 1;
    setReactionCounts(newCounts);

    const newCount = oldReaction
      ? (newReaction ? oldCount : oldCount - 1)
      : oldCount + 1;
    setLikeCount(Math.max(0, newCount));

    try {
      setIsLoading(true);
      const result = await reactPost(postId, newReaction);
      setLikeCount(result.likes);
      setMyReaction(result.myReaction);
      setReactionCounts(result.reactionCounts || {});
    } catch (err) {
      // Rollback
      setMyReaction(oldReaction);
      setLikeCount(oldCount);
      setReactionCounts(oldCounts);
      toast.error('Lỗi khi bày tỏ cảm xúc');
    } finally {
      setIsLoading(false);
    }
  };

  // Top 3 reactions to display next to count
  const topReactions = Object.entries(reactionCounts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => REACTIONS.find(r => r.type === type)?.emoji)
    .filter(Boolean);

  const iconSize = size === 'sm' ? 'text-base' : 'text-lg';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reaction Picker Popup */}
      {showPicker && (
        <div
          className="absolute bottom-full left-0 mb-2 z-50"
          onMouseEnter={() => { if (pickerTimeout.current) clearTimeout(pickerTimeout.current); }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-1 bg-[#1a2332] border border-white/10 rounded-full px-3 py-2 shadow-2xl backdrop-blur-xl">
            {REACTIONS.map(r => (
              <button
                key={r.type}
                onClick={() => handleReact(r.type)}
                title={r.label}
                className={`relative group/r flex flex-col items-center transition-transform duration-150 hover:scale-125 ${myReaction === r.type ? 'scale-110' : ''}`}
              >
                <span className="text-2xl leading-none">{r.emoji}</span>
                {/* Tooltip */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover/r:opacity-100 transition-opacity pointer-events-none">
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => {
          if (!showPicker) {
            // Quick tap = like (or remove if already liked)
            handleReact(myReaction === 'like' ? null : 'like');
          }
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all duration-200 select-none
          ${myReaction
            ? 'bg-white/[0.08] hover:bg-white/[0.12]'
            : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
          } ${textSize}`}
        style={myReaction ? { color: currentReaction?.color } : {}}
        disabled={isLoading}
      >
        <span className={iconSize}>
          {currentReaction ? currentReaction.emoji : '👍'}
        </span>
        
        {/* Top reaction emojis */}
        {topReactions.length > 0 && !myReaction && (
          <span className="flex -space-x-1 mr-0.5">
            {topReactions.map((emoji, i) => (
              <span key={i} className="text-xs">{emoji}</span>
            ))}
          </span>
        )}

        <span>{myReaction ? currentReaction?.label : 'Thích'}</span>
        {likeCount > 0 && (
          <span className={`ml-0.5 ${myReaction ? 'opacity-100' : 'opacity-70'}`}>
            {likeCount}
          </span>
        )}
      </button>
    </div>
  );
}
