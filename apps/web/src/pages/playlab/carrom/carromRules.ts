// =========================================================
// VIDYAVERSE NEWTON'S CARROM — RULES & TURN ENGINE
// =========================================================

import { CarromMatchState, CoinType, PlayerSlot } from './types';

export interface ShotResult {
  strikerPocketed: boolean;
  coinsPocketed: CoinType[];
  isLegalShot: boolean;
  pointsAwarded: number;
  queenClaimed: boolean;
  queenReturnedToCenter: boolean;
  penaltyCoinReturned: boolean;
  nextPlayerIndex: number;
  message: string;
}

export function evaluateCarromShot(
  state: CarromMatchState,
  pocketedThisShot: CoinType[]
): ShotResult {
  const activePlayer = state.players[state.activePlayerIndex];
  if (!activePlayer) {
    return {
      strikerPocketed: false,
      coinsPocketed: [],
      isLegalShot: false,
      pointsAwarded: 0,
      queenClaimed: false,
      queenReturnedToCenter: false,
      penaltyCoinReturned: false,
      nextPlayerIndex: 0,
      message: 'Invalid player state.',
    };
  }

  const strikerPocketed = pocketedThisShot.includes('striker');
  const coinsPocketed = pocketedThisShot.filter((c) => c !== 'striker');

  let pointsAwarded = 0;
  let queenClaimed = false;
  let queenReturnedToCenter = false;
  let penaltyCoinReturned = false;
  let retainsTurn = false;
  let message = '';

  // 1. Handle Striker Foul (Striker Pocketed)
  if (strikerPocketed) {
    message = `⚠️ Foul! ${activePlayer.name} pocketed the striker (-5 pts penalty).`;
    pointsAwarded = -5;
    penaltyCoinReturned = true;

    // If Queen was pending cover by this player, return Queen to center
    if (state.queenState === 'pocketed_uncovered' && state.queenCoverPlayerIndex === state.activePlayerIndex) {
      queenReturnedToCenter = true;
      message += ' Uncovered Queen returns to center.';
    }

    // Turn is lost on foul
    const nextPlayerIndex = (state.activePlayerIndex + 1) % state.players.length;
    return {
      strikerPocketed: true,
      coinsPocketed,
      isLegalShot: false,
      pointsAwarded,
      queenClaimed: false,
      queenReturnedToCenter,
      penaltyCoinReturned,
      nextPlayerIndex,
      message,
    };
  }

  // 2. Check if Queen Cover was pending for this player
  if (state.queenState === 'pocketed_uncovered' && state.queenCoverPlayerIndex === state.activePlayerIndex) {
    if (coinsPocketed.length > 0) {
      // Queen covered successfully!
      queenClaimed = true;
      pointsAwarded += 25;
      message = `👑 Queen successfully covered by ${activePlayer.name}! (+25 pts). `;
    } else {
      // Failed to cover Queen -> Queen returns to center
      queenReturnedToCenter = true;
      message = `Queen was not covered. Returning Queen to center circle. `;
    }
  }

  // 3. Evaluate Pocketed Coins
  if (coinsPocketed.length > 0) {
    coinsPocketed.forEach((coin) => {
      if (coin === 'queen') {
        pointsAwarded += 5; // Initial points for sinking queen
        message += `👑 Queen pocketed! Must cover with another coin on the next shot. `;
      } else if (coin === 'white') {
        pointsAwarded += 10;
        message += `Pocketed WHITE coin (+10 pts). `;
      } else if (coin === 'black') {
        pointsAwarded += 5;
        message += `Pocketed BLACK coin (+5 pts). `;
      }
    });

    retainsTurn = true;
  } else if (!queenClaimed && !queenReturnedToCenter) {
    message = `${activePlayer.name} took shot. No coins pocketed.`;
  }

  const nextPlayerIndex = retainsTurn
    ? state.activePlayerIndex
    : (state.activePlayerIndex + 1) % state.players.length;

  return {
    strikerPocketed: false,
    coinsPocketed,
    isLegalShot: true,
    pointsAwarded,
    queenClaimed,
    queenReturnedToCenter,
    penaltyCoinReturned,
    nextPlayerIndex,
    message: message.trim(),
  };
}

export function checkMatchWinner(
  players: PlayerSlot[],
  remainingCoinsCount: number,
  targetScore: number = 25
): PlayerSlot | null {
  // Check score target
  const topScorer = [...players].sort((a, b) => b.score - a.score)[0];
  if (topScorer && topScorer.score >= targetScore) {
    return topScorer;
  }

  // Check if board is cleared (no coins left)
  if (remainingCoinsCount === 0 && topScorer) {
    return topScorer;
  }

  return null;
}
