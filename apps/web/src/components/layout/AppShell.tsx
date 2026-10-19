import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Gamepad2, Cpu, Code2, Home, Menu, X, Zap, User,
  Star, Trophy, Wifi, WifiOff, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/playlab', label: 'PlayLab', icon: Gamepad2, color: 'text-playlab-400', bg: 'bg-playlab-500/10 border-playlab-500/30', dot: 'bg-playlab-400' },
  { to: '/circuitverse', label: 'CircuitVerse', icon: Cpu, color: 'text-circuit-400', bg: 'bg-circuit-500/10 border-circuit-500/30', dot: 'bg-circuit-400' },
  { to: '/codeverse', label: 'CodeVerse', icon: Code2, color: 'text-code-400', bg: 'bg-code-500/10 border-code-500/30', dot: 'bg-code-400' },
];

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isOnline, setOnline } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-surface-900 overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside
        className={clsx(
          'fixed left-0 top-0 h-full w-64 bg-surface-800 border-r border-surface-700 flex flex-col z-50 lg:hidden'
        )}
        initial={false}
        animate={{ translateX: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Logo */}
        <div className="p-4 border-b border-surface-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-code-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-surface-50">VidyaVerse</div>
              <div className="text-[10px] text-surface-400 uppercase tracking-wider">Explore & Labs</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-icon p-1" aria-label="Close menu">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? clsx('bg-surface-700 border', item.bg || 'bg-brand-500/10 border-brand-500/30', item.color || 'text-brand-400')
                  : 'text-surface-400 hover:text-surface-100 hover:bg-surface-700/50'
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={clsx('w-5 h-5 flex-shrink-0', isActive ? (item.color || 'text-brand-400') : '')} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
                  {!isActive && item.dot && (
                    <span className={clsx('w-1.5 h-1.5 rounded-full opacity-40 group-hover:opacity-70', item.dot)} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User panel */}
        <div className="p-3 border-t border-surface-700">
          {/* Online indicator */}
          <div className="flex items-center gap-2 mb-3 px-2">
            {isOnline
              ? <><Wifi className="w-3.5 h-3.5 text-circuit-400" /><span className="text-xs text-surface-400">Online</span></>
              : <><WifiOff className="w-3.5 h-3.5 text-red-400" /><span className="text-xs text-red-400">Offline</span></>}
          </div>
          
          {user && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-700/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-code-500 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-surface-100 truncate">{user.username}</div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-surface-400">{user.xp.toLocaleString()} XP</span>
                  <span className="text-xs text-surface-500">·</span>
                  <Trophy className="w-3 h-3 text-playlab-400" />
                  <span className="text-xs text-surface-400">Lv.{user.level}</span>
                </div>
              </div>
              {user.isGuest && <span className="badge badge-brand text-[10px]">Guest</span>}
            </div>
          )}
        </div>
      </motion.aside>

      {/* Desktop sidebar - always visible */}
      <aside className="hidden lg:flex w-64 bg-surface-800 border-r border-surface-700 flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-surface-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-code-500 flex items-center justify-center shadow-glow-brand">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-surface-50">VidyaVerse</div>
              <div className="text-[10px] text-surface-400 uppercase tracking-wider">Explore & Labs 2.0</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? clsx('border', item.bg || 'bg-brand-500/10 border-brand-500/30', item.color || 'text-brand-400')
                  : 'text-surface-400 hover:text-surface-100 hover:bg-surface-700/50'
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={clsx('w-5 h-5 flex-shrink-0 transition-colors', isActive ? (item.color || 'text-brand-400') : '')} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <motion.div layoutId="nav-indicator" className={clsx('w-1.5 h-1.5 rounded-full', item.dot || 'bg-brand-400')} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-700 space-y-2">
          <div className="flex items-center gap-2 px-2">
            {isOnline
              ? <><div className="w-1.5 h-1.5 rounded-full bg-circuit-400 animate-pulse" /><span className="text-xs text-surface-400">Connected</span></>
              : <><div className="w-1.5 h-1.5 rounded-full bg-red-400" /><span className="text-xs text-red-400">Offline Mode</span></>}
          </div>
          {user && (
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-700/50 border border-surface-600/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-code-500 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-surface-100 truncate">{user.username}</div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-yellow-400 font-medium">{user.xp.toLocaleString()} XP</span>
                  <span className="text-xs text-surface-500">·</span>
                  <span className="text-xs text-surface-400">Lv.{user.level}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-surface-800 border-b border-surface-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-icon"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-code-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-bold text-surface-50 text-sm">VidyaVerse</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" id="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
