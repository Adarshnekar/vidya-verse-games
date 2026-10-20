import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  BookOpen,
  Trophy,
  ArrowRight,
  Play,
  Sparkles,
  ChevronRight,
  Home,
  CheckCircle2,
  Layers,
  Terminal,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useProgressStore } from '../stores/progressStore';

interface LanguageCard {
  id: string;
  name: string;
  version: string;
  category: string;
  group: 'web' | 'systems' | 'data';
  icon: string;
  accent: string;
  description: string;
  tags: string[];
}

const LANGUAGES: LanguageCard[] = [
  {
    id: 'python',
    name: 'Python',
    version: '3.10',
    category: 'CBSE Class 11-12 & AI',
    group: 'web',
    icon: '🐍',
    accent: '#42A5E8',
    description: 'The preferred language for Indian school curriculums, data science, and AI development.',
    tags: ['CBSE Aligned', 'Easy to Read', 'Data Science'],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    version: 'ES2023',
    category: 'Full-Stack Web',
    group: 'web',
    icon: '⚡',
    accent: '#F5A623',
    description: 'The engine of the modern web. Master DOM manipulation, events, and asynchronous programming.',
    tags: ['Web Native', 'Interactive DOM', 'Full-Stack'],
  },
  {
    id: 'cpp',
    name: 'C++',
    version: 'GCC 10.2',
    category: 'Competitive Programming',
    group: 'systems',
    icon: '⚡',
    accent: '#6541F5',
    description: 'Blazing-fast execution, Standard Template Library (STL), and algorithmic problem solving.',
    tags: ['High Speed', 'STL Vectors', 'Competitions'],
  },
  {
    id: 'java',
    name: 'Java',
    version: 'OpenJDK 15',
    category: 'ICSE Syllabus & OOP',
    group: 'systems',
    icon: '☕',
    accent: '#E95778',
    description: 'Strict object-oriented foundations, encapsulation, inheritance, and ICSE Class 9/10 syllabus.',
    tags: ['ICSE Board', 'OOP Principles', 'Robust Typing'],
  },
  {
    id: 'c',
    name: 'C Language',
    version: 'C17',
    category: 'Systems & Hardware',
    group: 'systems',
    icon: '⚙️',
    accent: '#77778D',
    description: 'Understand memory addresses, pointers, binary manipulation, and how computers run code.',
    tags: ['Pointers', 'Low-level', 'Memory Model'],
  },
  {
    id: 'html',
    name: 'HTML & CSS',
    version: 'HTML5 / CSS3',
    category: 'Visual Web Design',
    group: 'web',
    icon: '🎨',
    accent: '#E95778',
    description: 'Design beautiful, responsive web interfaces with live instant sandbox rendering.',
    tags: ['Live Sandbox', 'Flexbox & Grid', 'Responsive'],
  },
  {
    id: 'sql',
    name: 'SQL',
    version: 'PostgreSQL / SQLite',
    category: 'Relational Databases',
    group: 'data',
    icon: '🗄️',
    accent: '#19B99A',
    description: 'Query, join, filter, and analyze relational data tables with declarative queries.',
    tags: ['Data Tables', 'SELECT / JOIN', 'CBSE Informatics'],
  },
];

export const CodeVersePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items } = useProgressStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'web' | 'systems' | 'data'>('all');

  const codeverseItems = items.filter((i) => i.module === 'codeverse');
  const completedCount = codeverseItems.filter((i) => i.completed).length;

  const filteredLanguages = selectedFilter === 'all'
    ? LANGUAGES
    : LANGUAGES.filter((l) => l.group === selectedFilter);

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
        <span className="text-[#6541F5] dark:text-[#7C5CFA] font-semibold flex items-center gap-1.5">
          <Code2 className="w-4 h-4" />
          CodeVerse
        </span>
      </nav>

      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE7FF] text-[#6541F5] dark:bg-[#26233E] dark:text-[#C4B5FD] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Code Studio • Piston Compiler
          </div>
          <h1 className="display-h1">
            VidyaVerse <span className="text-gradient-purple">CodeVerse</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-text-muted max-w-2xl leading-relaxed">
            Master coding through guided interactive lessons and algorithmic challenges. Execute Python,
            JavaScript, C++, Java, and SQL with instant test case verdicts.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/codeverse/learn')}
            className="btn-primary flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl"
          >
            <BookOpen className="w-4 h-4" />
            <span>Resume Lesson</span>
          </button>
          <button
            onClick={() => navigate('/codeverse/challenge')}
            className="btn-secondary flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl"
          >
            <Trophy className="w-4 h-4 text-[#F5A623]" />
            <span>Challenge Arena</span>
          </button>
        </div>
      </header>

      {/* 2 PRIMARY LEARNING PATHS: LEARN MODE VS CHALLENGE MODE */}
      <section className="space-y-3">
        <h2 className="section-h2 text-lg sm:text-xl">Choose Your Learning Path</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Path 1: Learn Mode */}
          <div
            onClick={() => navigate('/codeverse/learn')}
            className="card p-6 hover:border-[#6541F5] hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#EAE7FF] text-[#6541F5] dark:bg-[#26233E] dark:text-[#C4B5FD] flex items-center justify-center shadow-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="badge-purple">Step-by-Step Curriculum</span>
              </div>
              <h3 className="card-h3 text-xl group-hover:text-[#6541F5] dark:group-hover:text-[#7C5CFA] transition-colors">
                Interactive Learn Mode
              </h3>
              <p className="body-standard text-xs sm:text-sm text-text-muted leading-relaxed">
                Build rock-solid foundations from scratch. Concept breakdowns, visual code tracing, interactive
                multiple-choice checks, and incremental code builders for beginners.
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#28B987]" /> 8 Languages
                </span>
                <span>•</span>
                <span>Beginner to Advanced</span>
                <span>•</span>
                <span>Self-Paced</span>
              </div>
            </div>

            <div className="pt-5 flex items-center justify-between text-xs font-semibold text-[#6541F5] dark:text-[#7C5CFA]">
              <span>Explore curriculum lessons</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Path 2: Challenge Arena */}
          <div
            onClick={() => navigate('/codeverse/challenge')}
            className="card p-6 hover:border-[#F5A623] hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0D5] text-[#F5A623] dark:bg-[#35250D] flex items-center justify-center shadow-sm">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="badge-quest">Automated Judge</span>
              </div>
              <h3 className="card-h3 text-xl group-hover:text-[#F5A623] transition-colors">
                Code Challenge Arena
              </h3>
              <p className="body-standard text-xs sm:text-sm text-text-muted leading-relaxed">
                Sharpen algorithmic thinking with LeetCode-style problems. Live multi-language code editor with Monaco,
                Piston compiler backend, hidden edge test cases, and execution benchmarks.
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-[#F5A623]" /> 10 Built-in Problems
                </span>
                <span>•</span>
                <span>Easy, Medium & Hard</span>
                <span>•</span>
                <span>XP Rewards</span>
              </div>
            </div>

            <div className="pt-5 flex items-center justify-between text-xs font-semibold text-[#F5A623]">
              <span>Enter challenge arena</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </section>

      {/* LANGUAGE CATALOG */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="section-h2 text-lg sm:text-xl">Supported Languages & Stacks</h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Choose your stack to practice coding or solve algorithmic challenges.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {[
              { id: 'all', label: 'All Stacks' },
              { id: 'web', label: 'Web & Python' },
              { id: 'systems', label: 'Systems & C++' },
              { id: 'data', label: 'Data & SQL' },
            ].map((tab) => {
              const active = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[#6541F5] text-white shadow-sm'
                      : 'bg-card text-text-muted hover:text-text-primary border border-border'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Languages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLanguages.map((lang) => (
            <div
              key={lang.id}
              onClick={() => navigate(`/codeverse/challenge?lang=${lang.id}`)}
              className="card p-5 hover:border-[#6541F5] hover:shadow-card-hover transition-all duration-150 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{lang.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-text-primary group-hover:text-[#6541F5] dark:group-hover:text-[#7C5CFA] transition-colors">
                        {lang.name}
                      </h4>
                      <span className="text-[10px] text-text-muted font-mono">{lang.version}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                  {lang.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lang.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-canvas border border-border text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-border mt-3 text-xs font-semibold text-[#6541F5] dark:text-[#7C5CFA]">
                <span>Practice {lang.name}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CodeVersePage;
