import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  WifiOff,
  ArrowRight,
  Clock,
  Users,
  Sparkles,
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
    badgeBg: string;
    badgeText: string;
  };
  features: string[];
  image: string;
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
      primary: '#42A5E8',
      border: 'hover:border-[#42A5E8]',
      glow: 'hover:shadow-[0_4px_20px_rgba(66,165,232,0.25)]',
      badgeBg: 'bg-[#DDF2FC] dark:bg-[#13273D]',
      badgeText: 'text-[#42A5E8]',
    },
    features: [
      '10-second adaptive math quiz timer',
      '30+ NCERT curriculum questions',
      'Smart heuristic Bot opponents',
      'Traditional 15×15 4-quadrant board',
    ],
    image: '/images/playlab/math-ludo.png',
  },
  {
    id: 'carrom',
    path: '/playlab/carrom',
    title: "Newton's Carrom",
    subtitle: 'Master friction, elastic collision & 2D Newtonian physics',
    description:
      'Simulate authentic board physics with realistic restitution, friction coefficient, and impulse. Plan multi-bank rebound shots, strike the Queen, and learn conservation of momentum.',
    grades: 'Class 7–12',
    offline: true,
    difficulty: 'Challenging',
    players: '1–2 Players / AI Bot',
    playTime: '10–20 min',
    category: 'Physics',
    colorTheme: {
      primary: '#19B99A',
      border: 'hover:border-[#19B99A]',
      glow: 'hover:shadow-[0_4px_20px_rgba(25,185,154,0.25)]',
      badgeBg: 'bg-[#DDF8EE] dark:bg-[#0D2E26]',
      badgeText: 'text-[#19B99A]',
    },
    features: [
      'Accurate Matter.js 2D rigid-body engine',
      'Configurable friction & rebound coefficients',
      'Tactical AI bot with vector trajectory calculation',
      'Interactive vector power & angle aim line',
    ],
    image: '/images/playlab/carrom.png',
  },
  {
    id: 'maze',
    path: '/playlab/maze',
    title: 'MazeBot',
    subtitle: 'Pathfinding, BFS, DFS, and algorithmic graph exploration',
    description:
      'Guide your autonomous robot through procedurally generated mazes using visual algorithm execution. Compare Breadth-First Search, Depth-First Search, and Dijkstra shortest path step-by-step.',
    grades: 'Class 6–12',
    offline: true,
    difficulty: 'Moderate',
    players: 'Single Player',
    playTime: '5–10 min',
    category: 'Computer Science',
    colorTheme: {
      primary: '#6541F5',
      border: 'hover:border-[#6541F5]',
      glow: 'hover:shadow-[0_4px_20px_rgba(101,65,245,0.25)]',
      badgeBg: 'bg-[#EAE7FF] dark:bg-[#26233E]',
      badgeText: 'text-[#6541F5] dark:text-[#C4B5FD]',
    },
    features: [
      'Visual execution of BFS, DFS, and Dijkstra',
      'Real-time queue and stack data structure inspectors',
      'Step-by-step execution with play/pause controls',
      '12 progressive algorithmic challenge levels',
    ],
    image: '/images/playlab/mazebot.png',
  },
  {
    id: 'bharat',
    path: '/playlab/bharat',
    title: 'Bharat Explorer',
    subtitle: 'Interactive map missions across Indian states, capitals & heritage',
    description:
      'An expansive geospatial puzzle and quiz platform. Identify Indian states, locate capitals, explore biodiversity hotspots, and learn regional cultural heritage across 28 states and 8 union territories.',
    grades: 'Class 5–10',
    offline: true,
    difficulty: 'All Levels',
    players: 'Single Player',
    playTime: '10–15 min',
    category: 'Social Science',
    colorTheme: {
      primary: '#F5A623',
      border: 'hover:border-[#F5A623]',
      glow: 'hover:shadow-[0_4px_20px_rgba(245,166,35,0.25)]',
      badgeBg: 'bg-[#FFF0D5] dark:bg-[#35250D]',
      badgeText: 'text-[#F5A623]',
    },
    features: [
      'SVG vector map with clickable states & UTs',
      '3 challenge modes: Capitals, Physical Geo & Monuments',
      'Timed speed challenges with leaderboard streaks',
      'State-by-state encyclopedic facts & audio hints',
    ],
    image: '/images/playlab/bharat-explorer.jpg',
  },
];

export const PlayLabPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Math', 'Physics', 'Computer Science', 'Social Science'];

  const filteredGames =
    selectedCategory === 'All'
      ? GAMES
      : GAMES.filter((game) => game.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs sm:text-sm text-text-muted">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 hover:text-text-primary transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-text-muted/60" />
        <span className="text-[#F5A623] font-semibold flex items-center gap-1.5">
          <Gamepad2 className="w-4 h-4" />
          PlayLab
        </span>
      </nav>

      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0D5] text-[#F5A623] dark:bg-[#35250D] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Experiential Learning Hub • NEP 2020 Aligned
          </div>
          <h1 className="display-h1">
            VidyaVerse <span className="text-gradient-playlab">PlayLab</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-text-muted max-w-2xl leading-relaxed">
            Turn abstract curriculum theories into concrete visual intuition. Master mathematical speed,
            algorithmic thinking, Newtonian mechanics, and Indian geography through gamified simulations.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-card border border-border rounded-2xl p-3 sm:px-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0D5] text-[#F5A623] dark:bg-[#35250D] flex items-center justify-center">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-[11px] text-text-muted font-medium">Interactive Labs</p>
              <p className="text-base font-bold text-text-primary">4 Modules</p>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DDF8EE] text-[#19B99A] dark:bg-[#0D2E26] flex items-center justify-center">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-text-muted font-medium">Offline Mode</p>
              <p className="text-base font-bold text-[#19B99A]">100% Ready</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#F5A623] text-white shadow-sm shadow-[#F5A623]/25'
                  : 'bg-card text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-text-muted flex items-center gap-1.5 font-medium">
          <Award className="w-4 h-4 text-[#F5A623]" />
          <span>Earn XP and badges for each completed lab</span>
        </div>
      </div>

      {/* 2 Games in a Row: Image Square on Left, Description on Right */}
      <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {filteredGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className={`group relative flex flex-col sm:flex-row sm:h-[235px] card rounded-2xl overflow-hidden transition-all duration-300 ${game.colorTheme.border} ${game.colorTheme.glow} shadow-soft hover:shadow-card-hover`}
          >
            {/* Left: Guaranteed 1:1 Perfect Square Illustration Image */}
            <div className="relative w-full aspect-square sm:w-[235px] sm:h-[235px] shrink-0 overflow-hidden bg-[#F5F5FA] dark:bg-[#12121A] border-b sm:border-b-0 sm:border-r border-border">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                {/* Category Pill */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-sm ${game.colorTheme.badgeBg} ${game.colorTheme.badgeText}`}
                >
                  <Zap className="w-3 h-3" />
                  {game.category}
                </span>

                {/* Offline Ready Badge */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-card/90 backdrop-blur-md text-[#28B987] border border-border shadow-sm">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </span>
              </div>
            </div>

            {/* Right: Description & Action Area */}
            <div className="flex-1 p-5 flex flex-col justify-between min-w-0 h-full">
              <div className="space-y-1.5">
                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold font-display text-text-primary group-hover:text-[#F5A623] transition-colors truncate">
                  {game.title}
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm font-semibold text-text-primary/90 line-clamp-1">
                  {game.subtitle}
                </p>

                {/* Description */}
                <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                  {game.description}
                </p>

                {/* Metadata Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-text-muted font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-text-muted/70" />
                    {game.players}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-text-muted/70" />
                    {game.playTime}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: game.colorTheme.primary }} />
                    {game.grades}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => navigate(game.path)}
                  className="w-full btn-primary py-2.5 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 group/btn shadow-sm"
                >
                  <span>Launch {game.title}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PlayLabPage;
