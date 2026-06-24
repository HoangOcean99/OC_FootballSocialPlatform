import { create } from 'zustand';

export interface ChatUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  initials?: string;
}

interface ChatState {
  activeChats: ChatUser[];
  minimizedChats: string[]; // array of user IDs
  openChat: (user: ChatUser) => void;
  closeChat: (userId: string) => void;
  toggleMinimize: (userId: string) => void;
}

const MAX_ACTIVE_CHATS = 3;

export const useChatStore = create<ChatState>((set) => ({
  activeChats: [],
  minimizedChats: [],
  
  openChat: (user) => set((state) => {
    const isAlreadyOpen = state.activeChats.some(chat => chat.id === user.id);
    
    // If it's already open, make sure it's not minimized
    if (isAlreadyOpen) {
      return {
        minimizedChats: state.minimizedChats.filter(id => id !== user.id)
      };
    }
    
    // If we reached max chats, remove the oldest one (first in array)
    const newChats = [...state.activeChats];
    if (newChats.length >= MAX_ACTIVE_CHATS) {
      newChats.shift();
    }
    
    newChats.push(user);
    
    return {
      activeChats: newChats,
      minimizedChats: state.minimizedChats.filter(id => id !== user.id)
    };
  }),
  
  closeChat: (userId) => set((state) => ({
    activeChats: state.activeChats.filter(chat => chat.id !== userId),
    minimizedChats: state.minimizedChats.filter(id => id !== userId)
  })),
  
  toggleMinimize: (userId) => set((state) => {
    const isMinimized = state.minimizedChats.includes(userId);
    return {
      minimizedChats: isMinimized 
        ? state.minimizedChats.filter(id => id !== userId)
        : [...state.minimizedChats, userId]
    };
  })
}));
