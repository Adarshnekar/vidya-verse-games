import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  User,
  Bot,
  Trophy,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Star,
  Swords,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../stores/authStore';

// ==========================================
// TYPES & CONSTANTS
// ==========================================

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface PlayerConfig {
  id: number;
  name: string;
  color: PlayerColor;
  isBot: boolean;
  avatar: string;
  startPos: number; // cell index where player enters the track
  homePathStart: number; // start of relative home path
  hexColor: string;
  lightHex: string;
  bgHex: string;
  borderHex: string;
}

export interface MathQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  grade: string;
  topic: string;
  explanation: string;
}

export type GamePhase = 'rolling' | 'question' | 'moving' | 'finished';

// 52 Main Track Cells mapping to 15x15 Grid (col, row)
// 0 is Red Entry; 13 is Green Entry; 26 is Yellow Entry; 39 is Blue Entry
const TRACK_COORDS: Array<{ col: number; row: number }> = [
  /* 0 - 4: Red arm out */
  { col: 1, row: 6 },
  { col: 2, row: 6 },
  { col: 3, row: 6 },
  { col: 4, row: 6 },
  { col: 5, row: 6 },
  /* 5 - 10: Top arm left side */
  { col: 6, row: 5 },
  { col: 6, row: 4 },
  { col: 6, row: 3 },
  { col: 6, row: 2 }, // 8: Safe square
  { col: 6, row: 1 },
  { col: 6, row: 0 },
  /* 11 - 12: Top turn */
  { col: 7, row: 0 },
  { col: 8, row: 0 },
  /* 13 - 17: Green arm down */
  { col: 8, row: 1 }, // 13: Green entry, Safe
  { col: 8, row: 2 },
  { col: 8, row: 3 },
  { col: 8, row: 4 },
  { col: 8, row: 5 },
  /* 18 - 23: Right arm top side */
  { col: 9, row: 6 },
  { col: 10, row: 6 },
  { col: 11, row: 6 },
  { col: 12, row: 6 }, // 21: Safe square
  { col: 13, row: 6 },
  { col: 14, row: 6 },
  /* 24 - 25: Right turn */
  { col: 14, row: 7 },
  { col: 14, row: 8 },
  /* 26 - 30: Yellow arm left side */
  { col: 13, row: 8 }, // 26: Yellow entry, Safe
  { col: 12, row: 8 },
  { col: 11, row: 8 },
  { col: 10, row: 8 },
  { col: 9, row: 8 },
  /* 31 - 36: Bottom arm right side */
  { col: 8, row: 9 },
  { col: 8, row: 10 },
  { col: 8, row: 11 },
  { col: 8, row: 12 }, // 34: Safe square
  { col: 8, row: 13 },
  { col: 8, row: 14 },
  /* 37 - 38: Bottom turn */
  { col: 7, row: 14 },
  { col: 6, row: 14 },
  /* 39 - 43: Blue arm up */
  { col: 6, row: 13 }, // 39: Blue entry, Safe
  { col: 6, row: 12 },
  { col: 6, row: 11 },
  { col: 6, row: 10 },
  { col: 6, row: 9 },
  /* 44 - 49: Left arm bottom side */
  { col: 5, row: 8 },
  { col: 4, row: 8 },
  { col: 3, row: 8 },
  { col: 2, row: 8 }, // 47: Safe square
  { col: 1, row: 8 },
  { col: 0, row: 8 },
  /* 50 - 51: Left turn back to Red */
  { col: 0, row: 7 },
  { col: 0, row: 6 },
];

const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

// Home paths for each player (5 corridor cells + 1 center goal)
// Indices 52, 53, 54, 55, 56, 57 (57 = center goal)
const HOME_PATHS: Record<PlayerColor, Array<{ col: number; row: number }>> = {
  red: [
    { col: 1, row: 7 },
    { col: 2, row: 7 },
    { col: 3, row: 7 },
    { col: 4, row: 7 },
    { col: 5, row: 7 },
    { col: 6, row: 7 }, // Goal
  ],
  green: [
    { col: 7, row: 1 },
    { col: 7, row: 2 },
    { col: 7, row: 3 },
    { col: 7, row: 4 },
    { col: 7, row: 5 },
    { col: 7, row: 6 }, // Goal
  ],
  yellow: [
    { col: 13, row: 7 },
    { col: 12, row: 7 },
    { col: 11, row: 7 },
    { col: 10, row: 7 },
    { col: 9, row: 7 },
    { col: 8, row: 7 }, // Goal
  ],
  blue: [
    { col: 7, row: 13 },
    { col: 7, row: 12 },
    { col: 7, row: 11 },
    { col: 7, row: 10 },
    { col: 7, row: 9 },
    { col: 7, row: 8 }, // Goal
  ],
};

// Home bays coordinates for 4 tokens inside corner boxes
const HOME_BAYS: Record<PlayerColor, Array<{ x: number; y: number }>> = {
  red: [
    { x: 80, y: 80 },
    { x: 160, y: 80 },
    { x: 80, y: 160 },
    { x: 160, y: 160 },
  ],
  green: [
    { x: 440, y: 80 },
    { x: 520, y: 80 },
    { x: 440, y: 160 },
    { x: 520, y: 160 },
  ],
  yellow: [
    { x: 440, y: 440 },
    { x: 520, y: 440 },
    { x: 440, y: 520 },
    { x: 520, y: 520 },
  ],
  blue: [
    { x: 80, y: 440 },
    { x: 160, y: 440 },
    { x: 80, y: 520 },
    { x: 160, y: 520 },
  ],
};

const DEFAULT_PLAYERS: PlayerConfig[] = [
  {
    id: 0,
    name: 'Player 1 (You)',
    color: 'red',
    isBot: false,
    avatar: '👨‍🎓',
    startPos: 0,
    homePathStart: 52,
    hexColor: '#ef4444',
    lightHex: '#fca5a5',
    bgHex: 'rgba(239, 68, 68, 0.15)',
    borderHex: '#dc2626',
  },
  {
    id: 1,
    name: 'Ramanujan Bot',
    color: 'green',
    isBot: true,
    avatar: '🤖',
    startPos: 13,
    homePathStart: 52,
    hexColor: '#22c55e',
    lightHex: '#86efac',
    bgHex: 'rgba(34, 197, 94, 0.15)',
    borderHex: '#16a34a',
  },
  {
    id: 2,
    name: 'Aryabhata Bot',
    color: 'yellow',
    isBot: true,
    avatar: '⚡',
    startPos: 26,
    homePathStart: 52,
    hexColor: '#eab308',
    lightHex: '#fde047',
    bgHex: 'rgba(234, 179, 8, 0.15)',
    borderHex: '#ca8a04',
  },
  {
    id: 3,
    name: 'Bhaskara Bot',
    color: 'blue',
    isBot: true,
    avatar: '🔮',
    startPos: 39,
    homePathStart: 52,
    hexColor: '#3b82f6',
    lightHex: '#93c5fd',
    bgHex: 'rgba(59, 130, 246, 0.15)',
    borderHex: '#2563eb',
  },
];

// ==========================================
// 32 NCERT MATH QUESTIONS BANK (Grades 5-12)
// ==========================================

const QUESTIONS_BANK: MathQuestion[] = [
  {
    id: 'q1',
    question: 'What is the value of 15% of 240?',
    options: ['32', '36', '40', '48'],
    correctIndex: 1,
    grade: 'Class 7',
    topic: 'Percentages',
    explanation: '15% of 240 = (15 / 100) × 240 = 0.15 × 240 = 36.',
  },
  {
    id: 'q2',
    question: 'Solve for x: 3x - 7 = 14',
    options: ['5', '6', '7', '8'],
    correctIndex: 2,
    grade: 'Class 8',
    topic: 'Linear Equations',
    explanation: '3x = 14 + 7 = 21, hence x = 21 / 3 = 7.',
  },
  {
    id: 'q3',
    question: 'What is the sum of interior angles of a pentagon?',
    options: ['360°', '540°', '720°', '900°'],
    correctIndex: 1,
    grade: 'Class 8',
    topic: 'Geometry',
    explanation: 'Sum = (n - 2) × 180° = (5 - 2) × 180° = 3 × 180° = 540°.',
  },
  {
    id: 'q4',
    question: 'If a triangle has sides 3 cm, 4 cm, and 5 cm, what is its area?',
    options: ['6 cm²', '10 cm²', '12 cm²', '15 cm²'],
    correctIndex: 0,
    grade: 'Class 7',
    topic: 'Mensuration',
    explanation: 'Since 3² + 4² = 5², it is a right-angled triangle. Area = (1/2) × 3 × 4 = 6 cm².',
  },
  {
    id: 'q5',
    question: 'What is the value of 2⁴ × 2³?',
    options: ['2⁷ (128)', '2¹² (4096)', '64', '32'],
    correctIndex: 0,
    grade: 'Class 7',
    topic: 'Exponents',
    explanation: 'By law of exponents aᵐ × aⁿ = aᵐ⁺ⁿ, so 2⁴⁺³ = 2⁷ = 128.',
  },
  {
    id: 'q6',
    question: 'What is the median of: 3, 7, 2, 9, 5, 8, 4?',
    options: ['4', '5', '6', '7'],
    correctIndex: 1,
    grade: 'Class 9',
    topic: 'Statistics',
    explanation: 'Arranged in order: 2, 3, 4, 5, 7, 8, 9. The middle number is 5.',
  },
  {
    id: 'q7',
    question: 'What is the HCF of 36 and 84?',
    options: ['6', '8', '12', '18'],
    correctIndex: 2,
    grade: 'Class 6',
    topic: 'Number Theory',
    explanation: '36 = 12 × 3 and 84 = 12 × 7. The highest common factor is 12.',
  },
  {
    id: 'q8',
    question: 'If sin θ = 1/2, what is the value of θ (in degrees for acute angle)?',
    options: ['30°', '45°', '60°', '90°'],
    correctIndex: 0,
    grade: 'Class 10',
    topic: 'Trigonometry',
    explanation: 'In standard trigonometry tables, sin(30°) = 1/2.',
  },
  {
    id: 'q9',
    question: 'What is the perimeter of a semi-circle with radius r = 7 cm? (Use π = 22/7)',
    options: ['22 cm', '36 cm', '44 cm', '58 cm'],
    correctIndex: 1,
    grade: 'Class 10',
    topic: 'Mensuration',
    explanation: 'Perimeter = πr + 2r = (22/7 × 7) + 2(7) = 22 + 14 = 36 cm.',
  },
  {
    id: 'q10',
    question: 'Find the roots of equation: x² - 5x + 6 = 0',
    options: ['2 and 3', '-2 and -3', '1 and 6', '-1 and -6'],
    correctIndex: 0,
    grade: 'Class 10',
    topic: 'Quadratic Equations',
    explanation: '(x - 2)(x - 3) = 0 gives roots x = 2 and x = 3.',
  },
  {
    id: 'q11',
    question: 'What is 3/4 + 2/5?',
    options: ['5/9', '23/20', '17/20', '1'],
    correctIndex: 1,
    grade: 'Class 6',
    topic: 'Fractions',
    explanation: 'LCM of 4 and 5 is 20. (15 + 8) / 20 = 23/20 = 1.15.',
  },
  {
    id: 'q12',
    question: 'In a standard deck of 52 cards, what is the probability of drawing an Ace?',
    options: ['1/13', '1/26', '1/52', '4/13'],
    correctIndex: 0,
    grade: 'Class 9',
    topic: 'Probability',
    explanation: 'There are 4 Aces out of 52 cards: 4/52 = 1/13.',
  },
  {
    id: 'q13',
    question: 'What is the slope of the line passing through (1, 2) and (3, 8)?',
    options: ['2', '3', '4', '6'],
    correctIndex: 1,
    grade: 'Class 11',
    topic: 'Coordinate Geometry',
    explanation: 'Slope m = (y₂ - y₁) / (x₂ - x₁) = (8 - 2) / (3 - 1) = 6 / 2 = 3.',
  },
  {
    id: 'q14',
    question: 'What is the volume of a sphere of radius 3 cm? (Formula: 4/3 π r³)',
    options: ['12π cm³', '24π cm³', '36π cm³', '48π cm³'],
    correctIndex: 2,
    grade: 'Class 9',
    topic: 'Solid Geometry',
    explanation: 'Volume = (4/3) × π × 27 = 36π cm³.',
  },
  {
    id: 'q15',
    question: 'Simplify: (a + b)² - (a - b)²',
    options: ['2ab', '4ab', '2a² + 2b²', '0'],
    correctIndex: 1,
    grade: 'Class 8',
    topic: 'Algebraic Identities',
    explanation: '(a² + 2ab + b²) - (a² - 2ab + b²) = 4ab.',
  },
  {
    id: 'q16',
    question: 'What is the derivative of x³ with respect to x?',
    options: ['3x²', 'x²', '3x', '6x'],
    correctIndex: 0,
    grade: 'Class 12',
    topic: 'Calculus',
    explanation: 'd/dx(xⁿ) = n·xⁿ⁻¹, so d/dx(x³) = 3x².',
  },
  {
    id: 'q17',
    question: 'What is the simple interest on ₹1,000 at 5% per annum for 2 years?',
    options: ['₹50', '₹100', '₹150', '₹200'],
    correctIndex: 1,
    grade: 'Class 7',
    topic: 'Commercial Math',
    explanation: 'SI = (P × R × T) / 100 = (1000 × 5 × 2) / 100 = ₹100.',
  },
  {
    id: 'q18',
    question: 'If 8 workers build a wall in 6 days, how many days will 12 workers take?',
    options: ['3 days', '4 days', '5 days', '9 days'],
    correctIndex: 1,
    grade: 'Class 8',
    topic: 'Inverse Proportion',
    explanation: 'Total worker-days = 8 × 6 = 48. Days for 12 workers = 48 / 12 = 4 days.',
  },
  {
    id: 'q19',
    question: 'What is the 10th term of AP: 2, 5, 8, 11...?',
    options: ['27', '29', '31', '33'],
    correctIndex: 1,
    grade: 'Class 10',
    topic: 'Arithmetic Progression',
    explanation: 'a = 2, d = 3. a₁₀ = a + 9d = 2 + 9(3) = 29.',
  },
  {
    id: 'q20',
    question: 'What is the value of log₁₀(1000)?',
    options: ['1', '2', '3', '10'],
    correctIndex: 2,
    grade: 'Class 11',
    topic: 'Logarithms',
    explanation: 'Since 10³ = 1000, log₁₀(1000) = 3.',
  },
  {
    id: 'q21',
    question: 'What is the diagonal of a square with side 6 cm?',
    options: ['6√2 cm', '12 cm', '8 cm', '6√3 cm'],
    correctIndex: 0,
    grade: 'Class 8',
    topic: 'Pythagoras Theorem',
    explanation: 'Diagonal = s√2 = 6√2 cm (approx 8.48 cm).',
  },
  {
    id: 'q22',
    question: 'What is the mean of the first five prime numbers (2, 3, 5, 7, 11)?',
    options: ['5.0', '5.6', '6.2', '7.0'],
    correctIndex: 1,
    grade: 'Class 9',
    topic: 'Statistics',
    explanation: 'Sum = 2 + 3 + 5 + 7 + 11 = 28. Mean = 28 / 5 = 5.6.',
  },
  {
    id: 'q23',
    question: 'What is the value of cos(60°)?',
    options: ['1/2', '√3/2', '1/√2', '0'],
    correctIndex: 0,
    grade: 'Class 10',
    topic: 'Trigonometry',
    explanation: 'cos(60°) = 1/2 = 0.5.',
  },
  {
    id: 'q24',
    question: 'If x + 1/x = 4, find the value of x² + 1/x².',
    options: ['14', '16', '18', '20'],
    correctIndex: 0,
    grade: 'Class 9',
    topic: 'Algebra',
    explanation: '(x + 1/x)² = x² + 2 + 1/x² = 16, therefore x² + 1/x² = 16 - 2 = 14.',
  },
  {
    id: 'q25',
    question: 'How many diagonals does a regular hexagon have?',
    options: ['6', '9', '12', '15'],
    correctIndex: 1,
    grade: 'Class 8',
    topic: 'Polygons',
    explanation: 'Number of diagonals = n(n - 3) / 2 = 6(3) / 2 = 9.',
  },
  {
    id: 'q26',
    question: 'Find the compound interest on ₹8000 at 10% per annum for 1 year compounded half-yearly.',
    options: ['₹820', '₹800', '₹840', '₹880'],
    correctIndex: 0,
    grade: 'Class 8',
    topic: 'Compound Interest',
    explanation: 'Rate = 5% per half year, n = 2 periods. A = 8000 × (1.05)² = 8820. CI = 8820 - 8000 = ₹820.',
  },
  {
    id: 'q27',
    question: 'What is the unit digit in 7⁹⁵?',
    options: ['1', '3', '7', '9'],
    correctIndex: 1,
    grade: 'Class 10',
    topic: 'Modular Arithmetic',
    explanation: 'Powers of 7 cycle in 4s: 7, 9, 3, 1. 95 mod 4 = 3, so unit digit is 3.',
  },
  {
    id: 'q28',
    question: 'What is the value of ∫ 2x dx from 0 to 3?',
    options: ['6', '9', '12', '18'],
    correctIndex: 1,
    grade: 'Class 12',
    topic: 'Definite Integration',
    explanation: '∫ 2x dx = [x²] from 0 to 3 = 3² - 0 = 9.',
  },
  {
    id: 'q29',
    question: 'What is the remainder when x³ - 3x² + 4x - 5 is divided by (x - 1)?',
    options: ['-3', '-2', '1', '3'],
    correctIndex: 0,
    grade: 'Class 9',
    topic: 'Polynomials',
    explanation: 'By remainder theorem, P(1) = 1 - 3 + 4 - 5 = -3.',
  },
  {
    id: 'q30',
    question: 'What is the probability of rolling a prime number on a standard 6-sided die?',
    options: ['1/3', '1/2', '2/3', '5/6'],
    correctIndex: 1,
    grade: 'Class 6',
    topic: 'Probability',
    explanation: 'Prime numbers on a die are {2, 3, 5}. That is 3 out of 6 = 1/2.',
  },
  {
    id: 'q31',
    question: 'In a right triangle with hypotenuse 13 cm and one side 5 cm, what is the third side?',
    options: ['10 cm', '11 cm', '12 cm', '14 cm'],
    correctIndex: 2,
    grade: 'Class 7',
    topic: 'Pythagorean Triplets',
    explanation: '√(13² - 5²) = √(169 - 25) = √144 = 12 cm.',
  },
  {
    id: 'q32',
    question: 'What is the surface area of a cube of edge length 5 cm?',
    options: ['125 cm²', '150 cm²', '100 cm²', '175 cm²'],
    correctIndex: 1,
    grade: 'Class 7',
    topic: 'Mensuration',
    explanation: 'Total surface area = 6 × a² = 6 × 25 = 150 cm².',
  },
];

// Sound generator with Web Audio API (offline ready!)
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playDice() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.2);
    });
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playCapture() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }
}

const sfx = new SoundEffects();

// ==========================================
// COMPONENT
// ==========================================

export const MathLudoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, addXP, addCoins } = useAuthStore();

  // 4 players x 4 tokens = 16 tokens total
  // Position encoding:
  // -1: in home bay
  // 0 - 51: on main track
  // 52 - 56: on colored home corridor
  // 100: reached home/center (won!)
  const [tokens, setTokens] = useState<number[][]>([
    [-1, -1, -1, -1], // Player 0 (Red)
    [-1, -1, -1, -1], // Player 1 (Green)
    [-1, -1, -1, -1], // Player 2 (Yellow)
    [-1, -1, -1, -1], // Player 3 (Blue)
  ]);

  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [phase, setPhase] = useState<GamePhase>('rolling');
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0]);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Math quiz state
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(10);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Moving state
  const [movableTokenIndices, setMovableTokenIndices] = useState<number[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([
    'Game started! Roll the dice to enter the race.',
  ]);

  // Turn timer ref
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const botTurnRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  sfx.enabled = soundOn;

  // Sync player name from authStore
  const players = DEFAULT_PLAYERS.map((p, idx) =>
    idx === 0 && user ? { ...p, name: user.name } : p
  );

  // ------------------------------------------
  // GAME LOGIC HELPERS
  // ------------------------------------------

  // Check if a token can legally move given the dice value
  const canTokenMove = useCallback(
    (playerIdx: number, tokenPos: number, roll: number): boolean => {
      // If token is already home (100), cannot move
      if (tokenPos === 100) return false;

      // In home bay: only 6 allows token to enter
      if (tokenPos === -1) {
        return roll === 6;
      }

      const p = players[playerIdx];

      // On main track (0 - 51)
      if (tokenPos >= 0 && tokenPos <= 51) {
        const stepsFromStart = (tokenPos - p.startPos + 52) % 52;
        if (stepsFromStart + roll <= 50) {
          return true;
        } else if (stepsFromStart + roll <= 56) {
          // Can enter home corridor
          return true;
        } else if (stepsFromStart + roll === 57) {
          // Lands directly in goal
          return true;
        } else {
          // Over-roll
          return false;
        }
      }

      // On home path (52 - 56)
      if (tokenPos >= 52 && tokenPos <= 56) {
        const stepsInHome = tokenPos - 51; // 1 to 5
        return stepsInHome + roll <= 6;
      }

      return false;
    },
    [players]
  );

  // Calculate new position for a token
  const getNextPosition = useCallback(
    (playerIdx: number, currentPos: number, roll: number): number => {
      const p = players[playerIdx];

      if (currentPos === -1) {
        return p.startPos;
      }

      if (currentPos >= 0 && currentPos <= 51) {
        const stepsFromStart = (currentPos - p.startPos + 52) % 52;
        const totalSteps = stepsFromStart + roll;

        if (totalSteps <= 50) {
          return (currentPos + roll) % 52;
        } else if (totalSteps <= 56) {
          return 51 + (totalSteps - 50);
        } else if (totalSteps === 57) {
          return 100; // Goal reached!
        }
      }

      if (currentPos >= 52 && currentPos <= 56) {
        const stepsInHome = currentPos - 51;
        const newStep = stepsInHome + roll;
        if (newStep === 6) return 100;
        return 51 + newStep;
      }

      return currentPos;
    },
    [players]
  );

  // Add message to log
  const logAction = (msg: string) => {
    setMoveHistory((prev) => [msg, ...prev.slice(0, 19)]);
  };

  // ------------------------------------------
  // ADVANCE TURN
  // ------------------------------------------
  const advanceTurn = useCallback(
    (extraTurn = false) => {
      // Check if current player has won (all 4 tokens are 100)
      const currentWon = tokens[currentPlayer].every((pos) => pos === 100);
      if (currentWon) {
        setPhase('finished');
        logAction(`🏆 ${players[currentPlayer].name} has won the game!`);
        if (currentPlayer === 0) {
          addXP(250);
          addCoins(50);
        }
        return;
      }

      if (extraTurn) {
        logAction(`🎲 ${players[currentPlayer].name} rolled a 6 and gets another turn!`);
        setPhase('rolling');
      } else {
        const next = (currentPlayer + 1) % 4;
        setCurrentPlayer(next);
        setPhase('rolling');
      }

      setSelectedOption(null);
      setQuizFeedback(null);
      setMovableTokenIndices([]);
    },
    [tokens, currentPlayer, players, addXP, addCoins]
  );

  // ------------------------------------------
  // EXECUTE TOKEN MOVE
  // ------------------------------------------
  const executeMove = useCallback(
    (tokenIdx: number) => {
      const currentPos = tokens[currentPlayer][tokenIdx];
      const newPos = getNextPosition(currentPlayer, currentPos, diceValue);
      const activeP = players[currentPlayer];

      sfx.playDice();

      // Check for opponent capture on main track
      let captured = false;
      const nextTokens = tokens.map((row, pIdx) => {
        if (pIdx === currentPlayer) {
          const updated = [...row];
          updated[tokenIdx] = newPos;
          return updated;
        } else {
          // Check opponent tokens at newPos
          return row.map((opPos) => {
            if (
              newPos >= 0 &&
              newPos <= 51 &&
              !SAFE_SQUARES.includes(newPos) &&
              opPos === newPos
            ) {
              captured = true;
              return -1; // Sent back to base!
            }
            return opPos;
          });
        }
      });

      setTokens(nextTokens);

      // Score calculation
      let addedScore = diceValue * 10;
      if (newPos === 100) {
        addedScore += 100;
        logAction(`🎯 ${activeP.name}'s token reached home! (+100 pts)`);
      }

      if (captured) {
        addedScore += 50;
        sfx.playCapture();
        logAction(`⚔️ ${activeP.name} captured an opponent token! (+50 pts)`);
      }

      setScores((prev) => {
        const updated = [...prev];
        updated[currentPlayer] += addedScore;
        return updated;
      });

      // Extra turn if rolled 6, captured piece, or reached home
      const extraTurn = diceValue === 6 || captured || newPos === 100;
      setTimeout(() => {
        advanceTurn(extraTurn);
      }, 700);
    },
    [tokens, currentPlayer, diceValue, getNextPosition, players, advanceTurn]
  );

  // ------------------------------------------
  // HANDLE DICE ROLL
  // ------------------------------------------
  const rollDice = useCallback(() => {
    if (phase !== 'rolling' || isRolling) return;

    setIsRolling(true);
    sfx.playDice();

    let rollCounter = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCounter++;
      if (rollCounter > 8) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);

        // Find movable tokens
        const movable: number[] = [];
        tokens[currentPlayer].forEach((pos, idx) => {
          if (canTokenMove(currentPlayer, pos, finalRoll)) {
            movable.push(idx);
          }
        });

        if (movable.length === 0) {
          logAction(`${players[currentPlayer].name} rolled ${finalRoll} (No valid moves)`);
          setTimeout(() => {
            advanceTurn(finalRoll === 6);
          }, 1200);
        } else {
          setMovableTokenIndices(movable);
          // Trigger Math Quiz
          const randomQ =
            QUESTIONS_BANK[Math.floor(Math.random() * QUESTIONS_BANK.length)];
          setCurrentQuestion(randomQ);
          setQuestionTimeLeft(10);
          setSelectedOption(null);
          setQuizFeedback(null);
          setPhase('question');
        }
      }
    }, 60);
  }, [phase, isRolling, tokens, currentPlayer, canTokenMove, players, advanceTurn]);

  // ------------------------------------------
  // 10-SECOND QUIZ TIMER
  // ------------------------------------------
  useEffect(() => {
    if (phase === 'question' && questionTimeLeft > 0 && !quizFeedback) {
      timerRef.current = setTimeout(() => {
        setQuestionTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (phase === 'question' && questionTimeLeft === 0 && !quizFeedback) {
      // Timeout!
      sfx.playWrong();
      setQuizFeedback({
        isCorrect: false,
        text: 'Time out! Turn forfeited. Think faster next time.',
      });
      setTimeout(() => {
        advanceTurn(false);
      }, 2000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, questionTimeLeft, quizFeedback, advanceTurn]);

  // ------------------------------------------
  // HANDLE QUESTION ANSWER
  // ------------------------------------------
  const handleAnswerSelect = (optionIdx: number) => {
    if (selectedOption !== null || !currentQuestion || phase !== 'question') return;

    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentQuestion.correctIndex;

    if (isCorrect) {
      sfx.playCorrect();
      setQuizFeedback({
        isCorrect: true,
        text: 'Correct! Move your token.',
      });
      setScores((prev) => {
        const next = [...prev];
        next[currentPlayer] += 20; // 20 bonus points for correct answer
        return next;
      });

      setTimeout(() => {
        setPhase('moving');
        // If human and only 1 token can move, auto move it
        if (currentPlayer === 0 && movableTokenIndices.length === 1) {
          executeMove(movableTokenIndices[0]);
        }
      }, 1000);
    } else {
      sfx.playWrong();
      setQuizFeedback({
        isCorrect: false,
        text: `Incorrect! Correct answer was: ${currentQuestion.options[currentQuestion.correctIndex]}`,
      });
      setTimeout(() => {
        advanceTurn(false);
      }, 2200);
    }
  };

  // ------------------------------------------
  // BOT AUTOMATION
  // ------------------------------------------
  useEffect(() => {
    const activePlayer = players[currentPlayer];
    if (!activePlayer.isBot || phase === 'finished') return;

    // Bot Rolling
    if (phase === 'rolling' && !isRolling) {
      botTurnRef.current = setTimeout(() => {
        rollDice();
      }, 1200);
    }

    // Bot Answering Math Question
    if (phase === 'question' && currentQuestion && !quizFeedback) {
      botTurnRef.current = setTimeout(() => {
        // Bots have ~85% accuracy
        const isBotCorrect = Math.random() < 0.85;
        const answerIdx = isBotCorrect
          ? currentQuestion.correctIndex
          : (currentQuestion.correctIndex + 1) % 4;

        handleAnswerSelect(answerIdx);
      }, 1800);
    }

    // Bot Token Selection
    if (phase === 'moving' && movableTokenIndices.length > 0) {
      botTurnRef.current = setTimeout(() => {
        // Bot strategy:
        // 1. Can capture opponent?
        // 2. Can enter home (100)?
        // 3. Move token from base (-1) if 6?
        // 4. Furthest token on track?
        let chosenIdx = movableTokenIndices[0];

        for (const idx of movableTokenIndices) {
          const currentPos = tokens[currentPlayer][idx];
          const nextPos = getNextPosition(currentPlayer, currentPos, diceValue);

          // If lands in home
          if (nextPos === 100) {
            chosenIdx = idx;
            break;
          }

          // If captures opponent
          if (nextPos >= 0 && nextPos <= 51 && !SAFE_SQUARES.includes(nextPos)) {
            const hasOpponent = tokens.some(
              (pTokens, pIdx) =>
                pIdx !== currentPlayer && pTokens.some((pos) => pos === nextPos)
            );
            if (hasOpponent) {
              chosenIdx = idx;
              break;
            }
          }

          // If releasing from base
          if (currentPos === -1 && diceValue === 6) {
            chosenIdx = idx;
          }
        }

        executeMove(chosenIdx);
      }, 1200);
    }

    return () => {
      if (botTurnRef.current) clearTimeout(botTurnRef.current);
    };
  }, [
    currentPlayer,
    phase,
    isRolling,
    currentQuestion,
    quizFeedback,
    movableTokenIndices,
    tokens,
    diceValue,
    players,
    rollDice,
    getNextPosition,
    executeMove,
  ]);

  // Restart game
  const restartGame = () => {
    setTokens([
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
    ]);
    setCurrentPlayer(0);
    setPhase('rolling');
    setDiceValue(1);
    setScores([0, 0, 0, 0]);
    setSelectedOption(null);
    setQuizFeedback(null);
    setMovableTokenIndices([]);
    setMoveHistory(['Game reset! Roll the dice to begin.']);
  };

  // Render Dice Icon
  const renderDiceFace = (val: number) => {
    switch (val) {
      case 1:
        return <Dice1 className="w-12 h-12 text-white" />;
      case 2:
        return <Dice2 className="w-12 h-12 text-white" />;
      case 3:
        return <Dice3 className="w-12 h-12 text-white" />;
      case 4:
        return <Dice4 className="w-12 h-12 text-white" />;
      case 5:
        return <Dice5 className="w-12 h-12 text-white" />;
      case 6:
      default:
        return <Dice6 className="w-12 h-12 text-white" />;
    }
  };

  // ------------------------------------------
  // SVG BOARD RENDERING CALCULATIONS
  // ------------------------------------------
  const cellSize = 40; // 15 cells * 40 = 600px square

  // Compute position for any token on the board
  const getTokenCoords = (playerIdx: number, tokenIdx: number) => {
    const pos = tokens[playerIdx][tokenIdx];
    const color = players[playerIdx].color;

    // Home bay
    if (pos === -1) {
      return HOME_BAYS[color][tokenIdx];
    }

    // Goal reached (Center)
    if (pos === 100) {
      const centerOffsets = [
        { x: 280, y: 280 },
        { x: 320, y: 280 },
        { x: 320, y: 320 },
        { x: 280, y: 320 },
      ];
      return centerOffsets[playerIdx];
    }

    // Home path (52 - 57)
    if (pos >= 52 && pos <= 57) {
      const corridorIndex = pos - 52;
      const cell = HOME_PATHS[color][corridorIndex];
      return {
        x: cell.col * cellSize + cellSize / 2,
        y: cell.row * cellSize + cellSize / 2,
      };
    }

    // Main track (0 - 51)
    const trackCell = TRACK_COORDS[pos];
    return {
      x: trackCell.col * cellSize + cellSize / 2,
      y: trackCell.row * cellSize + cellSize / 2,
    };
  };

  return (
    <div className="min-h-screen bg-surface-900 text-surface-100 selection:bg-playlab-500/30 selection:text-playlab-200">
      {/* Top Bar Header */}
      <header className="border-b border-surface-800 bg-surface-850/80 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/playlab')}
            className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-display text-white">Math Ludo</h1>
              <span className="badge-playlab text-[10px]">NCERT Math Edition</span>
            </div>
            <p className="text-xs text-surface-400 hidden sm:block">
              Answer questions correctly to maneuver tokens to the center sanctuary
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
            title={soundOn ? 'Mute sound' : 'Enable sound'}
          >
            {soundOn ? <Volume2 className="w-5 h-5 text-playlab-400" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={restartGame}
            className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
            title="Reset Game"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Player Cards & Turn Indicator (3 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Players & Standings
              </h2>
              <span className="text-xs text-playlab-400 font-medium">1-4 Players</span>
            </div>

            <div className="space-y-2">
              {players.map((p, idx) => {
                const isCurrent = currentPlayer === idx;
                const homeTokensCount = tokens[idx].filter((pos) => pos === 100).length;

                return (
                  <motion.div
                    key={p.id}
                    animate={{
                      scale: isCurrent ? 1.02 : 1,
                      borderColor: isCurrent ? p.hexColor : 'rgba(55, 65, 81, 0.4)',
                    }}
                    className={clsx(
                      'p-3 rounded-xl border transition-all duration-200 relative overflow-hidden',
                      isCurrent
                        ? 'bg-surface-750 shadow-md ring-2'
                        : 'bg-surface-800/60 border-surface-700/50'
                    )}
                    style={{
                      borderColor: isCurrent ? p.hexColor : undefined,
                    }}
                  >
                    {/* Active player indicator bar */}
                    {isCurrent && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: p.hexColor }}
                      />
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{p.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-white">
                              {p.name}
                            </span>
                            {p.isBot && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-700 text-surface-300">
                                AI
                              </span>
                            )}
                          </div>
                          <span
                            className="text-xs font-medium capitalize"
                            style={{ color: p.hexColor }}
                          >
                            {p.color} Base
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-white">
                          {scores[idx]} pts
                        </div>
                        <div className="text-[11px] text-surface-400">
                          {homeTokensCount}/4 Home
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick Rules Mini-Card */}
          <div className="card p-4 space-y-2 text-xs text-surface-300 bg-surface-800/40 border-surface-700/40">
            <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-playlab-400" />
              Ludo Rules & Scoring
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-surface-400">
              <li>Roll 6 to launch a token from base.</li>
              <li>Every move requires answering a math quiz correctly!</li>
              <li>Landing on opponent captures them (+50 pts + extra turn).</li>
              <li>Starred cells (★) are safe zones.</li>
              <li>First player to get all 4 tokens home wins (+250 XP).</li>
            </ul>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: 15x15 SVG LUDO BOARD (6 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[560px] aspect-square bg-surface-900 rounded-3xl p-2 sm:p-3 border-2 border-surface-700/80 shadow-2xl overflow-hidden">
            <svg
              viewBox="0 0 600 600"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }}
            >
              {/* Board Outer Background */}
              <rect x="0" y="0" width="600" height="600" fill="#0f172a" rx="16" />

              {/* --------------------------------------------------- */}
              {/* 4 CORNER BASES (6x6 cells each = 240x240 px) */}
              {/* --------------------------------------------------- */}
              {/* Red Base (Top-Left) */}
              <g>
                <rect x="0" y="0" width="240" height="240" fill="#dc2626" rx="12" />
                <rect x="30" y="30" width="180" height="180" fill="#1e293b" rx="8" />
                {HOME_BAYS.red.map((bay, idx) => (
                  <circle
                    key={idx}
                    cx={bay.x}
                    cy={bay.y}
                    r="22"
                    fill="#334155"
                    stroke="#dc2626"
                    strokeWidth="3"
                  />
                ))}
                <text
                  x="120"
                  y="26"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  RED BASE
                </text>
              </g>

              {/* Green Base (Top-Right) */}
              <g>
                <rect x="360" y="0" width="240" height="240" fill="#16a34a" rx="12" />
                <rect x="390" y="30" width="180" height="180" fill="#1e293b" rx="8" />
                {HOME_BAYS.green.map((bay, idx) => (
                  <circle
                    key={idx}
                    cx={bay.x}
                    cy={bay.y}
                    r="22"
                    fill="#334155"
                    stroke="#16a34a"
                    strokeWidth="3"
                  />
                ))}
                <text
                  x="480"
                  y="26"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  GREEN BASE
                </text>
              </g>

              {/* Yellow Base (Bottom-Right) */}
              <g>
                <rect x="360" y="360" width="240" height="240" fill="#ca8a04" rx="12" />
                <rect x="390" y="390" width="180" height="180" fill="#1e293b" rx="8" />
                {HOME_BAYS.yellow.map((bay, idx) => (
                  <circle
                    key={idx}
                    cx={bay.x}
                    cy={bay.y}
                    r="22"
                    fill="#334155"
                    stroke="#ca8a04"
                    strokeWidth="3"
                  />
                ))}
                <text
                  x="480"
                  y="586"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  YELLOW BASE
                </text>
              </g>

              {/* Blue Base (Bottom-Left) */}
              <g>
                <rect x="0" y="360" width="240" height="240" fill="#2563eb" rx="12" />
                <rect x="30" y="390" width="180" height="180" fill="#1e293b" rx="8" />
                {HOME_BAYS.blue.map((bay, idx) => (
                  <circle
                    key={idx}
                    cx={bay.x}
                    cy={bay.y}
                    r="22"
                    fill="#334155"
                    stroke="#2563eb"
                    strokeWidth="3"
                  />
                ))}
                <text
                  x="120"
                  y="586"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  BLUE BASE
                </text>
              </g>

              {/* --------------------------------------------------- */}
              {/* 52 MAIN TRACK CELLS */}
              {/* --------------------------------------------------- */}
              {TRACK_COORDS.map((coord, idx) => {
                const isSafe = SAFE_SQUARES.includes(idx);
                const isRedEntry = idx === 0;
                const isGreenEntry = idx === 13;
                const isYellowEntry = idx === 26;
                const isBlueEntry = idx === 39;

                let cellFill = '#1e293b';
                if (isRedEntry) cellFill = '#dc2626';
                else if (isGreenEntry) cellFill = '#16a34a';
                else if (isYellowEntry) cellFill = '#ca8a04';
                else if (isBlueEntry) cellFill = '#2563eb';

                return (
                  <g key={`track-${idx}`}>
                    <rect
                      x={coord.col * cellSize}
                      y={coord.row * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill={cellFill}
                      stroke="#334155"
                      strokeWidth="1"
                    />

                    {/* Safe Star Indicator */}
                    {isSafe && (
                      <g
                        transform={`translate(${coord.col * cellSize + 20}, ${
                          coord.row * cellSize + 20
                        })`}
                      >
                        <polygon
                          points="0,-8 2.5,-2.5 8,0 2.5,2.5 0,8 -2.5,2.5 -8,0 -2.5,-2.5"
                          fill="#facc15"
                        />
                      </g>
                    )}
                  </g>
                );
              })}

              {/* --------------------------------------------------- */}
              {/* 4 COLORED HOME PATHS */}
              {/* --------------------------------------------------- */}
              {/* Red corridor */}
              {HOME_PATHS.red.slice(0, 5).map((coord, idx) => (
                <rect
                  key={`red-home-${idx}`}
                  x={coord.col * cellSize}
                  y={coord.row * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#ef4444"
                  stroke="#b91c1c"
                  strokeWidth="1"
                />
              ))}

              {/* Green corridor */}
              {HOME_PATHS.green.slice(0, 5).map((coord, idx) => (
                <rect
                  key={`green-home-${idx}`}
                  x={coord.col * cellSize}
                  y={coord.row * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#22c55e"
                  stroke="#15803d"
                  strokeWidth="1"
                />
              ))}

              {/* Yellow corridor */}
              {HOME_PATHS.yellow.slice(0, 5).map((coord, idx) => (
                <rect
                  key={`yellow-home-${idx}`}
                  x={coord.col * cellSize}
                  y={coord.row * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#eab308"
                  stroke="#a16207"
                  strokeWidth="1"
                />
              ))}

              {/* Blue corridor */}
              {HOME_PATHS.blue.slice(0, 5).map((coord, idx) => (
                <rect
                  key={`blue-home-${idx}`}
                  x={coord.col * cellSize}
                  y={coord.row * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#3b82f6"
                  stroke="#1d4ed8"
                  strokeWidth="1"
                />
              ))}

              {/* --------------------------------------------------- */}
              {/* CENTER SANCTUARY / HOME TRIANGLES */}
              {/* Center is cols 6..8, rows 6..8 (240 to 360 px) */}
              {/* --------------------------------------------------- */}
              <g>
                {/* Red Triangle (Left) */}
                <polygon points="240,240 300,300 240,360" fill="#ef4444" />
                {/* Green Triangle (Top) */}
                <polygon points="240,240 300,300 360,240" fill="#22c55e" />
                {/* Yellow Triangle (Right) */}
                <polygon points="360,240 300,300 360,360" fill="#eab308" />
                {/* Blue Triangle (Bottom) */}
                <polygon points="240,360 300,300 360,360" fill="#3b82f6" />

                {/* Central Star */}
                <circle cx="300" cy="300" r="14" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                <polygon
                  points="300,292 302,298 308,300 302,302 300,308 298,302 292,300 298,298"
                  fill="#facc15"
                />
              </g>

              {/* --------------------------------------------------- */}
              {/* TOKENS RENDERING (16 tokens) */}
              {/* --------------------------------------------------- */}
              {tokens.map((pTokens, playerIdx) =>
                pTokens.map((pos, tokenIdx) => {
                  const coords = getTokenCoords(playerIdx, tokenIdx);
                  const isCurrent = currentPlayer === playerIdx;
                  const canMove =
                    isCurrent &&
                    phase === 'moving' &&
                    movableTokenIndices.includes(tokenIdx);

                  const p = players[playerIdx];

                  return (
                    <g
                      key={`token-${playerIdx}-${tokenIdx}`}
                      onClick={() => {
                        if (canMove && !p.isBot) {
                          executeMove(tokenIdx);
                        }
                      }}
                      className={clsx(
                        'transition-transform duration-300',
                        canMove && !p.isBot ? 'cursor-pointer hover:scale-110' : ''
                      )}
                    >
                      {/* Pulse Ring if Can Move */}
                      {canMove && !p.isBot && (
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r="20"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          strokeDasharray="4 2"
                          className="animate-spin-slow"
                        />
                      )}

                      {/* Token Outer Shadow */}
                      <circle
                        cx={coords.x}
                        cy={coords.y + 2}
                        r="14"
                        fill="rgba(0,0,0,0.4)"
                      />

                      {/* Token Body */}
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="13"
                        fill={p.hexColor}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />

                      {/* Inner Ring */}
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="8"
                        fill={p.borderHex}
                      />

                      {/* Token Number */}
                      <text
                        x={coords.x}
                        y={coords.y + 3.5}
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        {tokenIdx + 1}
                      </text>
                    </g>
                  );
                })
              )}
            </svg>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Dice, Math Quiz & Move Log (3 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Turn & Dice Box */}
          <div className="card text-center p-5 space-y-4 bg-surface-800 border-surface-700/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Turn Action
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: players[currentPlayer].bgHex,
                  color: players[currentPlayer].hexColor,
                }}
              >
                {players[currentPlayer].name}
              </span>
            </div>

            {/* 3D Dice Display Button */}
            <div className="flex flex-col items-center justify-center py-2">
              <motion.button
                whileHover={phase === 'rolling' && currentPlayer === 0 ? { scale: 1.08 } : {}}
                whileTap={phase === 'rolling' && currentPlayer === 0 ? { scale: 0.92 } : {}}
                animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.45, repeat: isRolling ? Infinity : 0 }}
                onClick={() => {
                  if (currentPlayer === 0 && phase === 'rolling') {
                    rollDice();
                  }
                }}
                disabled={phase !== 'rolling' || currentPlayer !== 0 || isRolling}
                className={clsx(
                  'w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl transition-all',
                  currentPlayer === 0 && phase === 'rolling'
                    ? 'bg-gradient-to-br from-orange-500 to-red-600 hover:shadow-glow-playlab cursor-pointer ring-4 ring-orange-500/30'
                    : 'bg-surface-700 cursor-not-allowed opacity-80'
                )}
              >
                {renderDiceFace(diceValue)}
              </motion.button>

              <p className="mt-3 text-xs font-medium text-surface-300">
                {isRolling
                  ? 'Rolling dice...'
                  : phase === 'rolling'
                  ? currentPlayer === 0
                    ? 'Tap the dice to roll!'
                    : `${players[currentPlayer].name} is rolling...`
                  : phase === 'question'
                  ? `Rolled ${diceValue}! Solve the math quiz.`
                  : phase === 'moving'
                  ? currentPlayer === 0
                    ? 'Click your highlighted token to move!'
                    : 'Bot is selecting token...'
                  : 'Game completed!'}
              </p>
            </div>
          </div>

          {/* Math Quiz Card Modal/Panel */}
          <AnimatePresence mode="wait">
            {phase === 'question' && currentQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="card p-4 space-y-3 bg-surface-800 border-2 border-playlab-500/60 shadow-xl"
              >
                {/* Header with Circular Timer */}
                <div className="flex items-center justify-between pb-2 border-b border-surface-700/60">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-playlab-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentQuestion.topic} ({currentQuestion.grade})</span>
                  </div>

                  {/* 10s Timer Pill */}
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-900 border border-surface-700">
                    <Clock
                      className={clsx(
                        'w-3.5 h-3.5',
                        questionTimeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-yellow-400'
                      )}
                    />
                    <span
                      className={clsx(
                        'font-mono text-xs font-bold',
                        questionTimeLeft <= 3 ? 'text-red-400' : 'text-white'
                      )}
                    >
                      {questionTimeLeft}s
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm font-semibold text-white leading-snug">
                  {currentQuestion.question}
                </p>

                {/* 4 Choices */}
                <div className="space-y-2 pt-1">
                  {currentQuestion.options.map((opt, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isCorrect = optIdx === currentQuestion.correctIndex;
                    let btnStyle = 'bg-surface-700/60 hover:bg-surface-700 text-surface-200 border-surface-600/40';

                    if (selectedOption !== null) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-red-500/20 text-red-300 border-red-500';
                      } else {
                        btnStyle = 'bg-surface-800 text-surface-500 border-surface-700 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={selectedOption !== null || currentPlayer !== 0}
                        onClick={() => handleAnswerSelect(optIdx)}
                        className={clsx(
                          'w-full text-left px-3 py-2 rounded-xl text-xs border transition-all flex items-center justify-between',
                          btnStyle
                        )}
                      >
                        <span>{opt}</span>
                        {selectedOption !== null && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {selectedOption !== null && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
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
                      'p-2.5 rounded-xl text-xs font-medium border flex items-start gap-2',
                      quizFeedback.isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    )}
                  >
                    {quizFeedback.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{quizFeedback.text}</p>
                      <p className="text-[11px] opacity-80 mt-0.5">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Move Log History */}
          <div className="card p-3 space-y-2 bg-surface-800/80 border-surface-700/60 max-h-48 overflow-y-auto">
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Game Audit Trail</span>
            </h3>
            <div className="space-y-1.5 text-xs font-mono text-surface-300">
              {moveHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-1.5 rounded bg-surface-900/50 border border-surface-800 text-[11px]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MathLudoPage;
