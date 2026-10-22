import { PlayerConfig, SAFE_SQUARES } from './types';

/**
 * Validates whether a specific token can legally move given the dice roll.
 * Standard Ludo rules:
 * - Token in base (-1) requires a 6 to enter the starting square.
 * - Token on track (0 - 51) traverses up to 51 steps relative to player's entry.
 * - Enters home path (52 - 56).
 * - Exact roll required to reach home center (100). Over-rolls are invalid.
 */
export function canTokenMove(player: PlayerConfig, currentPos: number, roll: number): boolean {
  // Already completed/won
  if (currentPos === 100) return false;

  // In home bay: only 6 can launch token
  if (currentPos === -1) {
    return roll === 6;
  }

  // On main track (0 - 51)
  if (currentPos >= 0 && currentPos <= 51) {
    const stepsFromStart = (currentPos - player.startPos + 52) % 52;
    const totalSteps = stepsFromStart + roll;

    if (totalSteps <= 50) {
      return true; // Still on main track
    } else if (totalSteps <= 56) {
      return true; // Enters colored home corridor
    } else if (totalSteps === 57) {
      return true; // Exact roll lands directly in home center
    } else {
      return false; // Over-roll
    }
  }

  // On colored home corridor (52 - 56)
  if (currentPos >= 52 && currentPos <= 56) {
    const stepsInHome = currentPos - 51; // 1 to 5
    return stepsInHome + roll <= 6;
  }

  return false;
}

/**
 * Calculates the exact target position for a token given the dice roll.
 * Return values:
 * - 0 - 51: Main track index
 * - 52 - 56: Home corridor index
 * - 100: Center sanctuary (goal reached)
 */
export function getNextPosition(player: PlayerConfig, currentPos: number, roll: number): number {
  if (currentPos === -1) {
    return player.startPos;
  }

  if (currentPos >= 0 && currentPos <= 51) {
    const stepsFromStart = (currentPos - player.startPos + 52) % 52;
    const totalSteps = stepsFromStart + roll;

    if (totalSteps <= 50) {
      return (currentPos + roll) % 52;
    } else if (totalSteps <= 56) {
      return 51 + (totalSteps - 50);
    } else if (totalSteps === 57) {
      return 100; // Goal reached!
    }
  }

  if (currentPos >= 52 && currentPos <= 56) {
    const stepsInHome = currentPos - 51;
    if (stepsInHome + roll === 6) {
      return 100; // Goal reached!
    }
    if (stepsInHome + roll > 6) {
      return currentPos; // Cannot overshoot home
    }
    return currentPos + roll;
  }

  return currentPos;
}

/**
 * Returns list of token indices (0..3) that can legally move given the current roll.
 */
export function getLegalMoves(
  playerIdx: number,
  tokens: number[][],
  roll: number,
  players: PlayerConfig[]
): number[] {
  const p = players[playerIdx];
  if (!p || !p.isActive) return [];

  const legal: number[] = [];
  tokens[playerIdx].forEach((pos, tokenIdx) => {
    if (canTokenMove(p, pos, roll)) {
      legal.push(tokenIdx);
    }
  });

  return legal;
}

/**
 * Checks if landing on newPos captures an opponent's token.
 * Rules:
 * - Captures only happen on the main track (0 <= newPos <= 51).
 * - Safe squares (stars) are immune from captures.
 * - Friendly tokens cannot capture each other.
 * - Inactive player tokens are ignored.
 */
export function checkCapture(
  playerIdx: number,
  newPos: number,
  tokens: number[][],
  players: PlayerConfig[]
): { capturedPlayerIdx: number; capturedTokenIdx: number } | null {
  if (newPos < 0 || newPos > 51) return null;
  if (SAFE_SQUARES.includes(newPos)) return null;

  for (let pIdx = 0; pIdx < players.length; pIdx++) {
    if (pIdx === playerIdx) continue;
    if (!players[pIdx].isActive) continue;

    for (let tIdx = 0; tIdx < 4; tIdx++) {
      if (tokens[pIdx][tIdx] === newPos) {
        return { capturedPlayerIdx: pIdx, capturedTokenIdx: tIdx };
      }
    }
  }

  return null;
}

/**
 * Checks whether a player has won the game (all 4 tokens are in home sanctuary 100).
 */
export function checkWinCondition(playerIdx: number, tokens: number[][]): boolean {
  if (!tokens[playerIdx]) return false;
  return tokens[playerIdx].every((pos) => pos === 100);
}

/**
 * Finds the next active player in turn order.
 * In 4-player matches: rotates 0 -> 1 -> 2 -> 3 -> 0.
 * In 1v1 Duel: rotates only between the active players (e.g. 0 -> 2 -> 0 if Red vs Yellow).
 */
export function getNextActivePlayer(currentPlayer: number, players: PlayerConfig[]): number {
  let next = (currentPlayer + 1) % players.length;
  let attempts = 0;

  while (!players[next].isActive && attempts < players.length) {
    next = (next + 1) % players.length;
    attempts++;
  }

  return next;
}

/**
 * Dynamic fair dice roll algorithm.
 * Increases the chance of rolling a 6 so players can launch tokens from base,
 * while strictly distributing remaining probability equally among numbers 1..5.
 */
export function calculateSmartRoll(playerIdx: number, tokens: number[][]): number {
  const pTokens = tokens[playerIdx] || [-1, -1, -1, -1];
  const hasTokensInBase = pTokens.some((pos) => pos === -1);
  const allTokensInBase = pTokens.every((pos) => pos === -1);

  // Boost 6 to 35% if all tokens are in base, 28% if some in base, 22% otherwise
  const chanceOfSix = allTokensInBase ? 0.35 : hasTokensInBase ? 0.28 : 0.22;
  const remainingProbEach = (1 - chanceOfSix) / 5;

  const rand = Math.random();
  if (rand < chanceOfSix) return 6;
  if (rand < chanceOfSix + remainingProbEach) return 1;
  if (rand < chanceOfSix + remainingProbEach * 2) return 2;
  if (rand < chanceOfSix + remainingProbEach * 3) return 3;
  if (rand < chanceOfSix + remainingProbEach * 4) return 4;
  return 5;
}
