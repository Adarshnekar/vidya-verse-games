import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Dice6,
  Bot,
  Compass,
  CircleDot,
  Wifi,
  WifiOff,
  ArrowRight,
  Star,
  Clock,
  Users,
  Sparkles,
  Gamepad2,
  ChevronRight,
  Home,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

interface GameCardData {
  id: string;
  path: string;
  title: string;
  subtitle: string;
  description: string;
  grades: string;
  offline: boolean;
  difficulty: string;
  players: string;
  playTime: string;
  category: 'Math' | 'Computer Science' | 'Physics' | 'Social Science';
  colorTheme: {
    primary: string;
    border: string;
    glow: string;
    bgGradient: string;
    badgeBg: string;
    badgeText: string;
  };
  features: string[];
  renderIllustration: () => React.ReactNode;
}

const GAMES: GameCardData[] = [
  {
    id: 'ludo',
    path: '/playlab/ludo',
    title: 'Math Ludo',
    subtitle: 'Roll, solve NCERT math challenges, and race your tokens home',
    description:
      'A thrilling pedagogical twist on traditional Indian Chaupar/Ludo. Answer grade-appropriate math questions under a 10-second timer to execute moves, capture opponents, and conquer the center.',
    grades: 'Class 5–12',
    offline: true,
    difficulty: 'Adjustable',
    players: '1–4 Players / Bot AI',
    playTime: '10–15 min',
    category: 'Math',
    colorTheme: {
      primary: '#f97316',
      border: 'hover:border-orange-500/50',
      glow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]',
      bgGradient: 'from-orange-500/20 via-red-500/10 to-transparent',
      badgeBg: 'bg-orange-500/10 border-orange-500/30',
      badgeText: 'text-orange-400',
    },
    features: [
      '10-second adaptive math quiz timer',
      '30+ NCERT curriculum questions',
      'Smart heuristic Bot opponents',
      'Traditional 15×15 4-quadrant board',
    ],
    renderIllustration: () => (
      <svg
        viewBox="0 0 240 140"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="240" height="140" fill="#0f172a" />
        {/* Subtle grid backdrop */}
        <path d="M0 28H240M0 56H240M0 84H240M0 112H240" stroke="#1e293b" strokeWidth="0.8" />
        <path d="M48 0V140M96 0V140M144 0V140M192 0V140" stroke="#1e293b" strokeWidth="0.8" />

        {/* Mini Ludo Board */}
        <g transform="translate(65, 10)">
          {/* Board Outer */}
          <rect x="0" y="0" width="110" height="110" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          
          {/* 4 Quadrants */}
          {/* Red Base */}
          <rect x="6" y="6" width="40" height="40" rx="6" fill="#dc2626" fillOpacity="0.85" />
          <circle cx="18" cy="18" r="4.5" fill="#ffffff" />
          <circle cx="34" cy="18" r="4.5" fill="#ffffff" />
          <circle cx="18" cy="34" r="4.5" fill="#ffffff" />
          <circle cx="34" cy="34" r="4.5" fill="#ffffff" />

          {/* Green Base */}
          <rect x="64" y="6" width="40" height="40" rx="6" fill="#16a34a" fillOpacity="0.85" />
          <circle cx="76" cy="18" r="4.5" fill="#ffffff" />
          <circle cx="92" cy="18" r="4.5" fill="#ffffff" />
          <circle cx="76" cy="34" r="4.5" fill="#ffffff" />
          <circle cx="92" cy="34" r="4.5" fill="#ffffff" />

          {/* Blue Base */}
          <rect x="6" y="64" width="40" height="40" rx="6" fill="#2563eb" fillOpacity="0.85" />
          <circle cx="18" cy="76" r="4.5" fill="#ffffff" />
          <circle cx="34" cy="76" r="4.5" fill="#ffffff" />
          <circle cx="18" cy="92" r="4.5" fill="#ffffff" />
          <circle cx="34" cy="92" r="4.5" fill="#ffffff" />

          {/* Yellow Base */}
          <rect x="64" y="64" width="40" height="40" rx="6" fill="#eab308" fillOpacity="0.85" />
          <circle cx="76" cy="76" r="4.5" fill="#ffffff" />
          <circle cx="92" cy="76" r="4.5" fill="#ffffff" />
          <circle cx="76" cy="92" r="4.5" fill="#ffffff" />
          <circle cx="92" cy="92" r="4.5" fill="#ffffff" />

          {/* Center Goal Diamond */}
          <polygon points="55,47 63,55 55,63 47,55" fill="#f97316" />
          <polygon points="46,46 55,55 46,64" fill="#ef4444" opacity="0.9" />
          <polygon points="46,46 55,55 64,46" fill="#22c55e" opacity="0.9" />
          <polygon points="64,46 55,55 64,64" fill="#eab308" opacity="0.9" />
          <polygon points="46,64 55,55 64,64" fill="#3b82f6" opacity="0.9" />

          {/* Home tracks */}
          <rect x="47" y="10" width="16" height="36" fill="#15803d" opacity="0.3" rx="2" />
          <rect x="10" y="47" width="36" height="16" fill="#b91c1c" opacity="0.3" rx="2" />
          <rect x="47" y="64" width="16" height="36" fill="#1d4ed8" opacity="0.3" rx="2" />
          <rect x="64" y="47" width="36" height="16" fill="#ca8a04" opacity="0.3" rx="2" />
        </g>

        {/* 3D Dice Floating */}
        <g transform="translate(180, 25)">
          <rect
            x="0"
            y="0"
            width="34"
            height="34"
            rx="6"
            fill="#ea580c"
            stroke="#fed7aa"
            strokeWidth="1.5"
            className="drop-shadow-lg"
          />
          <circle cx="9" cy="9" r="2.5" fill="#ffffff" />
          <circle cx="25" cy="9" r="2.5" fill="#ffffff" />
          <circle cx="17" cy="17" r="2.5" fill="#ffffff" />
          <circle cx="9" cy="25" r="2.5" fill="#ffffff" />
          <circle cx="25" cy="25" r="2.5" fill="#ffffff" />
        </g>

        {/* Math Equation Bubble */}
        <g transform="translate(15, 20)">
          <rect x="0" y="0" width="46" height="22" rx="11" fill="#1e293b" stroke="#f97316" strokeWidth="1" />
          <text x="23" y="15" fill="#fed7aa" fontSize="10" fontWeight="bold" textAnchor="middle">
            x² + 7 = ?
          </text>
        </g>
      </svg>
    ),
  },
  {
    id: 'maze',
    path: '/playlab/maze',
    title: 'MazeBot: Algorithm Visualizer',
    subtitle: 'Watch recursion, DFS, and backtracking explore & solve complex mazes',
    description:
      'Step into the shoes of a Computer Science researcher. Understand the classic "Rat in a Maze" algorithm visually with step-by-step state inspection, execution speed control, and manual keyboard play.',
    grades: 'Class 6–12',
    offline: true,
    difficulty: 'Intermediate',
    players: 'Single Player / Visualizer',
    playTime: '5–10 min',
    category: 'Computer Science',
    colorTheme: {
      primary: '#8b5cf6',
      border: 'hover:border-purple-500/50',
      glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]',
      bgGradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
      badgeBg: 'bg-purple-500/10 border-purple-500/30',
      badgeText: 'text-purple-400',
    },
    features: [
      'Rat in a Maze recursive backtracking',
      'Interactive step-by-step algorithm slider',
      'Configurable grid size (10×10 to 20×20)',
      'Real-time call-stack & state explanation',
    ],
    renderIllustration: () => (
      <svg
        viewBox="0 0 240 140"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="240" height="140" fill="#0b0f19" />
        {/* Maze Grid Simulation */}
        <g transform="translate(30, 15)">
          {/* Outer Border */}
          <rect x="0" y="0" width="180" height="110" rx="8" fill="#111827" stroke="#374151" strokeWidth="2" />

          {/* Maze Wall Paths */}
          <path
            d="M0 25 H50 V55 H25 V85 H75 V25 H105 V60 H135 V25 H160 V55 H180"
            stroke="#1e293b"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M30 110 V80 H80 V100 H120 V75 H90 V60 H155 V85 H135 V110"
            stroke="#1e293b"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Active Solution Path */}
          <path
            d="M12 12 H40 V40 H60 V70 H100 V40 H120 V70 H140 V98 H168"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 2"
          />

          {/* Backtracked Dead-Ends */}
          <path d="M40 40 V52" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M60 70 V85" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M120 70 V85" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />

          {/* Start Point (Blue Pulse) */}
          <circle cx="12" cy="12" r="7" fill="#3b82f6" fillOpacity="0.4" />
          <circle cx="12" cy="12" r="4.5" fill="#3b82f6" />

          {/* End Point (Purple Star/Portal) */}
          <circle cx="168" cy="98" r="8" fill="#8b5cf6" fillOpacity="0.4" />
          <circle cx="168" cy="98" r="5" fill="#a855f7" />

          {/* Robot Head */}
          <g transform="translate(93, 33)">
            <rect x="0" y="0" width="14" height="14" rx="3" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="1" />
            <circle cx="4" cy="5" r="1.5" fill="#4338ca" />
            <circle cx="10" cy="5" r="1.5" fill="#4338ca" />
            <line x1="3" y1="10" x2="11" y2="10" stroke="#4338ca" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </g>

        {/* Code badge */}
        <g transform="translate(160, 16)">
          <rect x="0" y="0" width="65" height="20" rx="4" fill="#1e1b4b" stroke="#6366f1" strokeWidth="0.8" />
          <text x="32" y="14" fill="#c7d2fe" fontSize="9" fontFamily="monospace" textAnchor="middle">
            solve(x, y)
          </text>
        </g>
      </svg>
    ),
  },
  {
    id: 'carrom',
    path: '/playlab/carrom',
    title: 'Carrom Physics Lab',
    subtitle: 'Explore rigid-body collisions, restitution, and Newton’s laws of motion',
    description:
      'A real-time Matter.js physics sandbox simulating the beloved Indian table game. Tweak coefficient of restitution, surface friction, and impulse vectors while playing against smart Bot AI.',
    grades: 'Class 7–12',
    offline: true,
    difficulty: 'Challenging',
    players: '1–2 Players / AI Bot',
    playTime: '10–20 min',
    category: 'Physics',
    colorTheme: {
      primary: '#10b981',
      border: 'hover:border-emerald-500/50',
      glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
      bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
      badgeText: 'text-emerald-400',
    },
    features: [
      'Accurate Matter.js 2D rigid-body engine',
      'Configurable friction & rebound coefficients',
      'Tactical AI bot with vector trajectory calculation',
      'Interactive vector power & angle aim line',
    ],
    renderIllustration: () => (
      <svg
        viewBox="0 0 240 140"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="240" height="140" fill="#0f172a" />
        {/* Carrom Wooden Board Top View */}
        <g transform="translate(60, 10)">
          {/* Wood Frame */}
          <rect x="0" y="0" width="120" height="120" rx="6" fill="#78350f" stroke="#451a03" strokeWidth="3" />
          {/* Plywood Playing Surface */}
          <rect x="8" y="8" width="104" height="104" rx="3" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />

          {/* 4 Corner Pockets */}
          <circle cx="16" cy="16" r="6" fill="#0f172a" stroke="#78350f" strokeWidth="1" />
          <circle cx="104" cy="16" r="6" fill="#0f172a" stroke="#78350f" strokeWidth="1" />
          <circle cx="16" cy="104" r="6" fill="#0f172a" stroke="#78350f" strokeWidth="1" />
          <circle cx="104" cy="104" r="6" fill="#0f172a" stroke="#78350f" strokeWidth="1" />

          {/* Baselines */}
          <line x1="28" y1="28" x2="92" y2="28" stroke="#dc2626" strokeWidth="1" />
          <line x1="28" y1="92" x2="92" y2="92" stroke="#dc2626" strokeWidth="1" />
          <line x1="28" y1="28" x2="28" y2="92" stroke="#dc2626" strokeWidth="1" />
          <line x1="92" y1="28" x2="92" y2="92" stroke="#dc2626" strokeWidth="1" />

          {/* Baseline Red Circles */}
          <circle cx="28" cy="92" r="3" fill="#ef4444" />
          <circle cx="92" cy="92" r="3" fill="#ef4444" />

          {/* Center concentric circles */}
          <circle cx="60" cy="60" r="16" stroke="#b45309" strokeWidth="1" fill="none" />
          <circle cx="60" cy="60" r="6" stroke="#b45309" strokeWidth="1" fill="none" />

          {/* Queen (Red) */}
          <circle cx="60" cy="60" r="4.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8" />

          {/* White & Black Coins Pattern */}
          <circle cx="55" cy="54" r="3.5" fill="#f8fafc" stroke="#64748b" strokeWidth="0.5" />
          <circle cx="65" cy="54" r="3.5" fill="#1e293b" stroke="#0f172a" strokeWidth="0.5" />
          <circle cx="67" cy="62" r="3.5" fill="#f8fafc" stroke="#64748b" strokeWidth="0.5" />
          <circle cx="60" cy="67" r="3.5" fill="#1e293b" stroke="#0f172a" strokeWidth="0.5" />
          <circle cx="53" cy="63" r="3.5" fill="#f8fafc" stroke="#64748b" strokeWidth="0.5" />

          {/* Striker (Large Acrylic Disc) */}
          <circle cx="48" cy="92" r="6.5" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />

          {/* Aim Trajectory line */}
          <line
            x1="48"
            y1="92"
            x2="57"
            y2="63"
            stroke="#0ea5e9"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <circle cx="57" cy="63" r="2" fill="#38bdf8" />
        </g>

        {/* Physics Formula Callout */}
        <g transform="translate(15, 25)">
          <rect x="0" y="0" width="40" height="20" rx="4" fill="#064e3b" stroke="#10b981" strokeWidth="0.8" />
          <text x="20" y="14" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle">
            e = v₂/v₁
          </text>
        </g>
      </svg>
    ),
  },
  {
    id: 'bharat',
    path: '/playlab/bharat',
    title: 'Bharat Explorer',
    subtitle: 'Embark on geographic expeditions across India’s terrain, rivers & heritage',
    description:
      'An inspiring interactive map adventure across all 28 states and 8 union territories. Unlock regional expedition badges, master state capitals, and discover India’s biodiversity and monuments.',
    grades: 'Class 5–10',
    offline: true,
    difficulty: 'All Levels',
    players: 'Single Player Adventure',
    playTime: '15–25 min',
    category: 'Social Science',
    colorTheme: {
      primary: '#0ea5e9',
      border: 'hover:border-sky-500/50',
      glow: 'hover:shadow-[0_0_30px_rgba(14,165,233,0.25)]',
      bgGradient: 'from-sky-500/20 via-blue-500/10 to-transparent',
      badgeBg: 'bg-sky-500/10 border-sky-500/30',
      badgeText: 'text-sky-400',
    },
    features: [
      'Interactive SVG geographic map of India',
      '5 themed national expeditions (Himalayas, Rivers, etc.)',
      'State-by-state trivia challenge & star ratings',
      'Collector Passport with 6 achievement badges',
    ],
    renderIllustration: () => (
      <svg
        viewBox="0 0 240 140"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="240" height="140" fill="#082f49" />
        <radialGradient id="bharatGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#082f49" stopOpacity="0" />
        </radialGradient>
        <rect width="240" height="140" fill="url(#bharatGlow)" />

        {/* Compass Rose */}
        <g transform="translate(30, 30)">
          <circle cx="0" cy="0" r="14" stroke="#0369a1" strokeWidth="1" strokeDasharray="2 2" />
          <polygon points="0,-16 4,-4 0,0 -4,-4" fill="#f97316" />
          <polygon points="0,16 4,4 0,0 -4,4" fill="#ffffff" />
          <polygon points="16,0 4,4 0,0 4,-4" fill="#16a34a" />
          <polygon points="-16,0 -4,4 0,0 -4,-4" fill="#38bdf8" />
          <circle cx="0" cy="0" r="2.5" fill="#0f172a" />
        </g>

        {/* Stylized Contour Map of India */}
        <g transform="translate(100, 10)">
          <path
            d="M40 8 L50 14 L55 25 L65 30 L60 40 L70 48 L65 58 L55 60 L60 70 L52 82 L42 104 L35 118 L30 110 L25 90 L20 80 L15 65 L22 55 L10 52 L12 40 L25 35 L30 22 L35 12 Z"
            fill="#0369a1"
            fillOpacity="0.5"
            stroke="#38bdf8"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Saffron, White, Green Gradient Ribbons */}
          <path d="M30 20 L50 20" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M28 40 L55 40" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
          <path d="M26 65 L48 65" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />

          {/* Interactive Expedition Pins */}
          {/* Delhi / North */}
          <circle cx="38" cy="35" r="3.5" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
          <circle cx="38" cy="35" r="7" stroke="#facc15" strokeWidth="1" strokeDasharray="2 1" />
          
          {/* Himalayas */}
          <circle cx="45" cy="18" r="3" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />

          {/* Western Ghats */}
          <circle cx="22" cy="80" r="3" fill="#4ade80" stroke="#0f172a" strokeWidth="1" />

          {/* Deccan / Rivers */}
          <circle cx="42" cy="70" r="3" fill="#fb923c" stroke="#0f172a" strokeWidth="1" />
        </g>

        {/* Mission Badge Tag */}
        <g transform="translate(175, 95)">
          <rect x="0" y="0" width="55" height="24" rx="12" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
          <text x="27" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
            ★ 5 Missions
          </text>
        </g>
      </svg>
    ),
  },
];

export const PlayLabPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Math', 'Computer Science', 'Physics', 'Social Science'];

  const filteredGames =
    selectedCategory === 'All'
      ? GAMES
      : GAMES.filter((game) => game.category === selectedCategory);

  return (
    <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-surface-400">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 hover:text-surface-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-surface-600" />
          <span className="text-playlab-400 font-semibold flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4" />
            PlayLab
          </span>
        </nav>

        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-surface-800 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-playlab-500/10 border border-playlab-500/20 text-playlab-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Experiential Learning Hub • NEP 2020 Aligned
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white">
              VidyaVerse <span className="text-gradient-playlab">PlayLab</span>
            </h1>
            <p className="mt-3 text-base sm:text-lg text-surface-300 max-w-3xl">
              Turn abstract curriculum theories into concrete visual intuition. Master mathematical speed,
              algorithmic thinking, Newtonian mechanics, and Indian geography through gamified, offline-ready simulations.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-surface-800/80 backdrop-blur-md border border-surface-700/60 rounded-2xl p-3 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-playlab-500/20 flex items-center justify-center text-playlab-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-surface-400 font-medium">Interactive Labs</p>
                <p className="text-base font-bold text-white">4 Modules</p>
              </div>
            </div>
            <div className="h-8 w-px bg-surface-700" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-surface-400 font-medium">Offline Mode</p>
                <p className="text-base font-bold text-emerald-400">100% Ready</p>
              </div>
            </div>
          </div>
        </header>

        {/* Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-playlab-500 text-white shadow-lg shadow-playlab-500/25'
                    : 'bg-surface-800/80 text-surface-300 hover:text-white hover:bg-surface-700 border border-surface-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-surface-400 flex items-center gap-1.5 font-medium">
            <Award className="w-4 h-4 text-playlab-400" />
            <span>Earn XP and badges for each completed lab</span>
          </div>
        </div>

        {/* 2x2 Grid on Desktop / 1 Column on Mobile */}
        <motion.div
          layout
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2"
        >
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.12 }}
              className={`group relative flex flex-col card rounded-2xl overflow-hidden transition-all duration-300 ${game.colorTheme.border} ${game.colorTheme.glow} shadow-soft hover:shadow-card-hover`}
            >
              {/* Illustration Header Area */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden border-b border-border bg-canvas">
                {game.renderIllustration()}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${game.colorTheme.bgGradient} pointer-events-none`}
                />

                {/* Top Badges Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  {/* Category Pill */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${game.colorTheme.badgeBg} ${game.colorTheme.badgeText}`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {game.category}
                  </span>

                  {/* Offline Ready Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-canvas/85 backdrop-blur-md text-emerald-500 border border-emerald-500/30">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Works Offline</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Title & Subtitle */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-2xl font-bold font-display text-text-primary group-hover:text-playlab-400 transition-colors">
                        {game.title}
                      </h2>
                    </div>
                    <p className="text-sm font-medium text-playlab-300/90 mt-1">
                      {game.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-surface-300 leading-relaxed">
                    {game.description}
                  </p>

                  {/* Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-surface-300 font-medium">
                    <div className="flex items-center gap-1.5 bg-surface-900/60 px-2.5 py-1 rounded-lg border border-surface-700/50">
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{game.grades}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-surface-900/60 px-2.5 py-1 rounded-lg border border-surface-700/50">
                      <Users className="w-3.5 h-3.5 text-brand-400" />
                      <span>{game.players}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-surface-900/60 px-2.5 py-1 rounded-lg border border-surface-700/50">
                      <Clock className="w-3.5 h-3.5 text-code-400" />
                      <span>{game.playTime}</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="pt-2 border-t border-surface-700/40">
                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                      Lab Highlights
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {game.features.map((feat, fIdx) => (
                        <li
                          key={fIdx}
                          className="flex items-center gap-2 text-xs text-surface-300"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-playlab-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-surface-700/50 flex items-center justify-between">
                  <div className="text-xs text-surface-400">
                    Difficulty: <span className="font-semibold text-surface-200">{game.difficulty}</span>
                  </div>

                  <button
                    onClick={() => navigate(game.path)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-playlab-500 hover:bg-playlab-600 text-white shadow-lg shadow-playlab-500/25 hover:shadow-glow-playlab hover:translate-x-0.5 transition-all duration-200"
                  >
                    <span>Play Now</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer NEP 2020 Pedagogical Context */}
        <section className="bg-surface-800/40 rounded-2xl border border-surface-700/40 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Offline-First Pedagogical Games for Indian Classrooms
              </h3>
              <p className="text-xs text-surface-300 mt-1 max-w-2xl leading-relaxed">
                All VidyaVerse PlayLab games run client-side in standard modern web browsers without requiring continuous high-speed internet. Ideal for smart boards, computer labs, and rural school setups.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <span className="text-xs text-surface-400">Powered by</span>
            <span className="px-3 py-1 rounded-lg bg-surface-800 text-xs font-mono font-medium text-playlab-400 border border-surface-700">
              React 19 + Matter.js + SVG
            </span>
          </div>
        </section>
      </div>
  );
};

export default PlayLabPage;
