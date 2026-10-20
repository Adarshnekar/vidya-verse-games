import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Zap,
  Trophy,
  Volume2,
  VolumeX,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Sword,
  Target,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

type NinjaBelt = 'white' | 'yellow' | 'orange' | 'green' | 'black';

interface NinjaChallenge {
  id: string;
  belt: NinjaBelt;
  gradeLabel: string;
  category: 'Counting' | 'Place Value' | 'Arithmetic' | 'Multiplication' | 'Fractions';
  prompt: string;
  subPrompt?: string;
  hint: string;
  targetOptions: {
    id: string;
    value: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

const NINJA_CHALLENGES: NinjaChallenge[] = [
  // 1. WHITE BELT (Class 1 - Counting & Number Recognition)
  {
    id: 'n1',
    belt: 'white',
    gradeLabel: 'Class 1',
    category: 'Counting',
    prompt: 'Slice the box that shows exactly 7 stars: ★',
    subPrompt: 'Count carefully before you strike!',
    hint: '5 stars plus 2 more stars make 7.',
    targetOptions: [
      { id: 'opt1', value: '★ ★ ★ ★ ★', isCorrect: false },
      { id: 'opt2', value: '★ ★ ★ ★ ★ ★ ★', isCorrect: true },
      { id: 'opt3', value: '★ ★ ★ ★ ★ ★', isCorrect: false },
      { id: 'opt4', value: '★ ★ ★ ★ ★ ★ ★ ★', isCorrect: false },
    ],
    explanation: 'Count: 1, 2, 3, 4, 5, 6, 7 stars. Perfect slice!',
  },
  {
    id: 'n2',
    belt: 'white',
    gradeLabel: 'Class 1',
    category: 'Arithmetic',
    prompt: 'What is 4 + 5 = ?',
    hint: 'Start at 4 and count up 5 steps: 5, 6, 7, 8, 9!',
    targetOptions: [
      { id: 'opt1', value: '8', isCorrect: false },
      { id: 'opt2', value: '9', isCorrect: true },
      { id: 'opt3', value: '10', isCorrect: false },
      { id: 'opt4', value: '7', isCorrect: false },
    ],
    explanation: '4 + 5 = 9. Swift strike!',
  },

  // 2. YELLOW BELT (Class 2 - Place Value & 2-Digit Ops)
  {
    id: 'n3',
    belt: 'yellow',
    gradeLabel: 'Class 2',
    category: 'Place Value',
    prompt: 'Which number has 4 TENS and 7 ONES?',
    hint: '4 Tens = 40, and 7 Ones = 7. 40 + 7 = ?',
    targetOptions: [
      { id: 'opt1', value: '74', isCorrect: false },
      { id: 'opt2', value: '47', isCorrect: true },
      { id: 'opt3', value: '407', isCorrect: false },
      { id: 'opt4', value: '470', isCorrect: false },
    ],
    explanation: '4 Tens (40) + 7 Ones (7) = 47.',
  },
  {
    id: 'n4',
    belt: 'yellow',
    gradeLabel: 'Class 2',
    category: 'Arithmetic',
    prompt: 'Strike the answer: 25 - 9 = ?',
    hint: 'Subtract 5 to get 20, then subtract 4 more.',
    targetOptions: [
      { id: 'opt1', value: '14', isCorrect: false },
      { id: 'opt2', value: '16', isCorrect: true },
      { id: 'opt3', value: '17', isCorrect: false },
      { id: 'opt4', value: '15', isCorrect: false },
    ],
    explanation: '25 - 9 = 16.',
  },

  // 3. ORANGE BELT (Class 3 - Multiplication & Word Problems)
  {
    id: 'n5',
    belt: 'orange',
    gradeLabel: 'Class 3',
    category: 'Multiplication',
    prompt: 'A ninja has 6 pouches. Each pouch holds 7 shurikens. How many shurikens in total?',
    hint: 'Calculate 6 × 7.',
    targetOptions: [
      { id: 'opt1', value: '36', isCorrect: false },
      { id: 'opt2', value: '42', isCorrect: true },
      { id: 'opt3', value: '48', isCorrect: false },
      { id: 'opt4', value: '40', isCorrect: false },
    ],
    explanation: '6 × 7 = 42 shurikens in total.',
  },
  {
    id: 'n6',
    belt: 'orange',
    gradeLabel: 'Class 3',
    category: 'Place Value',
    prompt: 'In the number 852, what is the place value of 8?',
    hint: 'Hundreds place!',
    targetOptions: [
      { id: 'opt1', value: '8 Ones (8)', isCorrect: false },
      { id: 'opt2', value: '8 Tens (80)', isCorrect: false },
      { id: 'opt3', value: '8 Hundreds (800)', isCorrect: true },
      { id: 'opt4', value: '8 Thousands (8000)', isCorrect: false },
    ],
    explanation: 'In 852, 8 is in the hundreds position: 8 × 100 = 800.',
  },

  // 4. GREEN BELT (Class 4 - Division & Multi-step Ops)
  {
    id: 'n7',
    belt: 'green',
    gradeLabel: 'Class 4',
    category: 'Arithmetic',
    prompt: 'Slice the quotient: 72 ÷ 8 = ?',
    hint: 'What number multiplied by 8 equals 72?',
    targetOptions: [
      { id: 'opt1', value: '7', isCorrect: false },
      { id: 'opt2', value: '8', isCorrect: false },
      { id: 'opt3', value: '9', isCorrect: true },
      { id: 'opt4', value: '12', isCorrect: false },
    ],
    explanation: '72 ÷ 8 = 9, because 8 × 9 = 72.',
  },
  {
    id: 'n8',
    belt: 'green',
    gradeLabel: 'Class 4',
    category: 'Fractions',
    prompt: 'Which fraction represents ONE HALF (1/2)?',
    hint: 'Divide a whole shape into 2 equal parts and select 1 part.',
    targetOptions: [
      { id: 'opt1', value: '2/4', isCorrect: true },
      { id: 'opt2', value: '1/3', isCorrect: false },
      { id: 'opt3', value: '3/8', isCorrect: false },
      { id: 'opt4', value: '2/5', isCorrect: false },
    ],
    explanation: '2/4 simplifies to 1/2 by dividing both numerator and denominator by 2.',
  },

  // 5. BLACK BELT (Class 5 - Advanced Fractions & Mixed Operations)
  {
    id: 'n9',
    belt: 'black',
    gradeLabel: 'Class 5',
    category: 'Fractions',
    prompt: 'Solve the fraction addition: 1/4 + 2/4 = ?',
    hint: 'When denominators are the same, just add the numerators.',
    targetOptions: [
      { id: 'opt1', value: '3/8', isCorrect: false },
      { id: 'opt2', value: '3/4', isCorrect: true },
      { id: 'opt3', value: '2/4', isCorrect: false },
      { id: 'opt4', value: '1', isCorrect: false },
    ],
    explanation: '1/4 + 2/4 = (1 + 2)/4 = 3/4.',
  },
  {
    id: 'n10',
    belt: 'black',
    gradeLabel: 'Class 5',
    category: 'Arithmetic',
    prompt: 'Ninja Master Combo: (15 × 4) - 25 = ?',
    hint: 'BODMAS / PEMDAS: Multiply first (15 × 4 = 60), then subtract 25.',
    targetOptions: [
      { id: 'opt1', value: '35', isCorrect: true },
      { id: 'opt2', value: '45', isCorrect: false },
      { id: 'opt3', value: '25', isCorrect: false },
      { id: 'opt4', value: '40', isCorrect: false },
    ],
    explanation: '15 × 4 = 60, then 60 - 25 = 35. Ninja Master status achieved!',
  },
];

export const NumberNinjasPage: React.FC = () => {
  const navigate = useNavigate();
  const { addXP, addCoins, unlockBadge } = useAuthStore();

  const [selectedBelt, setSelectedBelt] = useState<NinjaBelt>('white');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [slicedId, setSlicedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const beltChallenges = NINJA_CHALLENGES.filter((c) => c.belt === selectedBelt);
  const currentChallenge = beltChallenges[currentIdx] || beltChallenges[0];

  useEffect(() => {
    setSlicedId(null);
    setShowHint(false);
    setStatusMessage(null);
  }, [currentIdx, selectedBelt]);

  // Audio Synthesizer
  const playSfx = (type: 'slice' | 'correct' | 'wrong' | 'victory' | 'gameover') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'slice') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.08);
        osc.frequency.setValueAtTime(880, now + 0.16);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'wrong') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'victory') {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.setValueAtTime(f, now + i * 0.1);
          g.gain.setValueAtTime(0.3, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.2);
        });
      }
    } catch {
      // Audio fallback
    }
  };

  const handleSliceTarget = (optionId: string, isCorrect: boolean) => {
    if (slicedId || lives <= 0) return;

    setSlicedId(optionId);
    playSfx('slice');

    setTimeout(() => {
      if (isCorrect) {
        playSfx('correct');
        const comboBonus = (combo + 1) * 10;
        setScore((s) => s + 50 + comboBonus);
        setCombo((c) => c + 1);
        setStatusMessage('Perfect Slice! +50 XP');
        addXP(30);
        addCoins(5);
      } else {
        playSfx('wrong');
        setCombo(0);
        setLives((l) => Math.max(0, l - 1));
        setStatusMessage('Missed! Focus your inner ninja!');
      }
    }, 250);
  };

  const handleNext = () => {
    if (currentIdx < beltChallenges.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      playSfx('victory');
      unlockBadge(`ninja-${selectedBelt}-belt`);
      addXP(80);
      addCoins(20);
      setStatusMessage('Belt Trial Mastered! Advancing Dojo!');
    }
  };

  const handleRestartDojo = () => {
    setLives(3);
    setScore(0);
    setCombo(0);
    setCurrentIdx(0);
    setSlicedId(null);
    setStatusMessage(null);
  };

  const isCurrentComplete = slicedId !== null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/playlab')}
            className="p-2 rounded-xl bg-card border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                Number <span className="text-[#E95778]">Ninjas</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FCE5EB] text-[#E95778] dark:bg-[#381521] dark:text-[#FFA0B6]">
                <Sword className="w-3.5 h-3.5" />
                Math Dojo
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Rapid mathematical blade slicing & place value challenges for Classes 1–5
            </p>
          </div>
        </div>

        {/* HUD: Hearts, Combo & Score */}
        <div className="flex items-center gap-3">
          {/* Hearts / Lives */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-card border border-border shadow-soft">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-4 h-4 transition-colors ${
                  heart <= lives ? 'fill-rose-500 text-rose-500' : 'text-text-muted/30'
                }`}
              />
            ))}
          </div>

          {/* Combo */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0D5] text-[#F5A623] dark:bg-[#35250D] text-xs font-bold">
            <Zap className="w-4 h-4 fill-current" />
            <span>{combo}x Combo</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold shadow-soft">
            <Trophy className="w-4 h-4 text-[#F5A623]" />
            <span>{score} XP</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-card border border-border text-text-muted hover:text-text-primary transition-colors"
            title={soundEnabled ? 'Mute' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#E95778]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Belt Dojo Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card border border-border rounded-2xl p-2 shadow-soft">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-text-muted px-2 uppercase tracking-wider">Belt:</span>
          {(
            [
              { id: 'white', label: '⚪ White (Class 1)' },
              { id: 'yellow', label: '🟡 Yellow (Class 2)' },
              { id: 'orange', label: '🟠 Orange (Class 3)' },
              { id: 'green', label: '🟢 Green (Class 4)' },
              { id: 'black', label: '⚫ Black (Class 5)' },
            ] as const
          ).map((belt) => (
            <button
              key={belt.id}
              onClick={() => {
                setSelectedBelt(belt.id);
                setCurrentIdx(0);
                setSlicedId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedBelt === belt.id
                  ? 'bg-[#E95778] text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {belt.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-text-muted font-medium pr-2">
          Trial {currentIdx + 1} of {beltChallenges.length}
        </div>
      </div>

      {/* Ninja Dojo Arena */}
      <div className="relative bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-soft overflow-hidden">
        {/* Decorative Dojo Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#E95778]/10 to-transparent pointer-events-none rounded-bl-full" />

        {lives <= 0 ? (
          /* Game Over State */
          <div className="text-center py-12 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-display text-text-primary">Dojo Lives Depleted!</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Every ninja master stumbles on the path of numbers. Meditate on your arithmetic and strike again!
            </p>
            <button
              onClick={handleRestartDojo}
              className="btn-primary py-2.5 px-6 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Dojo Trial</span>
            </button>
          </div>
        ) : (
          /* Active Challenge */
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Mission Category & Prompt */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FCE5EB] text-[#E95778] dark:bg-[#381521] dark:text-[#FFA0B6]">
                <Target className="w-3.5 h-3.5" />
                {currentChallenge.category} • {currentChallenge.gradeLabel}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-text-primary">
                {currentChallenge.prompt}
              </h2>

              {currentChallenge.subPrompt && (
                <p className="text-sm text-text-muted font-medium">{currentChallenge.subPrompt}</p>
              )}
            </div>

            {/* Slicing Target Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {currentChallenge.targetOptions.map((opt) => {
                const isThisSliced = slicedId === opt.id;
                const showSuccess = isThisSliced && opt.isCorrect;
                const showFailure = isThisSliced && !opt.isCorrect;
                const showMissedAnswer = isCurrentComplete && opt.isCorrect && !isThisSliced;

                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => handleSliceTarget(opt.id, opt.isCorrect)}
                    disabled={isCurrentComplete}
                    whileHover={{ scale: isCurrentComplete ? 1 : 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative group p-6 rounded-2xl border text-center font-bold text-lg transition-all overflow-hidden ${
                      showSuccess
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : showFailure
                        ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400'
                        : showMissedAnswer
                        ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-500'
                        : 'bg-card border-border hover:border-[#E95778] text-text-primary shadow-soft hover:shadow-card-hover'
                    }`}
                  >
                    {/* Katana Slice Line Animation */}
                    {isThisSliced && (
                      <motion.div
                        initial={{ width: 0, opacity: 1 }}
                        animate={{ width: '150%', opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-white shadow-[0_0_12px_#fff] rotate-[-25deg] origin-left pointer-events-none"
                      />
                    )}

                    <span className="relative z-10">{opt.value}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Hint & Feedback Banner */}
            <div className="space-y-3">
              {!showHint && !isCurrentComplete && (
                <div className="text-center">
                  <button
                    onClick={() => setShowHint(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#E95778] hover:underline font-semibold"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Sensei's Hint</span>
                  </button>
                </div>
              )}

              {showHint && !isCurrentComplete && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs text-center leading-relaxed font-medium">
                  💡 <span className="font-bold">Sensei says:</span> {currentChallenge.hint}
                </div>
              )}

              {isCurrentComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border text-xs sm:text-sm text-center leading-relaxed ${
                    currentChallenge.targetOptions.find((o) => o.id === slicedId)?.isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  <p className="font-bold mb-1">{statusMessage}</p>
                  <p>{currentChallenge.explanation}</p>
                </motion.div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                onClick={handleRestartDojo}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Dojo</span>
              </button>

              {isCurrentComplete && (
                <button
                  onClick={handleNext}
                  className="btn-primary px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-md"
                >
                  <span>{currentIdx < beltChallenges.length - 1 ? 'Next Strike' : 'Trial Complete!'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NumberNinjasPage;
