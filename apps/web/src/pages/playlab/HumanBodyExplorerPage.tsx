import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Heart,
  Wind,
  Apple,
  Bone,
  Brain,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

type BodySystem = 'circulatory' | 'respiratory' | 'digestive' | 'skeletal' | 'nervous';

interface OrganHotspot {
  id: string;
  name: string;
  system: BodySystem;
  x: number; // percentage in SVG
  y: number;
  ncertFact: string;
  functionDesc: string;
  funFact: string;
}

const ORGAN_HOTSPOTS: OrganHotspot[] = [
  // Circulatory
  {
    id: 'heart',
    name: 'Human Heart (Cardiovascular Pump)',
    system: 'circulatory',
    x: 52,
    y: 34,
    ncertFact:
      'A muscular organ about the size of a clenched fist. It has 4 chambers: Right/Left Atria and Right/Left Ventricles to prevent mixing of oxygen-rich and carbon dioxide-rich blood.',
    functionDesc:
      'Pumps deoxygenated blood to the pulmonary artery (lungs) and oxygenated blood through the aorta to the systemic body tissues.',
    funFact: 'Beats approximately 100,000 times per day, pumping over 7,000 liters of blood!',
  },
  {
    id: 'blood-vessels',
    name: 'Aorta & Vena Cava Network',
    system: 'circulatory',
    x: 50,
    y: 44,
    ncertFact:
      'Arteries carry blood away from the heart at high pressure (thick elastic walls). Veins have valves to ensure unidirectional flow back to the heart.',
    functionDesc:
      'Transports oxygen, nutrients, hormones, and waste products (urea, CO2) to and from body cells.',
    funFact: 'If laid end-to-end, all blood vessels in a human body would stretch over 100,000 kilometers!',
  },

  // Respiratory
  {
    id: 'lungs',
    name: 'Lungs & Alveoli',
    system: 'respiratory',
    x: 44,
    y: 33,
    ncertFact:
      'Millions of tiny balloon-like sacs called alveoli maximize surface area for gas exchange between inhaled air and capillary blood.',
    functionDesc:
      'Facilitates diffusion of oxygen (O2) into blood and removal of carbon dioxide (CO2).',
    funFact: 'The total surface area of both human lungs is roughly equivalent to a tennis court (~70 m²)!',
  },
  {
    id: 'diaphragm',
    name: 'Diaphragm Muscle',
    system: 'respiratory',
    x: 50,
    y: 42,
    ncertFact:
      'A dome-shaped sheet of muscle beneath the lungs. When it contracts and flattens, thoracic volume increases, drawing air in (inhalation).',
    functionDesc:
      'The primary engine of pulmonary respiration, separating thoracic and abdominal cavities.',
    funFact: 'Involuntary spasms of the diaphragm accompanied by vocal cord closure cause hiccups!',
  },

  // Digestive
  {
    id: 'stomach',
    name: 'Stomach & Gastric Juices',
    system: 'digestive',
    x: 54,
    y: 46,
    ncertFact:
      'Secretes hydrochloric acid (HCl, pH ~1.5–2.0) which kills ingested pathogens and activates the enzyme pepsin for protein breakdown.',
    functionDesc:
      'Mechanically churns food into a semi-liquid mixture called chyme and initiates protein digestion.',
    funFact: 'The stomach lining secretes mucus to protect itself from being digested by its own acid!',
  },
  {
    id: 'intestines',
    name: 'Small & Large Intestines',
    system: 'digestive',
    x: 50,
    y: 56,
    ncertFact:
      'The small intestine (~6 meters) is covered in millions of microscopic finger-like projections called villi that absorb digested nutrients into the bloodstream.',
    functionDesc:
      'Small intestine absorbs amino acids, glucose, and fatty acids; large intestine reabsorbs water and forms compact stool.',
    funFact: 'Host to trillions of beneficial probiotic gut microbes that synthesize essential Vitamin K and B12!',
  },

  // Skeletal
  {
    id: 'skull',
    name: 'Cranium & Vertebral Spine',
    system: 'skeletal',
    x: 50,
    y: 12,
    ncertFact:
      'Composed of 22 fused cranial and facial bones that form a rigid biological vault protecting the delicate brain.',
    functionDesc:
      'Protects the central nervous system and provides structural attachment points for facial and neck muscles.',
    funFact: 'Babies are born with ~300 soft bones; many fuse during growth to form 206 adult bones!',
  },
  {
    id: 'femur',
    name: 'Femur (Thigh Bone)',
    system: 'skeletal',
    x: 44,
    y: 72,
    ncertFact:
      'The longest, heaviest, and strongest bone in the human body, capable of supporting up to 30 times an adult’s body weight.',
    functionDesc:
      'Transfers body mass during bipedal standing, walking, and sprinting to the lower tibia/fibula.',
    funFact: 'Bone tissue is dynamic and constantly remodeled by osteoblasts and osteoclasts!',
  },

  // Nervous
  {
    id: 'brain',
    name: 'Human Brain (Cerebrum & Cerebellum)',
    system: 'nervous',
    x: 50,
    y: 10,
    ncertFact:
      'Consists of the Cerebrum (thought, memory, voluntary motion), Cerebellum (balance and precision coordination), and Medulla (involuntary heartbeat and breathing).',
    functionDesc:
      'The command hub of the central nervous system, processing sensory inputs and coordinating physiological responses.',
    funFact: 'Consumes approximately 20% of the body’s total oxygen and glucose despite being only 2% of total body weight!',
  },
  {
    id: 'spinal-cord',
    name: 'Spinal Cord & Reflex Arc',
    system: 'nervous',
    x: 50,
    y: 28,
    ncertFact:
      'A dense bundle of nerve fibers running through the protective vertebral canal. Controls rapid unconscious reflex arcs (e.g., knee jerk or hand withdrawal from fire).',
    functionDesc:
      'Transmits sensory impulses from the peripheral body to the brain and motor commands back to muscles.',
    funFact: 'Reflex signals can bypass the brain entirely, processing directly in the spinal cord for millisecond response times!',
  },
];

export const HumanBodyExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const { addXP } = useAuthStore();

  const [activeSystem, setActiveSystem] = useState<BodySystem>('circulatory');
  const [selectedOrgan, setSelectedOrgan] = useState<OrganHotspot>(ORGAN_HOTSPOTS[0]);
  const [heartBPM, setHeartBPM] = useState<number>(72);

  const systemHotspots = ORGAN_HOTSPOTS.filter((h) => h.system === activeSystem);

  const handleSelectSystem = (sys: BodySystem) => {
    setActiveSystem(sys);
    const firstInSystem = ORGAN_HOTSPOTS.find((h) => h.system === sys);
    if (firstInSystem) setSelectedOrgan(firstInSystem);
    addXP(5);
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
                Human Body <span className="text-[#E95778]">Explorer</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FCE5EB] text-[#E95778] dark:bg-[#381521] dark:text-[#FFA0B6]">
                <Stethoscope className="w-3.5 h-3.5" />
                Classes 3–10
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Interactive physiological organ systems: Cardiovascular, Respiratory, Digestive & Nervous
            </p>
          </div>
        </div>
      </div>

      {/* Body System Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-card border border-border rounded-2xl p-2 shadow-soft">
        {[
          { id: 'circulatory', label: 'Circulatory (Heart & Blood)', icon: Heart, grades: 'Classes 5–10' },
          { id: 'respiratory', label: 'Respiratory (Lungs & Gas)', icon: Wind, grades: 'Classes 4–10' },
          { id: 'digestive', label: 'Digestive (Food & Enzymes)', icon: Apple, grades: 'Classes 4–9' },
          { id: 'skeletal', label: 'Skeletal (Bones & Joints)', icon: Bone, grades: 'Classes 3–8' },
          { id: 'nervous', label: 'Nervous (Brain & Reflexes)', icon: Brain, grades: 'Classes 6–10' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSystem === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectSystem(tab.id as BodySystem)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#E95778] text-white shadow-sm'
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

      {/* Main Interactive Anatomy Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Anatomical Silhouette Canvas */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 relative flex flex-col items-center justify-center min-h-[480px] shadow-soft overflow-hidden">
          {/* Subtle Grid / Bio Scanner lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* SVG Silhouette Model */}
          <div className="relative w-full max-w-[340px] h-[440px]">
            <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-xl">
              {/* Human Body Silhouette Contour */}
              <path
                d="M100 20 C115 20, 125 35, 125 55 C125 70, 115 80, 110 85 C125 90, 145 105, 150 140 L160 220 C162 230, 155 235, 150 230 L140 160 L135 240 L130 360 C130 370, 120 370, 115 365 L105 260 L95 260 L85 365 C80 370, 70 370, 70 360 L65 240 L60 160 L50 230 C45 235, 38 230, 40 220 L50 140 C55 105, 75 90, 90 85 C85 80, 75 70, 75 55 C75 35, 85 20, 100 20 Z"
                fill="#1E293B"
                stroke="#334155"
                strokeWidth="2.5"
              />

              {/* System Overlays */}
              {activeSystem === 'circulatory' && (
                <g>
                  {/* Heart Outline & Pulsing Core */}
                  <circle
                    cx="104"
                    cy="135"
                    r="12"
                    fill="#EF4444"
                    className="animate-pulse"
                    style={{ animationDuration: `${60 / heartBPM}s` }}
                  />
                  {/* Major Blood Vessels */}
                  <path d="M104 135 L104 90 M104 135 L104 220" stroke="#EF4444" strokeWidth="3" />
                  <path d="M98 135 L70 170 M110 135 L130 170" stroke="#38BDF8" strokeWidth="2.5" />
                  <path d="M104 220 L85 310 M104 220 L115 310" stroke="#EF4444" strokeWidth="2.5" />
                </g>
              )}

              {activeSystem === 'respiratory' && (
                <g>
                  {/* Trachea */}
                  <line x1="100" y1="85" x2="100" y2="120" stroke="#94A3B8" strokeWidth="4" />
                  {/* Lungs */}
                  <ellipse cx="88" cy="135" rx="14" ry="20" fill="rgba(56, 189, 248, 0.4)" stroke="#38BDF8" strokeWidth="2" />
                  <ellipse cx="112" cy="135" rx="14" ry="20" fill="rgba(56, 189, 248, 0.4)" stroke="#38BDF8" strokeWidth="2" />
                  {/* Diaphragm Curve */}
                  <path d="M72 165 Q100 155 128 165" stroke="#F59E0B" strokeWidth="3" fill="none" />
                </g>
              )}

              {activeSystem === 'digestive' && (
                <g>
                  {/* Esophagus */}
                  <line x1="100" y1="85" x2="100" y2="160" stroke="#F59E0B" strokeWidth="3.5" />
                  {/* Stomach J-shape */}
                  <path d="M100 160 C115 160, 120 185, 105 190 C95 195, 95 180, 100 160" fill="#F59E0B" opacity="0.8" />
                  {/* Intestines winding */}
                  <path d="M95 195 Q110 205 95 215 Q110 225 95 235" stroke="#10B981" strokeWidth="5" fill="none" />
                </g>
              )}

              {activeSystem === 'skeletal' && (
                <g>
                  {/* Cranium */}
                  <circle cx="100" cy="50" r="16" fill="none" stroke="#E2E8F0" strokeWidth="2.5" />
                  {/* Spine */}
                  <line x1="100" y1="66" x2="100" y2="230" stroke="#E2E8F0" strokeWidth="3" strokeDasharray="3 2" />
                  {/* Ribs */}
                  {[-15, -5, 5, 15].map((offset, i) => (
                    <line key={i} x1={80} y1={125 + offset} x2={120} y2={125 + offset} stroke="#94A3B8" strokeWidth="2" />
                  ))}
                  {/* Femurs */}
                  <line x1="90" y1="230" x2="80" y2="310" stroke="#E2E8F0" strokeWidth="3.5" />
                  <line x1="110" y1="230" x2="120" y2="310" stroke="#E2E8F0" strokeWidth="3.5" />
                </g>
              )}

              {activeSystem === 'nervous' && (
                <g>
                  {/* Brain */}
                  <ellipse cx="100" cy="48" rx="14" ry="12" fill="#EC4899" opacity="0.8" />
                  {/* Spinal Cord */}
                  <line x1="100" y1="60" x2="100" y2="240" stroke="#EC4899" strokeWidth="3" />
                  {/* Peripheral Nerves */}
                  <line x1="100" y1="110" x2="60" y2="180" stroke="#EC4899" strokeWidth="1.5" strokeDasharray="4 2" />
                  <line x1="100" y1="110" x2="140" y2="180" stroke="#EC4899" strokeWidth="1.5" strokeDasharray="4 2" />
                  <line x1="100" y1="230" x2="75" y2="330" stroke="#EC4899" strokeWidth="1.5" strokeDasharray="4 2" />
                  <line x1="100" y1="230" x2="125" y2="330" stroke="#EC4899" strokeWidth="1.5" strokeDasharray="4 2" />
                </g>
              )}

              {/* Hotspots */}
              {systemHotspots.map((spot) => {
                const isSelected = selectedOrgan.id === spot.id;
                // SVG coordinates (x, y) mapped from 0-100% to (200, 400)
                const svgX = (spot.x / 100) * 200;
                const svgY = (spot.y / 100) * 400;

                return (
                  <g key={spot.id} onClick={() => setSelectedOrgan(spot)} className="cursor-pointer">
                    <circle
                      cx={svgX}
                      cy={svgY}
                      r={isSelected ? 10 : 7}
                      fill={isSelected ? '#E95778' : '#38BDF8'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    {isSelected && (
                      <circle
                        cx={svgX}
                        cy={svgY}
                        r="16"
                        fill="none"
                        stroke="#E95778"
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick HUD overlay for Circulatory BPM */}
          {activeSystem === 'circulatory' && (
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Resting Heart Rate:</span>
                <strong className="text-white font-mono">{heartBPM} BPM</strong>
              </div>
              <input
                type="range"
                min="50"
                max="140"
                value={heartBPM}
                onChange={(e) => setHeartBPM(parseInt(e.target.value))}
                className="w-36 accent-rose-500"
              />
            </div>
          )}
        </div>

        {/* Right 1 Col: Selected Organ Dossier & NCERT Facts */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Info className="w-4 h-4 text-[#E95778]" />
              <h3 className="font-bold text-sm text-text-primary">Anatomical Dossier</h3>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E95778] bg-[#FCE5EB] dark:bg-[#381521] px-2 py-0.5 rounded-md">
                {selectedOrgan.system} system
              </span>
              <h2 className="text-lg font-bold font-display text-text-primary mt-2">
                {selectedOrgan.name}
              </h2>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <strong className="text-text-primary block mb-1">Primary Physiological Function:</strong>
                <p className="text-text-muted">{selectedOrgan.functionDesc}</p>
              </div>

              <div>
                <strong className="text-text-primary block mb-1">NCERT Curriculum Concept:</strong>
                <p className="text-text-muted">{selectedOrgan.ncertFact}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200">
                <strong className="block mb-0.5">💡 Clinical Fun Fact:</strong>
                <span>{selectedOrgan.funFact}</span>
              </div>
            </div>
          </div>

          {/* NCERT Biology Alignment */}
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs space-y-2">
            <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Life Processes (NCERT Class 10 / Ch 6)</span>
            </div>
            <p className="text-rose-800 dark:text-slate-300 leading-relaxed text-[11px]">
              Maintenance processes like nutrition, respiration, transport of materials, and excretion are vital to sustain life and prevent damage to cellular structures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanBodyExplorerPage;
