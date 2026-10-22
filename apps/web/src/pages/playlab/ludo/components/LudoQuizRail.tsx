import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Shield,
} from 'lucide-react';
import { clsx } from 'clsx';
import { MathQuestion, GradeCategory } from '../types';

interface LudoQuizRailProps {
  phase: string;
  currentQuestion: MathQuestion | null;
  questionTimeLeft: number;
  questionTimerDuration: number;
  selectedOption: number | null;
  quizFeedback: { isCorrect: boolean; text: string } | null;
  isCurrentHuman: boolean;
  selectedGradeCategory: GradeCategory;
  moveHistory: string[];
  onAnswerSelect: (optionIdx: number) => void;
}

export const LudoQuizRail: React.FC<LudoQuizRailProps> = ({
  phase,
  currentQuestion,
  questionTimeLeft,
  questionTimerDuration,
  selectedOption,
  quizFeedback,
  isCurrentHuman,
  selectedGradeCategory,
  moveHistory,
  onAnswerSelect,
}) => {
  return (
    <div className="hidden lg:flex shrink-0 w-80 xl:w-96 2xl:w-[420px] h-full max-h-[740px] flex-col justify-between py-1 gap-2.5">
      {/* Math Quiz Card or Curriculum Challenge Station (Desktop - ENLARGED) */}
      <AnimatePresence mode="wait">
        {phase === 'question' && currentQuestion ? (
          <motion.div
            key="quiz-card-active"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="card p-4 sm:p-5 space-y-3 bg-card border-2 border-playlab-500/70 shadow-2xl overflow-hidden flex-1 min-h-0 flex flex-col justify-between"
          >
            {/* Header with Circular Timer & Topic */}
            <div className="flex items-center justify-between pb-2 border-b border-border shrink-0">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-playlab-500">
                <Sparkles className="w-4 h-4 text-playlab-500" />
                <span className="uppercase tracking-wider">{currentQuestion.topic}</span>
              </div>

              {/* Timer Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas border border-border shadow-inner">
                <Clock
                  className={clsx(
                    'w-4 h-4',
                    questionTimeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-amber-500'
                  )}
                />
                <span
                  className={clsx(
                    'font-mono text-xs sm:text-sm font-black',
                    questionTimeLeft <= 3 ? 'text-red-500' : 'text-text-primary'
                  )}
                >
                  {questionTimeLeft}s
                </span>
              </div>
            </div>

            {/* Question Prompt */}
            <div className="py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-playlab-500/90 block mb-1">
                Solve To Move Your Token
              </span>
              <p className="text-sm sm:text-base xl:text-lg font-bold text-text-primary leading-snug">
                {currentQuestion.question}
              </p>
            </div>

            {/* 4 Large Choices */}
            <div className="space-y-2 pt-1 flex-1 flex flex-col justify-center">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === currentQuestion.correctIndex;
                let btnStyle =
                  'bg-card hover:bg-canvas text-text-primary border-border hover:border-playlab-500/40 shadow-xs';

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle =
                      'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500 font-bold shadow-md';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-500/20 text-red-600 dark:text-red-300 border-red-500';
                  } else {
                    btnStyle = 'bg-card text-text-muted border-border opacity-50';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    disabled={selectedOption !== null || !isCurrentHuman}
                    onClick={() => onAnswerSelect(optIdx)}
                    className={clsx(
                      'w-full text-left px-3.5 sm:px-4 py-2.5 sm:py-3 xl:py-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center justify-between',
                      btnStyle
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-canvas border border-border/80 flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </span>
                    {selectedOption !== null && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    {selectedOption !== null && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Banner */}
            {quizFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={clsx(
                  'p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-medium border flex items-start gap-2 shrink-0',
                  quizFeedback.isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-300'
                )}
              >
                {quizFeedback.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{quizFeedback.text}</p>
                  <p className="text-[11px] opacity-80 mt-0.5 leading-snug">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div
            key="curriculum-station"
            className="card p-4 sm:p-4.5 bg-card border-border shadow-md flex-1 min-h-0 flex flex-col justify-between text-left space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-playlab-500" />
                <h3 className="text-xs sm:text-sm font-bold text-text-primary uppercase tracking-wider">
                  Curriculum Challenge Hub
                </h3>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-playlab-500/15 text-playlab-600 dark:text-playlab-300 font-bold border border-playlab-500/30">
                {selectedGradeCategory === 'all'
                  ? 'Classes 5-10'
                  : selectedGradeCategory === 'primary'
                  ? 'Classes 1-4'
                  : selectedGradeCategory === 'foundational'
                  ? 'Classes 5-6'
                  : selectedGradeCategory === 'middle'
                  ? 'Classes 7-8'
                  : 'Classes 9-10'}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 flex flex-col justify-center">
              <div className="p-3 rounded-2xl bg-canvas border border-border flex items-start gap-3">
                <div className="p-2 rounded-xl bg-playlab-500/15 text-playlab-500 shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-text-primary">
                    Grade-Aligned Math Quizzes
                  </h4>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Every dice roll triggers an NCERT challenge. Answer correctly within{' '}
                    {questionTimerDuration}s to unlock your token and earn bonus XP!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-canvas border border-border">
                  <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wide">
                    TIMER LIMIT
                  </span>
                  <span className="font-bold text-text-primary flex items-center gap-1.5 text-xs sm:text-sm mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {questionTimerDuration}s Blitz
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-canvas border border-border">
                  <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wide">
                    QUIZ REWARD
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xs sm:text-sm mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    +20 XP & Move
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted shrink-0">
              <span className="flex items-center gap-1">
                <span>💡</span> Correct answers advance tokens on track
              </span>
              <span className="font-bold text-playlab-500">Fast Math</span>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Rules & Tactical Bonuses (Right Rail, above Match Activity Log) */}
      <div className="card p-2.5 sm:p-3 bg-card border-border shadow-sm shrink-0 space-y-1.5">
        <div className="flex items-center justify-between pb-1 border-b border-border">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span className="uppercase tracking-wider">Rules & Tactical Bonuses</span>
          </div>
          <span className="text-[10px] text-text-muted font-semibold">Fair Play</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="p-1.5 rounded-lg bg-canvas border border-border flex items-center gap-1.5">
            <span className="text-sm">🎲</span>
            <span className="font-semibold text-text-secondary">Roll 6 to launch</span>
          </div>
          <div className="p-1.5 rounded-lg bg-canvas border border-border flex items-center gap-1.5">
            <span className="text-sm">🧮</span>
            <span className="font-semibold text-text-secondary">Solve quiz to move</span>
          </div>
          <div className="p-1.5 rounded-lg bg-canvas border border-border flex items-center gap-1.5">
            <span className="text-sm">⚔️</span>
            <span className="font-semibold text-text-secondary">Capture: +50 XP</span>
          </div>
          <div className="p-1.5 rounded-lg bg-canvas border border-border flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <span className="font-semibold text-text-secondary">Stars are safe</span>
          </div>
        </div>
      </div>

      {/* Move Log History (Bottom of Right Rail) */}
      <div className="card p-2 sm:p-2.5 space-y-1 bg-card border-border shadow-sm h-20 sm:h-24 flex flex-col shrink-0">
        <div className="flex items-center justify-between pb-1 border-b border-border shrink-0">
          <h3 className="text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1">
            <span>Match Activity Log</span>
          </h3>
          <span className="text-[10px] text-text-muted font-mono">{moveHistory.length} events</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1 text-xs font-mono text-text-secondary pr-1">
          {moveHistory.slice(0, 10).map((item, idx) => (
            <div
              key={idx}
              className="p-1 px-1.5 rounded bg-canvas border border-border text-[10px] truncate leading-tight"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
