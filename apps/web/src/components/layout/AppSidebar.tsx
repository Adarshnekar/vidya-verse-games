import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Cpu,
  Code2,
  Home,
  Zap,
  User,
  Star,
  Trophy,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    icon: Home,
    exact: true,
    accent: '#6541F5',
    pill: 'Overview',
  },
  {
    to: '/playlab',
    label: 'PlayLab',
    icon: Gamepad2,
    accent: '#F5A623',
    pill: '4 Games',
    pillBg: 'text-[#F5A623] bg-[#FFF0D5] dark:bg-[#35250D]',
  },
  {
    to: '/circuitverse',
    label: 'CircuitVerse',
    icon: Cpu,
    accent: '#19B99A',
    pill: '10 Labs',
    pillBg: 'text-[#19B99A] bg-[#DDF8EE] dark:bg-[#0D2E26]',
  },
  {
    to: '/codeverse',
    label: 'CodeVerse',
    icon: Code2,
    accent: '#6541F5',
    pill: '50+ Problems',
    pillBg: 'text-[#6541F5] bg-[#EAE7FF] dark:bg-[#2A244D]',
  },
];

export function AppSidebar() {
  const { user } = useAuthStore();
  const {
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    isMobileDrawerOpen,
    setMobileDrawerOpen,
  } = useUIStore();
  const location = useLocation();

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer (Slide-over) */}
      <motion.aside
        className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col z-50 lg:hidden shadow-game"
        initial={false}
        animate={{ translateX: isMobileDrawerOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      >
        {/* Header */}
        <div className="h-16 px-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6541F5] to-[#5230E8] flex items-center justify-center shadow-md shadow-[#6541F5]/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-base text-text-primary tracking-tight">VidyaVerse</div>
              <div className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Explore & Labs 2.0</div>
            </div>
          </div>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setMobileDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#EAE7FF] text-[#5230E8] dark:bg-[#26233E] dark:text-[#C4B5FD] shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive
                        ? 'bg-[#6541F5] text-white shadow-sm'
                        : 'bg-canvas text-text-muted'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {item.pill && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.pillBg || 'bg-[#EAE7FF] text-[#6541F5] dark:bg-[#26233E] dark:text-[#C4B5FD]'
                      }`}
                    >
                      {item.pill}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        {user && (
          <div className="p-4 border-t border-border bg-canvas/40">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border shadow-soft">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6541F5] to-[#5230E8] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-text-primary truncate">{user.username}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono font-semibold text-[#F5A623]">{user.xp.toLocaleString()} XP</span>
                  <span className="text-text-muted text-xs">·</span>
                  <span className="text-xs font-medium text-text-muted">Lv.{user.level}</span>
                </div>
              </div>
              {user.isGuest && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE7FF] text-[#6541F5] dark:bg-[#26233E] dark:text-[#C4B5FD]">
                  Guest
                </span>
              )}
            </div>
          </div>
        )}
      </motion.aside>

      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 px-4 border-b border-border flex items-center justify-between">
          <div className={`flex items-center gap-3 overflow-hidden ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6541F5] to-[#5230E8] flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#6541F5]/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <div className="font-display font-bold text-base text-text-primary tracking-tight">VidyaVerse</div>
                <div className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Explore & Labs 2.0</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Desktop navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              title={isSidebarCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-[#EAE7FF] text-[#5230E8] dark:bg-[#26233E] dark:text-[#C4B5FD] shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#6541F5] text-white shadow-sm'
                        : 'text-text-muted group-hover:text-text-primary group-hover:bg-black/5 dark:group-hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                  </div>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.pill && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.pillBg || 'bg-[#EAE7FF] text-[#6541F5] dark:bg-[#26233E] dark:text-[#C4B5FD]'
                          }`}
                        >
                          {item.pill}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="w-1.5 h-1.5 rounded-full bg-[#6541F5] dark:bg-[#7C5CFA]"
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Collapse Toggle Bar */}
        <div className="px-3 py-2 border-t border-border">
          <button
            onClick={toggleSidebarCollapsed}
            className={`w-full flex items-center gap-2 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs font-medium ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        </div>

        {/* User Profile Footer */}
        {user && (
          <div className="p-3 border-t border-border bg-canvas/30">
            <div
              className={`flex items-center gap-2.5 p-2 rounded-xl bg-card border border-border shadow-soft ${
                isSidebarCollapsed ? 'justify-center p-1.5' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6541F5] to-[#5230E8] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <User className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-text-primary truncate">{user.username}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <span className="font-mono text-[#F5A623] font-semibold">{user.xp.toLocaleString()} XP</span>
                    <span>·</span>
                    <span>Lv.{user.level}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
