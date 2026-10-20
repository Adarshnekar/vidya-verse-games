import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Layers,
  Activity,
  Sliders,
  ChevronRight,
  Maximize2,
  Trash2,
  Atom,
} from 'lucide-react';
import Matter from 'matter-js';
import { useAuthStore } from '../../stores/authStore';

type ExperimentPreset = 'projectile' | 'collision' | 'incline' | 'freefall';

export const PhysicsPlaygroundPage: React.FC = () => {
  const navigate = useNavigate();
  const { addXP, addCoins } = useAuthStore();

  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  // Physical parameters
  const [gravityY, setGravityY] = useState<number>(1); // 1 = 9.8 m/s²
  const [restitution, setRestitution] = useState<number>(0.8); // Bounciness
  const [friction, setFriction] = useState<number>(0.05); // Surface friction
  const [launchAngle, setLaunchAngle] = useState<number>(45); // Degrees
  const [launchSpeed, setLaunchSpeed] = useState<number>(18); // Speed magnitude
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<ExperimentPreset>('projectile');
  const [showVectors, setShowVectors] = useState<boolean>(true);

  // Live telemetry
  const [telemetry, setTelemetry] = useState<{
    bodyCount: number;
    kineticEnergy: number;
    potentialEnergy: number;
    maxVelocity: number;
  }>({
    bodyCount: 0,
    kineticEnergy: 0,
    potentialEnergy: 0,
    maxVelocity: 0,
  });

  // Setup Matter.js World
  useEffect(() => {
    if (!sceneRef.current) return;

    const width = sceneRef.current.clientWidth || 800;
    const height = 480;

    // Module aliases
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const Runner = Matter.Runner;
    const Bodies = Matter.Bodies;
    const Composite = Matter.Composite;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;
    const Events = Matter.Events;

    // Create engine
    const engine = Engine.create({
      gravity: { x: 0, y: gravityY, scale: 0.001 },
    });
    engineRef.current = engine;

    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: '#0F172A',
        showVelocity: false,
      },
    });
    renderRef.current = render;

    Render.run(render);

    // Create runner
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // Add boundaries (floor, walls)
    const wallOptions = { isStatic: true, render: { fillStyle: '#334155' } };
    const floor = Bodies.rectangle(width / 2, height - 10, width, 20, wallOptions);
    const leftWall = Bodies.rectangle(10, height / 2, 20, height, wallOptions);
    const rightWall = Bodies.rectangle(width - 10, height / 2, 20, height, wallOptions);
    const ceiling = Bodies.rectangle(width / 2, 10, width, 20, wallOptions);

    Composite.add(engine.world, [floor, leftWall, rightWall, ceiling]);

    // Add Mouse interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: true, strokeStyle: '#38BDF8' },
      },
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Custom Canvas Overlay for Vectors & HUD
    Events.on(render, 'afterRender', () => {
      const context = render.context;
      if (!context) return;

      const bodies = Composite.allBodies(engine.world).filter((b) => !b.isStatic);

      let totalKE = 0;
      let totalPE = 0;
      let maxVel = 0;

      bodies.forEach((body) => {
        const speed = Math.hypot(body.velocity.x, body.velocity.y);
        const ke = 0.5 * body.mass * speed * speed;
        const pe = body.mass * Math.abs(gravityY) * Math.max(0, height - body.position.y);

        totalKE += ke;
        totalPE += pe;
        if (speed > maxVel) maxVel = speed;

        // Draw Velocity Vectors
        if (showVectors && speed > 0.2) {
          context.save();
          context.beginPath();
          context.moveTo(body.position.x, body.position.y);
          context.lineTo(body.position.x + body.velocity.x * 6, body.position.y + body.velocity.y * 6);
          context.strokeStyle = '#38BDF8';
          context.lineWidth = 2.5;
          context.stroke();

          // Arrowhead
          const angle = Math.atan2(body.velocity.y, body.velocity.x);
          const arrowLength = 6;
          context.beginPath();
          context.moveTo(
            body.position.x + body.velocity.x * 6,
            body.position.y + body.velocity.y * 6
          );
          context.lineTo(
            body.position.x + body.velocity.x * 6 - arrowLength * Math.cos(angle - Math.PI / 6),
            body.position.y + body.velocity.y * 6 - arrowLength * Math.sin(angle - Math.PI / 6)
          );
          context.lineTo(
            body.position.x + body.velocity.x * 6 - arrowLength * Math.cos(angle + Math.PI / 6),
            body.position.y + body.velocity.y * 6 - arrowLength * Math.sin(angle + Math.PI / 6)
          );
          context.fillStyle = '#38BDF8';
          context.fill();
          context.restore();
        }
      });

      setTelemetry({
        bodyCount: bodies.length,
        kineticEnergy: Math.round(totalKE),
        potentialEnergy: Math.round(totalPE),
        maxVelocity: parseFloat(maxVel.toFixed(1)),
      });
    });

    // Load initial preset
    loadPreset('projectile', engine, width, height);

    // Cleanup
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  // Update physical parameters dynamically in active world
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.gravity.y = gravityY;

    // Update restitution and friction of non-static bodies
    const nonStaticBodies = Matter.Composite.allBodies(engineRef.current.world).filter(
      (b) => !b.isStatic
    );
    nonStaticBodies.forEach((body) => {
      body.restitution = restitution;
      body.friction = friction;
    });
  }, [gravityY, restitution, friction]);

  // Load Presets
  const loadPreset = (
    preset: ExperimentPreset,
    customEngine?: Matter.Engine,
    w?: number,
    h?: number
  ) => {
    const engine = customEngine || engineRef.current;
    if (!engine) return;

    const Bodies = Matter.Bodies;
    const Composite = Matter.Composite;
    const Constraint = Matter.Constraint;

    const width = w || (sceneRef.current ? sceneRef.current.clientWidth : 800);
    const height = h || 480;

    // Clear dynamic bodies but retain boundaries and mouse
    const staticBodies = Composite.allBodies(engine.world).filter((b) => b.isStatic);
    const constraints = Composite.allConstraints(engine.world).filter((c) => (c as any).mouse);

    Composite.clear(engine.world, false);
    Composite.add(engine.world, staticBodies);
    Composite.add(engine.world, constraints);

    setActivePreset(preset);

    if (preset === 'projectile') {
      // Slanted launcher base
      const ramp = Bodies.rectangle(120, height - 70, 160, 15, {
        isStatic: true,
        angle: -Math.PI / 6,
        render: { fillStyle: '#475569' },
      });

      // Target boxes at distance
      const target1 = Bodies.rectangle(width - 120, height - 40, 40, 40, {
        render: { fillStyle: '#F59E0B' },
        restitution: restitution,
        friction: friction,
      });
      const target2 = Bodies.rectangle(width - 120, height - 85, 40, 40, {
        render: { fillStyle: '#EF4444' },
        restitution: restitution,
        friction: friction,
      });
      const target3 = Bodies.rectangle(width - 120, height - 130, 40, 40, {
        render: { fillStyle: '#10B981' },
        restitution: restitution,
        friction: friction,
      });

      Composite.add(engine.world, [ramp, target1, target2, target3]);
    } else if (preset === 'collision') {
      // Newton's Collision Row
      for (let i = 0; i < 5; i++) {
        const sphere = Bodies.circle(width / 2 - 100 + i * 50, height - 35, 24, {
          restitution: 0.98,
          friction: 0.001,
          render: { fillStyle: i === 0 ? '#EC4899' : '#06B6D4' },
        });
        Composite.add(engine.world, sphere);
      }

      // Fast incoming projectile ball
      const striker = Bodies.circle(80, height - 35, 24, {
        restitution: 0.98,
        friction: 0.001,
        render: { fillStyle: '#F59E0B' },
      });
      Matter.Body.setVelocity(striker, { x: 18, y: 0 });
      Composite.add(engine.world, striker);
    } else if (preset === 'incline') {
      // Inclined plane
      const incline = Bodies.rectangle(width / 2, height / 2 + 50, 450, 20, {
        isStatic: true,
        angle: Math.PI / 7,
        render: { fillStyle: '#64748B' },
      });

      // Sliding crate vs rolling sphere
      const crate = Bodies.rectangle(width / 2 - 160, height / 2 - 60, 36, 36, {
        friction: 0.15,
        restitution: 0.2,
        render: { fillStyle: '#F97316' },
      });
      const rollingBall = Bodies.circle(width / 2 - 100, height / 2 - 70, 20, {
        friction: 0.01,
        restitution: 0.6,
        render: { fillStyle: '#3B82F6' },
      });

      Composite.add(engine.world, [incline, crate, rollingBall]);
    } else if (preset === 'freefall') {
      // Two spheres of different masses dropped from ceiling
      const heavy = Bodies.circle(width / 3, 60, 35, {
        mass: 20,
        restitution: restitution,
        friction: friction,
        render: { fillStyle: '#8B5CF6' },
      });
      const light = Bodies.circle((width * 2) / 3, 60, 18, {
        mass: 1,
        restitution: restitution,
        friction: friction,
        render: { fillStyle: '#10B981' },
      });

      Composite.add(engine.world, [heavy, light]);
    }
  };

  // Launch Projectile
  const handleLaunch = () => {
    if (!engineRef.current) return;
    const Bodies = Matter.Bodies;
    const Composite = Matter.Composite;
    const Body = Matter.Body;

    const rad = (launchAngle * Math.PI) / 180;
    const vx = launchSpeed * Math.cos(rad);
    const vy = -launchSpeed * Math.sin(rad);

    const projectile = Bodies.circle(60, 400, 18, {
      restitution: restitution,
      friction: friction,
      density: 0.004,
      render: { fillStyle: '#38BDF8' },
    });

    Composite.add(engineRef.current.world, projectile);
    Body.setVelocity(projectile, { x: vx, y: vy });

    addXP(10);
    addCoins(2);
  };

  // Spawn random shape
  const handleSpawnShape = (type: 'circle' | 'box') => {
    if (!engineRef.current) return;
    const Bodies = Matter.Bodies;
    const Composite = Matter.Composite;

    const x = Math.random() * 400 + 100;
    const y = 80;

    let shape;
    if (type === 'circle') {
      shape = Bodies.circle(x, y, 22, {
        restitution: restitution,
        friction: friction,
        render: { fillStyle: '#EC4899' },
      });
    } else {
      shape = Bodies.rectangle(x, y, 40, 40, {
        restitution: restitution,
        friction: friction,
        render: { fillStyle: '#10B981' },
      });
    }

    Composite.add(engineRef.current.world, shape);
  };

  // Clear Canvas
  const handleClear = () => {
    if (!engineRef.current) return;
    const staticBodies = Matter.Composite.allBodies(engineRef.current.world).filter(
      (b) => b.isStatic
    );
    const constraints = Matter.Composite.allConstraints(engineRef.current.world).filter(
      (c) => (c as any).mouse
    );
    Matter.Composite.clear(engineRef.current.world, false);
    Matter.Composite.add(engineRef.current.world, staticBodies);
    Matter.Composite.add(engineRef.current.world, constraints);
  };

  // Pause / Resume
  const togglePlay = () => {
    if (!runnerRef.current) return;
    if (isRunning) {
      Matter.Runner.stop(runnerRef.current);
    } else {
      Matter.Runner.run(runnerRef.current, engineRef.current!);
    }
    setIsRunning(!isRunning);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/playlab')}
            className="p-2 rounded-xl bg-card border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                Physics <span className="text-[#38BDF8]">Playground</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E0F2FE] text-[#0284C7] dark:bg-[#082F49] dark:text-[#38BDF8]">
                <Atom className="w-3.5 h-3.5" />
                Mechanics Sandbox
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Interactive 2D Newtonian physics simulation with Matter.js for Classes 4–10
            </p>
          </div>
        </div>

        {/* Live Telemetry Bar */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-xl bg-card border border-border shadow-soft flex items-center gap-1.5">
            <span className="text-text-muted font-normal">Bodies:</span>
            <span className="text-[#38BDF8]">{telemetry.bodyCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-card border border-border shadow-soft flex items-center gap-1.5">
            <span className="text-text-muted font-normal">Kinetic Energy:</span>
            <span className="text-emerald-500">{telemetry.kineticEnergy} J</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-card border border-border shadow-soft flex items-center gap-1.5">
            <span className="text-text-muted font-normal">Potential Energy:</span>
            <span className="text-amber-500">{telemetry.potentialEnergy} J</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-card border border-border shadow-soft flex items-center gap-1.5">
            <span className="text-text-muted font-normal">Max Vel:</span>
            <span className="text-rose-500">{telemetry.maxVelocity} m/s</span>
          </div>
        </div>
      </div>

      {/* Preset Tabs & Mode Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card border border-border rounded-2xl p-2.5 shadow-soft">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-text-muted px-2 uppercase tracking-wider">Presets:</span>
          {[
            { id: 'projectile', label: '🎯 Projectile Motion' },
            { id: 'collision', label: '💥 Elastic Collisions' },
            { id: 'incline', label: '📐 Inclined Plane' },
            { id: 'freefall', label: '🪂 Galileo Free Fall' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset.id as ExperimentPreset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activePreset === preset.id
                  ? 'bg-[#38BDF8] text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Global Physics Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-2 rounded-xl bg-card border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            {isRunning ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
            <span>{isRunning ? 'Pause' : 'Run'}</span>
          </button>

          <button
            onClick={() => loadPreset(activePreset)}
            className="p-2 rounded-xl bg-card border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
            title="Reset preset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleClear}
            className="p-2 rounded-xl bg-card border border-border text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Clear all objects"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport & Sandbox Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Matter.js Canvas */}
        <div className="lg:col-span-3 bg-slate-900 border border-border rounded-3xl overflow-hidden shadow-soft relative flex flex-col items-center justify-center min-h-[480px]">
          <div ref={sceneRef} className="w-full h-[480px] cursor-grab active:cursor-grabbing" />

          {/* Canvas Floating Quick-Bar */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-1.5 px-3 shadow-lg">
              <button
                onClick={() => handleSpawnShape('circle')}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors"
              >
                + Sphere
              </button>
              <button
                onClick={() => handleSpawnShape('box')}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
              >
                + Crate
              </button>
              <button
                onClick={handleLaunch}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-[#38BDF8] text-white hover:bg-[#0284C7] shadow-sm transition-colors flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                Fire Cannon
              </button>
            </div>

            <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-1.5 px-3 text-[11px] text-slate-400 flex items-center gap-2">
              <input
                type="checkbox"
                id="vectorToggle"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="rounded text-[#38BDF8] focus:ring-0"
              />
              <label htmlFor="vectorToggle" className="cursor-pointer">
                Velocity Vectors (v⃗)
              </label>
            </div>
          </div>
        </div>

        {/* Right: Physics Parameters Inspector */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-soft space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Sliders className="w-4 h-4 text-[#38BDF8]" />
              <h3 className="font-bold text-sm text-text-primary">Physical Parameters</h3>
            </div>

            {/* Gravity Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">Gravity (g)</span>
                <span className="text-text-muted font-mono">{(gravityY * 9.8).toFixed(1)} m/s²</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.1"
                value={gravityY}
                onChange={(e) => setGravityY(parseFloat(e.target.value))}
                className="w-full accent-[#38BDF8]"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Space (0g)</span>
                <span>Earth (1g)</span>
                <span>Jupiter (2.5g)</span>
              </div>
            </div>

            {/* Restitution (Elasticity) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">Restitution (e)</span>
                <span className="text-text-muted font-mono">{(restitution * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={restitution}
                onChange={(e) => setRestitution(parseFloat(e.target.value))}
                className="w-full accent-[#38BDF8]"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Inelastic (Clay)</span>
                <span>Elastic (Rubber)</span>
              </div>
            </div>

            {/* Friction Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">Surface Friction (μ)</span>
                <span className="text-text-muted font-mono">{friction.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={friction}
                onChange={(e) => setFriction(parseFloat(e.target.value))}
                className="w-full accent-[#38BDF8]"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Ice (0.0)</span>
                <span>Sandpaper (0.5)</span>
              </div>
            </div>

            {/* Cannon Angle & Speed */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="text-xs font-bold text-text-primary flex items-center justify-between">
                <span>Cannon Configuration</span>
                <span className="text-[10px] text-text-muted">R = (v² sin 2θ)/g</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Launch Angle</span>
                  <span className="font-mono text-text-primary">{launchAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={launchAngle}
                  onChange={(e) => setLaunchAngle(parseInt(e.target.value))}
                  className="w-full accent-[#38BDF8]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Initial Speed (v₀)</span>
                  <span className="font-mono text-text-primary">{launchSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={launchSpeed}
                  onChange={(e) => setLaunchSpeed(parseInt(e.target.value))}
                  className="w-full accent-[#38BDF8]"
                />
              </div>
            </div>
          </div>

          {/* Educational Formula Guide */}
          <div className="bg-[#E0F2FE] dark:bg-[#082F49] border border-[#38BDF8]/30 rounded-2xl p-4 text-xs space-y-2">
            <div className="font-bold text-[#0284C7] dark:text-[#38BDF8] flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              <span>NCERT Mechanics Focus</span>
            </div>
            <p className="text-[#0369A1] dark:text-slate-300 leading-relaxed text-[11px]">
              • <strong>Newton’s Second Law:</strong> F = m·a. Real-time accelerations reflect applied gravitational force.
              <br />• <strong>Conservation of Momentum:</strong> In elastic collisions, m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsPlaygroundPage;
