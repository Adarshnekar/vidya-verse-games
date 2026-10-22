// Ludo Game Types & Data Models
export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';
export type BotDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type MatchPreset = 'solo' | 'duel' | 'pass' | 'custom';
export type GameMode = 'offline' | 'online';
export type GamePhase = 'rolling' | 'question' | 'moving' | 'finished' | 'turn_transition';
export type GradeCategory = 'all' | 'primary' | 'foundational' | 'middle' | 'high';

export interface PlayerConfig {
  id: number;
  name: string;
  color: PlayerColor;
  isBot: boolean;
  botDifficulty: BotDifficulty;
  avatar: string;
  startPos: number; // cell index where player enters the track
  homePathStart: number; // start of relative home path
  hexColor: string;
  lightHex: string;
  bgHex: string;
  borderHex: string;
  isActive: boolean; // false for unused bases in 1v1 Duel
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

export interface MatchStats {
  startTime: number;
  endTime?: number;
  turnsPlayed: number;
  captures: Record<number, number>;
  questionsAnswered: number;
  questionsCorrect: number;
  topicStats: Record<string, { total: number; correct: number }>;
  xpEarned: number;
}

export interface SavedMatchState {
  timestamp: number;
  gameMode: GameMode;
  activePreset: MatchPreset;
  selectedGradeCategory: GradeCategory;
  questionTimerDuration: number;
  playerConfigs: PlayerConfig[];
  tokens: number[][];
  scores: number[];
  currentPlayer: number;
  phase: GamePhase;
  diceValue: number;
  consecutiveSixes: number;
  moveHistory: string[];
  stats: MatchStats;
}

// ------------------------------------------
// BOARD COORDINATES & GEOMETRY CONSTANTS
// ------------------------------------------

// 52 Main Track Cells mapping to 15x15 Grid (col, row)
// 0 is Red Entry; 13 is Green Entry; 26 is Yellow Entry; 39 is Blue Entry
export const TRACK_COORDS: Array<{ col: number; row: number }> = [
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
  { col: 8, row: 12 },
  { col: 8, row: 13 },
  { col: 8, row: 14 }, // 34: Safe square
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

// Safe Star Squares (no captures allowed)
export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

// Colored home corridors leading into center (5 cells each)
export const HOME_PATHS: Record<PlayerColor, Array<{ col: number; row: number }>> = {
  red: [
    { col: 1, row: 7 },
    { col: 2, row: 7 },
    { col: 3, row: 7 },
    { col: 4, row: 7 },
    { col: 5, row: 7 },
    { col: 6, row: 7 }, // Final home junction
  ],
  green: [
    { col: 7, row: 1 },
    { col: 7, row: 2 },
    { col: 7, row: 3 },
    { col: 7, row: 4 },
    { col: 7, row: 5 },
    { col: 7, row: 6 },
  ],
  yellow: [
    { col: 13, row: 7 },
    { col: 12, row: 7 },
    { col: 11, row: 7 },
    { col: 10, row: 7 },
    { col: 9, row: 7 },
    { col: 8, row: 7 },
  ],
  blue: [
    { col: 7, row: 13 },
    { col: 7, row: 12 },
    { col: 7, row: 11 },
    { col: 7, row: 10 },
    { col: 7, row: 9 },
    { col: 7, row: 8 },
  ],
};

// Precise pixel centers for the 4 tokens in each player's home base bay
export const HOME_BAYS: Record<PlayerColor, Array<{ x: number; y: number }>> = {
  red: [
    { x: 70, y: 70 },
    { x: 150, y: 70 },
    { x: 70, y: 150 },
    { x: 150, y: 150 },
  ],
  green: [
    { x: 450, y: 70 },
    { x: 530, y: 70 },
    { x: 450, y: 150 },
    { x: 530, y: 150 },
  ],
  yellow: [
    { x: 450, y: 450 },
    { x: 530, y: 450 },
    { x: 450, y: 530 },
    { x: 530, y: 530 },
  ],
  blue: [
    { x: 70, y: 450 },
    { x: 150, y: 450 },
    { x: 70, y: 530 },
    { x: 150, y: 530 },
  ],
};

export const DEFAULT_PLAYERS: PlayerConfig[] = [
  {
    id: 0,
    name: 'Explorer',
    color: 'red',
    isBot: false,
    botDifficulty: 'intermediate',
    avatar: '👨‍🎓',
    startPos: 0,
    homePathStart: 50,
    hexColor: '#ef4444',
    lightHex: '#fee2e2',
    bgHex: 'rgba(239, 68, 68, 0.12)',
    borderHex: '#b91c1c',
    isActive: true,
  },
  {
    id: 1,
    name: 'Ramanujan Bot',
    color: 'green',
    isBot: true,
    botDifficulty: 'advanced',
    avatar: '🤖',
    startPos: 13,
    homePathStart: 11,
    hexColor: '#22c55e',
    lightHex: '#dcfce7',
    bgHex: 'rgba(34, 197, 94, 0.12)',
    borderHex: '#15803d',
    isActive: true,
  },
  {
    id: 2,
    name: 'Aryabhata Bot',
    color: 'yellow',
    isBot: true,
    botDifficulty: 'intermediate',
    avatar: '⚡',
    startPos: 26,
    homePathStart: 24,
    hexColor: '#eab308',
    lightHex: '#fef9c3',
    bgHex: 'rgba(234, 179, 8, 0.12)',
    borderHex: '#a16207',
    isActive: true,
  },
  {
    id: 3,
    name: 'Bhaskara Bot',
    color: 'blue',
    isBot: true,
    botDifficulty: 'advanced',
    avatar: '🔮',
    startPos: 39,
    homePathStart: 37,
    hexColor: '#3b82f6',
    lightHex: '#dbeafe',
    bgHex: 'rgba(59, 130, 246, 0.12)',
    borderHex: '#1d4ed8',
    isActive: true,
  },
];
