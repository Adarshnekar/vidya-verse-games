import React, { useState, useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Bot,
  User,
  Sliders,
  Sparkles,
  HelpCircle,
  Trophy,
  Activity,
  Flame,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../stores/authStore';

// ==========================================
// TYPES & CONSTANTS
// ==========================================

export interface PocketPosition {
  x: number;
  y: number;
  radius: number;
}

export interface CoinBodyData {
  type: 'queen' | 'white' | 'black' | 'striker';
  color: string;
  radius: number;
  points: number;
}

const BOARD_SIZE = 800;
const POCKET_RADIUS = 34;

const POCKETS: PocketPosition[] = [
  { x: 62, y: 62, radius: POCKET_RADIUS },
  { x: 738, y: 62, radius: POCKET_RADIUS },
  { x: 62, y: 738, radius: POCKET_RADIUS },
  { x: 738, y: 738, radius: POCKET_RADIUS },
];

export const CarromPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, addXP, addCoins } = useAuthStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game Engine Refs
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const strikerRef = useRef<Matter.Body | null>(null);
  const coinsRef = useRef<Matter.Body[]>([]);

  // Aiming Interaction Refs
  const isDraggingAimRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentDragRef = useRef<{ x: number; y: number } | null>(null);

  // Game State
  const [currentTurn, setCurrentTurn] = useState<'player' | 'bot'>('player');
  const [gameMode, setGameMode] = useState<'vs_bot' | 'two_player'>('vs_bot');
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [botScore, setBotScore] = useState<number>(0);
  const [strikerBaselineX, setStrikerBaselineX] = useState<number>(400);
  const [isShotInMotion, setIsShotInMotion] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [turnMessage, setTurnMessage] = useState<string>('Drag from striker to set vector and release to shoot!');

  // Physics Lab Parameters
  const [frictionAir, setFrictionAir] = useState<number>(0.018); // Air/board friction
  const [restitution, setRestitution] = useState<number>(0.85); // Bounciness
  const [powerScale, setPowerScale] = useState<number>(1.0); // Power multiplier

  // Telemetry Metrics
  const [strikerSpeed, setStrikerSpeed] = useState<number>(0);
  const [pocketedLog, setPocketedLog] = useState<string[]>([]);

  // Sound Synthesizer (Web Audio API)
  const playSfx = useCallback((type: 'hit' | 'pocket' | 'strike') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'hit') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'strike') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'pocket') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // AudioContext policy fallback
    }
  }, [soundEnabled]);

  // ------------------------------------------
  // CREATE MATTER.JS CARROM BOARD & BODIES
  // ------------------------------------------
  const setupPhysicsWorld = useCallback(() => {
    // Clean up previous engine if any
    if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    if (engineRef.current) Matter.Composite.clear(engineRef.current.world, false);

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0 }, // Top-down 2D zero gravity
    });
    engineRef.current = engine;

    const wallThickness = 40;
    const wallOptions: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      restitution: restitution,
      friction: 0.05,
    };

    // 4 Wooden Cushion Borders
    const topWall = Matter.Bodies.rectangle(400, 20, 800, wallThickness, wallOptions);
    const bottomWall = Matter.Bodies.rectangle(400, 780, 800, wallThickness, wallOptions);
    const leftWall = Matter.Bodies.rectangle(20, 400, wallThickness, 800, wallOptions);
    const rightWall = Matter.Bodies.rectangle(780, 400, wallThickness, 800, wallOptions);

    // Striker: Radius 25, mass higher than coins
    const striker = Matter.Bodies.circle(400, 630, 25, {
      mass: 8,
      frictionAir: frictionAir,
      restitution: restitution,
      render: { fillStyle: '#0284c7' },
      label: 'striker',
    });
    strikerRef.current = striker;

    // Coins Formation in Center (Honey-comb / circle arrangement)
    const coins: Matter.Body[] = [];
    const coinRadius = 15;
    const center = { x: 400, y: 400 };

    // 1. Red Queen at exact center
    const queen = Matter.Bodies.circle(center.x, center.y, coinRadius, {
      mass: 2.2,
      frictionAir: frictionAir,
      restitution: restitution,
      label: 'coin_queen',
    });
    (queen as unknown as { coinData: CoinBodyData }).coinData = {
      type: 'queen',
      color: '#dc2626',
      radius: coinRadius,
      points: 25,
    };
    coins.push(queen);

    // 2. Inner Ring of 6 Coins (Alternating White and Black) at radius ~32px
    const innerRadius = 32;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = center.x + Math.cos(angle) * innerRadius;
      const y = center.y + Math.sin(angle) * innerRadius;
      const isWhite = i % 2 === 0;

      const body = Matter.Bodies.circle(x, y, coinRadius, {
        mass: 2.0,
        frictionAir: frictionAir,
        restitution: restitution,
        label: isWhite ? 'coin_white' : 'coin_black',
      });
      (body as unknown as { coinData: CoinBodyData }).coinData = {
        type: isWhite ? 'white' : 'black',
        color: isWhite ? '#f8fafc' : '#1e293b',
        radius: coinRadius,
        points: isWhite ? 10 : 5,
      };
      coins.push(body);
    }

    // 3. Outer Ring of 12 Coins (Alternating White and Black) at radius ~64px
    const outerRadius = 64;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6 + Math.PI / 12;
      const x = center.x + Math.cos(angle) * outerRadius;
      const y = center.y + Math.sin(angle) * outerRadius;
      const isWhite = i % 2 !== 0;

      const body = Matter.Bodies.circle(x, y, coinRadius, {
        mass: 2.0,
        frictionAir: frictionAir,
        restitution: restitution,
        label: isWhite ? 'coin_white' : 'coin_black',
      });
      (body as unknown as { coinData: CoinBodyData }).coinData = {
        type: isWhite ? 'white' : 'black',
        color: isWhite ? '#f8fafc' : '#1e293b',
        radius: coinRadius,
        points: isWhite ? 10 : 5,
      };
      coins.push(body);
    }

    coinsRef.current = coins;

    Matter.Composite.add(engine.world, [
      topWall,
      bottomWall,
      leftWall,
      rightWall,
      striker,
      ...coins,
    ]);

    // Collision sound event
    Matter.Events.on(engine, 'collisionStart', () => {
      playSfx('hit');
    });

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    setStrikerBaselineX(400);
    setIsShotInMotion(false);
  }, [frictionAir, restitution, playSfx]);

  // Initialize on mount
  useEffect(() => {
    setupPhysicsWorld();

    return () => {
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    };
  }, [setupPhysicsWorld]);

  // Update restitution and friction on existing bodies when sliders move
  useEffect(() => {
    if (!engineRef.current) return;
    const allBodies = Matter.Composite.allBodies(engineRef.current.world);
    allBodies.forEach((b) => {
      if (!b.isStatic) {
        b.frictionAir = frictionAir;
        b.restitution = restitution;
      }
    });
  }, [frictionAir, restitution]);

  // ------------------------------------------
  // TICK LOOP: POCKET DETECTION & MOTION CHECK
  // ------------------------------------------
  useEffect(() => {
    let animId: number;

    const checkPhysicsState = () => {
      const engine = engineRef.current;
      const striker = strikerRef.current;
      if (!engine || !striker) {
        animId = requestAnimationFrame(checkPhysicsState);
        return;
      }

      // Check speed of striker for telemetry
      const sSpeed = Math.hypot(striker.velocity.x, striker.velocity.y);
      setStrikerSpeed(Number(sSpeed.toFixed(2)));

      // Check if any coins entered pockets
      const allBodies = Matter.Composite.allBodies(engine.world);
      const coinsInPlay = allBodies.filter((b) => b.label.startsWith('coin_'));

      coinsInPlay.forEach((coin) => {
        for (const pocket of POCKETS) {
          const dist = Math.hypot(coin.position.x - pocket.x, coin.position.y - pocket.y);
          if (dist < pocket.radius) {
            // Coin sink into pocket!
            const data = (coin as unknown as { coinData: CoinBodyData }).coinData;
            playSfx('pocket');

            // Award points
            if (currentTurn === 'player') {
              setPlayerScore((prev) => prev + data.points);
              setPocketedLog((prev) => [
                `🎯 Player pocketed ${data.type.toUpperCase()} (+${data.points} pts)`,
                ...prev.slice(0, 9),
              ]);
            } else {
              setBotScore((prev) => prev + data.points);
              setPocketedLog((prev) => [
                `🤖 Bot pocketed ${data.type.toUpperCase()} (+${data.points} pts)`,
                ...prev.slice(0, 9),
              ]);
            }

            Matter.Composite.remove(engine.world, coin);
            break;
          }
        }
      });

      // Check if all bodies have settled to a stop
      const nonStaticBodies = allBodies.filter((b) => !b.isStatic);
      const isStillMoving = nonStaticBodies.some(
        (b) => Math.hypot(b.velocity.x, b.velocity.y) > 0.12
      );

      if (isShotInMotion && !isStillMoving) {
        // Shot completed! Reset striker to baseline & switch turn
        setIsShotInMotion(false);

        // Reset Striker to baseline
        const nextTurn = currentTurn === 'player' ? 'bot' : 'player';
        setCurrentTurn(nextTurn);

        const newBaselineY = nextTurn === 'player' ? 630 : 170;
        Matter.Body.setPosition(striker, { x: 400, y: newBaselineY });
        Matter.Body.setVelocity(striker, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(striker, 0);

        setTurnMessage(
          nextTurn === 'player'
            ? 'Your turn! Position striker and aim.'
            : 'Bot is analyzing trajectories and lining up shot...'
        );
      }

      animId = requestAnimationFrame(checkPhysicsState);
    };

    animId = requestAnimationFrame(checkPhysicsState);
    return () => cancelAnimationFrame(animId);
  }, [isShotInMotion, currentTurn, playSfx]);

  // ------------------------------------------
  // BOT AUTOMATION SHOT
  // ------------------------------------------
  useEffect(() => {
    if (currentTurn !== 'bot' || isShotInMotion || gameMode !== 'vs_bot') return;

    const botTimer = setTimeout(() => {
      const engine = engineRef.current;
      const striker = strikerRef.current;
      if (!engine || !striker) return;

      // Find closest coin to any pocket
      const allBodies = Matter.Composite.allBodies(engine.world);
      const availableCoins = allBodies.filter((b) => b.label.startsWith('coin_'));

      if (availableCoins.length === 0) {
        setTurnMessage('No coins left! Game finished.');
        return;
      }

      // Find best target coin
      let bestCoin = availableCoins[0];
      let minDistance = 9999;
      let targetPocket = POCKETS[0];

      availableCoins.forEach((coin) => {
        POCKETS.forEach((p) => {
          const d = Math.hypot(coin.position.x - p.x, coin.position.y - p.y);
          if (d < minDistance) {
            minDistance = d;
            bestCoin = coin;
            targetPocket = p;
          }
        });
      });

      // Position bot striker on top baseline (y = 170)
      const botStartX = Math.max(200, Math.min(600, bestCoin.position.x - 30));
      Matter.Body.setPosition(striker, { x: botStartX, y: 170 });

      // Aim vector from striker to coin
      const angle = Math.atan2(
        bestCoin.position.y - 170,
        bestCoin.position.x - botStartX
      );

      const botImpulse = 0.045 * powerScale;
      playSfx('strike');

      setTimeout(() => {
        Matter.Body.applyForce(striker, striker.position, {
          x: Math.cos(angle) * botImpulse,
          y: Math.sin(angle) * botImpulse,
        });
        setIsShotInMotion(true);
      }, 500);
    }, 1200);

    return () => clearTimeout(botTimer);
  }, [currentTurn, isShotInMotion, gameMode, powerScale, playSfx]);

  // ------------------------------------------
  // CANVASES & RENDER LOOP
  // ------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // 1. Draw Wooden Outer Frame
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // Frame inner bevel
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, BOARD_SIZE - 6, BOARD_SIZE - 6);

      // 2. Draw Lacquer Playing Surface
      ctx.fillStyle = '#fef3c7'; // Warm ivory plywood
      ctx.fillRect(40, 40, BOARD_SIZE - 80, BOARD_SIZE - 80);

      // Surface inner border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 40, BOARD_SIZE - 80, BOARD_SIZE - 80);

      // 3. Draw 4 Corner Pockets with mesh netting effect
      POCKETS.forEach((pocket) => {
        // Deep pocket hole
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Mesh Net lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocket.radius - 8, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 4. Draw Baselines & Circles
      // Bottom Baseline (Player 1)
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(180, 615);
      ctx.lineTo(620, 615);
      ctx.moveTo(180, 645);
      ctx.lineTo(620, 645);
      ctx.stroke();

      // Bottom Baseline Red Circles
      [180, 620].forEach((x) => {
        ctx.beginPath();
        ctx.arc(x, 630, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#fef3c7';
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, 630, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      });

      // Top Baseline (Player 2 / Bot)
      ctx.beginPath();
      ctx.moveTo(180, 155);
      ctx.lineTo(620, 155);
      ctx.moveTo(180, 185);
      ctx.lineTo(620, 185);
      ctx.stroke();

      [180, 620].forEach((x) => {
        ctx.beginPath();
        ctx.arc(x, 170, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#fef3c7';
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, 170, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      });

      // 5. Draw Center Concentric Circles and 8-petal mandala
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.arc(400, 400, 90, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(400, 400, 32, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(400, 400, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();

      // Corner arrow diagonals
      const diagonals = [
        { x1: 90, y1: 90, x2: 240, y2: 240 },
        { x1: 710, y1: 90, x2: 560, y2: 240 },
        { x1: 90, y1: 710, x2: 240, y2: 560 },
        { x1: 710, y1: 710, x2: 560, y2: 560 },
      ];
      diagonals.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x1, d.y1);
        ctx.lineTo(d.x2, d.y2);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // 6. Draw Matter.js Physics Bodies
      if (engineRef.current) {
        const bodies = Matter.Composite.allBodies(engineRef.current.world);

        bodies.forEach((body) => {
          if (body.isStatic) return;

          ctx.save();
          ctx.translate(body.position.x, body.position.y);
          ctx.rotate(body.angle);

          // Body Drop Shadow
          ctx.beginPath();
          ctx.arc(2, 3, (body.circleRadius || 15), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fill();

          // Body Render
          if (body.label === 'striker') {
            // Striker: Acrylic blue disc
            ctx.beginPath();
            ctx.arc(0, 0, body.circleRadius || 25, 0, Math.PI * 2);
            ctx.fillStyle = '#0284c7';
            ctx.fill();
            ctx.strokeStyle = '#bae6fd';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Inner engraving
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          } else {
            // Coins
            const data = (body as unknown as { coinData: CoinBodyData }).coinData;
            const r = body.circleRadius || 15;

            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fillStyle = data ? data.color : '#ffffff';
            ctx.fill();
            ctx.strokeStyle = data?.type === 'white' ? '#94a3b8' : '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Coin center accent
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fillStyle =
              data?.type === 'queen'
                ? '#fef08a'
                : data?.type === 'white'
                ? '#cbd5e1'
                : '#334155';
            ctx.fill();
          }

          ctx.restore();
        });
      }

      // 7. Draw Aiming Line & Trajectory Vector
      if (
        isDraggingAimRef.current &&
        dragStartRef.current &&
        currentDragRef.current &&
        strikerRef.current &&
        !isShotInMotion
      ) {
        const sx = strikerRef.current.position.x;
        const sy = strikerRef.current.position.y;

        const dx = currentDragRef.current.x - dragStartRef.current.x;
        const dy = currentDragRef.current.y - dragStartRef.current.y;

        // Slingshot inverted vector or direct vector
        const targetX = sx - dx * 1.5;
        const targetY = sy - dy * 1.5;

        // Draw dotted trajectory line
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Draw trajectory arrowhead / endpoint
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isShotInMotion]);

  // ------------------------------------------
  // MOUSE & TOUCH AIMING HANDLERS
  // ------------------------------------------
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = BOARD_SIZE / rect.width;
    const scaleY = BOARD_SIZE / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isShotInMotion || currentTurn !== 'player' || !strikerRef.current) return;
    const coords = getCanvasCoords(e);
    const dist = Math.hypot(
      coords.x - strikerRef.current.position.x,
      coords.y - strikerRef.current.position.y
    );

    // If click within 60px of striker, start aiming
    if (dist < 60) {
      isDraggingAimRef.current = true;
      dragStartRef.current = coords;
      currentDragRef.current = coords;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingAimRef.current) return;
    currentDragRef.current = getCanvasCoords(e);
  };

  const handleMouseUp = () => {
    if (
      !isDraggingAimRef.current ||
      !dragStartRef.current ||
      !currentDragRef.current ||
      !strikerRef.current
    ) {
      isDraggingAimRef.current = false;
      return;
    }

    const dx = currentDragRef.current.x - dragStartRef.current.x;
    const dy = currentDragRef.current.y - dragStartRef.current.y;
    const dragDistance = Math.hypot(dx, dy);

    isDraggingAimRef.current = false;
    dragStartRef.current = null;
    currentDragRef.current = null;

    if (dragDistance < 15) return; // Too small drag, ignore

    // Fire Striker!
    const forceMagnitude = Math.min(dragDistance * 0.00045 * powerScale, 0.08);
    const angle = Math.atan2(-dy, -dx); // Invert for slingshot pull

    playSfx('strike');

    Matter.Body.applyForce(strikerRef.current, strikerRef.current.position, {
      x: Math.cos(angle) * forceMagnitude,
      y: Math.sin(angle) * forceMagnitude,
    });

    setIsShotInMotion(true);
    setTurnMessage('Shot executed! Simulating momentum transfer...');
  };

  // Move Striker along baseline
  const handleBaselinePositionChange = (newX: number) => {
    if (isShotInMotion || currentTurn !== 'player' || !strikerRef.current) return;
    setStrikerBaselineX(newX);
    Matter.Body.setPosition(strikerRef.current, { x: newX, y: 630 });
    Matter.Body.setVelocity(strikerRef.current, { x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-surface-900 text-surface-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <header className="border-b border-surface-800 bg-surface-850/80 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/playlab')}
            className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-display text-white">
                Carrom Physics Lab
              </h1>
              <span className="badge-circuit text-[10px]">Matter.js 2D Rigid Body</span>
            </div>
            <p className="text-xs text-surface-400 hidden sm:block">
              Explore Newton’s laws, momentum conservation, and elastic collisions
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute' : 'Enable sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={setupPhysicsWorld}
            className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
            title="Reset Board"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Score & Controls (3 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Scoreboard Card */}
          <div className="card p-5 space-y-4 bg-surface-800 border-surface-700/80">
            <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center justify-between">
              <span>Match Scores</span>
              <span className="text-emerald-400 font-mono text-[11px]">Race to 25 pts</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {/* Player 1 Card */}
              <div
                className={clsx(
                  'p-3 rounded-xl border text-center transition-all',
                  currentTurn === 'player'
                    ? 'bg-emerald-500/10 border-emerald-500/40 ring-2 ring-emerald-500/20'
                    : 'bg-surface-900/50 border-surface-700'
                )}
              >
                <div className="text-xs text-surface-300 font-semibold mb-1">
                  {user?.name || 'Player 1'}
                </div>
                <div className="text-2xl font-bold font-display text-white">
                  {playerScore}
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">Bottom Line</div>
              </div>

              {/* Bot Card */}
              <div
                className={clsx(
                  'p-3 rounded-xl border text-center transition-all',
                  currentTurn === 'bot'
                    ? 'bg-purple-500/10 border-purple-500/40 ring-2 ring-purple-500/20'
                    : 'bg-surface-900/50 border-surface-700'
                )}
              >
                <div className="text-xs text-surface-300 font-semibold mb-1">
                  Newton Bot
                </div>
                <div className="text-2xl font-bold font-display text-white">
                  {botScore}
                </div>
                <div className="text-[10px] text-purple-400 mt-1">Top Line</div>
              </div>
            </div>

            {/* Turn Announcement */}
            <div className="p-3 bg-surface-900/80 rounded-xl border border-surface-700/60 text-xs text-surface-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-white">
                <span
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    currentTurn === 'player' ? 'bg-emerald-400' : 'bg-purple-400'
                  )}
                />
                <span>Turn: {currentTurn === 'player' ? 'You (Player 1)' : 'Newton Bot'}</span>
              </div>
              <p className="text-[11px] text-surface-400">{turnMessage}</p>
            </div>
          </div>

          {/* Striker Baseline Slider */}
          <div className="card p-4 space-y-3 bg-surface-800 border-surface-700/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-surface-300">Striker Placement:</span>
              <span className="font-mono text-emerald-400 font-bold">{strikerBaselineX}px</span>
            </div>
            <input
              type="range"
              min="200"
              max="600"
              value={strikerBaselineX}
              disabled={isShotInMotion || currentTurn !== 'player'}
              onChange={(e) => handleBaselinePositionChange(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer disabled:opacity-50"
            />
            <p className="text-[10px] text-surface-400">
              Slide striker horizontally along the baseline before pulling back to aim.
            </p>
          </div>

          {/* Pocketed Coins History Log */}
          <div className="card p-3 space-y-2 bg-surface-800/80 border-surface-700/60 max-h-44 overflow-y-auto">
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Pocket Log
            </h3>
            {pocketedLog.length === 0 ? (
              <p className="text-xs text-surface-500 italic">No coins pocketed yet.</p>
            ) : (
              <div className="space-y-1 text-xs font-mono">
                {pocketedLog.map((log, i) => (
                  <div key={i} className="text-[11px] text-surface-300">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: CARROM BOARD CANVAS (6 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[560px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-950 bg-amber-950">
            <canvas
              ref={canvasRef}
              width={BOARD_SIZE}
              height={BOARD_SIZE}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="w-full h-full cursor-crosshair select-none"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Physics Sandbox Lab & Telemetry (3 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Physics Parameters Card */}
          <div className="card p-4 space-y-4 bg-surface-800 border-surface-700/80">
            <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Physics Lab Sliders</span>
            </h2>

            {/* Restitution (Elasticity) Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-surface-300">
                <span>Restitution (e):</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {restitution.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="0.95"
                step="0.05"
                value={restitution}
                onChange={(e) => setRestitution(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-surface-400 block">
                Higher = bouncier cushion rebounds ($v_2 - v_1 / u_1 - u_2$)
              </span>
            </div>

            {/* Surface Friction (Boric Powder) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-surface-300">
                <span>Board Friction:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {frictionAir.toFixed(3)}
                </span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.05"
                step="0.005"
                value={frictionAir}
                onChange={(e) => setFrictionAir(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-surface-400 block">
                Lower = fine boric powder, coins glide longer
              </span>
            </div>

            {/* Impulse Power Multiplier */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-surface-300">
                <span>Impulse Power:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {powerScale.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={powerScale}
                onChange={(e) => setPowerScale(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Real-time Physics Telemetry */}
          <div className="card p-4 space-y-3 bg-surface-850 border-surface-700/80">
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Collision Telemetry</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-surface-900 border border-surface-800">
                <span className="text-surface-400">Striker Speed:</span>
                <span className="text-emerald-400 font-bold">{strikerSpeed} px/s</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-surface-900 border border-surface-800">
                <span className="text-surface-400">Momentum p:</span>
                <span className="text-white font-bold">
                  {(strikerSpeed * 8).toFixed(1)} kg·px/s
                </span>
              </div>
            </div>

            {/* Physics Principle Callout */}
            <div className="p-3 bg-surface-900/70 rounded-xl border border-emerald-500/30 text-xs space-y-1">
              <p className="font-bold text-emerald-300">Newton’s 3rd Law in Carrom</p>
              <p className="text-[11px] text-surface-300 leading-relaxed">
                When the striker impacts a stationary coin, the forces exerted between them are
                equal in magnitude and opposite in direction ($F_1 = -F_2$).
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarromPage;
