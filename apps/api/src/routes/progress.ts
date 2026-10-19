import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, findUserById, saveDb } from '../db/setup.js';
import { authenticate } from '../middleware/auth.js';
import type { Request, Response } from 'express';

interface AuthRequest extends Request {
  userId?: string;
}

const router = Router();

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const progress = db.data.progress.filter(p => p.userId === userId);
  const achievements = db.data.achievements.filter(a => a.userId === userId);
  const user = findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser, progress, achievements });
});

router.post('/xp', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { amount } = req.body as { amount: number };

  if (typeof amount !== 'number' || amount < 0 || amount > 1000) {
    return res.status(400).json({ error: 'Invalid XP amount' });
  }

  const user = findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.xp += amount;
  user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
  await saveDb();

  res.json({ xp: user.xp, level: user.level });
});

router.post('/complete', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { module, itemId, score } = req.body as { module: string; itemId: string; score?: number };

  const existing = db.data.progress.find(p => p.userId === userId && p.module === module && p.itemId === itemId);
  if (existing) {
    existing.completed = true;
    existing.score = score;
    existing.attempts += 1;
    existing.lastAttempt = new Date().toISOString();
  } else {
    db.data.progress.push({
      id: uuidv4(),
      userId,
      module,
      itemId,
      completed: true,
      score,
      attempts: 1,
      lastAttempt: new Date().toISOString(),
    });
  }
  await saveDb();
  res.json({ success: true });
});

export { router as progressRouter };
