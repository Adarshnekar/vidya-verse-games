import { PlayerConfig, SAFE_SQUARES } from './types';
import { getNextPosition } from './ludoRules';

export interface BotDecision {
  tokenIndex: number;
  reason: string;
}

/**
 * Intelligent AI Decision Engine for Ludo Bots.
 * Evaluates all legal moves using a multi-factor tactical heuristic:
 * 1. Completing into Home Center (100) -> +1000 pts
 * 2. Capturing an opponent token -> +800 pts
 * 3. Escaping an immediate threat (opponent 1-6 cells behind) -> +600 pts
 * 4. Releasing a token from base (-1) with roll 6 -> +500 pts
 * 5. Landing on a safe star square -> +400 pts
 * 6. Advancing track distance -> +10 to +80 pts
 * 7. Risk penalty for moving into unprotected vulnerability -> -200 pts
 */
export function chooseBestMove(
  playerIdx: number,
  legalTokenIndices: number[],
  tokens: number[][],
  diceValue: number,
  players: PlayerConfig[]
): BotDecision {
  if (legalTokenIndices.length === 0) {
    return { tokenIndex: 0, reason: 'No legal moves' };
  }

  if (legalTokenIndices.length === 1) {
    return { tokenIndex: legalTokenIndices[0], reason: 'Only legal move' };
  }

  const botConfig = players[playerIdx];
  const difficulty = botConfig.botDifficulty || 'intermediate';

  // Beginner AI: 40% random move, 60% simple heuristic
  if (difficulty === 'beginner' && Math.random() < 0.4) {
    const randomIdx = legalTokenIndices[Math.floor(Math.random() * legalTokenIndices.length)];
    return { tokenIndex: randomIdx, reason: 'Random exploration' };
  }

  let bestIndex = legalTokenIndices[0];
  let highestScore = -Infinity;
  let bestReason = 'Strategic advance';

  for (const idx of legalTokenIndices) {
    const currentPos = tokens[playerIdx][idx];
    const nextPos = getNextPosition(botConfig, currentPos, diceValue);
    let moveScore = 0;
    let moveReason = 'Advancing';

    // 1. Enters Home (100)
    if (nextPos === 100) {
      moveScore += 1000;
      moveReason = 'Reaches Home Goal 🎉';
    }

    // 2. Captures an opponent token (high priority + bonus turn awarded!)
    else if (nextPos >= 0 && nextPos <= 51 && !SAFE_SQUARES.includes(nextPos)) {
      const hasOpponent = tokens.some(
        (pTokens, pIdx) =>
          pIdx !== playerIdx &&
          players[pIdx].isActive &&
          pTokens.some((pos) => pos === nextPos)
      );

      if (hasOpponent) {
        moveScore += 900;
        moveReason = 'Captures opponent token ⚔️';
      }
    }

    // 3. Release from base
    if (currentPos === -1 && diceValue === 6) {
      // Prioritize releasing if we have few tokens on board
      const tokensOnBoard = tokens[playerIdx].filter((p) => p >= 0 && p < 100).length;
      const releaseBonus = tokensOnBoard === 0 ? 700 : tokensOnBoard === 1 ? 500 : 350;
      moveScore += releaseBonus;
      moveReason = 'Launches new token from base 🚀';
    }

    // 4. Lands on a safe square (when moving along track, not launching from base)
    if (SAFE_SQUARES.includes(nextPos) && currentPos !== -1) {
      moveScore += 400;
      moveReason = 'Secures safe star square ⭐';
    }

    // 5. Escaping threat if current position is vulnerable
    if (currentPos >= 0 && currentPos <= 51 && !SAFE_SQUARES.includes(currentPos)) {
      const isUnderThreat = tokens.some((pTokens, pIdx) => {
        if (pIdx === playerIdx || !players[pIdx].isActive) return false;
        return pTokens.some((oPos) => {
          if (oPos < 0 || oPos > 51) return false;
          const dist = (currentPos - oPos + 52) % 52;
          return dist >= 1 && dist <= 6;
        });
      });

      if (isUnderThreat) {
        moveScore += 600;
        moveReason = 'Escapes pursuing opponent 🛡️';
      }
    }

    // 6. Enters colored home corridor (52 - 56) where it is permanently safe
    if (nextPos >= 52 && nextPos <= 56) {
      moveScore += 450;
      moveReason = 'Enters safe home corridor 🏆';
    }

    // 7. Track advancement (progressive weight based on how close to home)
    if (currentPos >= 0 && currentPos <= 51) {
      const stepsFromStart = (currentPos - botConfig.startPos + 52) % 52;
      moveScore += stepsFromStart * 3;
    }

    // Personality adjustments
    if (botConfig.name.includes('Bhaskara')) {
      // Aggressive: Extra weight on captures & launches
      if (moveReason.includes('Capture')) moveScore += 150;
    } else if (botConfig.name.includes('Ramanujan')) {
      // Strategic: Extra weight on safe squares & escapes
      if (moveReason.includes('safe') || moveReason.includes('Escapes')) moveScore += 150;
    } else if (botConfig.name.includes('Aryabhata')) {
      // Mathematical: Extra weight on home finish
      if (moveReason.includes('Home')) moveScore += 150;
    }

    if (moveScore > highestScore) {
      highestScore = moveScore;
      bestIndex = idx;
      bestReason = moveReason;
    }
  }

  return { tokenIndex: bestIndex, reason: bestReason };
}

/**
 * Determines whether a bot answers a math question correctly based on difficulty.
 */
export function botMathQuizAnswer(
  botDifficulty: 'beginner' | 'intermediate' | 'advanced',
  correctIndex: number
): number {
  const accuracy =
    botDifficulty === 'advanced'
      ? 0.94 // 94% correct
      : botDifficulty === 'intermediate'
      ? 0.82 // 82% correct
      : 0.65; // 65% correct

  const isCorrect = Math.random() < accuracy;
  if (isCorrect) return correctIndex;

  // Pick one of the incorrect options
  const incorrectChoices = [0, 1, 2, 3].filter((i) => i !== correctIndex);
  return incorrectChoices[Math.floor(Math.random() * incorrectChoices.length)];
}
