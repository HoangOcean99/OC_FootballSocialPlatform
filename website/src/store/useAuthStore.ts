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
  favoriteCompetitions: string[];
  joinedCommunities: string[];
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
  toggleFavoriteCompetition: (name: string) => Promise<void>;
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
      toggleFavoriteCompetition: async (name: string) => {
        const { user, token } = useAuthStore.getState();
        if (!user || !token) return;

        const isFollowing = user.favoriteCompetitions?.includes(name);
        
        // Optimistic UI update
        set((state) => ({
          user: state.user ? {
            ...state.user,
            favoriteCompetitions: isFollowing 
              ? state.user.favoriteCompetitions.filter(n => n !== name)
              : [...(state.user.favoriteCompetitions || []), name]
          } : null
        }));

        try {
          const res = await fetch(`http://localhost:3001/api/users/me/favorites/competitions/${encodeURIComponent(name)}`, {
            method: isFollowing ? 'DELETE' : 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            set((state) => ({
              user: state.user ? { ...state.user, favoriteCompetitions: data.favoriteCompetitions } : null
            }));
          }
        } catch (error) {
          console.error('Failed to toggle favorite competition:', error);
          // Revert on failure (could be improved)
        }
      }
    }),
    { name: 'footballverse-auth' }
  )
);
