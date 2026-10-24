// =========================================================
// VIDYAVERSE NEWTON'S CARROM — MATTER.JS 2D PHYSICS ENGINE
// =========================================================

import Matter from 'matter-js';
import { CoinBodyData, CoinType, PocketPosition, CarromPhysicsConfig, ShotTelemetry } from './types';

export const BOARD_SIZE = 800;
export const POCKET_RADIUS = 34;
export const STRIKER_RADIUS = 25;
export const COIN_RADIUS = 15;

export const POCKETS: PocketPosition[] = [
  { id: 'top_left', x: 62, y: 62, radius: POCKET_RADIUS },
  { id: 'top_right', x: 738, y: 62, radius: POCKET_RADIUS },
  { id: 'bottom_left', x: 62, y: 738, radius: POCKET_RADIUS },
  { id: 'bottom_right', x: 738, y: 738, radius: POCKET_RADIUS },
];

export interface BaselineConfig {
  side: 'south' | 'north' | 'west' | 'east';
  fixedCoordinate: number; // Y for south/north, X for west/east
  minTravel: number;
  maxTravel: number;
  defaultPosition: { x: number; y: number };
}

export const BASELINE_CONFIGS: Record<'south' | 'north' | 'west' | 'east', BaselineConfig> = {
  south: {
    side: 'south',
    fixedCoordinate: 630,
    minTravel: 200,
    maxTravel: 600,
    defaultPosition: { x: 400, y: 630 },
  },
  north: {
    side: 'north',
    fixedCoordinate: 170,
    minTravel: 200,
    maxTravel: 600,
    defaultPosition: { x: 400, y: 170 },
  },
  west: {
    side: 'west',
    fixedCoordinate: 170,
    minTravel: 200,
    maxTravel: 600,
    defaultPosition: { x: 170, y: 400 },
  },
  east: {
    side: 'east',
    fixedCoordinate: 630,
    minTravel: 200,
    maxTravel: 600,
    defaultPosition: { x: 630, y: 400 },
  },
};

export class CarromPhysicsEngine {
  public engine: Matter.Engine;
  public runner: Matter.Runner;
  public striker: Matter.Body | null = null;
  public coins: Matter.Body[] = [];
  public cushions: Matter.Body[] = [];
  public config: CarromPhysicsConfig;

  private collisionCountThisShot: number = 0;
  private pocketedThisShot: CoinType[] = [];
  private onPocketCallbacks: ((coinType: CoinType, coinBody: Matter.Body) => void)[] = [];
  private onCollisionCallbacks: ((pair: Matter.Pair) => void)[] = [];

  constructor(config: CarromPhysicsConfig) {
    this.config = { ...config };

    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0 }, // Top-down 2D zero gravity
      constraintIterations: 4,
      positionIterations: 8,
      velocityIterations: 8,
    });

    this.runner = Matter.Runner.create({
      isFixed: true,
      delta: 1000 / 60,
    });

    this.initCushions();
    this.initCoins();
    this.initStriker('south', 400);
    this.setupCollisionEvents();

    Matter.Runner.run(this.runner, this.engine);
  }

  // ------------------------------------------
  // CUSHIONS & BORDERS (Rebound walls)
  // ------------------------------------------
  private initCushions(): void {
    const wallThickness = 40;
    const wallOptions: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      restitution: this.config.restitution,
      friction: 0.05,
      label: 'cushion',
    };

    const top = Matter.Bodies.rectangle(400, 20, 800, wallThickness, wallOptions);
    const bottom = Matter.Bodies.rectangle(400, 780, 800, wallThickness, wallOptions);
    const left = Matter.Bodies.rectangle(20, 400, wallThickness, 800, wallOptions);
    const right = Matter.Bodies.rectangle(780, 400, wallThickness, 800, wallOptions);

    this.cushions = [top, bottom, left, right];
    Matter.Composite.add(this.engine.world, this.cushions);
  }

  // ------------------------------------------
  // CARROM COINS FORMATION (Honey-comb array)
  // ------------------------------------------
  public initCoins(savedPositions?: Array<{ id: string; type: CoinType; x: number; y: number; pocketed: boolean }>): void {
    // Remove old coins from world if any
    if (this.coins.length > 0) {
      Matter.Composite.remove(this.engine.world, this.coins);
      this.coins = [];
    }

    if (savedPositions && savedPositions.length > 0) {
      // Rehydrate coins from saved match state
      this.coins = savedPositions
        .filter((c) => !c.pocketed)
        .map((saved) => {
          const body = Matter.Bodies.circle(saved.x, saved.y, COIN_RADIUS, {
            mass: saved.type === 'queen' ? this.config.coinMass * 1.1 : this.config.coinMass,
            frictionAir: this.config.frictionAir,
            restitution: this.config.restitution,
            label: `coin_${saved.type}`,
          });

          const data: CoinBodyData = {
            id: saved.id,
            type: saved.type,
            color: saved.type === 'queen' ? '#dc2626' : saved.type === 'white' ? '#f8fafc' : '#1e293b',
            points: saved.type === 'queen' ? 25 : saved.type === 'white' ? 10 : 5,
            radius: COIN_RADIUS,
            mass: body.mass,
            pocketed: false,
          };
          (body as unknown as { coinData: CoinBodyData }).coinData = data;
          return body;
        });

      Matter.Composite.add(this.engine.world, this.coins);
      return;
    }

    const center = { x: 400, y: 400 };
    const coins: Matter.Body[] = [];

    // 1. Red Queen at exact center
    const queen = Matter.Bodies.circle(center.x, center.y, COIN_RADIUS, {
      mass: this.config.coinMass * 1.1,
      frictionAir: this.config.frictionAir,
      restitution: this.config.restitution,
      label: 'coin_queen',
    });
    const queenData: CoinBodyData = {
      id: 'coin_queen_0',
      type: 'queen',
      color: '#dc2626',
      points: 25,
      radius: COIN_RADIUS,
      mass: queen.mass,
      pocketed: false,
    };
    (queen as unknown as { coinData: CoinBodyData }).coinData = queenData;
    coins.push(queen);

    // 2. Inner Ring of 6 Coins (Alternating White and Black) at radius 32px
    const innerRadius = 32;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = center.x + Math.cos(angle) * innerRadius;
      const y = center.y + Math.sin(angle) * innerRadius;
      const isWhite = i % 2 === 0;
      const coinType: CoinType = isWhite ? 'white' : 'black';

      const body = Matter.Bodies.circle(x, y, COIN_RADIUS, {
        mass: this.config.coinMass,
        frictionAir: this.config.frictionAir,
        restitution: this.config.restitution,
        label: `coin_${coinType}`,
      });
      const data: CoinBodyData = {
        id: `coin_inner_${i}`,
        type: coinType,
        color: isWhite ? '#f8fafc' : '#1e293b',
        points: isWhite ? 10 : 5,
        radius: COIN_RADIUS,
        mass: body.mass,
        pocketed: false,
      };
      (body as unknown as { coinData: CoinBodyData }).coinData = data;
      coins.push(body);
    }

    // 3. Outer Ring of 12 Coins (Alternating White and Black) at radius 64px
    const outerRadius = 64;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6 + Math.PI / 12;
      const x = center.x + Math.cos(angle) * outerRadius;
      const y = center.y + Math.sin(angle) * outerRadius;
      const isWhite = i % 2 !== 0;
      const coinType: CoinType = isWhite ? 'white' : 'black';

      const body = Matter.Bodies.circle(x, y, COIN_RADIUS, {
        mass: this.config.coinMass,
        frictionAir: this.config.frictionAir,
        restitution: this.config.restitution,
        label: `coin_${coinType}`,
      });
      const data: CoinBodyData = {
        id: `coin_outer_${i}`,
        type: coinType,
        color: isWhite ? '#f8fafc' : '#1e293b',
        points: isWhite ? 10 : 5,
        radius: COIN_RADIUS,
        mass: body.mass,
        pocketed: false,
      };
      (body as unknown as { coinData: CoinBodyData }).coinData = data;
      coins.push(body);
    }

    this.coins = coins;
    Matter.Composite.add(this.engine.world, this.coins);
  }

  // ------------------------------------------
  // STRIKER INITIALIZATION & BASELINE
  // ------------------------------------------
  public initStriker(side: 'south' | 'north' | 'west' | 'east' = 'south', travelPos: number = 400): void {
    if (this.striker) {
      Matter.Composite.remove(this.engine.world, this.striker);
      this.striker = null;
    }

    const baseline = BASELINE_CONFIGS[side];
    const clamped = Math.max(baseline.minTravel, Math.min(baseline.maxTravel, travelPos));

    let x = clamped;
    let y = baseline.fixedCoordinate;
    if (side === 'west' || side === 'east') {
      x = baseline.fixedCoordinate;
      y = clamped;
    }

    this.striker = Matter.Bodies.circle(x, y, STRIKER_RADIUS, {
      mass: this.config.strikerMass,
      frictionAir: this.config.frictionAir,
      restitution: this.config.restitution,
      label: 'striker',
    });

    Matter.Composite.add(this.engine.world, this.striker);
  }

  public setStrikerBaselinePosition(side: 'south' | 'north' | 'west' | 'east', travelPos: number): void {
    if (!this.striker) return;
    const baseline = BASELINE_CONFIGS[side];
    const clamped = Math.max(baseline.minTravel, Math.min(baseline.maxTravel, travelPos));

    let x = clamped;
    let y = baseline.fixedCoordinate;
    if (side === 'west' || side === 'east') {
      x = baseline.fixedCoordinate;
      y = clamped;
    }

    Matter.Body.setPosition(this.striker, { x, y });
    Matter.Body.setVelocity(this.striker, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(this.striker, 0);
  }

  // ------------------------------------------
  // RE-SPOT QUEEN / PENALTY COIN IN CENTER
  // ------------------------------------------
  public respotCoin(type: CoinType): void {
    const center = { x: 400, y: 400 };
    // Check if center is occupied; if so, slightly offset
    let targetX = center.x;
    let targetY = center.y;

    const allCoins = this.coins.filter((c) => !this.isPocketed(c));
    const occupied = allCoins.some((c) => Math.hypot(c.position.x - targetX, c.position.y - targetY) < COIN_RADIUS * 2);
    if (occupied) {
      targetY += COIN_RADIUS * 2.2;
    }

    const body = Matter.Bodies.circle(targetX, targetY, COIN_RADIUS, {
      mass: type === 'queen' ? this.config.coinMass * 1.1 : this.config.coinMass,
      frictionAir: this.config.frictionAir,
      restitution: this.config.restitution,
      label: `coin_${type}`,
    });

    const data: CoinBodyData = {
      id: `coin_respot_${Date.now()}`,
      type,
      color: type === 'queen' ? '#dc2626' : type === 'white' ? '#f8fafc' : '#1e293b',
      points: type === 'queen' ? 25 : type === 'white' ? 10 : 5,
      radius: COIN_RADIUS,
      mass: body.mass,
      pocketed: false,
    };
    (body as unknown as { coinData: CoinBodyData }).coinData = data;

    this.coins.push(body);
    Matter.Composite.add(this.engine.world, body);
  }

  // ------------------------------------------
  // SHOT EXECUTION & LAUNCH IMPULSE
  // ------------------------------------------
  public executeShot(angleRad: number, powerPercent: number): ShotTelemetry {
    if (!this.striker) {
      throw new Error('Striker is not ready.');
    }

    this.collisionCountThisShot = 0;
    this.pocketedThisShot = [];

    // Map 0..100 power to calibrated Matter.js force impulse
    // Striker mass is ~8kg. Max impulse ~0.08
    const clampedPower = Math.max(5, Math.min(100, powerPercent));
    const maxImpulse = 0.085 * this.config.powerMultiplier;
    const impulseMagnitude = (clampedPower / 100) * maxImpulse;

    const forceVector = {
      x: Math.cos(angleRad) * impulseMagnitude,
      y: Math.sin(angleRad) * impulseMagnitude,
    };

    Matter.Body.applyForce(this.striker, this.striker.position, forceVector);

    // Initial speed v = impulse / mass
    const initialSpeed = (impulseMagnitude / this.striker.mass) * 1000;
    const momentum = this.striker.mass * initialSpeed;
    const kineticEnergy = 0.5 * this.striker.mass * Math.pow(initialSpeed / 100, 2);

    const telemetry: ShotTelemetry = {
      initialSpeed: Number(initialSpeed.toFixed(1)),
      strikerMass: this.striker.mass,
      angleDegrees: Math.round(((angleRad * 180) / Math.PI + 360) % 360),
      powerPercent: Math.round(clampedPower),
      momentum: Number(momentum.toFixed(1)),
      kineticEnergy: Number(kineticEnergy.toFixed(2)),
      collisionCount: 0,
      coinsPocketedInShot: [],
      restitution: this.config.restitution,
      frictionCoeff: this.config.frictionAir,
      newtonExplanation: '',
      lawReferenced: 2,
    };

    return telemetry;
  }

  // ------------------------------------------
  // COLLISION EVENTS & SOUND TRIGGER
  // ------------------------------------------
  private setupCollisionEvents(): void {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      this.collisionCountThisShot += event.pairs.length;
      event.pairs.forEach((pair) => {
        this.onCollisionCallbacks.forEach((cb) => cb(pair));
      });
    });
  }

  public onCollision(callback: (pair: Matter.Pair) => void): () => void {
    this.onCollisionCallbacks.push(callback);
    return () => {
      this.onCollisionCallbacks = this.onCollisionCallbacks.filter((cb) => cb !== callback);
    };
  }

  public onPocket(callback: (coinType: CoinType, coinBody: Matter.Body) => void): () => void {
    this.onPocketCallbacks.push(callback);
    return () => {
      this.onPocketCallbacks = this.onPocketCallbacks.filter((cb) => cb !== callback);
    };
  }

  // ------------------------------------------
  // STEP TICK: POCKET DETECTION & SOFT GRAVITY
  // ------------------------------------------
  public updatePocketsAndSettling(): {
    isStillMoving: boolean;
    pocketedThisTick: CoinType[];
    strikerSpeed: number;
    collisionCount: number;
  } {
    const pocketedThisTick: CoinType[] = [];

    // All dynamic bodies
    const bodies = Matter.Composite.allBodies(this.engine.world).filter((b) => !b.isStatic);

    bodies.forEach((body) => {
      for (const pocket of POCKETS) {
        const dx = pocket.x - body.position.x;
        const dy = pocket.y - body.position.y;
        const dist = Math.hypot(dx, dy);

        // 1. Soft suction gravity when near pocket hole (< 42px)
        if (dist < 44 && dist > 15) {
          const suctionForce = 0.0006;
          Matter.Body.applyForce(body, body.position, {
            x: (dx / dist) * suctionForce,
            y: (dy / dist) * suctionForce,
          });
        }

        // 2. Complete Pocket Sink (< 28px)
        if (dist < 28) {
          if (body.label === 'striker') {
            pocketedThisTick.push('striker');
            this.pocketedThisShot.push('striker');
            // Remove striker temporarily; will be reset on turn change
            Matter.Body.setPosition(body, { x: -500, y: -500 });
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            this.onPocketCallbacks.forEach((cb) => cb('striker', body));
          } else if (body.label.startsWith('coin_')) {
            const data = (body as unknown as { coinData: CoinBodyData }).coinData;
            const coinType = data ? data.type : 'white';
            pocketedThisTick.push(coinType);
            this.pocketedThisShot.push(coinType);

            if (data) data.pocketed = true;
            Matter.Composite.remove(this.engine.world, body);
            this.coins = this.coins.filter((c) => c !== body);
            this.onPocketCallbacks.forEach((cb) => cb(coinType, body));
          }
          break;
        }
      }
    });

    // Settling check: speed < 0.12 and angular speed < 0.05
    const isStillMoving = bodies.some((b) => {
      const spd = Math.hypot(b.velocity.x, b.velocity.y);
      return spd > 0.12 || Math.abs(b.angularVelocity) > 0.04;
    });

    const strikerSpeed = this.striker
      ? Math.hypot(this.striker.velocity.x, this.striker.velocity.y)
      : 0;

    return {
      isStillMoving,
      pocketedThisTick,
      strikerSpeed: Number(strikerSpeed.toFixed(2)),
      collisionCount: this.collisionCountThisShot,
    };
  }

  public getPocketedInLastShot(): CoinType[] {
    return [...this.pocketedThisShot];
  }

  public isPocketed(body: Matter.Body): boolean {
    const data = (body as unknown as { coinData?: CoinBodyData }).coinData;
    return !!data?.pocketed;
  }

  // ------------------------------------------
  // TRAJECTORY AIM PREDICTOR (RAY & REBOUND)
  // ------------------------------------------
  public calculateAimTrajectory(
    startX: number,
    startY: number,
    angleRad: number,
    powerPercent: number
  ): {
    path: Array<{ x: number; y: number }>;
    hitCoin?: { x: number; y: number; label: string };
    reboundPoint?: { x: number; y: number };
  } {
    const path: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
    const dirX = Math.cos(angleRad);
    const dirY = Math.sin(angleRad);

    // Max trace distance proportional to power
    const maxDist = 120 + (powerPercent / 100) * 450;
    let currentX = startX;
    let currentY = startY;
    let hitCoin: { x: number; y: number; label: string } | undefined;
    let reboundPoint: { x: number; y: number } | undefined;

    const step = 8;
    const stepsCount = Math.floor(maxDist / step);

    for (let i = 0; i < stepsCount; i++) {
      currentX += dirX * step;
      currentY += dirY * step;

      // Check cushion boundary collision (inner boundary is x=40, x=760, y=40, y=760)
      if (currentX <= 40 || currentX >= 760 || currentY <= 40 || currentY >= 760) {
        currentX = Math.max(40, Math.min(760, currentX));
        currentY = Math.max(40, Math.min(760, currentY));
        path.push({ x: currentX, y: currentY });
        reboundPoint = { x: currentX, y: currentY };
        break;
      }

      // Check coin hit
      for (const coin of this.coins) {
        const d = Math.hypot(coin.position.x - currentX, coin.position.y - currentY);
        if (d < STRIKER_RADIUS + COIN_RADIUS) {
          hitCoin = { x: coin.position.x, y: coin.position.y, label: coin.label };
          path.push({ x: currentX, y: currentY });
          return { path, hitCoin };
        }
      }

      if (i % 2 === 0) {
        path.push({ x: currentX, y: currentY });
      }
    }

    if (!reboundPoint) {
      path.push({ x: currentX, y: currentY });
    }

    return { path, hitCoin, reboundPoint };
  }

  // ------------------------------------------
  // UPDATE REALTIME CONFIG (Physics Lab sliders)
  // ------------------------------------------
  public updateConfig(newConfig: Partial<CarromPhysicsConfig>): void {
    this.config = { ...this.config, ...newConfig };

    const allBodies = Matter.Composite.allBodies(this.engine.world);
    allBodies.forEach((b) => {
      if (!b.isStatic) {
        if (newConfig.frictionAir !== undefined) b.frictionAir = newConfig.frictionAir;
        if (newConfig.restitution !== undefined) b.restitution = newConfig.restitution;
      }
    });

    if (this.striker && newConfig.strikerMass !== undefined) {
      Matter.Body.setMass(this.striker, newConfig.strikerMass);
    }

    this.cushions.forEach((w) => {
      if (newConfig.restitution !== undefined) w.restitution = newConfig.restitution;
    });
  }

  public destroy(): void {
    if (this.runner) Matter.Runner.stop(this.runner);
    if (this.engine) Matter.Composite.clear(this.engine.world, false);
  }
}
