import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code,
  BookOpen,
  Trophy,
  Flame,
  Award,
  Terminal,
  ArrowRight,
  Play,
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
  FileCode,
  Layers,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useProgressStore } from '../stores/progressStore';

interface LanguageCard {
  id: string;
  name: string;
  version: string;
  category: string;
  icon: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  description: string;
  tags: string[];
}

const LANGUAGES: LanguageCard[] = [
  {
    id: 'python',
    name: 'Python',
    version: '3.10',
    category: 'CBSE Class 11-12 & AI',
    icon: '🐍',
    color: '#38bdf8',
    bgGradient: 'from-sky-950/40 via-surface-900 to-surface-900',
    borderColor: 'hover:border-sky-500/50',
    description: 'The preferred language for Indian school curriculums, data science, and AI development.',
    tags: ['CBSE Aligned', 'Easy to Read', 'Data Science'],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    version: 'ES2023',
    category: 'Full-Stack Web',
    icon: '⚡',
    color: '#facc15',
    bgGradient: 'from-amber-950/40 via-surface-900 to-surface-900',
    borderColor: 'hover:border-amber-500/50',
    description: 'The engine of the modern web. Master DOM manipulation, events, and asynchronous programming.',
    tags: ['Web Native', 'Interactive DOM', 'Full-Stack'],
  },
  {
    id: 'cpp',
    name: 'C++',
    version: 'GCC 10.2',
    category: 'Competitive Programming',
    icon: '⚡',
    color: '#818cf8',
    bgGradient: 'from-indigo-950/40 via-surface-900 to-surface-900',
    borderColor: 'hover:border-indigo-500/50',
    description: 'Blazing-fast execution, Standard Template Library (STL), and algorithmic problem solving.',
    tags: ['High Speed', 'STL Vectors', 'Competitions'],
  },
  {
    id: 'java',
    name: 'Java',
    version: 'OpenJDK 15',
    category: 'ICSE Syllabus & OOP',
    icon: '☕',
    color: '#f97316',
    bgGradient: 'from-orange-950/40 via-surface-900 to-surface-900',
    borderColor: 'hover:border-orange-500/50',
    description: 'Strict object-oriented foundations, encapsulation, inheritance, and ICSE Class 9/10 syllabus.',
    tags: ['ICSE Board', 'OOP Principles', 'Robust Typing'],
  },
  {
    id: 'c',
    name: 'C Language',
    version: 'C17',
    category: 'Systems & Hardware',
    icon: '⚙️',
    color: '#94a3b8',
    bgGradient: 'from-slate-900/60 via-surface-900 to-surface-900',
    borderColor: 'hover:border-slate-500/50',
    description: 'Understand memory addresses, pointers, binary manipulation, and how computers run code.',
    tags: ['Pointers', 'Low-level', 'Memory Model'],
  },
  {
    id: 'html',
    name: 'HTML & CSS',
    version: 'HTML5 / CSS3',
    category: 'Visual Web Design',
    icon: '🎨',
    color: '#ec4899',
    bgGradient: 'from-pink-950/40 via-surface-900 to-surface-900',
    borderColor: 'hover:border-pink-500/50',
    description: 'Design beautiful, responsive web interfaces with live instant sandbox rendering.',
    tags: ['Live Sandbox', 'Flexbox & Grid', 'Responsive'],
  },
  {
    id: 'sql',
    name: 'SQL',
    version: 'PostgreSQL / SQLite',
    category: 'Relational Databases',
    icon: '🗄️',
    color: '#2dd4bf',
    bgGradient: 'from-teal-950/40 via-surface-900 to-surface-900',
    borderColor: 'hover:border-teal-500/50',
    description: 'Query, join, filter, and analyze relational data tables with declarative queries.',
    tags: ['Data Tables', 'SELECT / JOIN', 'CBSE Informatics'],
  },
];

export const CodeVersePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, streak } = useProgressStore();

  const codeverseItems = items.filter((i) => i.module === 'codeverse');
  const completedCount = codeverseItems.filter((i) => i.completed).length;

  return (
    <div className="min-h-screen bg-surface-900 text-surface-100 flex flex-col font-sans">
      {/* 1. TOP HERO HEADER */}
      <section className="relative overflow-hidden border-b border-surface-800 bg-gradient-to-b from-surface-900 via-surface-800/40 to-surface-900 py-10 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-xl bg-code-500/20 text-code-400 border border-code-500/30 shadow-glow-code">
                  <Terminal className="w-6 h-6" />
                </span>
                <span className="font-display font-extrabold text-2xl tracking-wide text-surface-50">
                  VidyaVerse Code<span className="text-code-400">Verse</span>
                </span>
                <span className="badge-code ml-1.5 text-xs">Labs 2.0</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-surface-50 tracking-tight">
                Master Coding through Interactive Lessons & Challenges
              </h1>
              <p className="mt-2 text-surface-400 max-w-2xl text-sm sm:text-base leading-relaxed">
                Learn Python, C++, Java, and Web Development with live Piston code execution, automated unit test
                verdicts, and hands-on playgrounds designed for Indian school curriculums.
              </p>
            </div>

            {/* User Progress Stats Card */}
            <div className="bg-surface-800/80 backdrop-blur-md border border-surface-700/80 rounded-2xl p-4 sm:p-5 flex items-center gap-6 shadow-xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame className="w-6 h-6 fill-current animate-pulse" />
                </div>
                <div>
                  <div className="text-xs text-surface-400">Streak</div>
                  <div className="text-xl font-bold font-display text-surface-100">
                    {streak || user?.streak || 6} Days
                  </div>
                </div>
              </div>

              <div className="h-10 w-px bg-surface-700" />

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-code-500/10 border border-code-500/20 flex items-center justify-center text-code-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-surface-400">Challenges Solved</div>
                  <div className="text-xl font-bold font-display text-code-400">
                    {completedCount} <span className="text-xs font-normal text-surface-400">/ 10</span>
                  </div>
                </div>
              </div>

              <div className="h-10 w-px bg-surface-700" />

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-circuit-500/10 border border-circuit-500/20 flex items-center justify-center text-circuit-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-surface-400">Total XP</div>
                  <div className="text-xl font-bold font-display text-circuit-400">{user?.xp || 1450} XP</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/codeverse/learn')}
              className="btn-code px-4 py-2 text-sm font-semibold flex items-center gap-2 rounded-xl shadow-glow-code"
            >
              <BookOpen className="w-4 h-4" />
              <span>Resume Last Lesson</span>
            </button>
            <button
              onClick={() => navigate('/codeverse/challenge')}
              className="btn px-4 py-2 text-sm font-semibold bg-surface-800 hover:bg-surface-700 text-surface-100 border border-surface-600 rounded-xl flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Daily Challenge: Palindrome Check</span>
            </button>
            <button
              onClick={() => navigate('/codeverse/challenge?free=true')}
              className="btn-ghost px-4 py-2 text-sm rounded-xl flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-circuit-400" />
              <span>Free Code Sandbox</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. TWO PRIMARY MODES: LEARN MODE VS CHALLENGE MODE */}
      <section className="py-10 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-surface-50">
              Choose Your Learning Path
            </h2>
            <p className="text-xs sm:text-sm text-surface-400 mt-0.5">
              Build foundational intuition in Learn Mode, then sharpen your algorithmic prowess in Challenge Mode.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode 1: Learn Mode Card */}
          <div
            onClick={() => navigate('/codeverse/learn')}
            className="group relative rounded-2xl bg-gradient-to-br from-surface-800/90 to-surface-800/40 border border-surface-700 hover:border-code-500/60 p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:shadow-glow-code overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen className="w-40 h-40 text-code-400 -mr-8 -mt-8" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="badge-code text-xs px-2.5 py-1">Interactive Curriculum</span>
                <span className="text-xs text-surface-400 font-medium">5 Complete Modules</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-surface-50 group-hover:text-code-300 transition-colors">
                Learn Mode
              </h3>
              <p className="mt-2 text-sm text-surface-400 leading-relaxed">
                Step-by-step interactive lessons with structured explanations, readable syntax breakdowns, live Monaco
                editor examples, and instant practice exercises with progressive hints.
              </p>

              {/* Feature Highlights */}
              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-surface-300">
                  <CheckCircle2 className="w-4 h-4 text-code-400 shrink-0" />
                  <span>Python Basics: Variables, Dynamic Typing & Print Formats</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-surface-300">
                  <CheckCircle2 className="w-4 h-4 text-code-400 shrink-0" />
                  <span>Control Flow: If-Else Conditionals & Relational Operators</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-surface-300">
                  <CheckCircle2 className="w-4 h-4 text-code-400 shrink-0" />
                  <span>Loops & Iterations: For Loops, Range Sequences & Lists</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-surface-300">
                  <CheckCircle2 className="w-4 h-4 text-code-400 shrink-0" />
                  <span>Modular Code: Functions, Return Values & Scope</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-surface-300">
                  <CheckCircle2 className="w-4 h-4 text-code-400 shrink-0" />
                  <span>JavaScript Web: DOM Manipulation & Live Iframe Previews</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-surface-700/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-code-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Launch Lessons <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-xs text-surface-500 font-mono">Classes 6 - 12</span>
            </div>
          </div>

          {/* Mode 2: Challenge Mode Card */}
          <div
            onClick={() => navigate('/codeverse/challenge')}
            className="group relative rounded-2xl bg-gradient-to-br from-surface-800/90 to-surface-800/40 border border-surface-700 hover:border-amber-500/60 p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-40 h-40 text-amber-400 -mr-8 -mt-8" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="badge bg-amber-900/50 text-amber-400 border border-amber-700/50 text-xs px-2.5 py-1">
                  Algorithmic Battle Arena
                </span>
                <span className="text-xs text-surface-400 font-medium">10 Built-In Problems</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-surface-50 group-hover:text-amber-300 transition-colors">
                Challenge Mode
              </h3>
              <p className="mt-2 text-sm text-surface-400 leading-relaxed">
                Competitive coding environment powered by Monaco Editor and Piston API. Solve problems across Python,
                C++, C, Java, and JavaScript with automated visible & hidden test cases.
              </p>

              {/* Feature Highlights */}
              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-surface-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>10 Graded Problems: Hello World, FizzBuzz, Fibonacci, Binary Search</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-surface-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Multi-Language Starter Code: Python 3, C++ 20, Java, C, JS</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-surface-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Automated Testing: Pass/Fail Breakdown, Runtime (ms), Memory</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-surface-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instant Submission Verdicts: Accepted, Wrong Answer, TLE, Runtime Error</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-surface-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Submission History & Progress Tracking with XP Rewards</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-surface-700/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Enter Arena <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-xs text-surface-500 font-mono">Easy • Medium • Hard</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LANGUAGE TILES (7 SUPPORTED LANGUAGES) */}
      <section className="py-10 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-surface-50">
            Explore by Programming Language
          </h2>
          <p className="text-xs sm:text-sm text-surface-400 mt-0.5">
            VidyaVerse supports the most in-demand academic and industry programming languages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LANGUAGES.map((lang) => (
            <div
              key={lang.id}
              onClick={() => navigate(`/codeverse/challenge?lang=${lang.id}`)}
              className={`group card-interactive p-4 bg-gradient-to-br ${lang.bgGradient} border border-surface-700 ${lang.borderColor} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{lang.icon}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-800 text-surface-300 border border-surface-700">
                    {lang.version}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-surface-100 group-hover:text-surface-50">
                  {lang.name}
                </h3>
                <div className="text-[11px] text-surface-400 font-medium mb-2">{lang.category}</div>
                <p className="text-xs text-surface-400 leading-relaxed mb-4">{lang.description}</p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {lang.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-surface-800/80 text-surface-400 border border-surface-700/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-700/50 text-xs font-semibold text-surface-300 group-hover:text-white transition-colors">
                  <span>Start Coding</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. RECENT ACTIVITY & RECOMMENDED CHALLENGES */}
      <section className="py-10 px-6 sm:px-12 max-w-7xl mx-auto w-full border-t border-surface-800">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Problem List */}
          <div className="lg:col-span-2 bg-surface-800/60 rounded-2xl p-6 border border-surface-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-surface-100">Featured Challenges</h3>
              <button
                onClick={() => navigate('/codeverse/challenge')}
                className="text-xs text-code-400 hover:text-code-300 font-semibold flex items-center gap-1"
              >
                View all 10 problems <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'prob-1', title: '1. Hello World', diff: 'Easy', tag: 'Basics', points: 50 },
                { id: 'prob-2', title: '2. Sum of Two Numbers', diff: 'Easy', tag: 'Math', points: 50 },
                { id: 'prob-3', title: '3. FizzBuzz Classic', diff: 'Easy', tag: 'Logic', points: 75 },
                { id: 'prob-4', title: '4. Fibonacci Sequence', diff: 'Easy', tag: 'Recursion', points: 100 },
                { id: 'prob-5', title: '5. Palindrome String Check', diff: 'Medium', tag: 'Strings', points: 150 },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/codeverse/challenge?id=${p.id}`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-900/60 hover:bg-surface-700/60 border border-surface-700/60 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-circuit-400" />
                    <span className="font-medium text-xs sm:text-sm text-surface-200 group-hover:text-white">
                      {p.title}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        p.diff === 'Easy'
                          ? 'bg-circuit-900/60 text-circuit-400'
                          : 'bg-amber-900/60 text-amber-400'
                      }`}
                    >
                      {p.diff}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-surface-400 font-mono">+{p.points} XP</span>
                    <button className="btn-icon p-1 text-surface-400 group-hover:text-code-400">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Tracker Card */}
          <div className="bg-surface-800/60 rounded-2xl p-6 border border-surface-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg text-surface-100">Your Progress</h3>
                <span className="text-xs text-circuit-400 font-mono">Level 4 Student</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-surface-400 mb-1.5">
                  <span>Curriculum Completion</span>
                  <span className="font-semibold text-surface-200">
                    {Math.round((completedCount / 10) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-surface-900 rounded-full overflow-hidden border border-surface-700">
                  <div
                    className="h-full bg-gradient-to-r from-code-500 to-circuit-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(15, (completedCount / 10) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Next Milestone */}
              <div className="p-3.5 rounded-xl bg-surface-900/70 border border-surface-700/80 mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next Milestone</span>
                </div>
                <div className="text-xs text-surface-300">
                  Solve 2 more medium problems to unlock the <strong>"Logic Master"</strong> profile badge!
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/codeverse/learn')}
              className="btn-code w-full py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CodeVersePage;
