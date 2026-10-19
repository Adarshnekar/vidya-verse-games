import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, findUserByUsername, saveDb } from '../db/setup.js';
import { z } from 'zod';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vidyaverse-dev-secret-change-in-production';

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional(),
  password: z.string().min(6),
  grade: z.number().int().min(5).max(12).default(8),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

router.post('/register', async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);

    if (findUserByUsername(body.username)) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = {
      id: uuidv4(),
      username: body.username,
      email: body.email,
      passwordHash,
      grade: body.grade,
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
    };

    db.data.users.push(user);
    await saveDb();

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, username: user.username, grade: user.grade, xp: 0, level: 1 } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    res.status(400).json({ error: message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = findUserByUsername(body.username);

    if (!user || !user.passwordHash || !await bcrypt.compare(body.password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: { id: user.id, username: user.username, grade: user.grade, xp: user.xp, level: user.level },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    res.status(400).json({ error: message });
  }
});

router.post('/guest', (_req, res) => {
  const id = 'guest-' + uuidv4().slice(0, 8);
  const token = jwt.sign({ id, username: id, isGuest: true }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id, username: 'Guest', grade: 8, xp: 0, level: 1, isGuest: true } });
});

export { router as authRouter };
