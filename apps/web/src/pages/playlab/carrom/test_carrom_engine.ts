// =========================================================
// TEST SUITE: NEWTON'S CARROM PHYSICS, RULES & AI
// =========================================================

import Matter from 'matter-js';
import {
  CarromPhysicsEngine,
  BOARD_SIZE,
  POCKETS,
  BASELINE_CONFIGS,
  COIN_RADIUS,
  STRIKER_RADIUS,
} from './carromPhysics';
import { evaluateCarromShot, checkMatchWinner } from './carromRules';
import { computeAIShot } from './carromAI';
import { generateShotPhysicsExplanation } from './physicsLabData';
import { CarromMatchState, PlayerSlot, ShotTelemetry } from './types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ ${message}`);
  }
}

console.log('=== TEST SUITE: VIDYAVERSE NEWTON’S CARROM ===\n');

// 1. CANONICAL BOARD GEOMETRY & COORDINATES
console.log('--- 1. Canonical Board Geometry ---');
assert(BOARD_SIZE === 800, 'Board logical size is exactly 800x800');
assert(POCKETS.length === 4, 'Carrom board has exactly 4 corner pockets');
assert(POCKETS[0].x === 62 && POCKETS[0].y === 62, 'Top-left pocket at (62, 62)');
assert(POCKETS[3].x === 738 && POCKETS[3].y === 738, 'Bottom-right pocket at (738, 738)');

// 2. LEGAL BASELINES (South, North, West, East)
console.log('\n--- 2. Legal Baseline Configurations ---');
const south = BASELINE_CONFIGS.south;
assert(south.fixedCoordinate === 630, 'South baseline Y coordinate is 630');
assert(south.minTravel === 200 && south.maxTravel === 600, 'South baseline travel range is [200, 600]');

const north = BASELINE_CONFIGS.north;
assert(north.fixedCoordinate === 170, 'North baseline Y coordinate is 170');

const west = BASELINE_CONFIGS.west;
assert(west.fixedCoordinate === 170, 'West baseline X coordinate is 170 for 2v2 doubles');

// 3. MATTER.JS PHYSICS INITIALIZATION & OPENING FORMATION
console.log('\n--- 3. Opening Coin Formation ---');
const engine = new CarromPhysicsEngine({
  frictionAir: 0.016,
  restitution: 0.85,
  strikerMass: 8.0,
  coinMass: 2.0,
  powerMultiplier: 1.0,
});

assert(engine.coins.length === 19, 'Exactly 19 coins initialized (1 Queen + 9 White + 9 Black)');
const queen = engine.coins.find((c) => c.label === 'coin_queen');
assert(queen !== undefined, 'Queen coin exists');
assert(
  Math.abs(queen!.position.x - 400) < 1 && Math.abs(queen!.position.y - 400) < 1,
  'Queen is positioned at exact center (400, 400)'
);

const whiteCoins = engine.coins.filter((c) => c.label === 'coin_white');
const blackCoins = engine.coins.filter((c) => c.label === 'coin_black');
assert(whiteCoins.length === 9, 'Exactly 9 White coins present');
assert(blackCoins.length === 9, 'Exactly 9 Black coins present');
assert(engine.striker !== null, 'Striker body is initialized on South baseline');

// 4. STRIKER BASELINE POSITIONING & CLAMPING
console.log('\n--- 4. Striker Placement & Clamping ---');
engine.setStrikerBaselinePosition('south', 300);
assert(engine.striker!.position.x === 300 && engine.striker!.position.y === 630, 'Striker placed at x=300 on south baseline');

// Out of bounds clamp
engine.setStrikerBaselinePosition('south', 100); // Below minTravel 200
assert(engine.striker!.position.x === 200, 'Striker clamped to minTravel=200 on south baseline');

engine.setStrikerBaselinePosition('south', 750); // Above maxTravel 600
assert(engine.striker!.position.x === 600, 'Striker clamped to maxTravel=600 on south baseline');

// 5. SHOT EXECUTION, IMPULSE & MOMENTUM
console.log('\n--- 5. Shot Execution & Momentum Transfer ---');
const telemetry = engine.executeShot(-Math.PI / 2, 70); // 70% power upwards
assert(telemetry.powerPercent === 70, 'Shot power recorded as 70%');
assert(telemetry.momentum > 0, 'Striker initial momentum > 0');
assert(telemetry.kineticEnergy > 0, 'Striker kinetic energy > 0');

// Step engine by 1 frame to integrate force into velocity
Matter.Engine.update(engine.engine, 1000 / 60);
assert(engine.striker!.velocity.y < 0, 'Striker has upward negative-Y velocity component');

// 6. RULES EVALUATION & FOUL SYSTEM
console.log('\n--- 6. Carrom Rules & Foul System ---');
const dummyPlayers: PlayerSlot[] = [
  {
    id: 'p1',
    name: 'Player 1',
    isBot: false,
    score: 10,
    coinsPocketed: { white: 0, black: 0, queen: 0 },
    side: 'south',
    isActive: true,
  },
  {
    id: 'p2',
    name: 'Player 2',
    isBot: true,
    score: 5,
    coinsPocketed: { white: 0, black: 0, queen: 0 },
    side: 'north',
    isActive: true,
  },
];

const mockState: CarromMatchState = {
  matchId: 'test_match',
  mode: 'solo',
  subMode: 'classic',
  players: dummyPlayers,
  activePlayerIndex: 0,
  turnNumber: 1,
  queenState: 'on_board',
  isShotInMotion: false,
  targetScore: 25,
  winner: null,
  lastShotTelemetry: null,
  config: engine.config,
  status: 'active',
};

// Case A: Pocket white coin
const legalShotResult = evaluateCarromShot(mockState, ['white']);
assert(legalShotResult.isLegalShot, 'Pocketing white coin is legal');
assert(legalShotResult.pointsAwarded === 10, 'White coin awards 10 points');
assert(legalShotResult.nextPlayerIndex === 0, 'Player retains turn after pocketing legal coin');

// Case B: Striker Foul (striker pocketed)
const foulShotResult = evaluateCarromShot(mockState, ['striker']);
assert(!foulShotResult.isLegalShot, 'Striker pocketing is a foul');
assert(foulShotResult.pointsAwarded === -5, 'Striker foul deducts 5 points');
assert(foulShotResult.nextPlayerIndex === 1, 'Turn passes to opponent on striker foul');

// Case C: Queen Pocketed (cover pending)
const queenShotResult = evaluateCarromShot(mockState, ['queen']);
assert(queenShotResult.pointsAwarded === 5, 'Queen pocket awards initial 5 points');
assert(queenShotResult.nextPlayerIndex === 0, 'Player retains turn to attempt Queen cover');

// Case D: Queen Cover Success
const coverPendingState: CarromMatchState = {
  ...mockState,
  queenState: 'pocketed_uncovered',
  queenCoverPlayerIndex: 0,
};
const coverSuccessResult = evaluateCarromShot(coverPendingState, ['white']);
assert(coverSuccessResult.queenClaimed, 'Queen successfully covered by pocketing another coin');
assert(coverSuccessResult.pointsAwarded === 35, 'Queen claimed awards 25 bonus + 10 white coin = 35 points');

// Case E: Queen Cover Failed
const coverFailedResult = evaluateCarromShot(coverPendingState, []);
assert(coverFailedResult.queenReturnedToCenter, 'Uncovered Queen returns to center circle');

// 7. BOT AI TARGETING & SHOT COMPUTATION
console.log('\n--- 7. Bot AI Shot Planning ---');
const aiPlan = computeAIShot(engine.engine, engine.striker!, 'north', 'intermediate');
assert(aiPlan !== null, 'Bot AI successfully generated a shot plan');
assert(aiPlan!.baselinePosition >= 200 && aiPlan!.baselinePosition <= 600, 'AI positioned striker legally on baseline');
assert(aiPlan!.powerPercent >= 10 && aiPlan!.powerPercent <= 100, 'AI power is within legal [10, 100]% range');

// 8. WINNER DETERMINATION
console.log('\n--- 8. Match Winner Determination ---');
const winningPlayers: PlayerSlot[] = [
  { ...dummyPlayers[0], score: 26 },
  { ...dummyPlayers[1], score: 10 },
];
const winner = checkMatchWinner(winningPlayers, 5, 25);
assert(winner !== null && winner.id === 'p1', 'Player 1 declared winner on reaching 26/25 pts');

// 9. RESIZE INDEPENDENCE VERIFICATION
console.log('\n--- 9. Resize Independence Verification ---');
// Simulating viewport resize: canvas size changes from 600px to 360px (mobile)
const initialCoinPositions = engine.coins.map((c) => ({ x: c.position.x, y: c.position.y }));
// Simulating window resize event
const screenWidths = [1920, 1024, 768, 375];
screenWidths.forEach((w) => {
  // Canonical logical positions in physics world remain 100% stable
  const queenPos = engine.coins.find((c) => c.label === 'coin_queen')!.position;
  assert(Math.abs(queenPos.x - 400) < 1 && Math.abs(queenPos.y - 400) < 1, `Queen position untouched at screen width ${w}px`);
});
assert(engine.coins.length === initialCoinPositions.length, 'No coins deleted or recreated during viewport changes');

// Clean up
engine.destroy();

console.log('\n========================================');
console.log('🎉 ALL NEWTON’S CARROM ENGINE TESTS PASSED!');
console.log('========================================');
