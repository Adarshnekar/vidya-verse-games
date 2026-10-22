import { io, Socket } from 'socket.io-client';

export interface OnlinePlayer {
  id: string;
  socketId: string;
  username: string;
  color: 'red' | 'green' | 'yellow' | 'blue';
  isBot: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard';
  tokens: number[];
  score: number;
  isConnected: boolean;
}

export interface OnlineQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface LudoSocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onRoomCreated?: (data: { roomCode: string; player: OnlinePlayer }) => void;
  onPlayerJoined?: (data: { player: OnlinePlayer; players: OnlinePlayer[] }) => void;
  onGameStarted?: (data: { players: OnlinePlayer[]; currentPlayerIndex: number; phase: string }) => void;
  onDiceRolled?: (data: { dice: number; playerIndex: number }) => void;
  onQuestion?: (data: { question: OnlineQuestion; timeoutMs: number }) => void;
  onQuestionResult?: (data: { isCorrect: boolean; correctIndex: number; answerIndex: number; timeTaken: number }) => void;
  onSelectToken?: (data: { movableTokens: number[] }) => void;
  onTokenMoved?: (data: { playerIndex: number; tokenIndex: number; from: number; to: number; tokens: number[] }) => void;
  onTokenCaptured?: (data: { capturedColor: string; position: number }) => void;
  onTurnChanged?: (data: { currentPlayerIndex: number; phase: string }) => void;
  onExtraTurn?: (data: { playerIndex: number }) => void;
  onGameFinished?: (data: { winnerId: string; winnerUsername: string; players: OnlinePlayer[] }) => void;
  onPlayerDisconnected?: (data: { playerId: string }) => void;
  onError?: (error: string) => void;
}

class LudoSocketClient {
  private socket: Socket | null = null;
  private callbacks: LudoSocketCallbacks = {};

  public connect(serverUrl: string = 'http://localhost:3001', callbacks: LudoSocketCallbacks = {}) {
    this.callbacks = callbacks;

    if (this.socket && this.socket.connected) {
      return;
    }

    try {
      this.socket = io(`${serverUrl}/ludo`, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        this.callbacks.onConnect?.();
      });

      this.socket.on('disconnect', () => {
        this.callbacks.onDisconnect?.();
      });

      this.socket.on('room-created', (data) => {
        this.callbacks.onRoomCreated?.(data);
      });

      this.socket.on('player-joined', (data) => {
        this.callbacks.onPlayerJoined?.(data);
      });

      this.socket.on('game-started', (data) => {
        this.callbacks.onGameStarted?.(data);
      });

      this.socket.on('dice-rolled', (data) => {
        this.callbacks.onDiceRolled?.(data);
      });

      this.socket.on('question', (data) => {
        this.callbacks.onQuestion?.(data);
      });

      this.socket.on('question-result', (data) => {
        this.callbacks.onQuestionResult?.(data);
      });

      this.socket.on('select-token', (data) => {
        this.callbacks.onSelectToken?.(data);
      });

      this.socket.on('token-moved', (data) => {
        this.callbacks.onTokenMoved?.(data);
      });

      this.socket.on('token-captured', (data) => {
        this.callbacks.onTokenCaptured?.(data);
      });

      this.socket.on('turn-changed', (data) => {
        this.callbacks.onTurnChanged?.(data);
      });

      this.socket.on('extra-turn', (data) => {
        this.callbacks.onExtraTurn?.(data);
      });

      this.socket.on('game-finished', (data) => {
        this.callbacks.onGameFinished?.(data);
      });

      this.socket.on('player-disconnected', (data) => {
        this.callbacks.onPlayerDisconnected?.(data);
      });

      this.socket.on('error', (err) => {
        this.callbacks.onError?.(typeof err === 'string' ? err : 'Socket error occurred');
      });

      this.socket.on('connect_error', (err) => {
        this.callbacks.onError?.(`Connection error: ${err.message}`);
      });
    } catch (err) {
      console.warn('Socket initialization error:', err);
      this.callbacks.onError?.('Failed to initialize multiplayer socket');
    }
  }

  public isConnected(): boolean {
    return !!this.socket?.connected;
  }

  public createRoom(username: string, grade: number = 7, difficulty: 'easy' | 'medium' | 'hard' = 'medium', questionTimeout: number = 10000) {
    if (!this.socket) return;
    this.socket.emit('create-room', {
      username,
      config: {
        grade,
        difficulty,
        botCount: 0,
        questionTimeout,
      },
    });
  }

  public joinRoom(roomCode: string, username: string) {
    if (!this.socket) return;
    this.socket.emit('join-room', { roomCode, username });
  }

  public addBot(roomCode: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    if (!this.socket) return;
    this.socket.emit('add-bot', { roomCode, difficulty });
  }

  public startGame(roomCode: string) {
    if (!this.socket) return;
    this.socket.emit('start-game', { roomCode });
  }

  public rollDice(roomCode: string) {
    if (!this.socket) return;
    this.socket.emit('roll-dice', { roomCode });
  }

  public answerQuestion(roomCode: string, answerIndex: number) {
    if (!this.socket) return;
    this.socket.emit('answer-question', { roomCode, answerIndex });
  }

  public moveToken(roomCode: string, tokenIndex: number) {
    if (!this.socket) return;
    this.socket.emit('move-token', { roomCode, tokenIndex });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const ludoSocket = new LudoSocketClient();
