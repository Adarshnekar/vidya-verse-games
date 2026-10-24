import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, findUserByUsername, saveDb } from '../db/setup.js';
import { z } from 'zod';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vidyaverse-dev-secret-change-in-production';

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  studentId: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(4),
  pin: z.string().optional(),
  grade: z.number().int().min(1).max(12).default(8),
  role: z.enum(['Student', 'Teacher', 'Parent', 'Admin']).default('Student'),
  board: z.string().default('CBSE'),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  role: z.string().optional(),
});

router.post('/register', async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);

    if (findUserByUsername(body.username) || (body.studentId && findUserByUsername(body.studentId))) {
      return res.status(400).json({ error: 'Username or Student ID is already registered' });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const pinHash = body.pin ? await bcrypt.hash(body.pin, 10) : undefined;
    const user = {
      id: uuidv4(),
      username: body.username,
      studentId: body.studentId || `VV-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      name: body.name || body.username,
      role: body.role,
      board: body.board,
      email: body.email,
      passwordHash,
      pinHash,
      grade: body.grade,
      xp: 100,
      level: 1,
      createdAt: new Date().toISOString(),
    };

    db.data.users.push(user);
    await saveDb();

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        studentId: user.studentId,
        role: user.role,
        board: user.board,
        grade: user.grade,
        xp: user.xp,
        level: user.level,
        isGuest: false,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    res.status(400).json({ error: message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = findUserByUsername(body.username);

    if (!user) {
      return res.status(401).json({ error: 'User not found. Please check your Student ID / Roll No / Username.' });
    }

    let isValid = false;
    if (user.passwordHash && await bcrypt.compare(body.password, user.passwordHash)) {
      isValid = true;
    } else if (user.pinHash && await bcrypt.compare(body.password, user.pinHash)) {
      isValid = true;
    } else if (body.password === '2025' || body.password === 'password123' || body.password === '1234') {
      // Allow standard dev/demo passwords
      isValid = true;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect PIN or password. Try 2025 or password123.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role || 'Student' }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name || user.username,
        studentId: user.studentId || user.username,
        role: user.role || body.role || 'Student',
        board: user.board || 'CBSE',
        grade: user.grade || 8,
        xp: user.xp || 450,
        level: user.level || 2,
        isGuest: false,
      },
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
