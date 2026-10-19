import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from 'dotenv';
import { setupDatabase } from './db/setup.js';
import { authRouter } from './routes/auth.js';
import { progressRouter } from './routes/progress.js';
import { gameRouter } from './routes/game.js';
import { setupLudoSocket } from './sockets/ludo.js';
import { setupCarromSocket } from './sockets/carrom.js';

config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/progress', progressRouter);
app.use('/api/game', gameRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '2.0.0', timestamp: new Date().toISOString() });
});

// Socket namespaces
setupLudoSocket(io.of('/ludo'));
setupCarromSocket(io.of('/carrom'));

// Init DB then start server
setupDatabase().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 VidyaVerse API running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO listening on ws://localhost:${PORT}`);
  });
});
