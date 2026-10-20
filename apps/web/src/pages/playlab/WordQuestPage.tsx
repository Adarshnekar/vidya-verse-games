import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Star,
  Award,
  ChevronRight,
  Languages,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

type GameMode = 'matching' | 'spelling' | 'vocabulary' | 'grammar' | 'sentence';
type GradeLevel = 'primary' | 'middle' | 'upper'; // primary: 1-2, middle: 3-5, upper: 6-8

interface WordQuestQuestion {
  id: string;
  grade: GradeLevel;
  mode: GameMode;
  prompt: string;
  hint: string;
  audioWord?: string;
  // For matching / multiple choice / vocabulary / grammar
  options?: string[];
  correctAnswer: string;
  explanation: string;
  // For spelling
  scrambledLetters?: string[];
  // For sentence construction
  sentenceTiles?: string[];
  correctSentence?: string;
}

const QUEST_QUESTIONS: WordQuestQuestion[] = [
  // --- PRIMARY (Classes 1-2) ---
  {
    id: 'p1',
    grade: 'primary',
    mode: 'matching',
    prompt: 'Which word starts with the letter sound "B"?',
    hint: 'A flying creature that makes honey or a round toy you kick!',
    options: ['Apple', 'Ball', 'Cat', 'Dog'],
    correctAnswer: 'Ball',
    explanation: '"Ball" begins with the letter "B" (/b/ sound).',
  },
  {
    id: 'p2',
    grade: 'primary',
    mode: 'spelling',
    prompt: 'Unscramble the letters to spell the animal that says "Meow":',
    hint: 'It has whiskers and loves warm milk.',
    scrambledLetters: ['T', 'A', 'C'],
    correctAnswer: 'CAT',
    explanation: 'C-A-T spells Cat!',
  },
  {
    id: 'p3',
    grade: 'primary',
    mode: 'vocabulary',
    prompt: 'What is the opposite of "BIG"?',
    hint: 'Think of an ant compared to an elephant.',
    options: ['Huge', 'Small', 'Tall', 'Heavy'],
    correctAnswer: 'Small',
    explanation: 'The opposite (antonym) of big is small.',
  },
  {
    id: 'p4',
    grade: 'primary',
    mode: 'sentence',
    prompt: 'Arrange the words to form a correct sentence:',
    hint: 'The sentence tells what the dog does.',
    sentenceTiles: ['The', 'barks.', 'dog'],
    correctSentence: 'The dog barks.',
    correctAnswer: 'The dog barks.',
    explanation: 'A simple sentence starts with a capital letter and has a subject and verb: "The dog barks."',
  },
  {
    id: 'p5',
    grade: 'primary',
    mode: 'matching',
    prompt: 'Find the rhyming pair for the word "SUN":',
    hint: 'Something you have when you play games!',
    options: ['Moon', 'Fun', 'Star', 'Sky'],
    correctAnswer: 'Fun',
    explanation: '"Sun" and "Fun" share the same ending sound /-ʌn/.',
  },

  // --- MIDDLE (Classes 3-5) ---
  {
    id: 'm1',
    grade: 'middle',
    mode: 'spelling',
    prompt: 'Unscramble the letters to spell a person who teaches:',
    hint: 'They guide you in the classroom every day.',
    scrambledLetters: ['T', 'E', 'A', 'C', 'H', 'E', 'R'],
    correctAnswer: 'TEACHER',
    explanation: 'T-E-A-C-H-E-R spells Teacher.',
  },
  {
    id: 'm2',
    grade: 'middle',
    mode: 'vocabulary',
    prompt: 'Choose the word that means the SAME as "COURAGEOUS":',
    hint: 'Someone who is not afraid of danger.',
    options: ['Timid', 'Brave', 'Gentle', 'Quiet'],
    correctAnswer: 'Brave',
    explanation: '"Courageous" and "Brave" are synonyms meaning having mental or moral strength.',
  },
  {
    id: 'm3',
    grade: 'middle',
    mode: 'grammar',
    prompt: 'Identify the NOUN in the sentence: "The golden eagle flies high."',
    hint: 'A noun is a person, place, animal, or thing.',
    options: ['Golden', 'Eagle', 'Flies', 'High'],
    correctAnswer: 'Eagle',
    explanation: '"Eagle" is a common noun representing a bird of prey. "Golden" is an adjective, "flies" is a verb.',
  },
  {
    id: 'm4',
    grade: 'middle',
    mode: 'sentence',
    prompt: 'Arrange the tiles to build a grammatically correct sentence:',
    hint: 'Start with the subject who is reading.',
    sentenceTiles: ['Priya', 'reads', 'a', 'fascinating', 'book.'],
    correctSentence: 'Priya reads a fascinating book.',
    correctAnswer: 'Priya reads a fascinating book.',
    explanation: 'Subject ("Priya") + Verb ("reads") + Object ("a fascinating book.").',
  },
  {
    id: 'm5',
    grade: 'middle',
    mode: 'grammar',
    prompt: 'Which word correctly completes the past tense? "Yesterday, Rohan ______ a letter."',
    hint: 'Past tense of write.',
    options: ['write', 'writing', 'wrote', 'written'],
    correctAnswer: 'wrote',
    explanation: 'The simple past tense of the irregular verb "write" is "wrote".',
  },

  // --- UPPER (Classes 6-8) ---
  {
    id: 'u1',
    grade: 'upper',
    mode: 'vocabulary',
    prompt: 'What does the word "BENEVOLENT" mean?',
    hint: 'Look at the root "bene" meaning good or well.',
    options: ['Harmful and hostile', 'Kind and generous', 'Mysterious and dark', 'Proud and arrogant'],
    correctAnswer: 'Kind and generous',
    explanation: '"Benevolent" derives from Latin bene (well) + velle (to wish). It characterizes goodwill or charity.',
  },
  {
    id: 'u2',
    grade: 'upper',
    mode: 'grammar',
    prompt: 'Identify the figure of speech: "The stars danced playfully in the moonlit sky."',
    hint: 'Attributing human qualities to non-human things.',
    options: ['Metaphor', 'Simile', 'Personification', 'Hyperbole'],
    correctAnswer: 'Personification',
    explanation: 'Personification gives human actions ("danced playfully") to inanimate celestial objects ("stars").',
  },
  {
    id: 'u3',
    grade: 'upper',
    mode: 'grammar',
    prompt: 'Choose the sentence with the correct subject-verb agreement:',
    hint: 'When two singular subjects are joined by "neither... nor", the verb agrees with the closer subject.',
    options: [
      'Neither the teacher nor the students was present.',
      'Neither the teacher nor the students were present.',
      'Neither the teachers nor the student were present.',
      'The group of scientists have discovered a cure.',
    ],
    correctAnswer: 'Neither the teacher nor the students were present.',
    explanation: 'In "neither... nor", the verb agrees in number with the nearer subject ("students" is plural, hence "were").',
  },
  {
    id: 'u4',
    grade: 'upper',
    mode: 'vocabulary',
    prompt: 'Select the antonym for "METICULOUS":',
    hint: 'Someone who does things with very little care.',
    options: ['Careless', 'Thorough', 'Precise', 'Painstaking'],
    correctAnswer: 'Careless',
    explanation: '"Meticulous" means showing great attention to detail. The opposite is "Careless".',
  },
  {
    id: 'u5',
    grade: 'upper',
    mode: 'sentence',
    prompt: 'Assemble this complex sentence properly:',
    hint: 'Dependent clause followed by independent clause.',
    sentenceTiles: ['Although', 'it', 'rained,', 'we', 'won', 'the', 'match.'],
    correctSentence: 'Although it rained, we won the match.',
    correctAnswer: 'Although it rained, we won the match.',
    explanation: 'Subordinating conjunction "Although" introduces the adverbial clause, followed by the main clause.',
  },
];

export const WordQuestPage: React.FC = () => {
  const navigate = useNavigate();
  const { addXP, addCoins, unlockBadge } = useAuthStore();

  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('middle');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Spelling state
  const [spellingInput, setSpellingInput] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);

  // Sentence building state
  const [assembledSentence, setAssembledSentence] = useState<string[]>([]);
  const [availableTiles, setAvailableTiles] = useState<string[]>([]);

  // Filter questions for active grade
  const questions = QUEST_QUESTIONS.filter((q) => q.grade === selectedGrade);
  const currentQ = questions[currentIdx] || questions[0];

  // Initialize question state
  useEffect(() => {
    if (!currentQ) return;
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setShowHint(false);

    if (currentQ.mode === 'spelling' && currentQ.scrambledLetters) {
      setAvailableLetters([...currentQ.scrambledLetters]);
      setSpellingInput([]);
    } else if (currentQ.mode === 'sentence' && currentQ.sentenceTiles) {
      setAvailableTiles([...currentQ.sentenceTiles]);
      setAssembledSentence([]);
    }
  }, [currentIdx, selectedGrade]);

  // Audio Synthesizer
  const playSfx = (type: 'correct' | 'wrong' | 'click' | 'victory') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(160, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'victory') {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.setValueAtTime(f, now + i * 0.12);
          g.gain.setValueAtTime(0.25, now + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.25);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + i * 0.12);
          o.stop(now + i * 0.12 + 0.25);
        });
      }
    } catch {
      // Audio context policy
    }
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked) return;
    playSfx('click');
    setSelectedOption(opt);
  };

  // Spelling letter clicks
  const handleAddLetter = (letter: string, index: number) => {
    if (isAnswerChecked) return;
    playSfx('click');
    setSpellingInput([...spellingInput, letter]);
    const updated = [...availableLetters];
    updated.splice(index, 1);
    setAvailableLetters(updated);
  };

  const handleRemoveLetter = (index: number) => {
    if (isAnswerChecked) return;
    playSfx('click');
    const letter = spellingInput[index];
    const updatedInput = [...spellingInput];
    updatedInput.splice(index, 1);
    setSpellingInput(updatedInput);
    setAvailableLetters([...availableLetters, letter]);
  };

  // Sentence tile clicks
  const handleAddTile = (tile: string, index: number) => {
    if (isAnswerChecked) return;
    playSfx('click');
    setAssembledSentence([...assembledSentence, tile]);
    const updated = [...availableTiles];
    updated.splice(index, 1);
    setAvailableTiles(updated);
  };

  const handleRemoveTile = (index: number) => {
    if (isAnswerChecked) return;
    playSfx('click');
    const tile = assembledSentence[index];
    const updatedSentence = [...assembledSentence];
    updatedSentence.splice(index, 1);
    setAssembledSentence(updatedSentence);
    setAvailableTiles([...availableTiles, tile]);
  };

  const checkAnswer = () => {
    if (isAnswerChecked) return;

    let isCorrect = false;
    if (currentQ.mode === 'spelling') {
      const userWord = spellingInput.join('').toUpperCase();
      isCorrect = userWord === currentQ.correctAnswer.toUpperCase();
    } else if (currentQ.mode === 'sentence') {
      const userSentence = assembledSentence.join(' ').trim();
      isCorrect = userSentence === currentQ.correctSentence?.trim();
    } else {
      isCorrect = selectedOption === currentQ.correctAnswer;
    }

    setIsAnswerChecked(true);

    if (isCorrect) {
      playSfx('correct');
      setScore((s) => s + 20);
      setStreakCount((st) => st + 1);
      addXP(25);
      addCoins(5);
    } else {
      playSfx('wrong');
      setStreakCount(0);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Completed current level
      playSfx('victory');
      unlockBadge('wordquest-linguist');
      addXP(100);
      addCoins(25);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setScore(0);
    setStreakCount(0);
    setIsAnswerChecked(false);
    setSelectedOption(null);
  };

  const isLevelCompleted = isAnswerChecked && currentIdx === questions.length - 1;

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
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
                WordQuest <span className="text-[#6541F5]">Adventure</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAE7FF] text-[#6541F5] dark:bg-[#26233E] dark:text-[#C4B5FD]">
                <Languages className="w-3.5 h-3.5" />
                Language Lab
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Grammar, spelling, vocabulary & comprehension quests for Classes 1–8
            </p>
          </div>
        </div>

        {/* Badges / Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold shadow-soft">
            <Trophy className="w-4 h-4 text-[#F5A623]" />
            <span>{score} XP</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0D5] text-[#F5A623] dark:bg-[#35250D] text-xs font-semibold">
            <Zap className="w-4 h-4 fill-current" />
            <span>{streakCount} Streak</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-card border border-border text-text-muted hover:text-text-primary transition-colors"
            title={soundEnabled ? 'Mute' : 'Enable audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#6541F5]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grade Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card border border-border rounded-2xl p-2 shadow-soft">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-muted px-2 uppercase tracking-wider">Level:</span>
          {(
            [
              { id: 'primary', label: 'Classes 1–2 (Letters & Phonics)' },
              { id: 'middle', label: 'Classes 3–5 (Spelling & Vocab)' },
              { id: 'upper', label: 'Classes 6–8 (Grammar & Syntax)' },
            ] as const
          ).map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => {
                setSelectedGrade(lvl.id);
                setCurrentIdx(0);
                setScore(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedGrade === lvl.id
                  ? 'bg-[#6541F5] text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-text-muted font-medium pr-2">
          Question {currentIdx + 1} of {questions.length}
        </div>
      </div>

      {/* Main Quest Arena */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-soft relative overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full bg-border h-2 rounded-full overflow-hidden mb-6">
          <div
            className="bg-[#6541F5] h-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Mode Pill & Prompt */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EAE7FF] text-[#6541F5] dark:bg-[#26233E] dark:text-[#C4B5FD]">
              <Sparkles className="w-3.5 h-3.5" />
              {currentQ.mode} Quest
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
              {currentQ.prompt}
            </h2>
          </div>

          {/* Mode Specific Interaction Area */}
          {/* 1. Multiple Choice / Matching / Vocab / Grammar */}
          {(currentQ.mode === 'matching' || currentQ.mode === 'vocabulary' || currentQ.mode === 'grammar') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options?.map((opt) => {
                const isSelected = selectedOption === opt;
                const isCorrect = isAnswerChecked && opt === currentQ.correctAnswer;
                const isWrong = isAnswerChecked && isSelected && opt !== currentQ.correctAnswer;

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswerChecked}
                    className={`p-4 rounded-2xl text-left font-semibold text-sm transition-all border ${
                      isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : isWrong
                        ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                        : isSelected
                        ? 'bg-[#6541F5]/10 border-[#6541F5] text-[#6541F5]'
                        : 'bg-card border-border hover:border-[#6541F5]/50 text-text-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                      {isWrong && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. Spelling Anagram Solver */}
          {currentQ.mode === 'spelling' && (
            <div className="space-y-6 pt-2">
              {/* Target Input Slots */}
              <div className="flex flex-wrap items-center justify-center gap-2 min-h-[64px] p-3 rounded-2xl bg-canvas border border-dashed border-border">
                {spellingInput.length === 0 ? (
                  <span className="text-xs text-text-muted">Click the letter stones below to spell the word</span>
                ) : (
                  spellingInput.map((letter, i) => (
                    <button
                      key={i}
                      onClick={() => handleRemoveLetter(i)}
                      className="w-12 h-12 rounded-xl bg-[#6541F5] text-white font-bold text-lg flex items-center justify-center shadow-md hover:scale-95 transition-transform"
                    >
                      {letter}
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled Available Letters */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {availableLetters.map((letter, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddLetter(letter, i)}
                    disabled={isAnswerChecked}
                    className="w-12 h-12 rounded-xl bg-card border border-border hover:border-[#6541F5] text-text-primary font-bold text-lg flex items-center justify-center shadow-soft hover:-translate-y-0.5 transition-all"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Sentence Construction */}
          {currentQ.mode === 'sentence' && (
            <div className="space-y-6 pt-2">
              {/* Formed Sentence Display */}
              <div className="flex flex-wrap items-center gap-2 min-h-[64px] p-4 rounded-2xl bg-canvas border border-dashed border-border">
                {assembledSentence.length === 0 ? (
                  <span className="text-xs text-text-muted">Click words in sequence to assemble the sentence</span>
                ) : (
                  assembledSentence.map((tile, i) => (
                    <button
                      key={i}
                      onClick={() => handleRemoveTile(i)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#6541F5] text-white font-semibold text-sm shadow-sm hover:scale-95 transition-transform"
                    >
                      {tile}
                    </button>
                  ))
                )}
              </div>

              {/* Available Tiles */}
              <div className="flex flex-wrap items-center gap-2">
                {availableTiles.map((tile, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddTile(tile, i)}
                    disabled={isAnswerChecked}
                    className="px-3.5 py-1.5 rounded-xl bg-card border border-border hover:border-[#6541F5] text-text-primary font-semibold text-sm shadow-soft hover:-translate-y-0.5 transition-all"
                  >
                    {tile}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hint & Explanation Box */}
          <div className="pt-2">
            {!showHint && !isAnswerChecked && (
              <button
                onClick={() => setShowHint(true)}
                className="inline-flex items-center gap-1.5 text-xs text-[#6541F5] hover:underline font-semibold"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Need a hint?
              </button>
            )}

            {showHint && !isAnswerChecked && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
                <span className="font-bold">Hint: </span>
                {currentQ.hint}
              </div>
            )}

            {isAnswerChecked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                  (currentQ.mode === 'spelling' && spellingInput.join('').toUpperCase() === currentQ.correctAnswer.toUpperCase()) ||
                  (currentQ.mode === 'sentence' && assembledSentence.join(' ').trim() === currentQ.correctSentence?.trim()) ||
                  selectedOption === currentQ.correctAnswer
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
                }`}
              >
                <p className="font-bold mb-1">
                  {(currentQ.mode === 'spelling' && spellingInput.join('').toUpperCase() === currentQ.correctAnswer.toUpperCase()) ||
                  (currentQ.mode === 'sentence' && assembledSentence.join(' ').trim() === currentQ.correctSentence?.trim()) ||
                  selectedOption === currentQ.correctAnswer
                    ? '🎉 Brilliant Work!'
                    : `Correct Answer: ${currentQ.correctSentence || currentQ.correctAnswer}`}
                </p>
                <p>{currentQ.explanation}</p>
              </motion.div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={handleRestart}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Quiz</span>
            </button>

            {!isAnswerChecked ? (
              <button
                onClick={checkAnswer}
                disabled={
                  (currentQ.mode === 'spelling' && spellingInput.length === 0) ||
                  (currentQ.mode === 'sentence' && assembledSentence.length === 0) ||
                  ((currentQ.mode === 'matching' || currentQ.mode === 'vocabulary' || currentQ.mode === 'grammar') &&
                    !selectedOption)
                }
                className="btn-primary px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <span>Check Answer</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn-primary px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-md"
              >
                <span>{currentIdx < questions.length - 1 ? 'Next Challenge' : 'Complete Quest'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordQuestPage;
