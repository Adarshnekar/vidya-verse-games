import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  Gamepad2,
  Cpu,
  Code2,
  Dice6,
  CircleDot,
  Bot,
  Compass,
  Moon,
  Sun,
  Globe,
  Type,
  X,
  BookOpen,
  Sword,
  Atom,
  Divide,
  TreeDeciduous,
  FlaskConical,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Pages' | 'Games & Labs' | 'Settings';
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  action: () => void;
}

export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen, theme, toggleTheme, isEnlargedText, toggleEnlargedText } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Keyboard shortcut listener: Cmd+K / Ctrl+K & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Reset query when opening
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  const items: CommandItem[] = useMemo(() => [
    {
      id: 'home',
      title: 'Home Dashboard',
      subtitle: 'Overview, recent modules, and daily quests',
      category: 'Pages',
      icon: Home,
      action: () => navigate('/'),
    },
    {
      id: 'playlab',
      title: 'PlayLab Hub',
      subtitle: 'Physics and math games with algorithms',
      category: 'Pages',
      icon: Gamepad2,
      badge: '4 Games',
      badgeColor: 'text-[#F5A623] bg-[#FFF0D5] dark:bg-[#35250D]',
      action: () => navigate('/playlab'),
    },
    {
      id: 'ludo',
      title: 'Math Ludo',
      subtitle: 'Roll, solve NCERT math challenges, and race tokens home',
      category: 'Games & Labs',
      icon: Dice6,
      badge: 'Math',
      badgeColor: 'text-[#42A5E8] bg-[#DDF2FC] dark:bg-[#13273D]',
      action: () => navigate('/playlab/ludo'),
    },
    {
      id: 'carrom',
      title: "Newton's Carrom",
      subtitle: 'Friction, restitution, and 2D collision physics',
      category: 'Games & Labs',
      icon: CircleDot,
      badge: 'Physics',
      badgeColor: 'text-[#19B99A] bg-[#DDF8EE] dark:bg-[#0D2E26]',
      action: () => navigate('/playlab/carrom'),
    },
    {
      id: 'maze',
      title: 'MazeBot',
      subtitle: 'Pathfinding algorithms (BFS, DFS, Dijkstra, A*)',
      category: 'Games & Labs',
      icon: Bot,
      badge: 'Algorithms',
      badgeColor: 'text-[#6541F5] bg-[#EAE7FF] dark:bg-[#2A244D]',
      action: () => navigate('/playlab/maze'),
    },
    {
      id: 'bharat',
      title: 'Bharat Explorer',
      subtitle: 'Geography, state capitals, monuments & heritage missions',
      category: 'Games & Labs',
      icon: Compass,
      badge: 'Geography',
      badgeColor: 'text-[#F5A623] bg-[#FFF0D5] dark:bg-[#35250D]',
      action: () => navigate('/playlab/bharat'),
    },
    {
      id: 'wordquest',
      title: 'WordQuest',
      subtitle: 'Spelling, vocabulary puzzles & sentence construction for Classes 1–8',
      category: 'Games & Labs',
      icon: BookOpen,
      badge: 'Language',
      badgeColor: 'text-[#6541F5] bg-[#EAE7FF] dark:bg-[#26233E]',
      action: () => navigate('/playlab/wordquest'),
    },
    {
      id: 'number-ninjas',
      title: 'Number Ninjas',
      subtitle: 'Counting, place value, arithmetic & fraction slicing for Classes 1–5',
      category: 'Games & Labs',
      icon: Sword,
      badge: 'Math',
      badgeColor: 'text-[#E95778] bg-[#FCE5EB] dark:bg-[#381521]',
      action: () => navigate('/playlab/number-ninjas'),
    },
    {
      id: 'solar',
      title: 'Solar Odyssey 3D',
      subtitle: 'Real-time 3D Celestial Observatory, Keplerian Orbits & ISRO Missions',
      category: 'Games & Labs',
      icon: Globe,
      badge: 'Simulations',
      badgeColor: 'text-[#06B6D4] bg-[#CFFAFE] dark:bg-[#083344]',
      action: () => navigate('/playlab/solar'),
    },
    {
      id: 'human-body',
      title: 'Human Body Explorer',
      subtitle: '3D Anatomical Organ Observatory, Cross-Sections & Microstructure',
      category: 'Games & Labs',
      icon: Activity,
      badge: 'Simulations',
      badgeColor: 'text-[#E95778] bg-[#FCE5EB] dark:bg-[#381521]',
      action: () => navigate('/playlab/human-body'),
    },
    {
      id: 'physics-playground',
      title: '3D Physics Studio & Labs',
      subtitle: '55+ interactive 3D physics labs in Mechanics, Optics, Electricity & Quantum',
      category: 'Games & Labs',
      icon: Atom,
      badge: '3D Labs',
      badgeColor: 'text-[#38BDF8] bg-[#E0F2FE] dark:bg-[#082F49]',
      action: () => navigate('/playlab/physics-playground'),
    },
    {
      id: 'math-visualizer',
      title: 'Math Visualizer',
      subtitle: 'Number lines, fraction comparisons, polygon geometry & graphing',
      category: 'Games & Labs',
      icon: Divide,
      badge: 'Simulations',
      badgeColor: 'text-[#10B981] bg-[#D1FAE5] dark:bg-[#064E3B]',
      action: () => navigate('/playlab/math-visualizer'),
    },
    {
      id: 'ecosystem-simulator',
      title: 'Ecosystem Simulator',
      subtitle: 'Lotka-Volterra predator-prey dynamics & carrying capacity',
      category: 'Games & Labs',
      icon: TreeDeciduous,
      badge: 'Simulations',
      badgeColor: 'text-[#10B981] bg-[#D1FAE5] dark:bg-[#064E3B]',
      action: () => navigate('/playlab/ecosystem-simulator'),
    },
    {
      id: 'chemistry-lab',
      title: 'Chemistry Lab',
      subtitle: 'Bohr atom builder, states of matter & stoichiometric reaction chamber',
      category: 'Games & Labs',
      icon: FlaskConical,
      badge: 'Simulations',
      badgeColor: 'text-[#06B6D4] bg-[#CFFAFE] dark:bg-[#083344]',
      action: () => navigate('/playlab/chemistry-lab'),
    },
    {
      id: 'circuitverse',
      title: 'CircuitVerse Lab',
      subtitle: 'Virtual breadboard, resistors, LEDs & Ohm’s law simulation',
      category: 'Pages',
      icon: Cpu,
      badge: 'Electronics',
      badgeColor: 'text-[#19B99A] bg-[#DDF8EE] dark:bg-[#0D2E26]',
      action: () => navigate('/circuitverse'),
    },
    {
      id: 'codeverse',
      title: 'CodeVerse Platform',
      subtitle: 'Learn coding & solve challenges in Python, JS, C++, etc.',
      category: 'Pages',
      icon: Code2,
      badge: 'Programming',
      badgeColor: 'text-[#6541F5] bg-[#EAE7FF] dark:bg-[#2A244D]',
      action: () => navigate('/codeverse'),
    },
    {
      id: 'code-learn',
      title: 'Code Lessons',
      subtitle: 'Interactive step-by-step programming curriculum',
      category: 'Pages',
      icon: BookOpen,
      action: () => navigate('/codeverse/learn'),
    },
    {
      id: 'theme-toggle',
      title: theme === 'light' ? 'Switch to Charcoal Dark Mode' : 'Switch to Light Purple Mode',
      subtitle: `Currently active: ${theme === 'light' ? 'Light Purple Theme' : 'Charcoal Dark Theme'}`,
      category: 'Settings',
      icon: theme === 'light' ? Moon : Sun,
      action: () => toggleTheme(),
    },
    {
      id: 'enlarged-text',
      title: isEnlargedText ? 'Disable Enlarged Text Mode' : 'Enable Enlarged Text Mode (112.5%)',
      subtitle: 'High legibility mode designed for classroom tablets',
      category: 'Settings',
      icon: Type,
      action: () => toggleEnlargedText(),
    },
  ], [navigate, theme, toggleTheme, isEnlargedText, toggleEnlargedText]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    );
  }, [items, query]);

  const handleSelect = (item: CommandItem) => {
    setCommandPaletteOpen(false);
    item.action();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-game overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-card">
              <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search games, labs, commands (e.g. Ludo, Dark mode)..."
                className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted text-sm focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-sm">
                  No matching results for "{query}"
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors duration-150 ${
                        isSelected
                          ? 'bg-[#EAE7FF] text-[#5230E8] dark:bg-[#26233E] dark:text-[#C4B5FD]'
                          : 'text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-[#6541F5] text-white shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 text-text-muted'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate">{item.title}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted truncate">{item.subtitle}</p>
                      </div>
                      {isSelected && <ArrowRight className="w-4 h-4 text-[#6541F5] dark:text-[#7C5CFA] flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer shortcut helper */}
            <div className="px-4 py-2.5 bg-canvas/70 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px]">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px]">↵</kbd> Select</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px]">ESC</kbd> Close</span>
              </div>
              <span className="text-[10px] text-text-muted">VidyaVerse Command Palette</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
