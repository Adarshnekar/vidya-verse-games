import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'light' | 'dark';
export type AppLanguage = 'English' | 'हिन्दी' | 'தமிழ்' | 'తెలుగు' | 'বাংলা';
export type AppRole = 'Student' | 'Teacher' | 'Explorer';

interface UIState {
  theme: AppTheme;
  isSidebarCollapsed: boolean;
  isMobileDrawerOpen: boolean;
  isEnlargedText: boolean;
  isCommandPaletteOpen: boolean;
  language: AppLanguage;
  role: AppRole;
  
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileDrawerOpen: (open: boolean) => void;
  toggleEnlargedText: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setLanguage: (lang: AppLanguage) => void;
  setRole: (role: AppRole) => void;
  applyDOMTokens: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      isSidebarCollapsed: false,
      isMobileDrawerOpen: false,
      isEnlargedText: false,
      isCommandPaletteOpen: false,
      language: 'English',
      role: 'Student',

      toggleTheme: () => {
        const nextTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: nextTheme });
        get().applyDOMTokens();
      },

      setTheme: (theme) => {
        set({ theme });
        get().applyDOMTokens();
      },

      toggleSidebarCollapsed: () => {
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed) => {
        set({ isSidebarCollapsed: collapsed });
      },

      setMobileDrawerOpen: (open) => {
        set({ isMobileDrawerOpen: open });
      },

      toggleEnlargedText: () => {
        const next = !get().isEnlargedText;
        set({ isEnlargedText: next });
        if (typeof document !== 'undefined') {
          if (next) {
            document.documentElement.classList.add('text-enlarged');
          } else {
            document.documentElement.classList.remove('text-enlarged');
          }
        }
      },

      setCommandPaletteOpen: (open) => {
        set({ isCommandPaletteOpen: open });
      },

      setLanguage: (language) => {
        set({ language });
      },

      setRole: (role) => {
        set({ role });
      },

      applyDOMTokens: () => {
        if (typeof document === 'undefined') return;
        const currentTheme = get().theme;
        if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        if (get().isEnlargedText) {
          document.documentElement.classList.add('text-enlarged');
        } else {
          document.documentElement.classList.remove('text-enlarged');
        }
      },
    }),
    {
      name: 'vidyaverse-ui',
      onRehydrateStorage: () => (state) => {
        state?.applyDOMTokens();
      },
    }
  )
);
