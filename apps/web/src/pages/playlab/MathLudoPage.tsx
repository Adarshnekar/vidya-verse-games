import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Settings, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

// Modular Ludo Systems
import {
  PlayerConfig,
  MatchPreset,
  GameMode,
  GamePhase,
  GradeCategory,
  MathQuestion,
  MatchStats,
  DEFAULT_PLAYERS,
} from './ludo/types';
import {
  getLegalMoves,
  getNextPosition,
  checkCapture,
  checkWinCondition,
  getNextActivePlayer,
  calculateSmartRoll,
} from './ludo/ludoRules';
import { chooseBestMove, botMathQuizAnswer } from './ludo/ludoAI';
import { getRandomQuestion } from './ludo/mathQuizBank';
import { saveMatch, loadSavedMatch, clearSavedMatch, hasSavedMatch } from './ludo/ludoStorage';
import { ludoSocket, OnlinePlayer } from './ludo/ludoSocketClient';

// Modular UI Components
import { LudoSetupView } from './ludo/components/LudoSetupView';
import { LudoBoardView } from './ludo/components/LudoBoardView';
import { LudoTurnRail } from './ludo/components/LudoTurnRail';
import { LudoQuizRail } from './ludo/components/LudoQuizRail';
import { LudoVictoryModal } from './ludo/components/LudoVictoryModal';
import { LudoPassDeviceModal } from './ludo/components/LudoPassDeviceModal';
import { LudoSettingsModal } from './ludo/components/LudoSettingsModal';
import { LudoReactions } from './ludo/components/LudoReactions';

// ==========================================
// SOUND EFFECTS ENGINE (Web Audio API)
// ==========================================
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playDice() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.2);
    });
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playCapture() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.3, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.35);
    });
  }
}

const sfx = new SoundEffects();

// ==========================================
// MAIN COMPONENT
// ==========================================
export const MathLudoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, addXP, addCoins } = useAuthStore();

  // 1st Interface / Match Setup States
  const [gameStage, setGameStage] = useState<'lobby' | 'playing'>('lobby');
  const [gameMode, setGameMode] = useState<GameMode>('offline');
  const [activePreset, setActivePreset] = useState<MatchPreset>('solo');
  const [selectedGradeCategory, setSelectedGradeCategory] = useState<GradeCategory>('all');
  const [questionTimerDuration, setQuestionTimerDuration] = useState<number>(10);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [autoMoveSingleToken, setAutoMoveSingleToken] = useState<boolean>(true);
  const [hasSavedMatchState, setHasSavedMatchState] = useState<boolean>(false);

  // Player configurations
  const [playerConfigs, setPlayerConfigs] = useState<PlayerConfig[]>(() =>
    DEFAULT_PLAYERS.map((p, idx) =>
      idx === 0 && user?.name ? { ...p, name: user.name } : p
    )
  );

  // In-Game Board States
  const [tokens, setTokens] = useState<number[][]>([
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
  ]);
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [phase, setPhase] = useState<GamePhase>('rolling');
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [isMovingPawn, setIsMovingPawn] = useState<boolean>(false);
  const [movableTokenIndices, setMovableTokenIndices] = useState<number[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([
    'Match started! Roll the 3D dice to enter the race.',
  ]);

  // Quiz States
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(10);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Modals & Auxiliary States
  const [winner, setWinner] = useState<PlayerConfig | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [passDeviceActive, setPassDeviceActive] = useState<boolean>(false);

  // Match Statistics Tracking
  const [stats, setStats] = useState<MatchStats>({
    startTime: Date.now(),
    turnsPlayed: 0,
    captures: { 0: 0, 1: 0, 2: 0, 3: 0 },
    questionsAnswered: 0,
    questionsCorrect: 0,
    topicStats: {},
    xpEarned: 0,
  });

  // Online Multiplayer States
  const [roomCode, setRoomCode] = useState<string>('LUDO-7429');
  const [copiedRoomCode, setCopiedRoomCode] = useState<boolean>(false);
  const [onlineConnected, setOnlineConnected] = useState<boolean>(false);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);

  // Refs for timers & bot loops
  const quizTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTurnRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  sfx.enabled = soundOn;
  const isCurrentHuman = !playerConfigs[currentPlayer]?.isBot;

  // ------------------------------------------
  // INITIALIZATION & CHECK SAVED GAME
  // ------------------------------------------
  useEffect(() => {
    setHasSavedMatchState(hasSavedMatch());

    // Connect socket for online availability check
    ludoSocket.connect('http://localhost:3001', {
      onConnect: () => setOnlineConnected(true),
      onDisconnect: () => setOnlineConnected(false),
      onRoomCreated: ({ roomCode: code, player }) => {
        setRoomCode(code);
        setOnlinePlayers([player]);
      },
      onPlayerJoined: ({ players }) => {
        setOnlinePlayers(players);
      },
      onGameStarted: ({ players: pList }) => {
        // Map online players to player configs
        setPlayerConfigs((prev) =>
          prev.map((cfg, idx) => {
            const onP = pList[idx];
            if (onP) {
              return {
                ...cfg,
                name: onP.username,
                isBot: onP.isBot,
                isActive: true,
              };
            }
            return { ...cfg, isActive: false };
          })
        );
        startNewGame();
      },
      onDiceRolled: ({ dice }) => {
        setDiceValue(dice);
      },
      onQuestion: ({ question, timeoutMs }) => {
        setCurrentQuestion({
          id: question.id,
          question: question.text,
          options: question.options,
          correctIndex: 0,
          grade: 'Online',
          topic: 'Curriculum Challenge',
          explanation: 'Answer validated authoritatively on server.',
        });
        setQuestionTimeLeft(Math.round(timeoutMs / 1000));
        setPhase('question');
      },
      onTokenMoved: ({ playerIndex, tokenIndex, to }) => {
        setTokens((prev) => {
          const next = prev.map((arr) => [...arr]);
          next[playerIndex][tokenIndex] = to === 57 ? 100 : to;
          return next;
        });
      },
    });

    return () => {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
      if (botTurnRef.current) clearTimeout(botTurnRef.current);
    };
  }, []);

  // ------------------------------------------
  // PERSIST IN-PROGRESS MATCH
  // ------------------------------------------
  useEffect(() => {
    if (gameStage === 'playing' && phase !== 'finished') {
      saveMatch({
        timestamp: Date.now(),
        gameMode,
        activePreset,
        selectedGradeCategory,
        questionTimerDuration,
        playerConfigs,
        tokens,
        scores,
        currentPlayer,
        phase,
        diceValue,
        consecutiveSixes,
        moveHistory,
        stats,
      });
    }
  }, [
    gameStage,
    gameMode,
    activePreset,
    selectedGradeCategory,
    questionTimerDuration,
    playerConfigs,
    tokens,
    scores,
    currentPlayer,
    phase,
    diceValue,
    consecutiveSixes,
    moveHistory,
    stats,
  ]);

  // ------------------------------------------
  // START & RESUME MATCH
  // ------------------------------------------
  const startNewGame = () => {
    clearSavedMatch();
    setHasSavedMatchState(false);
    setTokens([
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
    ]);
    setScores([0, 0, 0, 0]);
    setCurrentPlayer(0);
    setPhase('rolling');
    setDiceValue(1);
    setConsecutiveSixes(0);
    setMovableTokenIndices([]);
    setSelectedOption(null);
    setQuizFeedback(null);
    setWinner(null);
    setPassDeviceActive(false);
    setMoveHistory(['Match initialized! Roll the 3D dice to enter the race.']);
    setStats({
      startTime: Date.now(),
      turnsPlayed: 0,
      captures: { 0: 0, 1: 0, 2: 0, 3: 0 },
      questionsAnswered: 0,
      questionsCorrect: 0,
      topicStats: {},
      xpEarned: 0,
    });
    setGameStage('playing');
    sfx.playDice();
  };

  const resumeSavedGame = () => {
    const saved = loadSavedMatch();
    if (!saved) return;

    setGameMode(saved.gameMode);
    setActivePreset(saved.activePreset);
    setSelectedGradeCategory(saved.selectedGradeCategory);
    setQuestionTimerDuration(saved.questionTimerDuration);
    setPlayerConfigs(saved.playerConfigs);
    setTokens(saved.tokens);
    setScores(saved.scores);
    setCurrentPlayer(saved.currentPlayer);
    setPhase(saved.phase);
    setDiceValue(saved.diceValue);
    setConsecutiveSixes(saved.consecutiveSixes || 0);
    setMoveHistory(saved.moveHistory);
    setStats(saved.stats);
    setGameStage('playing');
    sfx.playDice();
  };

  const returnToLobby = () => {
    if (botTurnRef.current) clearTimeout(botTurnRef.current);
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    setIsSettingsOpen(false);
    setHasSavedMatchState(hasSavedMatch());
    setGameStage('lobby');
  };

  // Add message to match history
  const logAction = (msg: string) => {
    setMoveHistory((prev) => [msg, ...prev.slice(0, 19)]);
  };

  // ------------------------------------------
  // TURN ADVANCEMENT & PASS-AND-PLAY FLOW
  // ------------------------------------------
  const advanceTurn = useCallback(
    (extraTurn = false) => {
      // 1. Check if current player won
      if (checkWinCondition(currentPlayer, tokens)) {
        setPhase('finished');
        setWinner(playerConfigs[currentPlayer]);
        sfx.playWin();
        logAction(`🏆 ${playerConfigs[currentPlayer].name} has brought all tokens home and won the match!`);

        // Award victory XP if human
        if (!playerConfigs[currentPlayer].isBot) {
          addXP(250);
          addCoins(50);
          setStats((prev) => ({ ...prev, xpEarned: prev.xpEarned + 250, endTime: Date.now() }));
        }
        clearSavedMatch();
        return;
      }

      setStats((prev) => ({ ...prev, turnsPlayed: prev.turnsPlayed + 1 }));

      if (extraTurn) {
        logAction(`🎲 Extra turn awarded to ${playerConfigs[currentPlayer].name}!`);
        setPhase('rolling');
      } else {
        setConsecutiveSixes(0);
        const next = getNextActivePlayer(currentPlayer, playerConfigs);
        setCurrentPlayer(next);
        setPhase('rolling');

        // If Pass & Play mode and next player is human, trigger transition modal
        if (activePreset === 'pass' && !playerConfigs[next].isBot) {
          setPassDeviceActive(true);
        }
      }

      setSelectedOption(null);
      setQuizFeedback(null);
      setMovableTokenIndices([]);
      setCurrentQuestion(null);
    },
    [currentPlayer, tokens, playerConfigs, activePreset, addXP, addCoins]
  );

  // ------------------------------------------
  // EXECUTE TOKEN MOVE (Smooth & Anti-Jitter)
  // ------------------------------------------
  const executeMove = useCallback(
    (tokenIdx: number) => {
      if (isMovingPawn) return;
      setIsMovingPawn(true);

      const currentPos = tokens[currentPlayer][tokenIdx];
      const activeP = playerConfigs[currentPlayer];

      // Calculate path steps
      const steps: number[] = [];
      if (currentPos === -1) {
        steps.push(activeP.startPos);
      } else {
        for (let s = 1; s <= diceValue; s++) {
          steps.push(getNextPosition(activeP, currentPos, s));
        }
      }

      // Step-by-step movement animation
      let stepIndex = 0;
      const moveInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          const stepPos = steps[stepIndex];
          setTokens((prev) => {
            const next = prev.map((arr) => [...arr]);
            next[currentPlayer][tokenIdx] = stepPos;
            return next;
          });
          stepIndex++;
        } else {
          clearInterval(moveInterval);
          setIsMovingPawn(false);

          const finalPos = steps[steps.length - 1];

          // Check if landed on opponent token (capture)
          const captureInfo = checkCapture(currentPlayer, finalPos, tokens, playerConfigs);
          let captured = false;

          if (captureInfo) {
            captured = true;
            sfx.playCapture();

            setTokens((prev) => {
              const next = prev.map((arr) => [...arr]);
              next[captureInfo.capturedPlayerIdx][captureInfo.capturedTokenIdx] = -1; // Send back to base!
              return next;
            });

            // Reward capturing player
            setScores((prev) => {
              const next = [...prev];
              next[currentPlayer] += 50;
              return next;
            });

            if (!activeP.isBot) {
              addXP(50);
              setStats((prev) => ({
                ...prev,
                xpEarned: prev.xpEarned + 50,
                captures: {
                  ...prev.captures,
                  [currentPlayer]: (prev.captures[currentPlayer] || 0) + 1,
                },
              }));
            }

            logAction(
              `⚔️ ${activeP.name} captured ${playerConfigs[captureInfo.capturedPlayerIdx].name}'s token (+50 XP)!`
            );
          }

          // Check if reached home sanctuary (100)
          if (finalPos === 100) {
            sfx.playWin();
            logAction(`🎉 ${activeP.name} safely brought Token #${tokenIdx + 1} to Home Sanctuary!`);
            setScores((prev) => {
              const next = [...prev];
              next[currentPlayer] += 100;
              return next;
            });
            if (!activeP.isBot) {
              addXP(100);
              setStats((prev) => ({ ...prev, xpEarned: prev.xpEarned + 100 }));
            }
          }

          // Check if extra turn is earned
          const extraTurn = (diceValue === 6 && consecutiveSixes < 2) || captured || finalPos === 100;
          setTimeout(() => {
            advanceTurn(extraTurn);
          }, 450);
        }
      }, 120);
    },
    [
      isMovingPawn,
      tokens,
      currentPlayer,
      diceValue,
      consecutiveSixes,
      playerConfigs,
      advanceTurn,
      addXP,
    ]
  );

  // ------------------------------------------
  // HANDLE DICE ROLL
  // ------------------------------------------
  const rollDice = useCallback(() => {
    if (phase !== 'rolling' || isRolling) return;

    setIsRolling(true);
    sfx.playDice();

    let rollCounter = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCounter++;
      if (rollCounter > 8) {
        clearInterval(interval);
        const finalRoll = calculateSmartRoll(currentPlayer, tokens);
        setDiceValue(finalRoll);
        setIsRolling(false);

        // 3 Consecutive Sixes Rule
        if (finalRoll === 6) {
          const nextSixes = consecutiveSixes + 1;
          setConsecutiveSixes(nextSixes);
          if (nextSixes >= 3) {
            logAction(`⚠️ ${playerConfigs[currentPlayer].name} rolled 3 consecutive 6s! Turn forfeited.`);
            setTimeout(() => {
              advanceTurn(false);
            }, 1200);
            return;
          }
        } else {
          setConsecutiveSixes(0);
        }

        // Check legal moves
        const legal = getLegalMoves(currentPlayer, tokens, finalRoll, playerConfigs);
        setMovableTokenIndices(legal);

        if (legal.length === 0) {
          logAction(`${playerConfigs[currentPlayer].name} rolled ${finalRoll} (No valid moves).`);
          setTimeout(() => {
            advanceTurn(false);
          }, 1400);
          return;
        }

        // Trigger NCERT Math Quiz Challenge
        const q = getRandomQuestion(selectedGradeCategory, currentQuestion?.id);
        setCurrentQuestion(q);
        setQuestionTimeLeft(questionTimerDuration);
        setSelectedOption(null);
        setQuizFeedback(null);
        setPhase('question');
      }
    }, 45);
  }, [
    phase,
    isRolling,
    currentPlayer,
    tokens,
    consecutiveSixes,
    playerConfigs,
    selectedGradeCategory,
    currentQuestion,
    questionTimerDuration,
    advanceTurn,
  ]);

  // ------------------------------------------
  // QUESTION COUNTDOWN TIMER
  // ------------------------------------------
  useEffect(() => {
    if (phase !== 'question' || !currentQuestion || quizFeedback !== null) {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
      return;
    }

    quizTimerRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          if (quizTimerRef.current) clearInterval(quizTimerRef.current);
          // Timeout penalty
          sfx.playWrong();
          setQuizFeedback({
            isCorrect: false,
            text: `Time's up! Correct answer was: ${currentQuestion.options[currentQuestion.correctIndex]}`,
          });
          setStats((s) => ({
            ...s,
            questionsAnswered: s.questionsAnswered + 1,
          }));
          setTimeout(() => {
            advanceTurn(false);
          }, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, [phase, currentQuestion, quizFeedback, advanceTurn]);

  // ------------------------------------------
  // HANDLE QUESTION ANSWER
  // ------------------------------------------
  const handleAnswerSelect = (optionIdx: number) => {
    if (selectedOption !== null || !currentQuestion || phase !== 'question') return;

    setSelectedOption(optionIdx);
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);

    const isCorrect = optionIdx === currentQuestion.correctIndex;
    const activeP = playerConfigs[currentPlayer];

    // Track statistics
    setStats((s) => {
      const topic = currentQuestion.topic;
      const prevTopic = s.topicStats[topic] || { total: 0, correct: 0 };
      return {
        ...s,
        questionsAnswered: s.questionsAnswered + 1,
        questionsCorrect: s.questionsCorrect + (isCorrect ? 1 : 0),
        topicStats: {
          ...s.topicStats,
          [topic]: {
            total: prevTopic.total + 1,
            correct: prevTopic.correct + (isCorrect ? 1 : 0),
          },
        },
      };
    });

    if (isCorrect) {
      sfx.playCorrect();
      setQuizFeedback({
        isCorrect: true,
        text: 'Correct! Move your token.',
      });
      setScores((prev) => {
        const next = [...prev];
        next[currentPlayer] += 20; // 20 bonus points
        return next;
      });

      if (!activeP.isBot) {
        addXP(20);
        setStats((s) => ({ ...s, xpEarned: s.xpEarned + 20 }));
      }

      setTimeout(() => {
        setPhase('moving');
        // Auto-move if only 1 move is legal and auto-move is on
        if (!activeP.isBot && movableTokenIndices.length === 1 && autoMoveSingleToken) {
          executeMove(movableTokenIndices[0]);
        }
      }, 1000);
    } else {
      sfx.playWrong();
      setQuizFeedback({
        isCorrect: false,
        text: `Incorrect! Correct answer was: ${currentQuestion.options[currentQuestion.correctIndex]}`,
      });
      setTimeout(() => {
        advanceTurn(false);
      }, 2200);
    }
  };

  // ------------------------------------------
  // BOT AUTOMATION LOOP
  // ------------------------------------------
  useEffect(() => {
    const activePlayer = playerConfigs[currentPlayer];
    if (!activePlayer.isBot || phase === 'finished' || gameStage !== 'playing') return;

    // Bot Rolling
    if (phase === 'rolling' && !isRolling) {
      botTurnRef.current = setTimeout(() => {
        rollDice();
      }, 1100);
    }

    // Bot Math Quiz Answer
    if (phase === 'question' && currentQuestion && !quizFeedback) {
      botTurnRef.current = setTimeout(() => {
        const answerIdx = botMathQuizAnswer(
          activePlayer.botDifficulty,
          currentQuestion.correctIndex
        );
        handleAnswerSelect(answerIdx);
      }, 1600);
    }

    // Bot Move Execution
    if (phase === 'moving' && movableTokenIndices.length > 0 && !isMovingPawn) {
      botTurnRef.current = setTimeout(() => {
        const decision = chooseBestMove(
          currentPlayer,
          movableTokenIndices,
          tokens,
          diceValue,
          playerConfigs
        );
        logAction(`${activePlayer.name}: ${decision.reason}`);
        executeMove(decision.tokenIndex);
      }, 1000);
    }

    return () => {
      if (botTurnRef.current) clearTimeout(botTurnRef.current);
    };
  }, [
    currentPlayer,
    phase,
    isRolling,
    currentQuestion,
    quizFeedback,
    movableTokenIndices,
    isMovingPawn,
    tokens,
    diceValue,
    playerConfigs,
    gameStage,
    rollDice,
    executeMove,
  ]);

  // Online invite link helper
  const copyRoomLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/playlab/ludo?room=${roomCode}`);
      setCopiedRoomCode(true);
      setTimeout(() => setCopiedRoomCode(false), 2000);
    }
  };

  // ------------------------------------------
  // RENDER: LOBBY (1ST INTERFACE)
  // ------------------------------------------
  if (gameStage === 'lobby') {
    return (
      <LudoSetupView
        gameMode={gameMode}
        setGameMode={setGameMode}
        activePreset={activePreset}
        setActivePreset={setActivePreset}
        playerConfigs={playerConfigs}
        setPlayerConfigs={setPlayerConfigs}
        selectedGradeCategory={selectedGradeCategory}
        setSelectedGradeCategory={setSelectedGradeCategory}
        questionTimerDuration={questionTimerDuration}
        setQuestionTimerDuration={setQuestionTimerDuration}
        roomCode={roomCode}
        setRoomCode={setRoomCode}
        copiedRoomCode={copiedRoomCode}
        copyRoomLink={copyRoomLink}
        onlineConnected={onlineConnected}
        onlinePlayersCount={onlinePlayers.length || 1}
        onCreateOnlineRoom={() => {
          ludoSocket.createRoom(playerConfigs[0].name, 7, 'medium', questionTimerDuration * 1000);
        }}
        onJoinOnlineRoom={() => {
          ludoSocket.joinRoom(roomCode, playerConfigs[0].name);
        }}
        onAddOnlineBot={() => {
          ludoSocket.addBot(roomCode, 'medium');
        }}
        soundOn={soundOn}
        setSoundOn={setSoundOn}
        hasSavedGame={hasSavedMatchState}
        onResumeSavedGame={resumeSavedGame}
        onStartGame={startNewGame}
        onNavigateBack={() => navigate('/playlab')}
      />
    );
  }

  // ------------------------------------------
  // RENDER: GAMEPLAY BOARD VIEW
  // ------------------------------------------
  return (
    <div className="h-full max-h-full flex flex-col bg-canvas text-text-primary selection:bg-playlab-500/30 selection:text-playlab-200 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="h-12 sm:h-14 shrink-0 px-3 sm:px-6 bg-card/90 backdrop-blur-md border-b border-border flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={returnToLobby}
            className="p-1.5 sm:p-2 rounded-xl bg-card hover:bg-canvas text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold border border-border"
            title="Return to Match Setup"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Lobby</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold font-display text-text-primary">Math Ludo</h1>
              <span className="badge-playlab text-[10px] hidden sm:inline">
                {gameMode === 'online'
                  ? `Online Room: ${roomCode}`
                  : activePreset === 'duel'
                  ? '1v1 Duel'
                  : activePreset === 'pass'
                  ? 'Pass & Play'
                  : 'Solo vs AI'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Controls: Safe Reactions & Match Settings */}
        <div className="flex items-center gap-2">
          {/* Preset Reactions */}
          <LudoReactions />

          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-2 rounded-xl bg-card hover:bg-canvas text-text-muted hover:text-text-primary transition-colors border border-border"
            title={soundOn ? 'Mute sound' : 'Enable sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-playlab-500" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-card hover:bg-canvas text-text-muted hover:text-text-primary transition-colors border border-border"
            title="Match Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Board View: 3-Column Zero-Scroll Layout */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row items-center justify-between p-2 sm:p-3 xl:p-4 gap-3 lg:gap-4 xl:gap-5 overflow-hidden max-w-[1800px] mx-auto w-full relative">
        {/* Left Rail: 3D Die & Standings */}
        <LudoTurnRail
          players={playerConfigs}
          currentPlayer={currentPlayer}
          tokens={tokens}
          scores={scores}
          phase={phase}
          isRolling={isRolling}
          diceValue={diceValue}
          isCurrentHuman={isCurrentHuman}
          onRollDice={rollDice}
        />

        {/* Center: Interactive Scaled Board */}
        <LudoBoardView
          tokens={tokens}
          players={playerConfigs}
          currentPlayer={currentPlayer}
          phase={phase}
          isCurrentHuman={isCurrentHuman}
          movableTokenIndices={movableTokenIndices}
          onTokenClick={executeMove}
          isMovingPawn={isMovingPawn}
        />

        {/* Right Rail: Enlarged Math Quiz & Tactical Log */}
        <LudoQuizRail
          phase={phase}
          currentQuestion={currentQuestion}
          questionTimeLeft={questionTimeLeft}
          questionTimerDuration={questionTimerDuration}
          selectedOption={selectedOption}
          quizFeedback={quizFeedback}
          isCurrentHuman={isCurrentHuman}
          selectedGradeCategory={selectedGradeCategory}
          moveHistory={moveHistory}
          onAnswerSelect={handleAnswerSelect}
        />
      </div>

      {/* Mobile Bottom Dock (< lg screens) */}
      <div className="lg:hidden shrink-0 w-full h-16 sm:h-20 px-3 py-1.5 bg-card/95 border-t border-border flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl">{playerConfigs[currentPlayer]?.avatar}</span>
          <div className="min-w-0">
            <span
              className="text-xs font-bold truncate block"
              style={{ color: playerConfigs[currentPlayer]?.hexColor }}
            >
              {playerConfigs[currentPlayer]?.name}
            </span>
            <span className="text-[11px] text-text-secondary truncate block">
              {isRolling
                ? 'Rolling dice...'
                : phase === 'rolling'
                ? isCurrentHuman
                  ? 'Tap dice to roll!'
                  : `${playerConfigs[currentPlayer]?.name} rolling...`
                : phase === 'question'
                ? `Rolled ${diceValue}! Solve quiz`
                : phase === 'moving'
                ? isCurrentHuman
                  ? 'Tap your token on board!'
                  : 'Bot moving token...'
                : 'Game finished'}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (isCurrentHuman && phase === 'rolling') {
              rollDice();
            }
          }}
          disabled={phase !== 'rolling' || !isCurrentHuman || isRolling}
          className="w-13 h-13 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg bg-gradient-to-br from-amber-500 to-red-600 text-white disabled:opacity-50"
        >
          {diceValue}
        </button>
      </div>

      {/* Pass & Play Transition Modal */}
      {passDeviceActive && (
        <LudoPassDeviceModal
          player={playerConfigs[currentPlayer]}
          onReady={() => setPassDeviceActive(false)}
        />
      )}

      {/* Settings / Pause Modal */}
      {isSettingsOpen && (
        <LudoSettingsModal
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          autoMoveSingleToken={autoMoveSingleToken}
          setAutoMoveSingleToken={setAutoMoveSingleToken}
          onClose={() => setIsSettingsOpen(false)}
          onQuitToLobby={returnToLobby}
        />
      )}

      {/* Victory Celebration Modal */}
      {phase === 'finished' && winner && (
        <LudoVictoryModal
          winner={winner}
          stats={stats}
          scores={scores}
          players={playerConfigs}
          onPlayAgain={startNewGame}
          onReturnToLobby={returnToLobby}
        />
      )}
    </div>
  );
};
