import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, '../../../../database/vidyaverse.json');

interface User {
  id: string;
  username: string;
  email?: string;
  passwordHash?: string;
  grade: number;
  xp: number;
  level: number;
  avatar?: string;
  createdAt: string;
}

interface ProgressItem {
  id: string;
  userId: string;
  module: string;
  itemId: string;
  completed: boolean;
  score?: number;
  attempts: number;
  lastAttempt?: string;
  metadata?: Record<string, unknown>;
}

interface Achievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
}

interface GameSession {
  id: string;
  roomCode: string;
  gameType: string;
  state: 'waiting' | 'playing' | 'finished';
  config: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
}

interface CodeSubmission {
  id: string;
  userId?: string;
  problemId: string;
  language: string;
  sourceCode: string;
  verdict: string;
  runtimeMs?: number;
  memoryKb?: number;
  submittedAt: string;
}

interface DbSchema {
  users: User[];
  progress: ProgressItem[];
  achievements: Achievement[];
  gameSessions: GameSession[];
  codeSubmissions: CodeSubmission[];
}

const defaultData: DbSchema = {
  users: [],
  progress: [],
  achievements: [],
  gameSessions: [],
  codeSubmissions: [],
};

export let db: Low<DbSchema>;

export async function setupDatabase() {
  db = await JSONFilePreset<DbSchema>(DB_PATH, defaultData);
  console.log('✅ Database initialized at', DB_PATH);
}

// Helper: find user by username
export function findUserByUsername(username: string): User | undefined {
  return db.data.users.find(u => u.username === username);
}

// Helper: find user by id
export function findUserById(id: string): User | undefined {
  return db.data.users.find(u => u.id === id);
}

// Helper: save all changes
export async function saveDb() {
  await db.write();
}
