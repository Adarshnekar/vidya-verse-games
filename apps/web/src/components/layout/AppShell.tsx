/**
 * AppShell.tsx
 * Main layout wrapper for all authenticated/app routes.
 *
 * Offline-first changes:
 * - Replaced inline online/offline event listeners with useNetworkStatus hook.
 * - Syncs isOnline state to authStore (for AppHeader badge) using the hook.
 * - Renders <OfflineBanner> at the top of the viewport — visible on all pages.
 * - Network disconnection does NOT trigger any redirect or auth state change.
 * - Route persistence is automatic: React Router preserves the current URL
 *   unless the user explicitly navigates away.
 */
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { CommandPalette } from './CommandPalette';
import { OfflineBanner } from './OfflineBanner';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useNetworkStatus } from '../../lib/useNetworkStatus';

export function AppShell() {
  const { setOnline } = useAuthStore();
  const { applyDOMTokens } = useUIStore();
  const location = useLocation();

  // Centralized, reliable network detection via dedicated hook
  const { isOnline } = useNetworkStatus();

  // Sync network status into authStore (AppHeader reads isOnline from there)
  useEffect(() => {
    setOnline(isOnline);
  }, [isOnline, setOnline]);

  // Apply DOM tokens (theme + enlarged text mode) on mount
  useEffect(() => {
    applyDOMTokens();
  }, [applyDOMTokens]);

  // Full-bleed workstation detection: routes requiring maximum canvas / IDE space
  const isWorkstation =
    location.pathname.startsWith('/playlab/ludo') ||
    location.pathname.startsWith('/playlab/solar') ||
    location.pathname.startsWith('/playlab/human-body') ||
    location.pathname.startsWith('/playlab/physics-playground') ||
    location.pathname.startsWith('/circuitverse') ||
    location.pathname.startsWith('/codeverse/challenge') ||
    location.pathname.startsWith('/codeverse/learn');

  return (
    <>
      {/* Offline / Reconnected banner — fixed to top of viewport, above everything */}
      <OfflineBanner isOnline={isOnline} />

      <div className="flex h-screen w-full bg-canvas text-text-primary overflow-hidden transition-colors duration-200">
        {/* Navigation Sidebar (Desktop + Mobile Drawer) */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Sticky Top Header Bar */}
          <AppHeader />

          {/* Global Viewport: Workstation (Full-bleed) vs Document (Max-w-7xl) */}
          {isWorkstation ? (
            <main
              className={`flex-1 overflow-hidden flex flex-col ${
                location.pathname.startsWith('/playlab/ludo') ||
                location.pathname.startsWith('/playlab/solar') ||
                location.pathname.startsWith('/playlab/human-body') ||
                location.pathname.startsWith('/playlab/physics-playground')
                  ? 'p-0'
                  : 'p-2 sm:p-3'
              }`}
              id="main-content"
            >
              <Outlet />
            </main>
          ) : (
            <main className="flex-1 overflow-y-auto" id="main-content">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-20 lg:pb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          )}

          {/* Mobile Sticky Bottom Navigation Bar (Hidden in full-bleed workstation modes) */}
          {!isWorkstation && <BottomNav />}
        </div>

        {/* Floating Centered Command Palette */}
        <CommandPalette />
      </div>
    </>
  );
}
