import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Cpu,
  Code2,
  ArrowRight,
  Zap,
  Star,
  BookOpen,
  Trophy,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ChevronRight,
  Layers,
  Award,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useProgressStore } from '../stores/progressStore';

const MODULES = [
  {
    id: 'playlab',
    path: '/playlab',
    label: 'PlayLab',
    subtitle: 'Pedagogical Game Engine',
    description:
      'Math Ludo, Newton’s Carrom, MazeBot, and Bharat Explorer — experiential learning with real physics and algorithms.',
    icon: Gamepad2,
    badgeText: '4 Games',
    accentColor: '#F5A623',
    badgeClass: 'text-[#F5A623] bg-[#FFF0D5] dark:bg-[#35250D]',
    buttonClass: 'bg-[#F5A623] hover:bg-[#E09419] text-white shadow-sm shadow-[#F5A623]/25',
    features: ['NCERT Math Ludo', 'Collision Physics Carrom', 'Pathfinding MazeBot', 'State Capital Missions'],
  },
  {
    id: 'circuitverse',
    path: '/circuitverse',
    label: 'CircuitVerse',
    subtitle: 'Electronics & Physics Lab',
    description:
      'Wire resistors, DC power sources, switches, and LEDs on a virtual breadboard. Live voltage, current & Ohm’s law analytics.',
    icon: Cpu,
    badgeText: '10 Labs',
    accentColor: '#19B99A',
    badgeClass: 'text-[#19B99A] bg-[#DDF8EE] dark:bg-[#0D2E26]',
    buttonClass: 'bg-[#19B99A] hover:bg-[#159F84] text-white shadow-sm shadow-[#19B99A]/25',
    features: ['Ohm’s Law Verification', 'Series & Parallel Circuits', 'Live Multimeter & Ammeter', 'Burnout Safety Check'],
  },
  {
    id: 'codeverse',
    path: '/codeverse',
    label: 'CodeVerse',
    subtitle: 'Interactive Code Studio',
    description:
      'Master programming step-by-step with guided interactive tutorials and 50+ algorithmic challenges in Python, JS & C++.',
    icon: Code2,
    badgeText: '50+ Problems',
    accentColor: '#6541F5',
    badgeClass: 'text-[#6541F5] bg-[#EAE7FF] dark:bg-[#26233E] dark:text-[#C4B5FD]',
    buttonClass: 'bg-[#6541F5] hover:bg-[#5230E8] text-white shadow-sm shadow-[#6541F5]/25',
    features: ['Python, C++, Java, JS', 'Step-by-Step Lessons', 'Instant Compiler Diagnostics', 'Gamified XP Badges'],
  },
];

const QUICK_GAMES = [
  {
    id: 'ludo',
    path: '/playlab/ludo',
    title: 'Math Ludo',
    subject: 'Mathematics',
    subjectBadge: 'text-[#42A5E8] bg-[#DDF2FC] dark:bg-[#13273D]',
    image: '/images/playlab/math-ludo.png',
    players: '1-4 Players',
  },
  {
    id: 'carrom',
    path: '/playlab/carrom',
    title: "Newton's Carrom",
    subject: 'Physics',
    subjectBadge: 'text-[#19B99A] bg-[#DDF8EE] dark:bg-[#0D2E26]',
    image: '/images/playlab/carrom.png',
    players: 'Physics Sim',
  },
  {
    id: 'maze',
    path: '/playlab/maze',
    title: 'MazeBot',
    subject: 'Algorithms',
    subjectBadge: 'text-[#6541F5] bg-[#EAE7FF] dark:bg-[#26233E] dark:text-[#C4B5FD]',
    image: '/images/playlab/mazebot.png',
    players: 'BFS / DFS / A*',
  },
  {
    id: 'bharat',
    path: '/playlab/bharat',
    title: 'Bharat Explorer',
    subject: 'Geography',
    subjectBadge: 'text-[#F5A623] bg-[#FFF0D5] dark:bg-[#35250D]',
    image: '/images/playlab/bharat-explorer.jpg',
    players: 'Heritage Map',
  },
  {
    id: 'solar',
    path: '/playlab/solar',
    title: 'Solar Odyssey 3D',
    subject: 'Space Science',
    subjectBadge: 'text-[#06B6D4] bg-[#CFFAFE] dark:bg-[#083344] dark:text-[#67E8F9]',
    image: '/images/playlab/solar-system.png',
    players: '3D Celestial Sim',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, streak } = useProgressStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'playlab' | 'circuitverse' | 'codeverse'>('all');

  const completedCount = items.filter((i) => i.completed).length;
  const effectiveStreak = streak > 0 ? streak : (user?.streak || 3);

  const filteredModules = selectedFilter === 'all'
    ? MODULES
    : MODULES.filter((m) => m.id === selectedFilter);

  return (
    <div className="space-y-6">
      {/* Top Welcome Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#6541F5] bg-[#EAE7FF] dark:bg-[#26233E] dark:text-[#C4B5FD] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            VidyaVerse Learning System
          </div>
          <h1 className="display-h1">
            Welcome back, <span className="text-gradient-purple">{user?.name || user?.username || 'Explorer'}!</span>
          </h1>
          <p className="body-meta mt-1">
            Pick up where you left off or dive into interactive labs, games, and code challenges.
          </p>
        </div>

        {/* Quick Session Stats */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-card border border-border shadow-soft flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#28B987]" />
            <div className="text-xs">
              <span className="font-bold text-text-primary">{completedCount}</span>{' '}
              <span className="text-text-muted">done</span>
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-card border border-border shadow-soft flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#E95778]" />
            <div className="text-xs">
              <span className="font-bold text-text-primary">{effectiveStreak}</span>{' '}
              <span className="text-text-muted">day streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 8/4 Split Grid Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT MAIN AREA (8 COLS) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Featured Hero: "Continue Learning" Deep Purple Gradient Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 sm:p-7 bg-hero-continue text-white shadow-game relative overflow-hidden"
          >
            {/* Background geometric accents */}
            <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute right-12 top-6 w-24 h-24 rounded-full bg-[#EAE7FF]/15 blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/25">
                  <Play className="w-3 h-3 fill-white" />
                  Featured • Continue Learning
                </div>

                <div>
                  <h2 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight">
                    Class {user?.grade || 8} Physics & Circuit Lab
                  </h2>
                  <p className="text-white/85 text-sm mt-1 max-w-lg leading-relaxed">
                    Verify Ohm's Law and measure voltage drops across series resistors on the interactive breadboard.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 max-w-md pt-1">
                  <div className="flex justify-between text-xs font-medium text-white/90">
                    <span>Progress: 3 of 4 experiments completed</span>
                    <span className="font-mono font-bold">75%</span>
                  </div>
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-500 w-3/4" />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0">
                <button
                  onClick={() => navigate('/circuitverse')}
                  className="px-5 py-3 rounded-xl bg-white text-[#5230E8] hover:bg-[#EAE7FF] font-bold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <span>Resume Lab</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate('/playlab')}
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs backdrop-blur-sm transition-all duration-200 text-center"
                >
                  Explore Other Labs
                </button>
              </div>
            </div>
          </motion.div>

          {/* Horizontal Scrolling Filter Tabs (No Horizontal Page Overflow) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {[
              { id: 'all', label: 'All Modules' },
              { id: 'playlab', label: 'PlayLab Games', badge: '4' },
              { id: 'circuitverse', label: 'CircuitVerse Lab', badge: '10' },
              { id: 'codeverse', label: 'CodeVerse Studio', badge: '50+' },
            ].map((tab) => {
              const active = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                    active
                      ? 'bg-[#6541F5] text-white shadow-sm shadow-[#6541F5]/25'
                      : 'bg-card border border-border text-text-muted hover:text-text-primary hover:border-[#6541F5]/30'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-canvas text-text-muted'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Module Cards Grid */}
          <div className="space-y-4">
            {filteredModules.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate(mod.path)}
                className="card p-5 sm:p-6 hover:border-[#6541F5] hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${mod.accentColor}18`, color: mod.accentColor }}
                  >
                    <mod.icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="card-h3">{mod.label}</h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mod.badgeClass}`}>
                        {mod.badgeText}
                      </span>
                    </div>
                    <p className="body-standard text-xs sm:text-sm text-text-muted line-clamp-2">
                      {mod.description}
                    </p>
                    <div className="flex items-center gap-3 pt-1 flex-wrap">
                      {mod.features.slice(0, 3).map((f) => (
                        <span key={f} className="inline-flex items-center gap-1.5 text-[11px] text-text-muted">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mod.accentColor }} />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end self-end md:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(mod.path);
                    }}
                    className={`btn ${mod.buttonClass} text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5`}
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Play Game Cards */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="section-h2 text-lg sm:text-xl">Quick Games & Labs</h2>
              <button
                onClick={() => navigate('/playlab')}
                className="text-xs font-semibold text-[#6541F5] dark:text-[#7C5CFA] hover:underline flex items-center gap-1"
              >
                <span>View all games</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {QUICK_GAMES.map((game) => (
                <div
                  key={game.id}
                  onClick={() => navigate(game.path)}
                  className="card overflow-hidden hover:border-[#6541F5] hover:shadow-card-hover transition-all duration-150 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="relative h-28 w-full overflow-hidden bg-canvas">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md ${game.subjectBadge}`}>
                        {game.subject}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <div className="font-bold text-sm text-text-primary group-hover:text-[#6541F5] dark:group-hover:text-[#7C5CFA] transition-colors truncate">
                      {game.title}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                      <span>{game.players}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#6541F5]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT ACTIVITY PANEL (4 COLS) ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Class / Curriculum Selector Card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAE7FF] text-[#5230E8] dark:bg-[#26233E] dark:text-[#C4B5FD] flex items-center justify-center font-bold text-xs">
                  CBSE
                </div>
                <div>
                  <h3 className="card-h3 text-sm">Class & Syllabus</h3>
                  <p className="text-[11px] text-text-muted">NCERT curriculum mode</p>
                </div>
              </div>
              <span className="badge-purple">Active</span>
            </div>

            <div className="p-3 rounded-xl bg-canvas border border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-text-muted block">Current Grade</span>
                <span className="text-base font-bold text-text-primary">Class {user?.grade || 8}</span>
              </div>
              <select
                className="bg-card border border-border text-text-primary rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-[#6541F5] focus:outline-none cursor-pointer"
                value={user?.grade || 8}
                onChange={(e) => {
                  if (user) {
                    useAuthStore.getState().setUser(
                      { ...user, grade: parseInt(e.target.value, 10) },
                      useAuthStore.getState().token || ''
                    );
                  }
                }}
              >
                {[5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    Class {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Daily Quests Card (Orange/Amber: #F5A623, Badge: #FFF0D5) */}
          <div className="card p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0D5] text-[#F5A623] dark:bg-[#35250D] flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="card-h3 text-sm">Daily Quests</h3>
                  <p className="text-[11px] text-text-muted">Resets in 6 hours</p>
                </div>
              </div>
              <span className="badge-quest">+150 XP</span>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  title: 'Solve 3 Math Ludo Equations',
                  progress: '2 / 3',
                  completed: false,
                  reward: '+30 XP',
                },
                {
                  title: 'Build Series Circuit in CircuitVerse',
                  progress: '1 / 1',
                  completed: true,
                  reward: '+50 XP',
                },
                {
                  title: 'Pass 1 Python Problem in CodeVerse',
                  progress: '0 / 1',
                  completed: false,
                  reward: '+70 XP',
                },
              ].map((quest, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-canvas border border-border flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {quest.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#28B987] flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-text-muted flex-shrink-0" />
                    )}
                    <span
                      className={`truncate font-medium ${
                        quest.completed ? 'line-through text-text-muted' : 'text-text-primary'
                      }`}
                    >
                      {quest.title}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-text-muted whitespace-nowrap">
                    {quest.progress}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Streak & Interventions Tracker (Pink: #E95778, Badge: #FCE5EB) */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FCE5EB] text-[#E95778] dark:bg-[#381521] flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="card-h3 text-sm">Learning Streak</h3>
                  <p className="text-[11px] text-text-muted">Keep momentum going</p>
                </div>
              </div>
              <span className="badge-streak">{effectiveStreak} Days Active</span>
            </div>

            {/* Weekly Days Indicator */}
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                const isActive = idx < effectiveStreak;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-colors ${
                        isActive
                          ? 'bg-[#E95778] text-white shadow-sm shadow-[#E95778]/25'
                          : 'bg-canvas border border-border text-text-muted'
                      }`}
                    >
                      {isActive ? '✓' : ''}
                    </div>
                    <span className="text-[10px] text-text-muted font-medium">{day}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-text-muted text-center pt-1">
              Active today! Practice tomorrow to reach a 4-day milestone.
            </p>
          </div>

          {/* Badges & Accolades */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="card-h3 text-sm">Unlocked Achievements</h3>
              <span className="badge-purple">3 Badges</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { name: 'Ohm Cadet', icon: '⚡', color: '#19B99A' },
                { name: 'Dice Prodigy', icon: '🎲', color: '#42A5E8' },
                { name: 'First Code', icon: '💻', color: '#6541F5' },
              ].map((badge) => (
                <div
                  key={badge.name}
                  className="p-2.5 rounded-xl bg-canvas border border-border flex flex-col items-center gap-1"
                >
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-[11px] font-semibold text-text-primary truncate w-full">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
