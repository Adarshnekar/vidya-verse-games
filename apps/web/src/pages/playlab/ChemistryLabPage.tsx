import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Atom,
  Flame,
  FlaskConical,
  Sparkles,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Info,
  Thermometer,
  Layers,
  Play,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

type ChemistryTab = 'atom' | 'states' | 'reactions';

interface ElementData {
  z: number;
  symbol: string;
  name: string;
  protons: number;
  neutrons: number;
  electrons: number;
  category: string;
}

const COMMON_ELEMENTS: ElementData[] = [
  { z: 1, symbol: 'H', name: 'Hydrogen', protons: 1, neutrons: 0, electrons: 1, category: 'Non-metal' },
  { z: 2, symbol: 'He', name: 'Helium', protons: 2, neutrons: 2, electrons: 2, category: 'Noble Gas' },
  { z: 3, symbol: 'Li', name: 'Lithium', protons: 3, neutrons: 4, electrons: 3, category: 'Alkali Metal' },
  { z: 6, symbol: 'C', name: 'Carbon', protons: 6, neutrons: 6, electrons: 6, category: 'Non-metal' },
  { z: 7, symbol: 'N', name: 'Nitrogen', protons: 7, neutrons: 7, electrons: 7, category: 'Non-metal' },
  { z: 8, symbol: 'O', name: 'Oxygen', protons: 8, neutrons: 8, electrons: 8, category: 'Non-metal' },
  { z: 11, symbol: 'Na', name: 'Sodium', protons: 11, neutrons: 12, electrons: 11, category: 'Alkali Metal' },
  { z: 17, symbol: 'Cl', name: 'Chlorine', protons: 17, neutrons: 18, electrons: 17, category: 'Halogen' },
];

interface ChemicalReaction {
  id: string;
  name: string;
  equation: string;
  type: string;
  reactants: string[];
  products: string[];
  description: string;
  atomBalance: { element: string; reactantCount: number; productCount: number }[];
}

const REACTIONS: ChemicalReaction[] = [
  {
    id: 'water',
    name: 'Synthesis of Water',
    equation: '2H₂ + O₂ → 2H₂O',
    type: 'Synthesis / Exothermic',
    reactants: ['2 Hydrogen Molecules (2H₂)', '1 Oxygen Molecule (O₂)'],
    products: ['2 Water Molecules (2H₂O)'],
    description: 'Hydrogen and oxygen gas react vigorously releasing energy to form liquid water.',
    atomBalance: [
      { element: 'Hydrogen (H)', reactantCount: 4, productCount: 4 },
      { element: 'Oxygen (O)', reactantCount: 2, productCount: 2 },
    ],
  },
  {
    id: 'combustion',
    name: 'Combustion of Methane',
    equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    type: 'Combustion / Exothermic',
    reactants: ['1 Methane (CH₄)', '2 Oxygen (2O₂)'],
    products: ['1 Carbon Dioxide (CO₂)', '2 Water (2H₂O)'],
    description: 'Natural gas burning in abundant oxygen to produce carbon dioxide and steam.',
    atomBalance: [
      { element: 'Carbon (C)', reactantCount: 1, productCount: 1 },
      { element: 'Hydrogen (H)', reactantCount: 4, productCount: 4 },
      { element: 'Oxygen (O)', reactantCount: 4, productCount: 4 },
    ],
  },
  {
    id: 'neutralization',
    name: 'Acid-Base Neutralization',
    equation: 'HCl + NaOH → NaCl + H₂O',
    type: 'Neutralization',
    reactants: ['Hydrochloric Acid (HCl)', 'Sodium Hydroxide (NaOH)'],
    products: ['Sodium Chloride (Table Salt)', 'Water (H₂O)'],
    description: 'A strong acid neutralizes a strong base to form neutral common salt and water.',
    atomBalance: [
      { element: 'Hydrogen (H)', reactantCount: 2, productCount: 2 },
      { element: 'Chlorine (Cl)', reactantCount: 1, productCount: 1 },
      { element: 'Sodium (Na)', reactantCount: 1, productCount: 1 },
      { element: 'Oxygen (O)', reactantCount: 1, productCount: 1 },
    ],
  },
];

export const ChemistryLabPage: React.FC = () => {
  const navigate = useNavigate();
  const { addXP } = useAuthStore();

  const [activeTab, setActiveTab] = useState<ChemistryTab>('atom');

  // --- 1. ATOM BUILDER STATE ---
  const [protons, setProtons] = useState<number>(6); // Carbon by default
  const [neutrons, setNeutrons] = useState<number>(6);
  const [electrons, setElectrons] = useState<number>(6);

  // --- 2. STATES OF MATTER STATE ---
  const [temperatureCelsius, setTemperatureCelsius] = useState<number>(25); // Room temp
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- 3. REACTION SIMULATOR STATE ---
  const [selectedReaction, setSelectedReaction] = useState<ChemicalReaction>(REACTIONS[0]);
  const [isReacted, setIsReacted] = useState<boolean>(false);

  // Determine element from protons
  const matchedElement = COMMON_ELEMENTS.find((el) => el.protons === protons) || {
    z: protons,
    symbol: protons <= 18 ? `El-${protons}` : 'X',
    name: `Element ${protons}`,
    category: 'Custom',
  };

  const netCharge = protons - electrons;
  const atomicMass = protons + neutrons;

  // Electron shell distribution: K (max 2), L (max 8), M (max 8)
  const shellK = Math.min(2, electrons);
  const shellL = Math.min(8, Math.max(0, electrons - 2));
  const shellM = Math.min(8, Math.max(0, electrons - 10));

  // Particle Simulation for States of Matter
  useEffect(() => {
    if (activeTab !== 'states') return;
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const numParticles = 64;
    const particles = Array.from({ length: numParticles }).map((_, i) => ({
      x: (i % 8) * 35 + 60,
      y: Math.floor(i / 8) * 35 + 40,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background container
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // State determination: Solid (<0°C), Liquid (0-100°C), Gas (>100°C)
      const thermalSpeed = Math.max(0.2, (temperatureCelsius + 100) / 70);

      particles.forEach((p, idx) => {
        if (temperatureCelsius < 0) {
          // SOLID: Particles vibrate around home grid
          const homeX = (idx % 8) * 35 + 75;
          const homeY = Math.floor(idx / 8) * 35 + 60;
          p.x = homeX + (Math.random() - 0.5) * thermalSpeed * 1.5;
          p.y = homeY + (Math.random() - 0.5) * thermalSpeed * 1.5;
        } else if (temperatureCelsius <= 100) {
          // LIQUID: Flow and slide near bottom of beaker
          p.x += p.vx * thermalSpeed;
          p.y += p.vy * thermalSpeed + 0.3; // Slight gravity

          if (p.x < 40 || p.x > canvas.width - 40) p.vx *= -1;
          if (p.y < canvas.height / 2 || p.y > canvas.height - 30) p.vy *= -1;
        } else {
          // GAS: Rapid random motion filling entire container
          p.x += p.vx * thermalSpeed * 1.5;
          p.y += p.vy * thermalSpeed * 1.5;

          if (p.x < 25 || p.x > canvas.width - 25) p.vx *= -1;
          if (p.y < 25 || p.y > canvas.height - 25) p.vy *= -1;
        }

        // Draw particle
        ctx.fillStyle =
          temperatureCelsius < 0 ? '#38BDF8' : temperatureCelsius <= 100 ? '#10B981' : '#F59E0B';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, temperatureCelsius]);

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
                Chemistry <span className="text-[#06B6D4]">Lab</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <FlaskConical className="w-3.5 h-3.5" />
                Classes 6–10
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Interactive Bohr atom builder, kinetic molecular states & balanced chemical stoichiometry
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-card border border-border rounded-2xl p-2 shadow-soft">
        {[
          { id: 'atom', label: 'Bohr Atom Builder', icon: Atom, grades: 'Classes 8–10' },
          { id: 'states', label: 'Kinetic States of Matter', icon: Thermometer, grades: 'Classes 6–9' },
          { id: 'reactions', label: 'Reaction Chamber', icon: FlaskConical, grades: 'Classes 7–10' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as ChemistryTab);
                addXP(5);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#06B6D4] text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/5 text-text-muted'
                }`}
              >
                {tab.grades}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Area */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-soft">
        {/* ========================================== */}
        {/* 1. BOHR ATOM BUILDER */}
        {/* ========================================== */}
        {activeTab === 'atom' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold font-display text-text-primary">
                Interactive Bohr Atomic Model
              </h2>
              <p className="text-xs text-text-muted">
                Construct stable elements by populating protons, neutrons, and electron valence shells
              </p>
            </div>

            {/* Element Dossier Card */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-6 px-8 py-4 rounded-2xl bg-canvas border border-border shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500 flex flex-col items-center justify-center">
                  <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">{protons}</span>
                  <span className="text-2xl font-black text-cyan-500 font-display">{matchedElement.symbol}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{matchedElement.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-1 font-medium">
                    <span>Atomic Mass: <strong className="text-text-primary">{atomicMass} u</strong></span>
                    <span>•</span>
                    <span>
                      Net Charge:{' '}
                      <strong
                        className={
                          netCharge === 0
                            ? 'text-emerald-500'
                            : netCharge > 0
                            ? 'text-blue-500'
                            : 'text-amber-500'
                        }
                      >
                        {netCharge === 0 ? 'Neutral (0)' : netCharge > 0 ? `+${netCharge}` : netCharge}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bohr Orbit SVG Display */}
            <div className="flex justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <svg viewBox="0 0 360 360" className="w-[320px] h-[320px]">
                {/* Nucleus */}
                <circle cx="180" cy="180" r="28" fill="#3B82F6" opacity="0.8" />
                <text x="180" y="177" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                  {protons}p⁺
                </text>
                <text x="180" y="191" textAnchor="middle" fill="#93C5FD" fontSize="10" fontWeight="bold">
                  {neutrons}n⁰
                </text>

                {/* Shell K (Radius 60, up to 2 electrons) */}
                <circle cx="180" cy="180" r="60" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" />
                {Array.from({ length: shellK }).map((_, i) => {
                  const angle = (i * Math.PI) / 1;
                  return (
                    <circle
                      key={`k-${i}`}
                      cx={180 + 60 * Math.cos(angle)}
                      cy={180 + 60 * Math.sin(angle)}
                      r="5"
                      fill="#06B6D4"
                    />
                  );
                })}

                {/* Shell L (Radius 100, up to 8 electrons) */}
                {electrons > 2 && (
                  <>
                    <circle cx="180" cy="180" r="100" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" />
                    {Array.from({ length: shellL }).map((_, i) => {
                      const angle = (i * 2 * Math.PI) / shellL;
                      return (
                        <circle
                          key={`l-${i}`}
                          cx={180 + 100 * Math.cos(angle)}
                          cy={180 + 100 * Math.sin(angle)}
                          r="5"
                          fill="#06B6D4"
                        />
                      );
                    })}
                  </>
                )}

                {/* Shell M (Radius 140, up to 8 electrons) */}
                {electrons > 10 && (
                  <>
                    <circle cx="180" cy="180" r="140" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" />
                    {Array.from({ length: shellM }).map((_, i) => {
                      const angle = (i * 2 * Math.PI) / shellM;
                      return (
                        <circle
                          key={`m-${i}`}
                          cx={180 + 140 * Math.cos(angle)}
                          cy={180 + 140 * Math.sin(angle)}
                          r="5"
                          fill="#06B6D4"
                        />
                      );
                    })}
                  </>
                )}
              </svg>
            </div>

            {/* Subatomic Particle Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5 p-4 rounded-2xl bg-canvas border border-border">
                <div className="flex justify-between text-xs font-semibold text-text-primary">
                  <span>Protons (p⁺) - Atomic No.</span>
                  <span className="font-mono text-blue-500 font-bold">{protons}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="18"
                  value={protons}
                  onChange={(e) => setProtons(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-canvas border border-border">
                <div className="flex justify-between text-xs font-semibold text-text-primary">
                  <span>Neutrons (n⁰)</span>
                  <span className="font-mono text-slate-400 font-bold">{neutrons}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="22"
                  value={neutrons}
                  onChange={(e) => setNeutrons(parseInt(e.target.value))}
                  className="w-full accent-slate-400"
                />
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-canvas border border-border">
                <div className="flex justify-between text-xs font-semibold text-text-primary">
                  <span>Electrons (e⁻)</span>
                  <span className="font-mono text-cyan-500 font-bold">{electrons}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="18"
                  value={electrons}
                  onChange={(e) => setElectrons(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 2. KINETIC STATES OF MATTER */}
        {/* ========================================== */}
        {activeTab === 'states' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold font-display text-text-primary">
                Kinetic Particle Model of Matter
              </h2>
              <p className="text-xs text-text-muted">
                Adjust temperature to observe phase transitions: Solid (Ice) ➔ Liquid (Water) ➔ Gas (Steam)
              </p>
            </div>

            {/* State Readout */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-canvas border border-border text-lg font-bold">
                <span className="text-text-muted font-normal text-xs uppercase">Current Phase:</span>
                <span
                  className={
                    temperatureCelsius < 0
                      ? 'text-[#38BDF8]'
                      : temperatureCelsius <= 100
                      ? 'text-[#10B981]'
                      : 'text-[#F59E0B]'
                  }
                >
                  {temperatureCelsius < 0
                    ? '❄️ Solid (Rigid Crystal Lattice)'
                    : temperatureCelsius <= 100
                    ? '💧 Liquid (Fluid Molecular Flow)'
                    : '💨 Gas (Rapid Diffusing Vapour)'}
                </span>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-2 flex justify-center">
              <canvas ref={particleCanvasRef} width={500} height={320} className="rounded-2xl" />
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2 p-5 rounded-2xl bg-canvas border border-border max-w-lg mx-auto">
              <div className="flex justify-between text-xs font-bold text-text-primary">
                <span>Temperature (°C / K)</span>
                <span className="font-mono text-cyan-500">
                  {temperatureCelsius}°C ({temperatureCelsius + 273} K)
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="200"
                step="5"
                value={temperatureCelsius}
                onChange={(e) => setTemperatureCelsius(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>-50°C (Freezing Ice)</span>
                <span>0°C (Melting Point)</span>
                <span>100°C (Boiling Point)</span>
                <span>200°C (Steam)</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 3. REACTION CHAMBER & STOICHIOMETRY */}
        {/* ========================================== */}
        {activeTab === 'reactions' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold font-display text-text-primary">
                Stoichiometric Reaction Chamber
              </h2>
              <p className="text-xs text-text-muted">
                Validate the Law of Conservation of Mass: Number of atoms remains identical before and after reaction
              </p>
            </div>

            {/* Reaction Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {REACTIONS.map((rxn) => (
                <button
                  key={rxn.id}
                  onClick={() => {
                    setSelectedReaction(rxn);
                    setIsReacted(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedReaction.id === rxn.id
                      ? 'bg-[#06B6D4] text-white shadow-sm'
                      : 'bg-card border border-border text-text-muted hover:text-text-primary'
                  }`}
                >
                  {rxn.name}
                </button>
              ))}
            </div>

            {/* Reaction Equation Box */}
            <div className="p-6 rounded-3xl bg-canvas border border-border text-center space-y-4">
              <div className="text-2xl font-black font-mono text-cyan-500">
                {selectedReaction.equation}
              </div>
              <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
                {selectedReaction.description}
              </p>

              <button
                onClick={() => {
                  setIsReacted(!isReacted);
                  addXP(15);
                }}
                className="btn-primary py-2.5 px-6 rounded-xl font-semibold text-xs flex items-center gap-2 mx-auto"
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>{isReacted ? 'Reset Chamber' : 'Initiate Reaction'}</span>
              </button>
            </div>

            {/* Conservation of Mass Atom Table */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h4 className="font-bold text-xs text-text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Atom Conservation Audit (Law of Lavoisier)</span>
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs border-b border-border pb-2 text-text-muted font-semibold">
                <span>Element</span>
                <span>Reactant Atoms</span>
                <span>Product Atoms</span>
              </div>
              {selectedReaction.atomBalance.map((item, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 text-xs font-mono py-1">
                  <span className="font-semibold text-text-primary">{item.element}</span>
                  <span className="text-blue-500">{item.reactantCount}</span>
                  <span className="text-emerald-500">{item.productCount} (Conserved ✓)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChemistryLabPage;
