import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, saveDb } from '../db/setup.js';
import { authenticate } from '../middleware/auth.js';
import type { Request, Response } from 'express';

interface AuthRequest extends Request {
  userId?: string;
}

const router = Router();

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

router.post('/room', authenticate, async (req: AuthRequest, res: Response) => {
  const { gameType, config } = req.body as { gameType: string; config: Record<string, unknown> };
  const id = uuidv4();
  const roomCode = generateRoomCode();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  db.data.gameSessions.push({
    id,
    roomCode,
    gameType,
    state: 'waiting',
    config: config || {},
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  await saveDb();
  res.json({ id, roomCode });
});

router.get('/room/:code', (req: Request, res: Response) => {
  const session = db.data.gameSessions.find(s => s.roomCode === req.params.code);
  if (!session) return res.status(404).json({ error: 'Room not found' });
  res.json(session);
});

export { router as gameRouter };
