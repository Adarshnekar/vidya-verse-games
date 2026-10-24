// =========================================================
// VIDYAVERSE NEWTON'S CARROM — INTELLIGENT BOT ENGINE
// =========================================================

import Matter from 'matter-js';
import { BotDifficulty, CoinType } from './types';
import { POCKETS, BASELINE_CONFIGS, COIN_RADIUS, STRIKER_RADIUS } from './carromPhysics';

export interface AIShotPlan {
  baselinePosition: number;
  angleRad: number;
  powerPercent: number;
  targetCoinType: CoinType;
  targetPocketId: string;
}

export function computeAIShot(
  engine: Matter.Engine,
  striker: Matter.Body,
  side: 'south' | 'north' | 'west' | 'east',
  difficulty: BotDifficulty = 'intermediate',
  queenPriority: boolean = false
): AIShotPlan | null {
  const allBodies = Matter.Composite.allBodies(engine.world);
  const activeCoins = allBodies.filter((b) => b.label.startsWith('coin_'));

  if (activeCoins.length === 0) return null;

  const baseline = BASELINE_CONFIGS[side];

  // If queen priority is high and queen is on board, target queen
  const queenCoin = activeCoins.find((c) => c.label === 'coin_queen');
  const targetCandidates = queenPriority && queenCoin ? [queenCoin, ...activeCoins] : activeCoins;

  let bestPlan: AIShotPlan | null = null;
  let bestScore = -999999;

  // Evaluate candidate coins and pockets
  for (const coin of targetCandidates) {
    const isQueen = coin.label === 'coin_queen';

    for (const pocket of POCKETS) {
      // Vector from coin to pocket
      const toPocketX = pocket.x - coin.position.x;
      const toPocketY = pocket.y - coin.position.y;
      const distCoinToPocket = Math.hypot(toPocketX, toPocketY);

      if (distCoinToPocket < 20) continue;

      const normPocketX = toPocketX / distCoinToPocket;
      const normPocketY = toPocketY / distCoinToPocket;

      // Desired impact point on coin (ghost ball position opposite to pocket)
      const impactDist = COIN_RADIUS + STRIKER_RADIUS - 2;
      const ghostX = coin.position.x - normPocketX * impactDist;
      const ghostY = coin.position.y - normPocketY * impactDist;

      // Project candidate baseline positions
      // Test 9 discrete baseline positions
      const step = (baseline.maxTravel - baseline.minTravel) / 8;
      for (let pos = baseline.minTravel; pos <= baseline.maxTravel; pos += step) {
        let strikerX = pos;
        let strikerY = baseline.fixedCoordinate;
        if (side === 'west' || side === 'east') {
          strikerX = baseline.fixedCoordinate;
          strikerY = pos;
        }

        const toGhostX = ghostX - strikerX;
        const toGhostY = ghostY - strikerY;
        const distStrikerToGhost = Math.hypot(toGhostX, toGhostY);

        if (distStrikerToGhost < 40) continue;

        // Angle from striker to impact point
        const aimAngle = Math.atan2(toGhostY, toGhostX);

        // Dot product between striker-to-coin vector and coin-to-pocket vector (cut angle alignment)
        const dot = (toGhostX / distStrikerToGhost) * normPocketX + (toGhostY / distStrikerToGhost) * normPocketY;

        // In Carrom, striker pushes coin forward; dot product should be positive (cut angle < 80 deg)
        if (dot < 0.15) continue;

        // Score this shot:
        // Higher alignment dot is better
        // Shorter distance to pocket is better
        // Queen bonus
        const shotScore = dot * 100 - distCoinToPocket * 0.1 - distStrikerToGhost * 0.05 + (isQueen ? 50 : 0);

        if (shotScore > bestScore) {
          bestScore = shotScore;

          // Calibrate power based on total distance
          const totalDistance = distStrikerToGhost + distCoinToPocket;
          let power = Math.min(100, Math.max(35, (totalDistance / 750) * 85));

          // Difficulty noise calibrations
          let angleNoise = 0;
          if (difficulty === 'beginner') {
            // ±8° noise, ±20% power error
            angleNoise = (Math.random() - 0.5) * 0.28;
            power += (Math.random() - 0.5) * 30;
          } else if (difficulty === 'intermediate') {
            // ±3° noise, ±8% power error
            angleNoise = (Math.random() - 0.5) * 0.1;
            power += (Math.random() - 0.5) * 15;
          } else {
            // Advanced: crisp ±1° precision
            angleNoise = (Math.random() - 0.5) * 0.035;
          }

          bestPlan = {
            baselinePosition: Math.round(pos),
            angleRad: aimAngle + angleNoise,
            powerPercent: Math.round(Math.min(100, Math.max(25, power))),
            targetCoinType: isQueen ? 'queen' : coin.label === 'coin_white' ? 'white' : 'black',
            targetPocketId: pocket.id,
          };
        }
      }
    }
  }

  // Fallback if no clean cut angle found: aim directly at closest coin
  if (!bestPlan && activeCoins.length > 0) {
    const closest = activeCoins[0];
    const defaultPos = (baseline.maxTravel + baseline.minTravel) / 2;
    let sx = defaultPos;
    let sy = baseline.fixedCoordinate;
    if (side === 'west' || side === 'east') {
      sx = baseline.fixedCoordinate;
      sy = defaultPos;
    }

    const angle = Math.atan2(closest.position.y - sy, closest.position.x - sx);
    bestPlan = {
      baselinePosition: defaultPos,
      angleRad: angle,
      powerPercent: 65,
      targetCoinType: closest.label.includes('queen') ? 'queen' : 'white',
      targetPocketId: 'top_left',
    };
  }

  return bestPlan;
}
