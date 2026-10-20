import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  TreeDeciduous,
  Activity,
  AlertTriangle,
  Sun,
  CloudRain,
  Flame,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface SimulationHistoryPoint {
  time: number;
  plants: number;
  herbivores: number;
  predators: number;
}

export const EcosystemSimulatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { addXP } = useAuthStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ecological Parameters
  const [plantRegrowthRate, setPlantRegrowthRate] = useState<number>(0.12);
  const [herbivoreReproduction, setHerbivoreReproduction] = useState<number>(0.08);
  const [predatorEfficiency, setPredatorEfficiency] = useState<number>(0.05);
  const [carryingCapacity, setCarryingCapacity] = useState<number>(300);

  // Population State
  const [plants, setPlants] = useState<number>(200);
  const [herbivores, setHerbivores] = useState<number>(60);
  const [predators, setPredators] = useState<number>(15);
  const [simTime, setSimTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Time-series history for chart
  const [history, setHistory] = useState<SimulationHistoryPoint[]>([
    { time: 0, plants: 200, herbivores: 60, predators: 15 },
  ]);

  // Simulation tick loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSimTime((t) => t + 1);

      setPlants((currentPlants) => {
        setHerbivores((currentHerbivores) => {
          setPredators((currentPredators) => {
            // Simplified Lotka-Volterra with carrying capacity:
            // dP/dt = r * P * (1 - P / K) - a * P * H
            // dH/dt = b * a * P * H - c * H * P_red - d * H
            // dPred/dt = e * c * H * P_red - f * P_red

            const plantGrowth = plantRegrowthRate * currentPlants * (1 - currentPlants / carryingCapacity);
            const plantEaten = 0.003 * currentPlants * currentHerbivores;
            const newPlants = Math.max(10, Math.min(carryingCapacity, currentPlants + plantGrowth - plantEaten));

            const herbivoreBirths = 0.002 * currentPlants * currentHerbivores;
            const herbivorePredated = predatorEfficiency * 0.02 * currentHerbivores * currentPredators;
            const herbivoreNaturalDeaths = 0.04 * currentHerbivores;
            const newHerbivores = Math.max(
              0,
              Math.min(250, currentHerbivores + herbivoreBirths - herbivorePredated - herbivoreNaturalDeaths)
            );

            const predatorBirths = 0.001 * currentHerbivores * currentPredators * 1.5;
            const predatorStarvation = (currentHerbivores < 15 ? 0.12 : 0.05) * currentPredators;
            const newPredators = Math.max(
              0,
              Math.min(100, currentPredators + predatorBirths - predatorStarvation)
            );

            // Record history
            setHistory((prev) => {
              const updated = [
                ...prev,
                {
                  time: prev.length,
                  plants: Math.round(newPlants),
                  herbivores: Math.round(newHerbivores),
                  predators: Math.round(newPredators),
                },
              ];
              return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
            });

            return newPredators;
          });
          return currentHerbivores;
        });
        return currentPlants;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isRunning, plantRegrowthRate, carryingCapacity, predatorEfficiency]);

  // Draw 2D Animated Biome Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background Sky/Terrain Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0F172A');
      skyGrad.addColorStop(0.7, '#1E293B');
      skyGrad.addColorStop(1, '#064E3B');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grass / Plants (Green Dots/Sprouts)
      const plantCount = Math.min(120, Math.round(plants / 2));
      for (let i = 0; i < plantCount; i++) {
        const x = (i * 37 + (simTime % 20)) % canvas.width;
        const y = canvas.height - 40 - ((i * 19) % 120);
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Herbivores (Rabbits / Deer - Blue Circles hopping)
      const herbCount = Math.min(50, Math.round(herbivores));
      for (let i = 0; i < herbCount; i++) {
        const speed = 1.2;
        const x = (i * 55 + simTime * speed * 4) % (canvas.width - 40) + 20;
        const hop = Math.abs(Math.sin((simTime + i) * 0.4)) * 12;
        const y = canvas.height - 50 - ((i * 13) % 90) - hop;

        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillRect(x - 3, y - 10, 2, 5);
        ctx.fillRect(x + 1, y - 10, 2, 5);
      }

      // Draw Predators (Foxes / Wolves - Red/Orange Triangles stalking)
      const predCount = Math.min(30, Math.round(predators));
      for (let i = 0; i < predCount; i++) {
        const speed = 1.6;
        const x = (i * 90 + simTime * speed * 3) % (canvas.width - 50) + 25;
        const y = canvas.height - 55 - ((i * 17) % 80);

        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.moveTo(x + 10, y);
        ctx.lineTo(x - 8, y - 6);
        ctx.lineTo(x - 8, y + 6);
        ctx.closePath();
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [plants, herbivores, predators, simTime]);

  // Disaster Events
  const triggerDrought = () => {
    setPlants((p) => Math.max(15, p * 0.3));
    addXP(10);
  };

  const triggerDisease = () => {
    setHerbivores((h) => Math.max(5, h * 0.4));
    addXP(10);
  };

  const resetEcosystem = () => {
    setPlants(200);
    setHerbivores(60);
    setPredators(15);
    setSimTime(0);
    setHistory([{ time: 0, plants: 200, herbivores: 60, predators: 15 }]);
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
                Ecosystem <span className="text-[#10B981]">Simulator</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TreeDeciduous className="w-3.5 h-3.5" />
                Classes 3–10
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Dynamic Lotka-Volterra predator-prey food-chain balance & environmental carrying capacity
            </p>
          </div>
        </div>

        {/* Live Population Stats */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-xl bg-card border border-border shadow-soft flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-text-muted">Plants:</span>
            <span className="text-emerald-500 font-bold">{Math.round(plants)}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-card border border-border shadow-soft flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
            <span className="text-text-muted">Herbivores:</span>
            <span className="text-[#38BDF8] font-bold">{Math.round(herbivores)}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-card border border-border shadow-soft flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-text-muted">Predators:</span>
            <span className="text-rose-500 font-bold">{Math.round(predators)}</span>
          </div>
        </div>
      </div>

      {/* Control Bar & Environmental Disruptions */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card border border-border rounded-2xl p-2.5 shadow-soft">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 rounded-xl bg-card border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            {isRunning ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
            <span>{isRunning ? 'Pause Sim' : 'Resume Sim'}</span>
          </button>

          <button
            onClick={resetEcosystem}
            className="p-2 rounded-xl bg-card border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
            title="Reset populations"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Environmental Disruption Triggers */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-muted hidden sm:inline">Disruptions:</span>
          <button
            onClick={triggerDrought}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Severe Drought</span>
          </button>

          <button
            onClick={triggerDisease}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors flex items-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Herbivore Disease</span>
          </button>
        </div>
      </div>

      {/* Simulation Viewport & Population Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2D Biome Canvas & Population History Chart */}
        <div className="lg:col-span-2 space-y-4">
          {/* Animated Canvas */}
          <div className="bg-slate-900 border border-border rounded-3xl overflow-hidden shadow-soft relative">
            <canvas ref={canvasRef} width={700} height={260} className="w-full h-[260px]" />
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-slate-300 border border-slate-700">
              Simulated Grassland Biome (Time: {simTime} ticks)
            </div>
          </div>

          {/* Real-time Multi-Line Population Chart */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#10B981]" />
                <span>Lotka-Volterra Population Waves</span>
              </h3>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="text-emerald-500 flex items-center gap-1">■ Plants</span>
                <span className="text-[#38BDF8] flex items-center gap-1">■ Herbivores</span>
                <span className="text-rose-500 flex items-center gap-1">■ Predators</span>
              </div>
            </div>

            {/* SVG Line Chart */}
            <div className="w-full h-44 bg-slate-950 rounded-2xl p-2 border border-slate-800">
              <svg viewBox="0 0 500 140" className="w-full h-full">
                {/* Horizontal baseline */}
                <line x1="10" y1="130" x2="490" y2="130" stroke="#334155" strokeWidth="1" />

                {/* Plants Line (Scaled to max 300) */}
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  points={history
                    .map((pt, i) => `${10 + i * 10},${130 - (pt.plants / 300) * 110}`)
                    .join(' ')}
                />

                {/* Herbivores Line (Scaled to max 200) */}
                <polyline
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  points={history
                    .map((pt, i) => `${10 + i * 10},${130 - (pt.herbivores / 200) * 110}`)
                    .join(' ')}
                />

                {/* Predators Line (Scaled to max 80) */}
                <polyline
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  points={history
                    .map((pt, i) => `${10 + i * 10},${130 - (pt.predators / 80) * 110}`)
                    .join(' ')}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right: Ecological Controls & NCERT Guide */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-soft space-y-4">
            <h3 className="font-bold text-sm text-text-primary border-b border-border pb-3">
              Ecological Model Variables
            </h3>

            {/* Carrying Capacity (K) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-primary font-medium">Plant Carrying Capacity (K)</span>
                <span className="font-mono text-emerald-500">{carryingCapacity}</span>
              </div>
              <input
                type="range"
                min="150"
                max="450"
                value={carryingCapacity}
                onChange={(e) => setCarryingCapacity(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Plant Regrowth Rate */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-primary font-medium">Vegetation Regrowth Rate</span>
                <span className="font-mono text-emerald-500">{(plantRegrowthRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.25"
                step="0.01"
                value={plantRegrowthRate}
                onChange={(e) => setPlantRegrowthRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Predator Hunting Efficiency */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-primary font-medium">Predation Efficiency</span>
                <span className="font-mono text-rose-500">{(predatorEfficiency * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.12"
                step="0.01"
                value={predatorEfficiency}
                onChange={(e) => setPredatorEfficiency(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          </div>

          {/* NCERT Ecological Principles */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs space-y-2">
            <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Trophic Cascade Observations</span>
            </div>
            <p className="text-emerald-800 dark:text-slate-300 leading-relaxed text-[11px]">
              • <strong>Energy Pyramid:</strong> Only ~10% of energy transfers between successive trophic levels (Lindeman’s 10% Rule).
              <br />• <strong>Oscillation Cycles:</strong> A surge in herbivores triggers a subsequent surge in predators, which then suppresses the herbivore population, allowing vegetation to recover.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcosystemSimulatorPage;
