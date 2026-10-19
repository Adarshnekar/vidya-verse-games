import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Cpu, Code2, ArrowRight, Zap, Star, BookOpen, Trophy } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useProgressStore } from '../stores/progressStore';

const MODULES = [
  {
    id: 'playlab',
    path: '/playlab',
    label: 'PlayLab',
    subtitle: 'Learn through Play',
    description: 'Math Ludo, Newton\'s Carrom, MazeBot, and Bharat Explorer — educational games with real physics and algorithms.',
    icon: Gamepad2,
    gradient: 'from-playlab-500 to-yellow-500',
    border: 'border-playlab-500/30',
    bg: 'bg-playlab-500/10',
    glow: 'hover:shadow-glow-playlab',
    badge: 'badge-playlab',
    badgeText: '4 Games',
    iconBg: 'from-playlab-400 to-yellow-400',
    features: ['Math Ludo', 'Newton\'s Carrom', 'MazeBot', 'Bharat Explorer'],
  },
  {
    id: 'circuitverse',
    path: '/circuitverse',
    label: 'CircuitVerse',
    subtitle: 'Electronics Lab',
    description: 'Build and simulate real circuits. Wire resistors, LEDs, switches, and observe live voltage and current measurements.',
    icon: Cpu,
    gradient: 'from-circuit-500 to-brand-500',
    border: 'border-circuit-500/30',
    bg: 'bg-circuit-500/10',
    glow: 'hover:shadow-glow-circuit',
    badge: 'badge-circuit',
    badgeText: '10 Labs',
    iconBg: 'from-circuit-400 to-brand-400',
    features: ['Real simulation', 'Guided labs', 'Save projects', 'Measure V & I'],
  },
  {
    id: 'codeverse',
    path: '/codeverse',
    label: 'CodeVerse',
    subtitle: 'Coding Platform',
    description: 'Learn programming from scratch with guided lessons, then tackle real coding challenges. Python, C++, Java, JS, SQL.',
    icon: Code2,
    gradient: 'from-code-500 to-pink-500',
    border: 'border-code-500/30',
    bg: 'bg-code-500/10',
    glow: 'hover:shadow-glow-code',
    badge: 'badge-code',
    badgeText: '50+ Problems',
    iconBg: 'from-code-400 to-pink-400',
    features: ['8 languages', 'Guided lessons', 'Live execution', 'Code challenges'],
  },
];

const STATS = [
  { icon: BookOpen, label: 'Lessons', value: '120+' },
  { icon: Gamepad2, label: 'Games', value: '4' },
  { icon: Trophy, label: 'Challenges', value: '50+' },
  { icon: Star, label: 'Max Level', value: '50' },
];

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items } = useProgressStore();
  const completedCount = items.filter(i => i.completed).length;

  return (
    <div className="min-h-full p-6 max-w-6xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center lg:text-left"
      >
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-3 py-1 text-xs text-brand-400 font-medium mb-4">
          <Zap className="w-3.5 h-3.5" />
          VidyaVerse Explore & Labs 2.0
        </div>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-surface-50 mb-3">
          Welcome back, <span className="text-gradient-brand">{user?.username || 'Explorer'}!</span>
        </h1>
        <p className="text-surface-400 text-lg max-w-2xl">
          Your learning universe awaits. Play, build circuits, and write code — all in one place.
        </p>
        {completedCount > 0 && (
          <p className="text-circuit-400 text-sm mt-2">
            🎯 {completedCount} activities completed this session
          </p>
        )}
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-3 mb-10"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-3">
            <stat.icon className="w-5 h-5 text-brand-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-surface-50">{stat.value}</div>
              <div className="text-xs text-surface-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Module cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        {MODULES.map((mod, i) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className={`card-interactive border ${mod.border} ${mod.glow} transition-all duration-300 flex flex-col`}
            onClick={() => navigate(mod.path)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(mod.path)}
            aria-label={`Open ${mod.label}`}
          >
            {/* Card header */}
            <div className={`h-32 rounded-lg ${mod.bg} border ${mod.border} flex items-center justify-center mb-4 relative overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${mod.gradient} opacity-5`} />
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mod.iconBg} flex items-center justify-center shadow-lg`}>
                <mod.icon className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="font-display text-xl font-bold text-surface-50">{mod.label}</h2>
                <p className="text-xs text-surface-400">{mod.subtitle}</p>
              </div>
              <span className={mod.badge}>{mod.badgeText}</span>
            </div>

            <p className="text-sm text-surface-300 mb-4 flex-1">{mod.description}</p>

            <div className="space-y-1.5 mb-4">
              {mod.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-surface-400">
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${mod.gradient}`} />
                  {f}
                </div>
              ))}
            </div>

            <button
              className={`btn w-full ${mod.id === 'playlab' ? 'btn-playlab' : mod.id === 'circuitverse' ? 'btn-circuit' : 'btn-code'}`}
              onClick={(e) => { e.stopPropagation(); navigate(mod.path); }}
            >
              Open {mod.label}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Grade selector */}
      {user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 card border-brand-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-surface-100 mb-1">Your Class</h3>
              <p className="text-sm text-surface-400">Questions and content adapt to your class level.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-surface-400 text-sm">Class</span>
              <select
                className="bg-surface-700 border border-surface-600 text-surface-100 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                defaultValue={user.grade}
                onChange={(e) => {
                  useAuthStore.getState().setUser({ ...user, grade: parseInt(e.target.value) }, useAuthStore.getState().token || '');
                }}
              >
                {[5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
