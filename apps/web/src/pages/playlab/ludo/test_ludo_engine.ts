import {
  canTokenMove,
  getNextPosition,
  getLegalMoves,
  checkCapture,
  checkWinCondition,
  getNextActivePlayer,
} from './ludoRules';
import { chooseBestMove, botMathQuizAnswer } from './ludoAI';
import { getRandomQuestion, COMPREHENSIVE_QUESTIONS_BANK } from './mathQuizBank';
import { PlayerConfig, DEFAULT_PLAYERS, SAFE_SQUARES } from './types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ ${message}`);
  }
}

console.log('=== TEST SUITE: LUDO RULES ENGINE & MATH QUIZ ===\n');

// 1. BASE EXIT RULES
console.log('--- 1. Base Exit Rules ---');
assert(!canTokenMove(DEFAULT_PLAYERS[0], -1, 5), 'Token in base cannot move on roll of 5');
assert(!canTokenMove(DEFAULT_PLAYERS[0], -1, 1), 'Token in base cannot move on roll of 1');
assert(canTokenMove(DEFAULT_PLAYERS[0], -1, 6), 'Token in base CAN move on roll of 6');
assert(getNextPosition(DEFAULT_PLAYERS[0], -1, 6) === 0, 'Red token in base on 6 lands on entry #0');
assert(getNextPosition(DEFAULT_PLAYERS[1], -1, 6) === 13, 'Green token in base on 6 lands on entry #13');
assert(getNextPosition(DEFAULT_PLAYERS[2], -1, 6) === 26, 'Yellow token in base on 6 lands on entry #26');
assert(getNextPosition(DEFAULT_PLAYERS[3], -1, 6) === 39, 'Blue token in base on 6 lands on entry #39');

// 2. MAIN TRACK MOVEMENT & WRAPPING
console.log('\n--- 2. Track Movement & Wrapping ---');
assert(getNextPosition(DEFAULT_PLAYERS[0], 10, 4) === 14, 'Red token moves from 10 + 4 to 14');
assert(getNextPosition(DEFAULT_PLAYERS[1], 50, 4) === 2, 'Green token wraps from 50 + 4 to 2 (modulo 52)');

// 3. HOME PATH & FINISH
console.log('\n--- 3. Home Stretch & Exact Finish ---');
// Red exit is 50. Approaching home stretch:
const redHomePos1 = getNextPosition(DEFAULT_PLAYERS[0], 50, 1);
assert(redHomePos1 === 52, 'Red token at 50 with roll 1 lands on 52 (1st home cell)');
const redHomePosExact = getNextPosition(DEFAULT_PLAYERS[0], 55, 2);
assert(redHomePosExact === 100, 'Red token at 55 with roll 2 lands on 100 (Center Home - Won)');
const redOverShoot = getNextPosition(DEFAULT_PLAYERS[0], 55, 3);
assert(redOverShoot === 55, 'Red token at 55 cannot overshoot home with roll of 3');

// 4. CAPTURING & SAFE SQUARES
console.log('\n--- 4. Captures & Safe Squares ---');
const dummyTokens = [
  [0, -1, -1, -1],  // Red token at 0 (Safe square)
  [14, -1, -1, -1], // Green token at 14 (Not a safe square)
  [26, -1, -1, -1], // Yellow token at 26
  [-1, -1, -1, -1], // Blue
];
// Yellow player moves to 14
const captureResult = checkCapture(2, 14, dummyTokens, DEFAULT_PLAYERS);
assert(captureResult !== null && captureResult.capturedPlayerIdx === 1 && captureResult.capturedTokenIdx === 0, 'Yellow landing on Green at position 14 captures Green token');

// Red token is at position 0 (Safe square). Green moves to 0:
const safeSquareCapture = checkCapture(1, 0, dummyTokens, DEFAULT_PLAYERS);
assert(safeSquareCapture === null, 'Landing on safe square (0) does NOT capture');

// Check all safe squares are protected
SAFE_SQUARES.forEach((sq) => {
  const cap = checkCapture(0, sq, dummyTokens, DEFAULT_PLAYERS);
  assert(cap === null, `Safe square ${sq} is protected from capture`);
});

// 5. WIN CONDITION
console.log('\n--- 5. Win Condition ---');
const winningTokens = [
  [100, 100, 100, 100],
  [-1, 14, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
];
assert(checkWinCondition(0, winningTokens), 'Player 0 with all 4 tokens at 100 wins the match');
assert(!checkWinCondition(1, winningTokens), 'Player 1 with tokens not all at 100 has not won');

// 6. TURN ROTATION & 1V1 DUEL
console.log('\n--- 6. Turn Rotation (Standard & 1v1 Duel) ---');
const players4: PlayerConfig[] = DEFAULT_PLAYERS;
assert(getNextActivePlayer(0, players4) === 1, '4-player mode: 0 advances to 1');
assert(getNextActivePlayer(1, players4) === 2, '4-player mode: 1 advances to 2');
assert(getNextActivePlayer(2, players4) === 3, '4-player mode: 2 advances to 3');
assert(getNextActivePlayer(3, players4) === 0, '4-player mode: 3 advances to 0');

// 1v1 Duel where Green (1) and Blue (3) are inactive
const playersDuel: PlayerConfig[] = DEFAULT_PLAYERS.map((p, idx) => ({
  ...p,
  isActive: idx === 0 || idx === 2,
}));
assert(getNextActivePlayer(0, playersDuel) === 2, '1v1 Duel: 0 skips inactive 1 and advances directly to 2');
assert(getNextActivePlayer(2, playersDuel) === 0, '1v1 Duel: 2 skips inactive 3 and advances directly to 0');

// 7. BOT AI HEURISTICS
console.log('\n--- 7. AI Bot Heuristics ---');
const aiTokens = [
  [-1, 10, -1, -1],
  [16, -1, -1, -1], // Green token at 16
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
];
// Red rolled 6. Move options: token 0 (from base to 0) or token 1 (10 + 6 = 16, which CAPTURES green!)
const botDecision = chooseBestMove(0, [0, 1], aiTokens, 6, DEFAULT_PLAYERS);
assert(botDecision.tokenIndex === 1, 'AI smartly prioritizes token 1 to capture opponent at 16');

// Test difficulty accuracy
let advancedCorrectCount = 0;
let beginnerCorrectCount = 0;
const trials = 1000;
for (let i = 0; i < trials; i++) {
  if (botMathQuizAnswer('advanced', 2) === 2) advancedCorrectCount++;
  if (botMathQuizAnswer('beginner', 2) === 2) beginnerCorrectCount++;
}
assert(advancedCorrectCount > beginnerCorrectCount, `Advanced bot (${advancedCorrectCount}/${trials}) scores higher than Beginner bot (${beginnerCorrectCount}/${trials})`);

// 8. MATH QUIZ BANK VALIDATION
console.log('\n--- 8. NCERT Math Question Bank Validation ---');
const grades: Array<import('./types').GradeCategory> = ['all', 'primary', 'foundational', 'middle', 'high'];
grades.forEach((grade) => {
  const q = getRandomQuestion(grade);
  assert(q !== null && !!q.id && !!q.question, `Valid question generated for grade "${grade}"`);
  assert(q.options.length >= 2, `Question has at least 2 options (${q.options.length})`);
  assert(q.correctIndex >= 0 && q.correctIndex < q.options.length, `Question correctIndex (${q.correctIndex}) is within range`);
  assert(q.explanation.length > 0, `Question has step-by-step explanation`);
});

assert(COMPREHENSIVE_QUESTIONS_BANK.length >= 30, `Comprehensive question bank has ${COMPREHENSIVE_QUESTIONS_BANK.length} curated questions`);

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% SPEC COMPLIANCE.\n');
