import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProgressItem {
  module: string;
  itemId: string;
  completed: boolean;
  score?: number;
  attempts: number;
  lastAttempt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

interface ProgressState {
  items: ProgressItem[];
  achievements: Achievement[];
  streak: number;
  lastActiveDate: string | null;
  markCompleted: (module: string, itemId: string, score?: number) => void;
  addAchievement: (achievement: Omit<Achievement, 'earnedAt'>) => void;
  hasAchievement: (id: string) => boolean;
  updateStreak: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      items: [],
      achievements: [],
      streak: 0,
      lastActiveDate: null,
      markCompleted: (module, itemId, score) => {
        const existing = get().items.find(i => i.module === module && i.itemId === itemId);
        if (existing) {
          set(s => ({
            items: s.items.map(i =>
              i.module === module && i.itemId === itemId
                ? { ...i, completed: true, score, attempts: i.attempts + 1, lastAttempt: new Date().toISOString() }
                : i
            ),
          }));
        } else {
          set(s => ({
            items: [...s.items, { module, itemId, completed: true, score, attempts: 1, lastAttempt: new Date().toISOString() }],
          }));
        }
      },
      addAchievement: (achievement) => {
        if (get().hasAchievement(achievement.id)) return;
        set(s => ({ achievements: [...s.achievements, { ...achievement, earnedAt: new Date().toISOString() }] }));
      },
      hasAchievement: (id) => get().achievements.some(a => a.id === id),
      updateStreak: () => {
        const today = new Date().toDateString();
        const lastDate = get().lastActiveDate;
        if (lastDate === today) return;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        set(s => ({
          streak: lastDate === yesterday ? s.streak + 1 : 1,
          lastActiveDate: today,
        }));
      },
    }),
    { name: 'vidyaverse-progress' }
  )
);
