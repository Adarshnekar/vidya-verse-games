/**
 * authStore.ts
 * Zustand store for authentication state.
 *
 * Offline-first changes:
 * - Added `authReady`: set to true once Firebase resolves initial auth state.
 *   Protected routes must not render until authReady is true — this prevents
 *   a flash redirect to /login during Firebase's initialization delay.
 * - logout() now calls Firebase signOut() so the intentional logout is distinct
 *   from a network failure (which must NOT clear auth state).
 * - isOnline tracks network connectivity independently from auth state.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signOut as firebaseSignOut, auth, db, doc, updateDoc, serverTimestamp } from '../lib/firebase';

export interface User {
  id: string;
  username: string;
  name?: string;
  studentId?: string;
  role?: string;
  board?: string;
  grade: number;
  xp: number;
  level: number;
  isGuest?: boolean;
  avatar?: string;
  coins?: number;
  streak?: number;
  badges?: string[];
  email?: string;
}

export type UserProfile = User;

interface AuthState {
  user: User | null;
  token: string | null;
  isOnline: boolean;
  /** True once Firebase onAuthStateChanged has fired its first event.
   *  Prevents protected routes from rendering before auth is resolved. */
  authReady: boolean;
  isAuthenticated?: boolean;
  setUser: (user: User, token?: string) => void;
  setGuest: (user: User, token: string) => void;
  /** Intentional logout: calls Firebase signOut then clears local state.
   *  This is the ONLY path that clears auth — network failures do not. */
  logout: () => Promise<void>;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
  updateUser: (updates: Partial<User>) => void;
  initGuest: () => void;
  setOnline: (online: boolean) => void;
  setAuthReady: (ready: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      authReady: false,
      isAuthenticated: false,

      setUser: (user, token = '') =>
        set({ user: { ...user, name: user.name || user.username }, token, isAuthenticated: true }),

      setGuest: (user, token) =>
        set({ user: { ...user, name: user.name || user.username }, token, isAuthenticated: true }),

      logout: async () => {
        // Always attempt Firebase signOut; ignore errors (e.g. already signed out)
        try {
          await firebaseSignOut(auth);
        } catch (e) {
          // Non-fatal — clear local state regardless
          console.warn('[Auth] Firebase signOut error (non-fatal):', e);
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      addXP: (amount) => {
        const user = get().user;
        if (!user) return;
        const newXP = user.xp + amount;
        const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
        set({ user: { ...user, xp: newXP, level: newLevel } });

        // Sync to Firestore if authenticated
        if (auth.currentUser && auth.currentUser.uid === user.id) {
          updateDoc(doc(db, 'users', user.id), {
            xp: newXP,
            level: newLevel,
            updatedAt: serverTimestamp(),
          }).catch((err) => console.warn('[Firestore] sync addXP failed:', err));
        }
      },

      addCoins: (amount) => {
        const user = get().user;
        if (!user) return;
        const newCoins = (user.coins || 0) + amount;
        set({ user: { ...user, coins: newCoins } });

        if (auth.currentUser && auth.currentUser.uid === user.id) {
          updateDoc(doc(db, 'users', user.id), {
            coins: newCoins,
            updatedAt: serverTimestamp(),
          }).catch((err) => console.warn('[Firestore] sync addCoins failed:', err));
        }
      },

      unlockBadge: (badgeId) => {
        const user = get().user;
        if (!user) return;
        const badges = user.badges || [];
        if (badges.includes(badgeId)) return;
        const newBadges = [...badges, badgeId];
        set({ user: { ...user, badges: newBadges } });

        if (auth.currentUser && auth.currentUser.uid === user.id) {
          updateDoc(doc(db, 'users', user.id), {
            badges: newBadges,
            updatedAt: serverTimestamp(),
          }).catch((err) => console.warn('[Firestore] sync unlockBadge failed:', err));
        }
      },

      updateUser: (updates) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, ...updates } });

        if (auth.currentUser && auth.currentUser.uid === user.id) {
          updateDoc(doc(db, 'users', user.id), {
            ...updates,
            updatedAt: serverTimestamp(),
          }).catch((err) => console.warn('[Firestore] sync updateUser failed:', err));
        }
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

      setAuthReady: (ready) => set({ authReady: ready }),
    }),
    {
      name: 'vidyaverse-auth',
      // Don't persist authReady or isOnline — these are runtime states
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
