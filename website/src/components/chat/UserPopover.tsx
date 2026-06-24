'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/useChatStore';
import { User, MessageCircle } from 'lucide-react';

interface UserPopoverProps {
  user: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    initials?: string;
  };
  children: React.ReactNode;
}

export default function UserPopover({ user, children }: UserPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { openChat } = useChatStore();

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleProfileClick = () => {
    setIsOpen(false);
    router.push(`/profile/${user.username}`);
  };

  const handleMessageClick = () => {
    setIsOpen(false);
    openChat({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      initials: user.initials
    });
  };

  return (
    <div className="relative inline-block w-full" ref={popoverRef}>
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full"
      >
        {children}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 bg-[#0f1923] border border-white/10 rounded-xl p-1 shadow-xl left-0 top-full">
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <p className="text-sm font-bold text-white truncate">{user.displayName || user.username}</p>
            <p className="text-[10px] text-gray-500 truncate">@{user.username}</p>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleProfileClick(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <User className="w-4 h-4" />
            Trang cá nhân
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleMessageClick(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors font-medium mt-1"
          >
            <MessageCircle className="w-4 h-4" />
            Nhắn tin
          </button>
        </div>
      )}
    </div>
  );
}
