import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vidyaverse-dev-secret-change-in-production';

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; username: string };
    req.userId = payload.id;
    req.username = payload.username;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
