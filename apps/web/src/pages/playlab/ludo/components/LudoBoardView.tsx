import React from 'react';
import { motion } from 'framer-motion';
import {
  PlayerConfig,
  TRACK_COORDS,
  SAFE_SQUARES,
  HOME_PATHS,
  HOME_BAYS,
} from '../types';

interface LudoBoardViewProps {
  tokens: number[][];
  players: PlayerConfig[];
  currentPlayer: number;
  phase: string;
  isCurrentHuman: boolean;
  movableTokenIndices: number[];
  onTokenClick: (tokenIdx: number) => void;
  isMovingPawn: boolean;
}

export const LudoBoardView: React.FC<LudoBoardViewProps> = ({
  tokens,
  players,
  currentPlayer,
  phase,
  isCurrentHuman,
  movableTokenIndices,
  onTokenClick,
  isMovingPawn,
}) => {
  const cellSize = 40; // 15 cells * 40 = 600px square

  // Compute position for any token on the board (with multi-token collision distribution)
  const getTokenCoords = (playerIdx: number, tokenIdx: number) => {
    const pos = tokens[playerIdx][tokenIdx];
    const color = players[playerIdx].color;

    // Home bay
    if (pos === -1) {
      const bay = HOME_BAYS[color][tokenIdx];
      return { x: bay.x, y: bay.y, isShared: false };
    }

    // Goal reached (Center)
    if (pos === 100 || pos === 57) {
      const centerOffsets = [
        { x: 276, y: 276 },
        { x: 324, y: 276 },
        { x: 324, y: 324 },
        { x: 276, y: 324 },
      ];
      const tokenCornerOffsets = [
        { dx: -4, dy: -4 },
        { dx: 4, dy: -4 },
        { dx: -4, dy: 4 },
        { dx: 4, dy: 4 },
      ];
      const base = centerOffsets[playerIdx] || centerOffsets[0];
      const sub = tokenCornerOffsets[tokenIdx] || { dx: 0, dy: 0 };
      return { x: base.x + sub.dx, y: base.y + sub.dy, isShared: false };
    }

    // Main Track or Corridor Base
    let baseX = 0;
    let baseY = 0;

    if (pos >= 52 && pos <= 56) {
      const corridorIndex = pos - 52;
      const cell = HOME_PATHS[color][corridorIndex];
      baseX = cell.col * cellSize + cellSize / 2;
      baseY = cell.row * cellSize + cellSize / 2;
    } else {
      const trackCell = TRACK_COORDS[pos] || TRACK_COORDS[0];
      baseX = trackCell.col * cellSize + cellSize / 2;
      baseY = trackCell.row * cellSize + cellSize / 2;
    }

    // Check how many tokens share this exact cell
    const tokensOnCell: { pIdx: number; tIdx: number }[] = [];
    tokens.forEach((pTokens, pI) => {
      pTokens.forEach((pPos, tI) => {
        if (pPos === pos) {
          if (pos >= 52 && pos <= 56) {
            if (pI === playerIdx) tokensOnCell.push({ pIdx: pI, tIdx: tI });
          } else {
            tokensOnCell.push({ pIdx: pI, tIdx: tI });
          }
        }
      });
    });

    if (tokensOnCell.length <= 1) {
      return { x: baseX, y: baseY, isShared: false };
    }

    // Distribute shared pawns symmetrically around cell center
    const myIndex = tokensOnCell.findIndex(
      (item) => item.pIdx === playerIdx && item.tIdx === tokenIdx
    );

    const offsets2 = [
      { dx: -5, dy: -5 },
      { dx: 5, dy: 5 },
    ];
    const offsets3 = [
      { dx: 0, dy: -6 },
      { dx: -6, dy: 5 },
      { dx: 6, dy: 5 },
    ];
    const offsets4 = [
      { dx: -6, dy: -6 },
      { dx: 6, dy: -6 },
      { dx: -6, dy: 6 },
      { dx: 6, dy: 6 },
    ];

    const offsetList =
      tokensOnCell.length === 2
        ? offsets2
        : tokensOnCell.length === 3
        ? offsets3
        : offsets4;

    const offset = offsetList[myIndex % offsetList.length] || { dx: 0, dy: 0 };

    return {
      x: baseX + offset.dx,
      y: baseY + offset.dy,
      isShared: true,
    };
  };

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col items-center justify-center overflow-hidden w-full">
      <div className="relative aspect-square h-full max-h-[740px] max-w-[740px] flex items-center justify-center select-none p-1 sm:p-2">
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-slate-900 bg-slate-950 overflow-hidden"
        >
          {/* --------------------------------------------------- */}
          {/* 4 BASES (6x6 cells = 240px square each) */}
          {/* --------------------------------------------------- */}

          {/* Red Base (Top-Left) */}
          <g>
            <rect x="0" y="0" width="240" height="240" fill="#dc2626" rx="16" />
            <rect x="24" y="24" width="192" height="192" fill="#0f172a" rx="12" />
            {HOME_BAYS.red.map((b, idx) => (
              <circle
                key={`red-bay-${idx}`}
                cx={b.x}
                cy={b.y}
                r="18"
                fill="#dc2626"
                stroke="#fee2e2"
                strokeWidth="2.5"
              />
            ))}
            <text
              x="120"
              y="20"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="900"
              letterSpacing="2"
            >
              RED BASE
            </text>
          </g>

          {/* Green Base (Top-Right) */}
          <g opacity={!players[1].isActive ? 0.4 : 1}>
            <rect x="360" y="0" width="240" height="240" fill="#16a34a" rx="16" />
            <rect x="384" y="24" width="192" height="192" fill="#0f172a" rx="12" />
            {HOME_BAYS.green.map((b, idx) => (
              <circle
                key={`green-bay-${idx}`}
                cx={b.x}
                cy={b.y}
                r="18"
                fill="#16a34a"
                stroke="#dcfce7"
                strokeWidth="2.5"
              />
            ))}
            <text
              x="480"
              y="20"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="900"
              letterSpacing="2"
            >
              {!players[1].isActive ? 'LOCKED' : 'GREEN BASE'}
            </text>
          </g>

          {/* Yellow Base (Bottom-Right) */}
          <g>
            <rect x="360" y="360" width="240" height="240" fill="#ca8a04" rx="16" />
            <rect x="384" y="384" width="192" height="192" fill="#0f172a" rx="12" />
            {HOME_BAYS.yellow.map((b, idx) => (
              <circle
                key={`yellow-bay-${idx}`}
                cx={b.x}
                cy={b.y}
                r="18"
                fill="#ca8a04"
                stroke="#fef9c3"
                strokeWidth="2.5"
              />
            ))}
            <text
              x="480"
              y="592"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="900"
              letterSpacing="2"
            >
              YELLOW BASE
            </text>
          </g>

          {/* Blue Base (Bottom-Left) */}
          <g opacity={!players[3].isActive ? 0.4 : 1}>
            <rect x="0" y="360" width="240" height="240" fill="#2563eb" rx="16" />
            <rect x="24" y="384" width="192" height="192" fill="#0f172a" rx="12" />
            {HOME_BAYS.blue.map((b, idx) => (
              <circle
                key={`blue-bay-${idx}`}
                cx={b.x}
                cy={b.y}
                r="18"
                fill="#2563eb"
                stroke="#dbeafe"
                strokeWidth="2.5"
              />
            ))}
            <text
              x="120"
              y="592"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="900"
              letterSpacing="2"
            >
              {!players[3].isActive ? 'LOCKED' : 'BLUE BASE'}
            </text>
          </g>

          {/* --------------------------------------------------- */}
          {/* 52 MAIN TRACK CELLS */}
          {/* --------------------------------------------------- */}
          {TRACK_COORDS.map((coord, idx) => {
            const isSafe = SAFE_SQUARES.includes(idx);
            const isRedEntry = idx === 0;
            const isGreenEntry = idx === 13;
            const isYellowEntry = idx === 26;
            const isBlueEntry = idx === 39;

            let cellFill = '#1e293b';
            if (isRedEntry) cellFill = '#dc2626';
            else if (isGreenEntry) cellFill = '#16a34a';
            else if (isYellowEntry) cellFill = '#ca8a04';
            else if (isBlueEntry) cellFill = '#2563eb';

            return (
              <g key={`track-${idx}`}>
                <rect
                  x={coord.col * cellSize}
                  y={coord.row * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={cellFill}
                  stroke="#334155"
                  strokeWidth="1"
                />

                {/* Safe Star Indicator */}
                {isSafe && (
                  <g
                    transform={`translate(${coord.col * cellSize + 20}, ${
                      coord.row * cellSize + 20
                    })`}
                  >
                    <polygon
                      points="0,-8 2.5,-2.5 8,0 2.5,2.5 0,8 -2.5,2.5 -8,0 -2.5,-2.5"
                      fill="#facc15"
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* --------------------------------------------------- */}
          {/* 4 COLORED HOME PATHS */}
          {/* --------------------------------------------------- */}
          {/* Red corridor */}
          {HOME_PATHS.red.slice(0, 5).map((coord, idx) => (
            <rect
              key={`red-home-${idx}`}
              x={coord.col * cellSize}
              y={coord.row * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#ef4444"
              stroke="#b91c1c"
              strokeWidth="1"
            />
          ))}

          {/* Green corridor */}
          {HOME_PATHS.green.slice(0, 5).map((coord, idx) => (
            <rect
              key={`green-home-${idx}`}
              x={coord.col * cellSize}
              y={coord.row * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#22c55e"
              stroke="#15803d"
              strokeWidth="1"
            />
          ))}

          {/* Yellow corridor */}
          {HOME_PATHS.yellow.slice(0, 5).map((coord, idx) => (
            <rect
              key={`yellow-home-${idx}`}
              x={coord.col * cellSize}
              y={coord.row * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#eab308"
              stroke="#a16207"
              strokeWidth="1"
            />
          ))}

          {/* Blue corridor */}
          {HOME_PATHS.blue.slice(0, 5).map((coord, idx) => (
            <rect
              key={`blue-home-${idx}`}
              x={coord.col * cellSize}
              y={coord.row * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#3b82f6"
              stroke="#1d4ed8"
              strokeWidth="1"
            />
          ))}

          {/* --------------------------------------------------- */}
          {/* CENTER HOME (3x3 = 120px triangle hub) */}
          {/* --------------------------------------------------- */}
          <polygon points="240,240 360,240 300,300" fill="#16a34a" />
          <polygon points="360,240 360,360 300,300" fill="#ca8a04" />
          <polygon points="240,360 360,360 300,300" fill="#2563eb" />
          <polygon points="240,240 240,360 300,300" fill="#dc2626" />

          {/* Central Winning Star */}
          <circle cx="300" cy="300" r="14" fill="#0f172a" stroke="#facc15" strokeWidth="2.5" />
          <polygon
            points="0,-7 2.2,-2.2 7,0 2.2,2.2 0,7 -2.2,2.2 -7,0 -2.2,-2.2"
            fill="#facc15"
            transform="translate(300, 300)"
          />

          {/* --------------------------------------------------- */}
          {/* 16 INTERACTIVE PAWNS (ANIMATED WITH FRAMER MOTION) */}
          {/* --------------------------------------------------- */}
          {players.map((p, pIdx) => {
            if (!p.isActive) return null;

            return tokens[pIdx].map((pos, tIdx) => {
              const coords = getTokenCoords(pIdx, tIdx);
              const isMovable =
                phase === 'moving' &&
                currentPlayer === pIdx &&
                isCurrentHuman &&
                movableTokenIndices.includes(tIdx);

              const isBotTurnMoving =
                phase === 'moving' &&
                currentPlayer === pIdx &&
                p.isBot &&
                movableTokenIndices.includes(tIdx);

              const radius = coords.isShared ? 11 : 14;

              return (
                <motion.g
                  key={`token-${pIdx}-${tIdx}`}
                  initial={false}
                  animate={{
                    x: coords.x,
                    y: coords.y,
                    scale: isMovable ? [1, 1.14, 1] : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 28,
                    mass: 0.8,
                    scale: {
                      repeat: isMovable ? Infinity : 0,
                      duration: 0.9,
                    },
                  }}
                  onClick={() => {
                    if (isMovable && !isMovingPawn) {
                      onTokenClick(tIdx);
                    }
                  }}
                  className={
                    isMovable
                      ? 'cursor-pointer hover:filter hover:brightness-125'
                      : 'pointer-events-none'
                  }
                >
                  {/* Glowing ring for legal moves */}
                  {(isMovable || isBotTurnMoving) && (
                    <circle
                      cx="0"
                      cy="0"
                      r={radius + 6}
                      fill="none"
                      stroke="#facc15"
                      strokeWidth="3.5"
                      strokeDasharray="4 2"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Pawn Shadow */}
                  <ellipse
                    cx="0"
                    cy={radius - 2}
                    rx={radius - 1}
                    ry={radius / 3.5}
                    fill="rgba(0, 0, 0, 0.45)"
                  />

                  {/* Outer Rim */}
                  <circle
                    cx="0"
                    cy="0"
                    r={radius}
                    fill={p.hexColor}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="drop-shadow-md"
                  />

                  {/* Inner Dome */}
                  <circle
                    cx="0"
                    cy="0"
                    r={radius - 4}
                    fill="#0f172a"
                    stroke={p.hexColor}
                    strokeWidth="1.5"
                  />

                  {/* Token Number Pip */}
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={coords.isShared ? '9' : '11'}
                    fontWeight="bold"
                  >
                    {pos === 100 ? '✓' : tIdx + 1}
                  </text>
                </motion.g>
              );
            });
          })}
        </svg>
      </div>
    </div>
  );
};
