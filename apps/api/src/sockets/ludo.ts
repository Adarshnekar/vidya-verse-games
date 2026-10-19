import { Namespace, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/setup.js';

interface LudoPlayer {
  id: string;
  socketId: string;
  username: string;
  color: 'red' | 'green' | 'yellow' | 'blue';
  isBot: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard';
  tokens: number[]; // positions: -1=home, 0-51=board, 57=won
  score: number;
  isConnected: boolean;
}

interface LudoGameState {
  id: string;
  roomCode: string;
  players: LudoPlayer[];
  currentPlayerIndex: number;
  phase: 'waiting' | 'rolling' | 'question' | 'moving' | 'finished';
  diceValue: number;
  questionTimer: ReturnType<typeof setTimeout> | null;
  currentQuestion: Question | null;
  questionStartTime: number;
  winnerId: string | null;
  config: LudoConfig;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  topic: string;
  grade: number;
}

interface LudoConfig {
  grade: number;
  difficulty: 'easy' | 'medium' | 'hard';
  botCount: number;
  questionTimeout: number; // ms
}

const rooms = new Map<string, LudoGameState>();

// Simple math question bank
const QUESTION_BANK: Question[] = [
  { id: 'q1', text: 'What is 7 × 8?', options: ['54', '56', '63', '64'], correctIndex: 1, topic: 'multiplication', grade: 5 },
  { id: 'q2', text: 'What is 144 ÷ 12?', options: ['10', '11', '12', '13'], correctIndex: 2, topic: 'division', grade: 5 },
  { id: 'q3', text: 'What is 25% of 80?', options: ['15', '20', '25', '30'], correctIndex: 1, topic: 'percentages', grade: 7 },
  { id: 'q4', text: 'Solve: 3x + 5 = 20', options: ['x=4', 'x=5', 'x=6', 'x=7'], correctIndex: 1, topic: 'algebra', grade: 8 },
  { id: 'q5', text: 'What is √144?', options: ['11', '12', '13', '14'], correctIndex: 1, topic: 'square-roots', grade: 7 },
  { id: 'q6', text: 'What is 15² - 10²?', options: ['100', '125', '125', '125'], correctIndex: 1, topic: 'algebra', grade: 9 },
  { id: 'q7', text: 'What is 3/4 + 1/2?', options: ['1', '1¼', '1½', '2'], correctIndex: 1, topic: 'fractions', grade: 6 },
  { id: 'q8', text: 'Area of a circle with r=7 (π≈22/7)?', options: ['144', '154', '164', '174'], correctIndex: 1, topic: 'geometry', grade: 7 },
  { id: 'q9', text: 'What is 2⁸?', options: ['128', '256', '512', '64'], correctIndex: 1, topic: 'powers', grade: 8 },
  { id: 'q10', text: 'If a car travels 60 km/h for 2.5h, how far?', options: ['120km', '150km', '180km', '200km'], correctIndex: 1, topic: 'speed', grade: 6 },
];

function getQuestion(grade: number): Question {
  const suitable = QUESTION_BANK.filter(q => Math.abs(q.grade - grade) <= 2);
  return suitable[Math.floor(Math.random() * suitable.length)] || QUESTION_BANK[0];
}

function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// Ludo board positions: -1 = home, 0-51 = main track, 52-57 = colored home path
// Each player starts at different offsets: R=0, G=13, Y=26, B=39
const PLAYER_STARTS: Record<string, number> = { red: 0, green: 13, yellow: 26, blue: 39 };
const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];
const TOKEN_COUNT = 4;

function canTokenMove(token: number, dice: number, color: string): boolean {
  if (token === 57) return false; // already home
  if (token === -1) return dice === 6; // needs 6 to start
  return true;
}

function moveToken(token: number, dice: number, color: string): number {
  if (token === -1 && dice === 6) {
    return PLAYER_STARTS[color]; // enter board
  }
  if (token === -1) return -1;
  
  const start = PLAYER_STARTS[color];
  const relPos = (token - start + 52) % 52;
  const newRelPos = relPos + dice;
  
  if (newRelPos >= 52) {
    // entering home stretch (positions 52-57)
    const homePos = 52 + (newRelPos - 52);
    if (homePos > 57) return token; // can't overshoot
    return homePos;
  }
  
  return (start + newRelPos) % 52;
}

export function setupLudoSocket(namespace: Namespace) {
  namespace.on('connection', (socket: Socket) => {
    console.log('Ludo: client connected', socket.id);

    socket.on('create-room', ({ username, config }: { username: string; config: LudoConfig }) => {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const player: LudoPlayer = {
        id: socket.id,
        socketId: socket.id,
        username,
        color: 'red',
        isBot: false,
        tokens: [-1, -1, -1, -1],
        score: 0,
        isConnected: true,
      };
      
      const state: LudoGameState = {
        id: uuidv4(),
        roomCode,
        players: [player],
        currentPlayerIndex: 0,
        phase: 'waiting',
        diceValue: 0,
        questionTimer: null,
        currentQuestion: null,
        questionStartTime: 0,
        winnerId: null,
        config,
      };
      
      rooms.set(roomCode, state);
      socket.join(roomCode);
      socket.emit('room-created', { roomCode, player });
    });

    socket.on('join-room', ({ roomCode, username }: { roomCode: string; username: string }) => {
      const state = rooms.get(roomCode);
      if (!state) return socket.emit('error', 'Room not found');
      if (state.players.length >= 4) return socket.emit('error', 'Room is full');
      if (state.phase !== 'waiting') return socket.emit('error', 'Game already started');

      const colors: Array<'red' | 'green' | 'yellow' | 'blue'> = ['red', 'green', 'yellow', 'blue'];
      const usedColors = state.players.map(p => p.color);
      const color = colors.find(c => !usedColors.includes(c))!;

      const player: LudoPlayer = {
        id: socket.id,
        socketId: socket.id,
        username,
        color,
        isBot: false,
        tokens: [-1, -1, -1, -1],
        score: 0,
        isConnected: true,
      };

      state.players.push(player);
      socket.join(roomCode);
      namespace.to(roomCode).emit('player-joined', { player, players: state.players });
    });

    socket.on('add-bot', ({ roomCode, difficulty }: { roomCode: string; difficulty: 'easy' | 'medium' | 'hard' }) => {
      const state = rooms.get(roomCode);
      if (!state || state.players.length >= 4) return;

      const colors: Array<'red' | 'green' | 'yellow' | 'blue'> = ['red', 'green', 'yellow', 'blue'];
      const usedColors = state.players.map(p => p.color);
      const color = colors.find(c => !usedColors.includes(c))!;

      const bot: LudoPlayer = {
        id: 'bot-' + uuidv4().slice(0, 8),
        socketId: '',
        username: `Bot (${difficulty})`,
        color,
        isBot: true,
        botDifficulty: difficulty,
        tokens: [-1, -1, -1, -1],
        score: 0,
        isConnected: true,
      };

      state.players.push(bot);
      namespace.to(roomCode).emit('player-joined', { player: bot, players: state.players });
    });

    socket.on('start-game', ({ roomCode }: { roomCode: string }) => {
      const state = rooms.get(roomCode);
      if (!state) return;
      if (state.players.length < 2) return socket.emit('error', 'Need at least 2 players');

      state.phase = 'rolling';
      namespace.to(roomCode).emit('game-started', {
        players: state.players,
        currentPlayerIndex: state.currentPlayerIndex,
        phase: state.phase,
      });

      // If first player is a bot, trigger bot turn
      scheduleBotTurn(state, namespace);
    });

    socket.on('roll-dice', ({ roomCode }: { roomCode: string }) => {
      const state = rooms.get(roomCode);
      if (!state || state.phase !== 'rolling') return;

      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.socketId !== socket.id) return socket.emit('error', 'Not your turn');

      performDiceRoll(state, namespace, roomCode);
    });

    socket.on('answer-question', ({ roomCode, answerIndex }: { roomCode: string; answerIndex: number }) => {
      const state = rooms.get(roomCode);
      if (!state || state.phase !== 'question' || !state.currentQuestion) return;

      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.socketId !== socket.id) return;

      handleAnswer(state, namespace, roomCode, answerIndex);
    });

    socket.on('move-token', ({ roomCode, tokenIndex }: { roomCode: string; tokenIndex: number }) => {
      const state = rooms.get(roomCode);
      if (!state || state.phase !== 'moving') return;

      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.socketId !== socket.id) return;

      executeMove(state, namespace, roomCode, state.currentPlayerIndex, tokenIndex);
    });

    socket.on('disconnect', () => {
      // Mark player disconnected in all rooms they were in
      for (const [code, state] of rooms) {
        const player = state.players.find(p => p.socketId === socket.id);
        if (player) {
          player.isConnected = false;
          namespace.to(code).emit('player-disconnected', { playerId: player.id });
        }
      }
    });
  });
}

function performDiceRoll(state: LudoGameState, namespace: Namespace, roomCode: string) {
  const dice = rollDice();
  state.diceValue = dice;

  namespace.to(roomCode).emit('dice-rolled', {
    dice,
    playerIndex: state.currentPlayerIndex,
  });

  // Check if any token can legally move
  const currentPlayer = state.players[state.currentPlayerIndex];
  const movableTokens = currentPlayer.tokens
    .map((pos, i) => ({ pos, i }))
    .filter(({ pos }) => canTokenMove(pos, dice, currentPlayer.color));

  if (movableTokens.length === 0) {
    // No valid move - skip turn
    setTimeout(() => {
      advanceTurn(state, namespace, roomCode);
    }, 1500);
    return;
  }

  // Present math question
  const question = getQuestion(state.config.grade);
  state.currentQuestion = question;
  state.phase = 'question';
  state.questionStartTime = Date.now();

  namespace.to(roomCode).emit('question', {
    question: {
      id: question.id,
      text: question.text,
      options: question.options,
    },
    timeoutMs: state.config.questionTimeout || 10000,
  });

  // Auto-timeout
  state.questionTimer = setTimeout(() => {
    handleAnswer(state, namespace, roomCode, -1); // -1 = timeout
  }, (state.config.questionTimeout || 10000) + 500);
}

function handleAnswer(state: LudoGameState, namespace: Namespace, roomCode: string, answerIndex: number) {
  if (state.questionTimer) {
    clearTimeout(state.questionTimer);
    state.questionTimer = null;
  }

  const question = state.currentQuestion!;
  const isCorrect = answerIndex === question.correctIndex;
  const timeTaken = Date.now() - state.questionStartTime;

  namespace.to(roomCode).emit('question-result', {
    isCorrect,
    correctIndex: question.correctIndex,
    answerIndex,
    timeTaken,
  });

  if (!isCorrect) {
    // Wrong answer - skip move
    setTimeout(() => {
      advanceTurn(state, namespace, roomCode);
    }, 1500);
    return;
  }

  // Correct - allow move selection
  state.phase = 'moving';
  const currentPlayer = state.players[state.currentPlayerIndex];
  const movableTokens = currentPlayer.tokens
    .map((pos, i) => ({ pos, i }))
    .filter(({ pos }) => canTokenMove(pos, state.diceValue, currentPlayer.color))
    .map(({ i }) => i);

  namespace.to(roomCode).emit('select-token', { movableTokens });

  // If only one movable token, auto-move after short delay
  if (movableTokens.length === 1) {
    setTimeout(() => {
      executeMove(state, namespace, roomCode, state.currentPlayerIndex, movableTokens[0]);
    }, 500);
  }

  // If bot's turn, handle automatically
  const currentP = state.players[state.currentPlayerIndex];
  if (currentP.isBot) {
    const tokenChoice = movableTokens[Math.floor(Math.random() * movableTokens.length)];
    setTimeout(() => {
      executeMove(state, namespace, roomCode, state.currentPlayerIndex, tokenChoice);
    }, 800 + Math.random() * 700);
  }
}

function executeMove(state: LudoGameState, namespace: Namespace, roomCode: string, playerIndex: number, tokenIndex: number) {
  const player = state.players[playerIndex];
  const oldPos = player.tokens[tokenIndex];
  const newPos = moveToken(oldPos, state.diceValue, player.color);

  player.tokens[tokenIndex] = newPos;

  // Check for captures on main board
  if (newPos >= 0 && newPos < 52 && !SAFE_SQUARES.includes(newPos)) {
    for (const other of state.players) {
      if (other.id === player.id) continue;
      other.tokens = other.tokens.map(t => {
        if (t === newPos) {
          namespace.to(roomCode).emit('token-captured', { capturedColor: other.color, position: newPos });
          return -1; // send back home
        }
        return t;
      });
    }
  }

  namespace.to(roomCode).emit('token-moved', {
    playerIndex,
    tokenIndex,
    from: oldPos,
    to: newPos,
    tokens: player.tokens,
  });

  // Check win: all 4 tokens at position 57
  if (player.tokens.every(t => t === 57)) {
    state.phase = 'finished';
    state.winnerId = player.id;
    namespace.to(roomCode).emit('game-finished', {
      winnerId: player.id,
      winnerUsername: player.username,
      players: state.players,
    });
    return;
  }

  // 6 = extra turn, otherwise advance
  if (state.diceValue === 6) {
    state.phase = 'rolling';
    namespace.to(roomCode).emit('extra-turn', { playerIndex });
    scheduleBotTurn(state, namespace);
  } else {
    advanceTurn(state, namespace, roomCode);
  }
}

function advanceTurn(state: LudoGameState, namespace: Namespace, roomCode: string) {
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  state.phase = 'rolling';
  state.currentQuestion = null;

  namespace.to(roomCode).emit('turn-changed', {
    currentPlayerIndex: state.currentPlayerIndex,
    phase: state.phase,
  });

  scheduleBotTurn(state, namespace);
}

function scheduleBotTurn(state: LudoGameState, namespace: Namespace) {
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer?.isBot || state.phase !== 'rolling') return;

  const delay = 1000 + Math.random() * 1500;
  setTimeout(() => {
    if (state.phase !== 'rolling') return;
    performDiceRoll(state, namespace, state.roomCode);

    // If question phase triggered, bot answers after delay
    setTimeout(() => {
      if (state.phase !== 'question' || !state.currentQuestion) return;
      const difficulty = currentPlayer.botDifficulty || 'medium';
      const correctProb = difficulty === 'hard' ? 0.85 : difficulty === 'medium' ? 0.65 : 0.40;
      const answerIndex = Math.random() < correctProb
        ? state.currentQuestion.correctIndex
        : Math.floor(Math.random() * 4);
      handleAnswer(state, namespace, state.roomCode, answerIndex);
    }, 1500 + Math.random() * 1000);
  }, delay);
}
