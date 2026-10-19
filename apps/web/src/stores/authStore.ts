import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  name?: string;
  grade: number;
  xp: number;
  level: number;
  isGuest?: boolean;
  avatar?: string;
  coins?: number;
  streak?: number;
  badges?: string[];
}

export type UserProfile = User;

interface AuthState {
  user: User | null;
  token: string | null;
  isOnline: boolean;
  isAuthenticated?: boolean;
  setUser: (user: User, token?: string) => void;
  setGuest: (user: User, token: string) => void;
  logout: () => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
  updateUser: (updates: Partial<User>) => void;
  initGuest: () => void;
  setOnline: (online: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isAuthenticated: false,
      setUser: (user, token = '') =>
        set({ user: { ...user, name: user.name || user.username }, token, isAuthenticated: true }),
      setGuest: (user, token) =>
        set({ user: { ...user, name: user.name || user.username }, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      addXP: (amount) => {
        const user = get().user;
        if (!user) return;
        const newXP = user.xp + amount;
        const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
        set({ user: { ...user, xp: newXP, level: newLevel } });
      },
      addCoins: (amount) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, coins: (user.coins || 0) + amount } });
      },
      unlockBadge: (badgeId) => {
        const user = get().user;
        if (!user) return;
        const badges = user.badges || [];
        if (badges.includes(badgeId)) return;
        set({ user: { ...user, badges: [...badges, badgeId] } });
      },
      updateUser: (updates) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, ...updates } });
      },
      initGuest: () => {
        if (!get().user) {
          const guestId = 'guest-' + Math.random().toString(36).slice(2, 10);
          set({
            user: {
              id: guestId,
              username: 'Explorer',
              name: 'Explorer',
              grade: 8,
              xp: 0,
              level: 1,
              isGuest: true,
              coins: 0,
              streak: 1,
              badges: [],
            },
            token: 'guest',
            isAuthenticated: true,
          });
        }
      },
      setOnline: (online) => set({ isOnline: online }),
    }),
    { name: 'vidyaverse-auth' }
  )
);
