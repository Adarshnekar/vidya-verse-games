import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Flame,
  Zap,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Type,
  Globe,
  UserCheck,
  ChevronDown,
  Sparkles,
  LogIn,
  LogOut,
  User as UserIcon,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';
import { useUIStore, AppLanguage, AppRole } from '../../stores/uiStore';

const LANGUAGES: AppLanguage[] = ['English', 'हिन्दी', 'தமிழ்', 'తెలుగు', 'বাংলা'];
const ROLES: AppRole[] = ['Student', 'Teacher', 'Explorer'];

export function AppHeader() {
  const { user, isOnline, logout } = useAuthStore();
  const { streak } = useProgressStore();
  const {
    theme,
    toggleTheme,
    isEnlargedText,
    toggleEnlargedText,
    language,
    setLanguage,
    role,
    setRole,
    setCommandPaletteOpen,
    setMobileDrawerOpen,
  } = useUIStore();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const effectiveStreak = streak > 0 ? streak : (user?.streak || 3);
  const effectiveXP = user?.xp !== undefined ? user.xp : 450;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/80 backdrop-blur-md transition-colors duration-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section: Mobile Menu Button & Command Search Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-[#6541F5]"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search / Command Palette Bar */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex-1 flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-xl bg-canvas border border-border text-text-muted hover:text-text-primary hover:border-[#6541F5]/40 transition-all text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-[#6541F5]"
            title="Press Cmd+K or Ctrl+K to search"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
              <span className="truncate">Search games, labs, problems...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-card border border-border text-[10px] font-mono text-text-muted">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Section: Gamification Badges, Network Pill, Language, Role & Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Streak Badge (Pink: #E95778, Bg: #FCE5EB) */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FCE5EB] text-[#E95778] dark:bg-[#381521] dark:text-[#FFA0B6] transition-colors"
            title={`${effectiveStreak} day learning streak!`}
          >
            <Flame className="w-3.5 h-3.5 fill-[#E95778] text-[#E95778]" />
            <span className="font-mono font-bold">{effectiveStreak}</span>
            <span className="hidden sm:inline text-[11px] font-medium opacity-80">days</span>
          </div>

          {/* XP Counter Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAE7FF] text-[#5230E8] dark:bg-[#26233E] dark:text-[#C4B5FD] transition-colors"
            title={`${effectiveXP} total experience points`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="font-mono font-bold">{effectiveXP.toLocaleString()}</span>
            <span className="hidden sm:inline text-[11px] font-medium opacity-80">XP</span>
          </div>

          {/* Network Status Pill (Online / Success Green: #28B987) */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-[#DDF8EE] text-[#19B99A] border-[#19B99A]/20 dark:bg-[#0D2E26] dark:text-[#28B987]'
                : 'bg-red-50 text-red-500 border-red-200 dark:bg-red-950/40 dark:text-red-400'
            }`}
            title={isOnline ? 'Online mode active' : 'Offline mode active'}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#28B987] animate-pulse" />
                <span className="text-[11px] font-semibold">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[11px] font-semibold">Offline</span>
              </>
            )}
          </div>

          {/* Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs font-medium focus-visible:ring-2 focus-visible:ring-[#6541F5]"
              title="Select interface language"
            >
              <Globe className="w-4 h-4 text-text-muted" />
              <span className="hidden lg:inline">{language}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-xl shadow-game py-1 z-40">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors flex items-center justify-between ${
                      language === lang
                        ? 'font-semibold text-[#6541F5] bg-[#EAE7FF] dark:bg-[#26233E] dark:text-[#C4B5FD]'
                        : 'text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{lang}</span>
                    {language === lang && <span className="w-1.5 h-1.5 rounded-full bg-[#6541F5]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-canvas border border-border text-text-primary hover:border-[#6541F5]/40 transition-colors text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#6541F5]"
              title="Switch user role"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#6541F5] dark:text-[#7C5CFA]" />
              <span>{role}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-xl shadow-game py-1 z-40">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors flex items-center justify-between ${
                      role === r
                        ? 'font-semibold text-[#6541F5] bg-[#EAE7FF] dark:bg-[#26233E] dark:text-[#C4B5FD]'
                        : 'text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{r}</span>
                    {role === r && <span className="w-1.5 h-1.5 rounded-full bg-[#6541F5]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Accessibility: Enlarged Text Mode Toggle (112.5%) */}
          <button
            onClick={toggleEnlargedText}
            className={`p-2 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-[#6541F5] ${
              isEnlargedText
                ? 'bg-[#EAE7FF] text-[#5230E8] dark:bg-[#26233E] dark:text-[#C4B5FD]'
                : 'text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title={isEnlargedText ? 'Disable Enlarged Text Mode' : 'Enable Enlarged Text Mode (112.5% scale for classroom tablets)'}
            aria-label="Toggle text scale"
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Theme Toggle Button (Light Purple vs Charcoal Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-[#6541F5]"
            title={theme === 'light' ? 'Switch to Charcoal Dark Mode' : 'Switch to Light Purple Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-[#5230E8]" />
            ) : (
              <Sun className="w-4 h-4 text-[#F5A623]" />
            )}
          </button>

          {/* Authentication State: User Menu or Sign In Button */}
          {user && !user.isGuest ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-canvas border border-border hover:border-blue-500/50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600"
                title="Account menu"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left max-w-[100px] truncate">
                  <div className="text-xs font-bold text-text-primary truncate">{user.name || user.username}</div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate">{user.role || 'Student'}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted opacity-70" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-game py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-border/80">
                    <div className="font-bold text-sm text-text-primary">{user.name || user.username}</div>
                    <div className="text-xs text-text-muted mt-0.5 font-mono">{user.studentId || user.username}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {user.role || 'Student'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Class {user.grade}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/login"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full px-4 py-2 text-left text-xs text-text-primary hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 font-medium"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Switch Account / Sign In</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
