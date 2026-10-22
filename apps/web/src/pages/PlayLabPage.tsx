import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  ArrowRight,
  Clock,
  Users,
  Sparkles,
  Zap,
  Search,
  X,
} from 'lucide-react';

export interface GameCardData {
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
  category: 'Math' | 'Computer Science' | 'Physics' | 'Social Science' | 'Language' | 'Biology' | 'Chemistry';
  colorTheme: {
    primary: string;
    border: string;
    glow: string;
    badgeBg: string;
    badgeText: string;
  };
  features: string[];
  image: string;
  type: 'game' | 'simulation';
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
    type: 'game',
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
    type: 'game',
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
    type: 'game',
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
    type: 'game',
  },
  {
    id: 'wordquest',
    path: '/playlab/wordquest',
    title: 'WordQuest',
    subtitle: 'Spelling, vocabulary puzzles & sentence construction',
    description:
      'Embark on an interactive linguistic adventure. Master letter phonics, unscramble spelling anagrams, expand contextual vocabulary, and construct syntactically sound sentences across progressive grade quests.',
    grades: 'Class 1–8',
    offline: true,
    difficulty: 'Progressive',
    players: 'Single Player',
    playTime: '5–15 min',
    category: 'Language',
    colorTheme: {
      primary: '#6541F5',
      border: 'hover:border-[#6541F5]',
      glow: 'hover:shadow-[0_4px_20px_rgba(101,65,245,0.25)]',
      badgeBg: 'bg-[#EAE7FF] dark:bg-[#26233E]',
      badgeText: 'text-[#6541F5] dark:text-[#C4B5FD]',
    },
    features: [
      'Letter phonics & visual word matching',
      'Scrambled spelling bee anagram challenges',
      'Contextual vocabulary & antonym/synonym puzzles',
      'Syntactic tile sentence construction',
    ],
    image: '/images/playlab/wordquest.jpg',
    type: 'game',
  },
  {
    id: 'number-ninjas',
    path: '/playlab/number-ninjas',
    title: 'Number Ninjas',
    subtitle: 'Rapid mathematical blade slicing & place value challenges',
    description:
      'Sharpen counting intuition, place value, multiplication tables, and introductory fractions in a fast-paced ninja dojo. Slice through correct mathematical blocks to build combos and earn mastery belts.',
    grades: 'Class 1–5',
    offline: true,
    difficulty: 'Adjustable',
    players: 'Single Player',
    playTime: '5–10 min',
    category: 'Math',
    colorTheme: {
      primary: '#E95778',
      border: 'hover:border-[#E95778]',
      glow: 'hover:shadow-[0_4px_20px_rgba(233,87,120,0.25)]',
      badgeBg: 'bg-[#FCE5EB] dark:bg-[#381521]',
      badgeText: 'text-[#E95778]',
    },
    features: [
      'Subitizing and rapid counting blade strikes',
      'Place value breakdown (Units, Tens, Hundreds)',
      'Multiplication tables and mental division',
      'Visual fraction slice representations',
    ],
    image: '/images/playlab/number-ninjas.jpg',
    type: 'game',
  },
];

const SIMULATIONS: GameCardData[] = [
  {
    id: 'solar',
    path: '/playlab/solar',
    title: 'Solar Odyssey 3D',
    subtitle: 'Real-time 3D Celestial Observatory, Keplerian Orbits & ISRO Missions',
    description:
      'Immerse in an accurate 3D simulation of our Solar System built with Three.js. Fly past ringed giants, inspect atmospheric layers, calculate your weight across worlds, and conquer NCERT cosmic exploration missions.',
    grades: 'Class 6–12',
    offline: true,
    difficulty: 'All Levels',
    players: 'Interactive 3D Sim',
    playTime: '10–25 min',
    category: 'Physics',
    colorTheme: {
      primary: '#06B6D4',
      border: 'hover:border-[#06B6D4]',
      glow: 'hover:shadow-[0_4px_20px_rgba(6,182,212,0.25)]',
      badgeBg: 'bg-[#CFFAFE] dark:bg-[#083344]',
      badgeText: 'text-[#06B6D4]',
    },
    features: [
      'Interactive 3D Three.js camera flybys & Kepler orbits',
      'Realistic planetary textures, rings & Galilean moon systems',
      'ISRO space missions (Chandrayaan, Mangalyaan, Aditya-L1)',
      'Multi-world gravity, jump & atmospheric composition simulator',
    ],
    image: '/images/playlab/solar-system.png',
    type: 'simulation',
  },
  {
    id: 'human-body',
    path: '/playlab/human-body',
    title: 'Human Body Explorer',
    subtitle: '3D Anatomical Organ Observatory, Cross-Sections & Microstructure',
    description:
      'Interact with 9 high-fidelity 3D organs powered by Three.js. Rotate and inspect internal structures, explore anatomical hotspots, slice cross-sections, and test yourself with interactive labelling quizzes.',
    grades: 'Class 3–10',
    offline: true,
    difficulty: 'All Levels',
    players: '3D Anatomy Lab',
    playTime: '10–25 min',
    category: 'Biology',
    colorTheme: {
      primary: '#E95778',
      border: 'hover:border-[#E95778]',
      glow: 'hover:shadow-[0_4px_20px_rgba(233,87,120,0.25)]',
      badgeBg: 'bg-[#FCE5EB] dark:bg-[#381521]',
      badgeText: 'text-[#E95778]',
    },
    features: [
      '9 detailed 3D organ models (Heart, Brain, Lungs, Liver, Kidneys, Eye, Intestines, Pancreas, Skin)',
      'Interactive 3D hotspots naming all anatomical structures with Latin TA2 terms',
      'Adjustable cross-section depth slider slicing internal cavities',
      'Interactive 3D labelling quiz mode with live feedback and scoring',
    ],
    image: '/images/playlab/human-body.jpg',
    type: 'simulation',
  },
  {
    id: 'physics-playground',
    path: '/playlab/physics-playground',
    title: '3D Physics Studio & Labs',
    subtitle: '55+ 3D interactive physics labs in Mechanics, Optics, Electricity & Quantum',
    description:
      'Immerse yourself in over 55 interactive 3D physics apparatuses. Master projectile motion, telescopes, Coulomb electrostatic fields, electromagnetic induction, Pascal hydraulic lifts, and quantum photoelectric effects with NCERT derivations.',
    grades: 'All Grades',
    offline: true,
    difficulty: 'All Levels',
    players: 'Interactive 3D Studio',
    playTime: '15–30 min',
    category: 'Physics',
    colorTheme: {
      primary: '#38BDF8',
      border: 'hover:border-[#38BDF8]',
      glow: 'hover:shadow-[0_4px_20px_rgba(56,189,248,0.25)]',
      badgeBg: 'bg-[#E0F2FE] dark:bg-[#082F49]',
      badgeText: 'text-[#0284C7] dark:text-[#38BDF8]',
    },
    features: [
      '55+ Three.js 3D physics laboratories & apparatuses',
      'Mechanics, Optics, Electricity, Magnetism, Fluids & Quantum',
      'NCERT curriculum theory, ray diagrams, and mathematical derivations',
      'Dynamic parameter controls, live vectors, voice assistant & 2D sandbox',
    ],
    image: '/images/playlab/physics-playground.jpg',
    type: 'simulation',
  },
  {
    id: 'math-visualizer',
    path: '/playlab/math-visualizer',
    title: 'Math Visualizer',
    subtitle: 'Number lines, fraction comparisons, polygon geometry & graphing',
    description:
      'Transform abstract math into visual representations. Explore dynamic number line jumps, equivalent fraction bars, geometric symmetry lines, and Cartesian linear function slopes.',
    grades: 'Class 1–10',
    offline: true,
    difficulty: 'Adjustable',
    players: 'Interactive Tool',
    playTime: '5–15 min',
    category: 'Math',
    colorTheme: {
      primary: '#10B981',
      border: 'hover:border-[#10B981]',
      glow: 'hover:shadow-[0_4px_20px_rgba(16,185,129,0.25)]',
      badgeBg: 'bg-[#D1FAE5] dark:bg-[#064E3B]',
      badgeText: 'text-[#059669] dark:text-[#34D399]',
    },
    features: [
      'Interactive number line addition & subtraction jumps',
      'Comparative fraction bars & equivalent fraction visualizer',
      'Polygon geometry builder with reflectional symmetry lines',
      'Cartesian coordinate plane with interactive slope sliders',
    ],
    image: '/images/playlab/math-visualizer.jpg',
    type: 'simulation',
  },
  {
    id: 'ecosystem-simulator',
    path: '/playlab/ecosystem-simulator',
    title: 'Ecosystem Simulator',
    subtitle: 'Lotka-Volterra predator-prey dynamics & carrying capacity',
    description:
      'Model multi-trophic ecological balance. Observe real-time population waves between vegetation, herbivores, and apex predators with environmental drought and disease triggers.',
    grades: 'Class 3–10',
    offline: true,
    difficulty: 'Moderate',
    players: 'Agent-based Sim',
    playTime: '10–20 min',
    category: 'Biology',
    colorTheme: {
      primary: '#10B981',
      border: 'hover:border-[#10B981]',
      glow: 'hover:shadow-[0_4px_20px_rgba(16,185,129,0.25)]',
      badgeBg: 'bg-[#D1FAE5] dark:bg-[#064E3B]',
      badgeText: 'text-[#059669] dark:text-[#34D399]',
    },
    features: [
      'Dynamic 2D animated grassland biome canvas',
      'Real-time multi-line population oscillation chart',
      'Adjustable plant carrying capacity & predation efficiency',
      'Disruption events: severe drought & herbivore disease',
    ],
    image: '/images/playlab/ecosystem-simulator.jpg',
    type: 'simulation',
  },
  {
    id: 'chemistry-lab',
    path: '/playlab/chemistry-lab',
    title: 'Chemistry Lab',
    subtitle: 'Bohr atom builder, states of matter & stoichiometric reaction chamber',
    description:
      'Construct Bohr atomic shells from Hydrogen to Calcium, observe kinetic molecular phase transitions across temperatures, and verify the Law of Conservation of Mass in balanced reactions.',
    grades: 'Class 6–10',
    offline: true,
    difficulty: 'Intermediate',
    players: 'Virtual Lab',
    playTime: '10–20 min',
    category: 'Chemistry',
    colorTheme: {
      primary: '#06B6D4',
      border: 'hover:border-[#06B6D4]',
      glow: 'hover:shadow-[0_4px_20px_rgba(6,182,212,0.25)]',
      badgeBg: 'bg-[#CFFAFE] dark:bg-[#083344]',
      badgeText: 'text-[#0891B2] dark:text-[#22D3EE]',
    },
    features: [
      'Interactive Bohr model with K, L, M electron shells',
      'Kinetic particle simulation of solid, liquid, and gas phases',
      'Balanced reaction demonstrations with atom conservation audits',
      'Safe, non-hazardous virtual chemical exploration',
    ],
    image: '/images/playlab/chemistry-lab.jpg',
    type: 'simulation',
  },
];

export const PlayLabPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Math',
    'Physics',
    'Computer Science',
    'Social Science',
    'Language',
    'Biology',
    'Chemistry',
  ];

  // Search & category filter function
  const filterItem = (item: GameCardData) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.grades.toLowerCase().includes(query)
    );
  };

  const filteredGames = GAMES.filter(filterItem);
  const filteredSimulations = SIMULATIONS.filter(filterItem);

  // Reusable Card Component strictly preserving dimensions, styling tokens, and hover states
  const renderCard = (item: GameCardData, index: number) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className={`group relative flex flex-col sm:flex-row sm:h-[235px] card rounded-2xl overflow-hidden transition-all duration-300 ${item.colorTheme.border} ${item.colorTheme.glow} shadow-soft hover:shadow-card-hover`}
    >
      {/* Left: Guaranteed 1:1 Perfect Square Illustration Image */}
      <div className="relative w-full aspect-square sm:w-[235px] sm:h-[235px] shrink-0 overflow-hidden bg-[#F5F5FA] dark:bg-[#12121A] border-b sm:border-b-0 sm:border-r border-border">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 pointer-events-none">
          {/* Category Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-sm ${item.colorTheme.badgeBg} ${item.colorTheme.badgeText}`}
          >
            <Zap className="w-3 h-3" />
            {item.category}
          </span>
        </div>
      </div>

      {/* Right: Description & Action Area */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0 h-full">
        <div className="space-y-1.5">
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold font-display text-text-primary group-hover:text-[#F5A623] transition-colors truncate">
            {item.title}
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm font-semibold text-text-primary/90 line-clamp-1">
            {item.subtitle}
          </p>

          {/* Description */}
          <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
            {item.description}
          </p>

          {/* Metadata Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-text-muted font-medium">
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-text-muted/70" />
              {item.players}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-text-muted/70" />
              {item.playTime}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.colorTheme.primary }} />
              {item.grades}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => navigate(item.path)}
            className="w-full btn-primary py-2.5 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 group/btn shadow-sm"
          >
            <span>Launch {item.title}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Page Header with Integrated Search */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-text-primary">
            VidyaVerse <span className="text-gradient-playlab">PlayLab</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
            Turn abstract curriculum theories into concrete visual intuition through gamified simulations.
          </p>
        </div>

        {/* Unified Search Input placed neatly in header */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games & simulations..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-card border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#6541F5]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#F5A623] text-white shadow-sm shadow-[#F5A623]/25'
                : 'bg-card text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 border border-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* SECTION A — GAMES                                         */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 text-[#6541F5] dark:bg-purple-500/20 dark:text-[#C4B5FD] flex items-center justify-center border border-purple-500/20 shadow-sm shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-text-primary">
                  Educational Games
                </h2>
                <span className="text-sm sm:text-base font-medium text-text-muted">
                  • Curriculum challenges, algorithms & quests
                </span>
              </div>
            </div>
          </div>
          <span className="self-start sm:self-center text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-[#6541F5] dark:text-[#C4B5FD] border border-purple-500/20 shrink-0">
            {filteredGames.length} {filteredGames.length === 1 ? 'Game' : 'Games'}
          </span>
        </div>

        {filteredGames.length === 0 ? (
          <div className="text-center py-8 bg-card border border-border rounded-2xl p-4 shadow-soft">
            <Gamepad2 className="w-7 h-7 text-text-muted mx-auto mb-1.5 opacity-50" />
            <p className="text-sm font-semibold text-text-primary">No games match your search</p>
            <p className="text-xs text-text-muted mt-0.5">Try clearing your search query or selecting "All" categories</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredGames.map((game, index) => renderCard(game, index))}
          </motion.div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION B — SIMULATIONS                                   */}
      {/* ========================================================= */}
      <section className="space-y-4 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 text-[#0891B2] dark:bg-cyan-500/20 dark:text-[#67E8F9] flex items-center justify-center border border-cyan-500/20 shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-text-primary">
                  Interactive Simulations
                </h2>
                <span className="text-sm sm:text-base font-medium text-text-muted">
                  • Astrophysics, mechanics sandboxes & anatomy
                </span>
              </div>
            </div>
          </div>
          <span className="self-start sm:self-center text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-[#0891B2] dark:text-[#67E8F9] border border-cyan-500/20 shrink-0">
            {filteredSimulations.length} {filteredSimulations.length === 1 ? 'Simulation' : 'Simulations'}
          </span>
        </div>

        {filteredSimulations.length === 0 ? (
          <div className="text-center py-8 bg-card border border-border rounded-2xl p-4 shadow-soft">
            <Sparkles className="w-7 h-7 text-text-muted mx-auto mb-1.5 opacity-50" />
            <p className="text-sm font-semibold text-text-primary">No simulations match your search</p>
            <p className="text-xs text-text-muted mt-0.5">Try clearing your search query or selecting "All" categories</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredSimulations.map((sim, index) => renderCard(sim, index))}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default PlayLabPage;
