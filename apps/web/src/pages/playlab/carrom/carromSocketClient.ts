// =========================================================
// VIDYAVERSE NEWTON'S CARROM — ONLINE ROOM SOCKET CLIENT
// =========================================================

import { io, Socket } from 'socket.io-client';
import { PlayerSlot } from './types';

export interface CarromSocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onRoomCreated?: (data: { roomCode: string; player: PlayerSlot }) => void;
  onPlayerJoined?: (data: { player: PlayerSlot; players: PlayerSlot[] }) => void;
  onGameStarted?: (data: { players: PlayerSlot[]; activeIndex: number }) => void;
  onShotExecuted?: (data: { playerIndex: number; angleRad: number; powerPercent: number; baselinePos: number }) => void;
  onTurnChanged?: (data: { activeIndex: number }) => void;
  onError?: (error: string) => void;
}

class CarromSocketClient {
  private socket: Socket | null = null;
  private callbacks: CarromSocketCallbacks = {};

  public connect(serverUrl: string = 'http://localhost:3001', callbacks: CarromSocketCallbacks = {}): void {
    this.callbacks = callbacks;

    if (this.socket && this.socket.connected) {
      return;
    }

    try {
      this.socket = io(`${serverUrl}/carrom`, {
        transports: ['websocket', 'polling'],
        timeout: 4000,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        this.callbacks.onConnect?.();
      });

      this.socket.on('disconnect', () => {
        this.callbacks.onDisconnect?.();
      });

      this.socket.on('room_created', (data) => {
        this.callbacks.onRoomCreated?.(data);
      });

      this.socket.on('player_joined', (data) => {
        this.callbacks.onPlayerJoined?.(data);
      });

      this.socket.on('game_started', (data) => {
        this.callbacks.onGameStarted?.(data);
      });

      this.socket.on('shot_executed', (data) => {
        this.callbacks.onShotExecuted?.(data);
      });

      this.socket.on('turn_changed', (data) => {
        this.callbacks.onTurnChanged?.(data);
      });

      this.socket.on('error', (err) => {
        this.callbacks.onError?.(typeof err === 'string' ? err : 'Connection error');
      });
    } catch (err) {
      console.warn('[CarromSocket] Server offline, operating in simulated online room', err);
    }
  }

  public createRoom(player: PlayerSlot): string {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    if (this.socket && this.socket.connected) {
      this.socket.emit('create_room', { roomCode: code, player });
    } else {
      setTimeout(() => {
        this.callbacks.onRoomCreated?.({ roomCode: code, player });
      }, 300);
    }
    return code;
  }

  public joinRoom(roomCode: string, player: PlayerSlot): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_room', { roomCode, player });
    } else {
      setTimeout(() => {
        this.callbacks.onPlayerJoined?.({ player, players: [player] });
      }, 300);
    }
  }

  public broadcastShot(playerIndex: number, angleRad: number, powerPercent: number, baselinePos: number): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('execute_shot', { playerIndex, angleRad, powerPercent, baselinePos });
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const carromSocketClient = new CarromSocketClient();
