// =========================================================
// VIDYAVERSE NEWTON'S CARROM — HIGH-FIDELITY CANVAS BOARD
// =========================================================

import React, { useRef, useEffect, useCallback } from 'react';
import Matter from 'matter-js';
import {
  CarromPhysicsEngine,
  BOARD_SIZE,
  POCKETS,
  COIN_RADIUS,
  STRIKER_RADIUS,
  BASELINE_CONFIGS,
} from '../carromPhysics';
import { PlayerSlot, CoinBodyData } from '../types';

export interface CarromBoardViewProps {
  physicsEngine: CarromPhysicsEngine | null;
  activePlayer: PlayerSlot;
  isShotInMotion: boolean;
  strikerBaselinePos: number;
  onBaselinePosChange: (newPos: number) => void;
  aimAngleRad: number;
  onAimAngleChange: (newAngle: number) => void;
  shotPower: number;
  onShotPowerChange: (newPower: number) => void;
  onExecuteShot: (angleRad: number, powerPercent: number) => void;
  aimGuideEnabled?: boolean;
}

export const CarromBoardView: React.FC<CarromBoardViewProps> = ({
  physicsEngine,
  activePlayer,
  isShotInMotion,
  strikerBaselinePos,
  onBaselinePosChange,
  aimAngleRad,
  onAimAngleChange,
  shotPower,
  onShotPowerChange,
  onExecuteShot,
  aimGuideEnabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interaction State Refs
  const isDraggingStrikerRef = useRef(false);
  const isDraggingAimRef = useRef(false);
  const dragStartPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentDragPointRef = useRef<{ x: number; y: number } | null>(null);

  // ---------------------------------------------------------
  // CONVERT SCREEN COORDINATES TO LOGICAL 800x800 COORDINATES
  // ---------------------------------------------------------
  const getLogicalCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 400, y: 400 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = BOARD_SIZE / rect.width;
    const scaleY = BOARD_SIZE / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // ---------------------------------------------------------
  // TOUCH & MOUSE HANDLERS FOR BASELINE DRAG & SLINGSHOT AIM
  // ---------------------------------------------------------
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (isShotInMotion || activePlayer.isBot || !physicsEngine?.striker) return;

    const coords = getLogicalCoords(clientX, clientY);
    const strikerPos = physicsEngine.striker.position;
    const distToStriker = Math.hypot(coords.x - strikerPos.x, coords.y - strikerPos.y);

    // 1. If clicking directly on striker, start Drag-To-Shoot (pull back)
    if (distToStriker <= STRIKER_RADIUS + 15) {
      isDraggingAimRef.current = true;
      dragStartPointRef.current = coords;
      currentDragPointRef.current = coords;
      return;
    }

    // 2. If clicking on baseline area, move striker along baseline
    const baseline = BASELINE_CONFIGS[activePlayer.side];
    let distToBaseline = Math.abs(coords.y - baseline.fixedCoordinate);
    if (activePlayer.side === 'west' || activePlayer.side === 'east') {
      distToBaseline = Math.abs(coords.x - baseline.fixedCoordinate);
    }

    if (distToBaseline <= 35) {
      isDraggingStrikerRef.current = true;
      const travelCoord = activePlayer.side === 'west' || activePlayer.side === 'east' ? coords.y : coords.x;
      onBaselinePosChange(travelCoord);
      return;
    }

    // 3. If clicking anywhere else on board, orient aim angle towards that point
    const angle = Math.atan2(coords.y - strikerPos.y, coords.x - strikerPos.x);
    onAimAngleChange(angle);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (isShotInMotion || activePlayer.isBot || !physicsEngine?.striker) return;

    const coords = getLogicalCoords(clientX, clientY);

    if (isDraggingStrikerRef.current) {
      const travelCoord = activePlayer.side === 'west' || activePlayer.side === 'east' ? coords.y : coords.x;
      onBaselinePosChange(travelCoord);
    } else if (isDraggingAimRef.current && dragStartPointRef.current) {
      currentDragPointRef.current = coords;
      const dx = coords.x - dragStartPointRef.current.x;
      const dy = coords.y - dragStartPointRef.current.y;
      const pullDist = Math.hypot(dx, dy);

      // Invert pull vector for slingshot / cue pull
      const angle = Math.atan2(-dy, -dx);
      onAimAngleChange(angle);

      // Calibrate drag distance (0..160px) to power (10..100%)
      const power = Math.min(100, Math.max(10, Math.round((pullDist / 140) * 100)));
      onShotPowerChange(power);
    }
  };

  const handlePointerUp = () => {
    if (isDraggingStrikerRef.current) {
      isDraggingStrikerRef.current = false;
    }

    if (isDraggingAimRef.current && dragStartPointRef.current && currentDragPointRef.current) {
      const dx = currentDragPointRef.current.x - dragStartPointRef.current.x;
      const dy = currentDragPointRef.current.y - dragStartPointRef.current.y;
      const pullDist = Math.hypot(dx, dy);

      isDraggingAimRef.current = false;
      dragStartPointRef.current = null;
      currentDragPointRef.current = null;

      // If dragged sufficiently (> 20px), execute the shot!
      if (pullDist >= 20) {
        onExecuteShot(aimAngleRad, shotPower);
      }
    }
  };

  // ---------------------------------------------------------
  // HIGH-RESOLUTION CANVAS RENDER LOOP (60FPS)
  // ---------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // 1. MAHOGANY WOODEN OUTER FRAME WITH BEVEL
      ctx.fillStyle = '#451a03'; // Deep rich mahogany
      ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // Inner cushion bevel gradient
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, BOARD_SIZE - 8, BOARD_SIZE - 8);

      // Wooden corner accents
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.strokeRect(38, 38, BOARD_SIZE - 76, BOARD_SIZE - 76);

      // 2. LACQUER PLAYING SURFACE (Warm polished plywood)
      ctx.fillStyle = '#fef3c7'; // Warm polished ivory
      ctx.fillRect(40, 40, BOARD_SIZE - 80, BOARD_SIZE - 80);

      // Surface border line
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, BOARD_SIZE - 80, BOARD_SIZE - 80);

      // 3. FOUR CORNER POCKETS (Deep holes with mesh lines)
      POCKETS.forEach((pocket) => {
        // Deep shadow
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocket.radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = '#1c1917';
        ctx.fill();

        // Pocket hole
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#09090b';
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Mesh Web Pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocket.radius - 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pocket.x - 12, pocket.y - 12);
        ctx.lineTo(pocket.x + 12, pocket.y + 12);
        ctx.moveTo(pocket.x + 12, pocket.y - 12);
        ctx.lineTo(pocket.x - 12, pocket.y + 12);
        ctx.stroke();
      });

      // 4. CORNER REBOUND ARROWS (Radiating towards center)
      const diagonals = [
        { x1: 95, y1: 95, x2: 240, y2: 240 },
        { x1: 705, y1: 95, x2: 560, y2: 240 },
        { x1: 95, y1: 705, x2: 240, y2: 560 },
        { x1: 705, y1: 705, x2: 560, y2: 560 },
      ];
      diagonals.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x1, d.y1);
        ctx.lineTo(d.x2, d.y2);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Decorative arrow circle
        ctx.beginPath();
        ctx.arc(d.x2, d.y2, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
      });

      // 5. FOUR BASELINES & CIRCLES (South, North, West, East)
      const drawHorizontalBaseline = (yFixed: number, isActive: boolean) => {
        ctx.strokeStyle = isActive ? '#dc2626' : '#991b1b';
        ctx.lineWidth = 1.8;

        // Double lines
        ctx.beginPath();
        ctx.moveTo(200, yFixed - 15);
        ctx.lineTo(600, yFixed - 15);
        ctx.moveTo(200, yFixed + 15);
        ctx.lineTo(600, yFixed + 15);
        ctx.stroke();

        // Baseline endpoint circles
        [200, 600].forEach((cx) => {
          ctx.beginPath();
          ctx.arc(cx, yFixed, 15, 0, Math.PI * 2);
          ctx.fillStyle = '#fef3c7';
          ctx.fill();
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(cx, yFixed, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
        });
      };

      const drawVerticalBaseline = (xFixed: number, isActive: boolean) => {
        ctx.strokeStyle = isActive ? '#dc2626' : '#991b1b';
        ctx.lineWidth = 1.8;

        // Double lines
        ctx.beginPath();
        ctx.moveTo(xFixed - 15, 200);
        ctx.lineTo(xFixed - 15, 600);
        ctx.moveTo(xFixed + 15, 200);
        ctx.lineTo(xFixed + 15, 600);
        ctx.stroke();

        // Baseline endpoint circles
        [200, 600].forEach((cy) => {
          ctx.beginPath();
          ctx.arc(xFixed, cy, 15, 0, Math.PI * 2);
          ctx.fillStyle = '#fef3c7';
          ctx.fill();
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(xFixed, cy, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
        });
      };

      // Draw all 4 standard baselines
      drawHorizontalBaseline(630, activePlayer.side === 'south');
      drawHorizontalBaseline(170, activePlayer.side === 'north');
      drawVerticalBaseline(170, activePlayer.side === 'west');
      drawVerticalBaseline(630, activePlayer.side === 'east');

      // 6. CENTRAL MANDALA & CONCENTRIC CIRCLES
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;

      // Outer circle (outer coin boundary)
      ctx.beginPath();
      ctx.arc(400, 400, 85, 0, Math.PI * 2);
      ctx.stroke();

      // Middle circle (inner coin boundary)
      ctx.beginPath();
      ctx.arc(400, 400, 32, 0, Math.PI * 2);
      ctx.stroke();

      // 8-Petal Mandala motif
      for (let p = 0; p < 8; p++) {
        const pAngle = (p * Math.PI) / 4;
        const px = 400 + Math.cos(pAngle) * 55;
        const py = 400 + Math.sin(pAngle) * 55;
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
        ctx.stroke();
      }

      // Center queen spot
      ctx.beginPath();
      ctx.arc(400, 400, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();

      // 7. MATTER.JS BODIES (Coins & Striker)
      if (physicsEngine?.engine) {
        const bodies = Matter.Composite.allBodies(physicsEngine.engine.world);

        bodies.forEach((body) => {
          if (body.isStatic) return;

          ctx.save();
          ctx.translate(body.position.x, body.position.y);
          ctx.rotate(body.angle);

          // 3D Drop Shadow
          ctx.beginPath();
          ctx.arc(2.5, 3.5, (body.circleRadius || COIN_RADIUS), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          ctx.fill();

          if (body.label === 'striker') {
            // STRIKER: Acrylic translucent disc with concentric laser rings
            ctx.beginPath();
            ctx.arc(0, 0, STRIKER_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = '#0284c7'; // Electric Cyan
            ctx.fill();
            ctx.strokeStyle = '#e0f2fe';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Inner engraving rings
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          } else {
            // COINS (Queen, White, Black)
            const data = (body as unknown as { coinData?: CoinBodyData }).coinData;
            const r = body.circleRadius || COIN_RADIUS;

            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);

            if (data?.type === 'queen') {
              // Red Queen
              ctx.fillStyle = '#dc2626';
              ctx.fill();
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 2;
              ctx.stroke();

              // Queen center jewel
              ctx.beginPath();
              ctx.arc(0, 0, 5, 0, Math.PI * 2);
              ctx.fillStyle = '#fde047';
              ctx.fill();
            } else if (data?.type === 'white') {
              // Ivory White Coin
              ctx.fillStyle = '#f8fafc';
              ctx.fill();
              ctx.strokeStyle = '#cbd5e1';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              // Concentric ring
              ctx.beginPath();
              ctx.arc(0, 0, 6, 0, Math.PI * 2);
              ctx.fillStyle = '#e2e8f0';
              ctx.fill();
            } else {
              // Ebony Black Coin
              ctx.fillStyle = '#1e293b';
              ctx.fill();
              ctx.strokeStyle = '#475569';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              // Concentric ring
              ctx.beginPath();
              ctx.arc(0, 0, 6, 0, Math.PI * 2);
              ctx.fillStyle = '#334155';
              ctx.fill();
            }
          }

          ctx.restore();
        });
      }

      // 8. AIMING GUIDE & TRAJECTORY PREDICTION
      if (
        aimGuideEnabled &&
        !isShotInMotion &&
        !activePlayer.isBot &&
        physicsEngine?.striker
      ) {
        const sx = physicsEngine.striker.position.x;
        const sy = physicsEngine.striker.position.y;

        const trajectory = physicsEngine.calculateAimTrajectory(
          sx,
          sy,
          aimAngleRad,
          shotPower
        );

        ctx.save();
        ctx.setLineDash([7, 5]);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        trajectory.path.forEach((pt) => {
          ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        // Endpoint marker
        const lastPt = trajectory.path[trajectory.path.length - 1];
        if (lastPt) {
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(lastPt.x, lastPt.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = trajectory.hitCoin ? '#f59e0b' : '#38bdf8';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [physicsEngine, activePlayer, isShotInMotion, aimAngleRad, shotPower, aimGuideEnabled]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[620px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-[#331105] bg-[#331105] select-none mx-auto flex items-center justify-center"
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        width={BOARD_SIZE}
        height={BOARD_SIZE}
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) handlePointerDown(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) handlePointerMove(t.clientX, t.clientY);
        }}
        onTouchEnd={handlePointerUp}
        className="w-full h-full cursor-crosshair"
      />
    </div>
  );
};
