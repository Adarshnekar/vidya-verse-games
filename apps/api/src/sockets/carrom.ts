import { Namespace, Socket } from 'socket.io';

interface CarromRoom {
  roomCode: string;
  players: { id: string; socketId: string; username: string; score: number }[];
  phase: 'waiting' | 'playing' | 'finished';
}

const rooms = new Map<string, CarromRoom>();

export function setupCarromSocket(namespace: Namespace) {
  namespace.on('connection', (socket: Socket) => {
    socket.on('create-room', ({ username }: { username: string }) => {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const room: CarromRoom = {
        roomCode,
        players: [{ id: socket.id, socketId: socket.id, username, score: 0 }],
        phase: 'waiting',
      };
      rooms.set(roomCode, room);
      socket.join(roomCode);
      socket.emit('room-created', { roomCode });
    });

    socket.on('join-room', ({ roomCode, username }: { roomCode: string; username: string }) => {
      const room = rooms.get(roomCode);
      if (!room || room.players.length >= 2) return socket.emit('error', 'Room unavailable');
      room.players.push({ id: socket.id, socketId: socket.id, username, score: 0 });
      socket.join(roomCode);
      room.phase = 'playing';
      namespace.to(roomCode).emit('game-started', { players: room.players });
    });

    // Shot relay - server validates basic constraints before broadcasting
    socket.on('shot', ({ roomCode, angle, power }: { roomCode: string; angle: number; power: number }) => {
      const room = rooms.get(roomCode);
      if (!room || room.phase !== 'playing') return;
      // Validate ranges
      if (power < 0 || power > 1 || angle < 0 || angle >= 360) return;
      namespace.to(roomCode).emit('shot-taken', { playerId: socket.id, angle, power });
    });

    socket.on('disconnect', () => {
      for (const [code, room] of rooms) {
        const idx = room.players.findIndex(p => p.socketId === socket.id);
        if (idx !== -1) {
          namespace.to(code).emit('player-disconnected', { playerId: socket.id });
        }
      }
    });
  });
}
