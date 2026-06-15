'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  level: string;
  xp: number;
  favoriteClubs: string[];
  favoriteNationalTeams: string[];
  onboardingCompleted: boolean;
  tier: 'REGULAR' | 'PLUS';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('footballverse_token', token);
        Cookies.set('footballverse_token', token, { expires: 7, path: '/' });
        set({ user, token, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem('footballverse_token');
        Cookies.remove('footballverse_token', { path: '/' });
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    { name: 'footballverse-auth' }
  )
);
