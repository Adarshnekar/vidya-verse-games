// =========================================================
// VIDYAVERSE NEWTON'S CARROM — TYPES & DATA CONTRACTS
// =========================================================

export type CarromPlayMode = 'solo' | 'duel' | 'team' | 'friends';
export type CarromSubMode = 'classic' | 'lab';
export type BotDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CoinType = 'queen' | 'white' | 'black' | 'striker';

export interface PocketPosition {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface CoinBodyData {
  id: string;
  type: CoinType;
  color: string;
  points: number;
  radius: number;
  mass: number;
  pocketed: boolean;
  pocketedBy?: string;
}

export interface PlayerSlot {
  id: string;
  name: string;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
  assignedColor?: 'white' | 'black'; // In classic rules
  score: number;
  coinsPocketed: {
    white: number;
    black: number;
    queen: number;
  };
  side: 'south' | 'north' | 'west' | 'east'; // Baseline position
  teamId?: 1 | 2; // For 2v2 doubles
  isActive: boolean;
}

export interface ShotTelemetry {
  initialSpeed: number; // px/s
  strikerMass: number; // kg (scaled)
  angleDegrees: number;
  powerPercent: number;
  momentum: number; // kg*px/s
  kineticEnergy: number; // Joules (scaled)
  collisionCount: number;
  coinsPocketedInShot: CoinType[];
  restitution: number;
  frictionCoeff: number;
  newtonExplanation: string;
  lawReferenced: 1 | 2 | 3;
}

export interface CarromPhysicsConfig {
  frictionAir: number; // Linear deceleration (boric powder)
  restitution: number; // Cushion & coin bounciness
  strikerMass: number;
  coinMass: number;
  powerMultiplier: number;
}

export interface CarromMatchState {
  matchId: string;
  mode: CarromPlayMode;
  subMode: CarromSubMode;
  players: PlayerSlot[];
  activePlayerIndex: number;
  turnNumber: number;
  queenState: 'on_board' | 'pocketed_uncovered' | 'covered';
  queenCoverPlayerIndex?: number;
  isShotInMotion: boolean;
  targetScore: number;
  winner: PlayerSlot | null;
  lastShotTelemetry: ShotTelemetry | null;
  config: CarromPhysicsConfig;
  status: 'lobby' | 'active' | 'completed';
}

export interface CarromSavedGame {
  matchState: CarromMatchState;
  coinPositions: Array<{
    id: string;
    type: CoinType;
    x: number;
    y: number;
    vx: number;
    vy: number;
    pocketed: boolean;
  }>;
  strikerPosition: { x: number; y: number };
  timestamp: number;
}
