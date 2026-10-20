import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  ArrowLeft,
  Sun,
  Globe,
  Compass,
  Trophy,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  FastForward,
  RotateCw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ChevronRight,
  Info,
  Rocket,
  Scale,
  RefreshCw,
  Sliders,
  X,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../stores/authStore';

// ==========================================
// SOUND SYNTHESIZER (Web Audio API - Offline)
// ==========================================
class SpaceAudioSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playFlyby() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.25);
      filter.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.75);
    } catch {}
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {}
  }

  playCorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const startTime = this.ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    } catch {}
  }

  playWrong() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch {}
  }
}

const spaceAudio = new SpaceAudioSynthesizer();

// ==========================================
// CELESTIAL DATA & SCIENTIFIC CONSTANTS
// ==========================================
export interface PlanetData {
  id: string;
  name: string;
  type: 'Star' | 'Terrestrial' | 'Gas Giant' | 'Ice Giant' | 'Dwarf Planet';
  color: string;
  baseHex: number;
  radiusKm: number;
  displaySize: number;
  orbitDistance: number;
  actualDistAU: number;
  orbitalPeriodDays: number;
  rotationHours: number;
  axialTiltDeg: number;
  surfaceGravity: number;
  temperatureRange: string;
  avgTempC: number;
  atmosphere: string;
  atmosphereBreakdown: { gas: string; percentage: number }[];
  moonsCount: number;
  notableMoons: string[];
  ncertFocus: string;
  isroMission?: string;
  funFact: string;
  info: string;
  details: string;
  textures: {
    map: string;
    bump?: string;
    atmosphere?: string;
    ring?: {
      innerRadius: number;
      outerRadius: number;
      texture: string;
    };
  };
  cameraDistance: number;
}

const CELESTIAL_BODIES: PlanetData[] = [
  {
    id: 'sun',
    name: 'The Sun',
    type: 'Star',
    color: '#FBBF24',
    baseHex: 0xffaa00,
    radiusKm: 696340,
    displaySize: 697 / 40, // 17.425 scale exactly matching original
    orbitDistance: 0,
    actualDistAU: 0,
    orbitalPeriodDays: 0,
    rotationHours: 648,
    axialTiltDeg: 7.25,
    surfaceGravity: 274.0,
    temperatureRange: '5,500°C (Surface) to 15,000,000°C (Core)',
    avgTempC: 5500,
    atmosphere: 'Hydrogen (73%), Helium (25%), Solar Wind Plasma',
    atmosphereBreakdown: [
      { gas: 'Hydrogen', percentage: 73.4 },
      { gas: 'Helium', percentage: 25.0 },
      { gas: 'Oxygen & Iron', percentage: 1.6 },
    ],
    moonsCount: 0,
    notableMoons: [],
    ncertFocus: 'Nuclear Fusion (Proton-Proton chain), Solar Flare Corona, Heliocentric Dynamics',
    isroMission: 'Aditya-L1 (Stationed at Sun-Earth L1 Lagrange Point)',
    funFact: 'The Sun accounts for 99.86% of the total mass of the entire Solar System!',
    info: 'The central star of our solar system, powering all planetary weather and orbital mechanics.',
    details:
      'A yellow dwarf star at the center of our solar system. Its gravitational field holds all planets, dwarf planets, asteroids, and comets in orbit.',
    textures: {
      map: '/solar/textures/sun.jpg',
    },
    cameraDistance: 60,
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial',
    color: '#9CA3AF',
    baseHex: 0x9ca3af,
    radiusKm: 2439.7,
    displaySize: 2.4,
    orbitDistance: 40,
    actualDistAU: 0.39,
    orbitalPeriodDays: 88,
    rotationHours: 1407.6,
    axialTiltDeg: 0.034,
    surfaceGravity: 3.7,
    temperatureRange: '-180°C to 430°C',
    avgTempC: 167,
    atmosphere: 'Trace Exosphere (Oxygen, Sodium, Hydrogen)',
    atmosphereBreakdown: [
      { gas: 'Oxygen', percentage: 42 },
      { gas: 'Sodium', percentage: 29 },
      { gas: 'Hydrogen', percentage: 22 },
      { gas: 'Helium & Others', percentage: 7 },
    ],
    moonsCount: 0,
    notableMoons: [],
    ncertFocus: '3:2 Spin-Orbit Resonance, Cratered Basins, Extreme Thermal Swings',
    funFact: 'A year on Mercury is only 88 Earth days, but one solar day takes 176 Earth days!',
    info: 'The smallest planet in our solar system and nearest to the Sun.',
    details:
      'Closest planet to the Sun. It has virtually no atmosphere to trap heat, resulting in the most extreme day-to-night temperature fluctuations in the solar system.',
    textures: {
      map: '/solar/textures/mercurymap.jpg',
      bump: '/solar/textures/mercurybump.jpg',
    },
    cameraDistance: 10,
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial',
    color: '#FCD34D',
    baseHex: 0xe6c87a,
    radiusKm: 6051.8,
    displaySize: 6.1,
    orbitDistance: 65,
    actualDistAU: 0.72,
    orbitalPeriodDays: 224.7,
    rotationHours: -5832.5,
    axialTiltDeg: 177.36,
    surfaceGravity: 8.87,
    temperatureRange: 'Constant 465°C day and night',
    avgTempC: 465,
    atmosphere: '96.5% Carbon Dioxide, 3.5% Nitrogen (Sulfuric Acid Clouds)',
    atmosphereBreakdown: [
      { gas: 'Carbon Dioxide', percentage: 96.5 },
      { gas: 'Nitrogen', percentage: 3.5 },
      { gas: 'Sulfur Dioxide', percentage: 0.015 },
    ],
    moonsCount: 0,
    notableMoons: [],
    ncertFocus: 'Runaway Greenhouse Effect, Retrograde Spin, Super-rotating Atmosphere',
    isroMission: 'Shukrayaan (Venus Orbiter Mission planned)',
    funFact: 'Venus spins backwards compared to most planets, and its day is longer than its year!',
    info: 'Second planet from the Sun, known for its extreme temperatures and thick atmosphere.',
    details:
      "Earth's 'twin' in size, but a scorching inferno under atmospheric pressure 92 times heavier than Earth—equivalent to being 900 meters deep under ocean water.",
    textures: {
      map: '/solar/textures/venusmap.jpg',
      bump: '/solar/textures/venusbump.jpg',
      atmosphere: '/solar/textures/venus_atmosphere.jpg',
    },
    cameraDistance: 25,
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'Terrestrial',
    color: '#60A5FA',
    baseHex: 0x2b82c9,
    radiusKm: 6371.0,
    displaySize: 6.4,
    orbitDistance: 90,
    actualDistAU: 1.0,
    orbitalPeriodDays: 365.25,
    rotationHours: 23.93,
    axialTiltDeg: 23.44,
    surfaceGravity: 9.807,
    temperatureRange: '-88°C to 58°C',
    avgTempC: 15,
    atmosphere: '78% Nitrogen, 21% Oxygen, 0.93% Argon, 0.04% CO2',
    atmosphereBreakdown: [
      { gas: 'Nitrogen', percentage: 78.08 },
      { gas: 'Oxygen', percentage: 20.95 },
      { gas: 'Argon', percentage: 0.93 },
      { gas: 'Carbon Dioxide', percentage: 0.04 },
    ],
    moonsCount: 1,
    notableMoons: ['The Moon (Luna)'],
    ncertFocus: 'Goldilocks Habitable Zone, Plate Tectonics, Hydrological Cycle, Magnetic Shield',
    isroMission: 'Chandrayaan-1, 2, 3 (Water Ice on Moon South Pole), Gaganyaan Crewed Mission',
    funFact:
      "Earth's 23.5° axial tilt is stabilized by the Moon, creating our regular seasons and stable climate!",
    info: 'Third planet from the Sun and the only known planet to harbor life.',
    details:
      'The only world known to harbor life and surface liquid water. Protected by a strong magnetic field (magnetosphere) generated by its liquid iron outer core dynamo.',
    textures: {
      map: '/solar/textures/earth_daymap.jpg',
      bump: '/solar/textures/earth_normalmap.jpg',
      atmosphere: '/solar/textures/earth_atmosphere.jpg',
    },
    cameraDistance: 25,
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Terrestrial',
    color: '#EF4444',
    baseHex: 0xc1440e,
    radiusKm: 3389.5,
    displaySize: 3.4,
    orbitDistance: 115,
    actualDistAU: 1.52,
    orbitalPeriodDays: 687,
    rotationHours: 24.62,
    axialTiltDeg: 25.19,
    surfaceGravity: 3.72,
    temperatureRange: '-140°C to 20°C',
    avgTempC: -63,
    atmosphere: '95% CO2, 2.6% Nitrogen, 1.9% Argon',
    atmosphereBreakdown: [
      { gas: 'Carbon Dioxide', percentage: 95.32 },
      { gas: 'Nitrogen', percentage: 2.6 },
      { gas: 'Argon', percentage: 1.9 },
      { gas: 'Water Vapor', percentage: 0.03 },
    ],
    moonsCount: 2,
    notableMoons: ['Phobos', 'Deimos'],
    ncertFocus: 'Iron Oxide Regolith, Olympus Mons (22km high volcano), Valles Marineris Canyon',
    isroMission: 'Mangalyaan (Mars Orbiter Mission - historic first attempt success)',
    funFact:
      'Mars hosts Olympus Mons, a shield volcano three times taller than Mount Everest and as wide as France!',
    info: 'Known as the Red Planet, famous for its reddish appearance and potential for human colonization.',
    details:
      'The Red Planet features ancient dry river valleys, massive polar ice caps composed of water and dry ice (CO2), and evidence of ancient habitable waterways.',
    textures: {
      map: '/solar/textures/marsmap.jpg',
      bump: '/solar/textures/marsbump.jpg',
    },
    cameraDistance: 15,
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Gas Giant',
    color: '#FB923C',
    baseHex: 0xd8ca9d,
    radiusKm: 69911.0,
    displaySize: 69 / 4, // 17.25 scale from original
    orbitDistance: 200,
    actualDistAU: 5.2,
    orbitalPeriodDays: 4333,
    rotationHours: 9.93,
    axialTiltDeg: 3.13,
    surfaceGravity: 24.79,
    temperatureRange: '-145°C (Cloud tops)',
    avgTempC: -110,
    atmosphere: '90% Hydrogen, 10% Helium with Ammonia Clouds',
    atmosphereBreakdown: [
      { gas: 'Hydrogen', percentage: 89.8 },
      { gas: 'Helium', percentage: 10.2 },
      { gas: 'Methane & Ammonia', percentage: 0.3 },
    ],
    moonsCount: 95,
    notableMoons: ['Ganymede', 'Europa', 'Io', 'Callisto'],
    ncertFocus: 'Great Red Spot Anticyclonic Storm, Gravitational Shepherding of Asteroid Belt, Metallic Hydrogen',
    funFact:
      'Jupiter rotates in under 10 hours—faster than any other planet—causing it to visibly bulge at the equator!',
    info: 'The largest planet in our solar system, known for its Great Red Spot.',
    details:
      'A mammoth gas giant with mass 2.5 times that of all other planets combined. Its massive magnetosphere is 20,000 times stronger than Earth’s.',
    textures: {
      map: '/solar/textures/jupiter.jpg',
    },
    cameraDistance: 50,
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Gas Giant',
    color: '#FDE047',
    baseHex: 0xe2bf7d,
    radiusKm: 58232.0,
    displaySize: 58 / 4, // 14.5 scale from original
    orbitDistance: 270,
    actualDistAU: 9.58,
    orbitalPeriodDays: 10759,
    rotationHours: 10.7,
    axialTiltDeg: 26.73,
    surfaceGravity: 10.44,
    temperatureRange: '-178°C',
    avgTempC: -140,
    atmosphere: '96% Hydrogen, 3% Helium, 0.4% Methane',
    atmosphereBreakdown: [
      { gas: 'Hydrogen', percentage: 96.3 },
      { gas: 'Helium', percentage: 3.25 },
      { gas: 'Methane', percentage: 0.45 },
    ],
    moonsCount: 146,
    notableMoons: ['Titan', 'Enceladus', 'Mimas'],
    ncertFocus: 'Roche Limit, Ring Particle Dynamics (99% water ice), Less Dense than Water (0.687 g/cm³)',
    funFact: 'Saturn has a density lower than liquid water—if you had a bathtub big enough, Saturn would float!',
    info: 'Distinguished by its extensive ring system, the second-largest planet in our solar system.',
    details:
      'Adorned with thousands of dazzling ringlets made of water ice, rocky debris, and dust stretching up to 282,000 km across but only ~10 meters thick!',
    textures: {
      map: '/solar/textures/saturnmap.jpg',
      ring: {
        innerRadius: 18,
        outerRadius: 29,
        texture: '/solar/textures/saturn_ring.png',
      },
    },
    cameraDistance: 50,
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'Ice Giant',
    color: '#67E8F9',
    baseHex: 0x82b5c4,
    radiusKm: 25362.0,
    displaySize: 25 / 4, // 6.25 scale from original
    orbitDistance: 320,
    actualDistAU: 19.22,
    orbitalPeriodDays: 30687,
    rotationHours: -17.24,
    axialTiltDeg: 97.77,
    surfaceGravity: 8.69,
    temperatureRange: '-224°C (Coldest recorded)',
    avgTempC: -195,
    atmosphere: '83% Hydrogen, 15% Helium, 2% Methane',
    atmosphereBreakdown: [
      { gas: 'Hydrogen', percentage: 82.5 },
      { gas: 'Helium', percentage: 15.2 },
      { gas: 'Methane', percentage: 2.3 },
    ],
    moonsCount: 28,
    notableMoons: ['Miranda', 'Titania', 'Oberon', 'Ariel'],
    ncertFocus: 'Sideways Rotation (98° Tilt), Methane Absorption of Red Light, Retrograde Rotation',
    funFact:
      'Uranus rolls on its side as it orbits the Sun, likely knocked over by an ancient proto-planet collision!',
    info: 'Known for its unique sideways rotation and pale blue color.',
    details:
      'An ice giant with a slushy mantle of water, ammonia, and methane ices. Its magnetic poles are tilted 59 degrees away from its rotational axis.',
    textures: {
      map: '/solar/textures/uranus.jpg',
      ring: {
        innerRadius: 6,
        outerRadius: 8,
        texture: '/solar/textures/uranus_ring.png',
      },
    },
    cameraDistance: 25,
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'Ice Giant',
    color: '#3B82F6',
    baseHex: 0x4b70dd,
    radiusKm: 24622.0,
    displaySize: 24 / 4, // 6.0 scale from original
    orbitDistance: 340,
    actualDistAU: 30.05,
    orbitalPeriodDays: 60190,
    rotationHours: 16.11,
    axialTiltDeg: 28.32,
    surfaceGravity: 11.15,
    temperatureRange: '-218°C',
    avgTempC: -201,
    atmosphere: '80% Hydrogen, 19% Helium, 1.5% Methane',
    atmosphereBreakdown: [
      { gas: 'Hydrogen', percentage: 80.0 },
      { gas: 'Helium', percentage: 19.0 },
      { gas: 'Methane', percentage: 1.0 },
    ],
    moonsCount: 16,
    notableMoons: ['Triton', 'Proteus', 'Nereid'],
    ncertFocus: 'Supersonic Winds (>2,100 km/h), Mathematical Prediction by Le Verrier, Great Dark Spot',
    funFact:
      'Neptune was discovered through mathematical calculations before it was ever seen through a telescope!',
    info: 'The most distant planet from the Sun in our solar system, known for its deep blue color.',
    details:
      'The most distant major planet in our solar system. It generates internal heat that drives the fastest supersonic planetary winds measured anywhere in the Solar System.',
    textures: {
      map: '/solar/textures/neptune.jpg',
    },
    cameraDistance: 20,
  },
  {
    id: 'pluto',
    name: 'Pluto',
    type: 'Dwarf Planet',
    color: '#D1D5DB',
    baseHex: 0xc4b7a6,
    radiusKm: 1188.3,
    displaySize: 1.0,
    orbitDistance: 350,
    actualDistAU: 39.48,
    orbitalPeriodDays: 90560,
    rotationHours: -153.3,
    axialTiltDeg: 122.53,
    surfaceGravity: 0.62,
    temperatureRange: '-230°C to -223°C',
    avgTempC: -228,
    atmosphere: 'Thin Nitrogen, Methane, Carbon Monoxide haze',
    atmosphereBreakdown: [
      { gas: 'Nitrogen', percentage: 97.0 },
      { gas: 'Methane', percentage: 2.5 },
      { gas: 'Carbon Monoxide', percentage: 0.5 },
    ],
    moonsCount: 5,
    notableMoons: ['Charon', 'Nix', 'Hydra'],
    ncertFocus: 'IAU 2006 Planet Definition (Clearing the Orbit), Kuiper Belt, Tombaugh Regio Heart',
    funFact:
      "Pluto and its moon Charon are tidally locked to each other—they always show the same face to one another!",
    info: 'Originally classified as the ninth planet, Pluto is now considered a dwarf planet.',
    details:
      'Reclassified as a Dwarf Planet by the IAU in 2006 because it has not cleared its orbital neighborhood in the Kuiper Belt. Features a giant nitrogen-ice glacier named Tombaugh Regio.',
    textures: {
      map: '/solar/textures/plutomap.jpg',
      bump: '/solar/textures/plutobump2k.jpg',
    },
    cameraDistance: 10,
  },
];

export function SolarSystemPage() {
  const navigate = useNavigate();

  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'info' | 'gravity'>('info');
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('earth');
  const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false);
  const [showControlsDrawer, setShowControlsDrawer] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // GitHub Core Features: Live Slider States
  const [acceleration, setAcceleration] = useState<number>(1.0);
  const [accelerationOrbit, setAccelerationOrbit] = useState<number>(1.0);
  const [sunIntensity, setSunIntensity] = useState<number>(1.0); // exact default from GitHub repo
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);

  // Gravity Lab State
  const [earthWeightInput, setEarthWeightInput] = useState<number>(50);
  const [earthJumpInput, setEarthJumpInput] = useState<number>(45);

  // Three.js References
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const outlinePassRef = useRef<OutlinePass | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Dynamic references for non-reactive animation loop
  const accelerationRef = useRef(1.0);
  const accelerationOrbitRef = useRef(1.0);
  const isPausedRef = useRef(false);

  const sunMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const sunPointLightRef = useRef<THREE.PointLight | null>(null);

  // Tracking focused planet for 360 degree observation
  const focusedPlanetMeshRef = useRef<THREE.Mesh | null>(null);
  const lastPlanetWorldPosRef = useRef<THREE.Vector3 | null>(null);

  // Smooth Camera Glider
  const isTransitioningRef = useRef<boolean>(false);
  const transitionStartRef = useRef<number>(0);
  const transitionDurationRef = useRef<number>(1000);
  const startCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const startTargetPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const endCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const endTargetPosRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Planet Meshes map
  const planetMeshesRef = useRef<
    Map<
      string,
      {
        mesh: THREE.Mesh;
        pivot: THREE.Object3D;
        orbitLine?: THREE.LineLoop;
        atmosphere?: THREE.Mesh;
        ring?: THREE.Mesh;
        moons?: THREE.Mesh[];
        data: PlanetData;
      }
    >
  >(new Map());

  // Sync ref values
  useEffect(() => {
    accelerationRef.current = acceleration;
  }, [acceleration]);
  useEffect(() => {
    accelerationOrbitRef.current = accelerationOrbit;
  }, [accelerationOrbit]);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    spaceAudio.enabled = !isMuted;
  }, [isMuted]);

  // Camera transition initiator
  const startCameraTransition = (targetCamPos: THREE.Vector3, targetLookAt: THREE.Vector3) => {
    if (!cameraRef.current || !controlsRef.current) return;
    startCamPosRef.current.copy(cameraRef.current.position);
    startTargetPosRef.current.copy(controlsRef.current.target);
    endCamPosRef.current.copy(targetCamPos);
    endTargetPosRef.current.copy(targetLookAt);
    transitionStartRef.current = performance.now();
    isTransitioningRef.current = true;
  };

  // Fly to planet & open its description card
  const flyToPlanet = useCallback((planetId: string) => {
    setSelectedPlanetId(planetId);
    setShowInfoPanel(true);
    setActiveTab('info');
    spaceAudio.playFlyby();

    const body = CELESTIAL_BODIES.find((b) => b.id === planetId);
    if (!body || !cameraRef.current || !controlsRef.current) return;

    if (body.id === 'sun') {
      focusedPlanetMeshRef.current = null;
      lastPlanetWorldPosRef.current = null;
      if (outlinePassRef.current) outlinePassRef.current.selectedObjects = [];
      startCameraTransition(new THREE.Vector3(0, 30, 65), new THREE.Vector3(0, 0, 0));
    } else {
      const pEntry = planetMeshesRef.current.get(planetId);
      if (pEntry) {
        focusedPlanetMeshRef.current = pEntry.mesh;
        const worldPos = new THREE.Vector3();
        pEntry.mesh.getWorldPosition(worldPos);
        lastPlanetWorldPosRef.current = worldPos.clone();

        // Highlight with OutlinePass (matches original glowing outline!)
        if (outlinePassRef.current) {
          outlinePassRef.current.selectedObjects = [pEntry.mesh];
        }

        const camDistance = body.cameraDistance || 22;
        const targetCam = worldPos
          .clone()
          .add(new THREE.Vector3(camDistance * 0.8, camDistance * 0.4, camDistance * 0.8));
        startCameraTransition(targetCam, worldPos);
      }
    }
  }, []);

  // Return to Overview
  const resetCameraOverview = () => {
    spaceAudio.playClick();
    focusedPlanetMeshRef.current = null;
    lastPlanetWorldPosRef.current = null;
    if (outlinePassRef.current) outlinePassRef.current.selectedObjects = [];
    startCameraTransition(new THREE.Vector3(-175, 115, 5), new THREE.Vector3(0, 0, 0));
  };

  const closeInfoAndZoomOut = () => {
    setShowInfoPanel(false);
    resetCameraOverview();
  };

  // Live Slider Synced Sun Brightness
  useEffect(() => {
    if (sunMatRef.current) {
      sunMatRef.current.emissiveIntensity = sunIntensity;
    }
    if (sunPointLightRef.current) {
      sunPointLightRef.current.intensity = 600 * sunIntensity;
    }
  }, [sunIntensity]);

  // ==========================================
  // THREE.JS INITIALIZATION WITH POSTPROCESSING
  // ==========================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera (Exactly matching original perspective: 45 FOV at -175, 115, 5)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(-175, 115, 5);
    cameraRef.current = camera;

    // 3. WebGL Renderer with ACESFilmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Star Background (Authentic 6-Face Space Skybox from original repo!)
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    scene.background = cubeTextureLoader.load([
      '/solar/textures/3.jpg',
      '/solar/textures/1.jpg',
      '/solar/textures/2.jpg',
      '/solar/textures/2.jpg',
      '/solar/textures/4.jpg',
      '/solar/textures/2.jpg',
    ]);

    // 5. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Using intelligent Zoom-to-Cursor below
    controls.enableRotate = true;
    controls.rotateSpeed = 0.8;
    controls.enablePan = true;
    controls.panSpeed = 0.8;
    controls.minDistance = 2;
    controls.maxDistance = 2000;
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      isTransitioningRef.current = false;
    });

    // 6. Postprocessing Setup (EffectComposer + BloomPass + OutlinePass)
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composerRef.current = composer;

    // Outline Pass (Glowing white border on selected or hovered planet, exactly like original demo!)
    const outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    outlinePass.edgeStrength = 4.2;
    outlinePass.edgeGlow = 1.4;
    outlinePass.edgeThickness = 2.2;
    outlinePass.visibleEdgeColor.set(0xffffff);
    outlinePass.hiddenEdgeColor.set(0x190a05);
    composer.addPass(outlinePass);
    outlinePassRef.current = outlinePass;

    // Unreal Bloom Pass (Gentle, realistic sun glow matching original demo!)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.55, 0.4, 1.0);
    bloomPass.threshold = 1.0; // Strictly HDR: only the sun can bloom, asteroids and planets stay clean
    bloomPass.radius = 0.5;
    composer.addPass(bloomPass);

    // 7. Lighting (Matching original parameters with physical falloff for outer planets)
    const lightAmbient = new THREE.AmbientLight(0x222222, 5.0);
    scene.add(lightAmbient);

    const pointLight = new THREE.PointLight(0xfdffd3, 800 * sunIntensity, 450, 1.3);
    pointLight.position.set(0, 0, 0);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;
    scene.add(pointLight);
    sunPointLightRef.current = pointLight;

    // 8. Texture Loader & GLTF Loader
    const loadTexture = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();

    // 9. The Sun (Warm golden solar star with visible surface texture matching original demo)
    const sunSize = 697 / 40;
    const sunGeom = new THREE.SphereGeometry(sunSize, 48, 36);
    const sunTexture = loadTexture.load('/solar/textures/sun.jpg');
    sunTexture.colorSpace = THREE.SRGBColorSpace;

    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xffb732,
      emissive: 0xff9800,
      emissiveMap: sunTexture,
      emissiveIntensity: 1.0,
      roughness: 1.0,
    });
    sunMatRef.current = sunMat;
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    scene.add(sunMesh);

    // 10. Earth Day/Night Custom Shader Material (Original high-tech shader with smooth terminator!)
    const earthDayTex = loadTexture.load('/solar/textures/earth_daymap.jpg');
    earthDayTex.colorSpace = THREE.SRGBColorSpace;
    const earthNightTex = loadTexture.load('/solar/textures/earth_nightmap.jpg');
    earthNightTex.colorSpace = THREE.SRGBColorSpace;

    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: earthDayTex },
        nightTexture: { value: earthNightTex },
        sunPosition: { value: new THREE.Vector3(0, 0, 0) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vSunDirection;
        uniform vec3 sunPosition;

        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
          vSunDirection = normalize(sunPosition - worldPosition.xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;

        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vSunDirection;

        void main() {
          float cosTheta = dot(vNormal, vSunDirection);
          float intensity = smoothstep(-0.06, 0.18, cosTheta);
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv) * 0.45;
          gl_FragColor = mix(nightColor, dayColor, intensity);
        }
      `,
    });

    // 11. Create Celestial Planets (Original MeshPhongMaterial + Bump Scaling)
    CELESTIAL_BODIES.forEach((body) => {
      if (body.id === 'sun') {
        const pivot = new THREE.Object3D();
        scene.add(pivot);
        pivot.add(sunMesh);
        planetMeshesRef.current.set(body.id, { mesh: sunMesh, pivot, data: body });
        return;
      }

      let material: THREE.Material;
      if (body.id === 'earth') {
        material = earthMaterial;
      } else if (body.textures.bump) {
        const map = loadTexture.load(body.textures.map);
        map.colorSpace = THREE.SRGBColorSpace;
        const bump = loadTexture.load(body.textures.bump);
        material = new THREE.MeshPhongMaterial({
          map,
          bumpMap: bump,
          bumpScale: 0.7,
        });
      } else {
        const map = loadTexture.load(body.textures.map);
        map.colorSpace = THREE.SRGBColorSpace;
        material = new THREE.MeshPhongMaterial({
          map,
        });
      }

      const geom = new THREE.SphereGeometry(body.displaySize, 36, 24);
      const planetMesh = new THREE.Mesh(geom, material);
      planetMesh.castShadow = true;
      planetMesh.receiveShadow = true;
      const planet3d = new THREE.Object3D();
      const planetSystem = new THREE.Group();
      planetSystem.add(planetMesh);

      planetMesh.position.x = body.orbitDistance;
      planetMesh.rotation.z = (body.axialTiltDeg * Math.PI) / 180;

      // Elliptical Orbit Loop (From original repo - crisp white lines)
      const orbitPath = new THREE.EllipseCurve(
        0,
        0,
        body.orbitDistance,
        body.orbitDistance,
        0,
        2 * Math.PI,
        false,
        0
      );
      const pathPoints = orbitPath.getPoints(140);
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.10, // Subtle, clean orbital ring matching original repo
      });
      const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      planetSystem.add(orbit);

      // Rings (Saturn / Uranus with original geometries)
      let ringMesh: THREE.Mesh | undefined;
      if (body.textures.ring) {
        const ring = body.textures.ring;
        const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 64);
        const ringTex = loadTexture.load(ring.texture);
        ringTex.colorSpace = THREE.SRGBColorSpace;
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
        });
        ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.receiveShadow = true;
        planetSystem.add(ringMesh);
        ringMesh.position.x = body.orbitDistance;
        ringMesh.rotation.x = -0.5 * Math.PI;
        ringMesh.rotation.y = (-body.axialTiltDeg * Math.PI) / 180;
      }

      // Atmosphere (Venus / Earth original atmospheric layers)
      let atmosphereMesh: THREE.Mesh | undefined;
      if (body.textures.atmosphere) {
        const atmosGeom = new THREE.SphereGeometry(body.displaySize + 0.12, 36, 24);
        const atmosTex = loadTexture.load(body.textures.atmosphere);
        atmosTex.colorSpace = THREE.SRGBColorSpace;
        const atmosMat = new THREE.MeshPhongMaterial({
          map: atmosTex,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
        });
        atmosphereMesh = new THREE.Mesh(atmosGeom, atmosMat);
        planetMesh.add(atmosphereMesh);
      }

      // Earth's Moon
      const moonMeshes: THREE.Mesh[] = [];
      if (body.id === 'earth') {
        const moonGeo = new THREE.SphereGeometry(1.5, 24, 18);
        const moonTex = loadTexture.load('/solar/textures/moonmap.jpg');
        moonTex.colorSpace = THREE.SRGBColorSpace;
        const moonBump = loadTexture.load('/solar/textures/moonbump.jpg');
        const moonMat = new THREE.MeshStandardMaterial({
          map: moonTex,
          bumpMap: moonBump,
          bumpScale: 0.5,
        });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.castShadow = true;
        moonMesh.receiveShadow = true;
        moonMesh.position.set(10.5, 0, 0);
        planetSystem.add(moonMesh);
        moonMeshes.push(moonMesh);
      }

      // Mars Moons with authentic 3D models (Phobos and Deimos)
      if (body.id === 'mars') {
        const marsMoonsConfig = [
          { path: '/solar/models/mars/phobos.glb', scale: 0.1, dist: 5.5, speed: 0.002 },
          { path: '/solar/models/mars/deimos.glb', scale: 0.08, dist: 9.0, speed: 0.0008 },
        ];
        marsMoonsConfig.forEach((cfg) => {
          gltfLoader.load(cfg.path, (gltf) => {
            const moonObj = gltf.scene;
            moonObj.scale.setScalar(cfg.scale);
            moonObj.position.set(cfg.dist, 0, 0);
            planetSystem.add(moonObj);
            moonObj.userData = { orbitDist: cfg.dist, orbitSpeed: cfg.speed };
            moonMeshes.push(moonObj as unknown as THREE.Mesh);
          });
        });
      }

      // Jupiter Galilean Moons (From original repo)
      if (body.id === 'jupiter') {
        const moonsData = [
          { name: 'Io', size: 1.6, dist: 22, tex: '/solar/textures/jupiterIo.jpg' },
          { name: 'Europa', size: 1.4, dist: 27, tex: '/solar/textures/jupiterEuropa.jpg' },
          { name: 'Ganymede', size: 2.0, dist: 33, tex: '/solar/textures/jupiterGanymede.jpg' },
          { name: 'Callisto', size: 1.7, dist: 38, tex: '/solar/textures/jupiterCallisto.jpg' },
        ];
        moonsData.forEach((m) => {
          const mGeom = new THREE.SphereGeometry(m.size, 20, 16);
          const mTex = loadTexture.load(m.tex);
          mTex.colorSpace = THREE.SRGBColorSpace;
          const mMat = new THREE.MeshStandardMaterial({ map: mTex });
          const mMesh = new THREE.Mesh(mGeom, mMat);
          mMesh.castShadow = true;
          mMesh.receiveShadow = true;
          mMesh.position.set(m.dist, 0, 0);
          planetSystem.add(mMesh);
          moonMeshes.push(mMesh);
        });
      }

      planet3d.add(planetSystem);
      scene.add(planet3d);

      planetMeshesRef.current.set(body.id, {
        mesh: planetMesh,
        pivot: planet3d,
        orbitLine: orbit,
        atmosphere: atmosphereMesh,
        ring: ringMesh,
        moons: moonMeshes,
        data: body,
      });
    });

    // 12. Main Asteroid Belt & Outer Kuiper Belt (Authentic 3D asteroidPack.glb from original demo!)
    const asteroidGroup = new THREE.Group();
    scene.add(asteroidGroup);

    gltfLoader.load(
      '/solar/asteroids/asteroidPack.glb',
      (gltf) => {
        const rockMeshes: THREE.Mesh[] = [];
        gltf.scene.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            rockMeshes.push(c as THREE.Mesh);
          }
        });

        if (rockMeshes.length === 0) return;

        const dummy = new THREE.Object3D();

        rockMeshes.forEach((mesh) => {
          // Clone material with realistic dark stony asteroid tone (not reflective or white)
          const rockMat = (mesh.material as THREE.MeshStandardMaterial).clone();
          rockMat.color.set(0x77726f);
          rockMat.roughness = 0.95;
          rockMat.metalness = 0.05;

          // 1. Main Belt (between Mars 115 and Jupiter 200: 130 to 160)
          const mainCount = 95;
          const instMain = new THREE.InstancedMesh(mesh.geometry, rockMat, mainCount);
          instMain.receiveShadow = true;

          for (let i = 0; i < mainCount; i++) {
            const radius = THREE.MathUtils.randFloat(130, 160);
            const angle = Math.random() * Math.PI * 2;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            const y = (Math.random() - 0.5) * 5.0;

            dummy.position.set(x, y, z);
            dummy.rotation.set(
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2
            );
            const scale = THREE.MathUtils.randFloat(0.75, 1.25);
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            instMain.setMatrixAt(i, dummy.matrix);
          }
          instMain.instanceMatrix.needsUpdate = true;
          asteroidGroup.add(instMain);

          // 2. Kuiper Belt (352 to 372)
          const kuiperCount = 140;
          const instKuiper = new THREE.InstancedMesh(mesh.geometry, rockMat, kuiperCount);
          instKuiper.receiveShadow = true;

          for (let i = 0; i < kuiperCount; i++) {
            const radius = THREE.MathUtils.randFloat(352, 372);
            const angle = Math.random() * Math.PI * 2;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            const y = (Math.random() - 0.5) * 6.0;

            dummy.position.set(x, y, z);
            dummy.rotation.set(
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2
            );
            const scale = THREE.MathUtils.randFloat(0.9, 1.5);
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            instKuiper.setMatrixAt(i, dummy.matrix);
          }
          instKuiper.instanceMatrix.needsUpdate = true;
          asteroidGroup.add(instKuiper);
        });
      },
      undefined,
      (err) => console.error('Failed to load asteroid pack:', err)
    );

    // 13. Hover Outline & Click-to-Fly Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9999, -9999);
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerDown = (event: MouseEvent) => {
      pointerDownPos = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: MouseEvent) => {
      const dist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
      if (dist > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const targets: { id: string; mesh: THREE.Object3D }[] = [];
      planetMeshesRef.current.forEach((val, id) => {
        targets.push({ id, mesh: val.mesh });
        if (val.atmosphere) {
          targets.push({ id, mesh: val.atmosphere });
        }
      });

      const intersects = raycaster.intersectObjects(targets.map((t) => t.mesh));
      if (intersects.length > 0) {
        const hit = targets.find((t) => t.mesh === intersects[0].object);
        if (hit) flyToPlanet(hit.id);
      }
    };

    const handleDblClick = (event: MouseEvent) => {
      handlePointerUp(event);
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('dblclick', handleDblClick);

    // 14. Contextual Zoom-To-Cursor (Zooms directly into the world under cursor!)
    const onCanvasWheel = (event: WheelEvent) => {
      event.preventDefault();
      isTransitioningRef.current = false;

      const rect = renderer.domElement.getBoundingClientRect();
      const mouseNdc = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const wheelRay = new THREE.Raycaster();
      wheelRay.setFromCamera(mouseNdc, camera);

      const targets = Array.from(planetMeshesRef.current.entries()).map(([id, val]) => ({
        id,
        mesh: val.mesh,
        size: val.data.displaySize,
      }));

      const intersects = wheelRay.intersectObjects(targets.map((t) => t.mesh));
      let targetPoint = new THREE.Vector3();
      let targetedPlanetId: string | null = null;

      if (intersects.length > 0) {
        targetPoint.copy(intersects[0].point);
        const hit = targets.find((t) => t.mesh === intersects[0].object);
        if (hit) targetedPlanetId = hit.id;
      } else {
        let closestDist = Infinity;
        let bestPos: THREE.Vector3 | null = null;
        let bestId: string | null = null;

        targets.forEach((t) => {
          const wPos = new THREE.Vector3();
          t.mesh.getWorldPosition(wPos);
          const distToRay = wheelRay.ray.distanceToPoint(wPos);
          const threshold = Math.max(t.size * 2.8, 10);
          if (distToRay < threshold && distToRay < closestDist) {
            closestDist = distToRay;
            bestPos = wPos;
            bestId = t.id;
          }
        });

        if (bestPos && bestId) {
          targetPoint.copy(bestPos);
          targetedPlanetId = bestId;
        } else {
          const camDir = new THREE.Vector3();
          camera.getWorldDirection(camDir);
          const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, controls.target);
          const planeIntersect = new THREE.Vector3();
          if (wheelRay.ray.intersectPlane(plane, planeIntersect)) {
            targetPoint.copy(planeIntersect);
          } else {
            targetPoint.copy(controls.target);
          }
        }
      }

      const zoomSensitivity = 0.0016;
      const zoomFactor = Math.exp(event.deltaY * zoomSensitivity);
      const clampedFactor = THREE.MathUtils.clamp(zoomFactor, 0.75, 1.35);

      const camOffset = camera.position.clone().sub(targetPoint);
      const targetOffset = controls.target.clone().sub(targetPoint);

      const newCamPos = targetPoint.clone().add(camOffset.multiplyScalar(clampedFactor));
      const newTarget = targetPoint.clone().add(targetOffset.multiplyScalar(clampedFactor));

      const dist = newCamPos.length();
      if (dist > 2 && dist < 2500) {
        camera.position.copy(newCamPos);
        controls.target.copy(newTarget);
      }

      if (targetedPlanetId && event.deltaY < 0) {
        const pEntry = planetMeshesRef.current.get(targetedPlanetId);
        if (pEntry) {
          const pWorldPos = new THREE.Vector3();
          pEntry.mesh.getWorldPosition(pWorldPos);
          if (camera.position.distanceTo(pWorldPos) < (pEntry.data.cameraDistance || 25) * 3) {
            focusedPlanetMeshRef.current = pEntry.mesh;
            lastPlanetWorldPosRef.current = pWorldPos.clone();
            setSelectedPlanetId(targetedPlanetId);
            setShowInfoPanel(true);
            setActiveTab('info');
            if (outlinePassRef.current) outlinePassRef.current.selectedObjects = [pEntry.mesh];
          }
        }
      }

      if (event.deltaY > 0 && camera.position.length() > 380 && !focusedPlanetMeshRef.current) {
        controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.12);
      }

      controls.update();
    };

    renderer.domElement.addEventListener('wheel', onCanvasWheel, { passive: false });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      outlinePass.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 15. Animation Loop with EffectComposer rendering
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const currentAccel = accelerationRef.current;
      const currentOrbitAccel = accelerationOrbitRef.current;
      const paused = isPausedRef.current;

      // Sun self rotation
      sunMesh.rotateY(0.001 * currentAccel);

      // Revolving & rotating planets (Matching original speed factors!)
      planetMeshesRef.current.forEach((item, id) => {
        if (id === 'sun') return;

        // Axial Rotation
        const rotBase = 0.005;
        item.mesh.rotateY(rotBase * currentAccel * (item.data.rotationHours < 0 ? -1 : 1));

        if (item.atmosphere) {
          item.atmosphere.rotateY(0.002 * currentAccel);
        }

        // Heliocentric Orbital Revolution
        if (!paused && item.data.orbitalPeriodDays > 0) {
          const orbitSpeed = (0.2 / Math.sqrt(item.data.orbitDistance)) * 0.02 * currentOrbitAccel;
          item.pivot.rotateY(orbitSpeed);
        }

        // Animate Moons (Earth's Moon with 5 deg tilt angle from original)
        if (!paused && item.moons && item.moons.length > 0) {
          const time = performance.now();
          item.moons.forEach((m, idx) => {
            const moonSpeed = 0.001 * (idx + 1) * currentOrbitAccel;
            const moonDist = 10 + idx * 4;
            const tilt = (5 * Math.PI) / 180;
            const mX = item.mesh.position.x + moonDist * Math.cos(time * moonSpeed);
            const mY = moonDist * Math.sin(time * moonSpeed) * Math.sin(tilt);
            const mZ = item.mesh.position.z + moonDist * Math.sin(time * moonSpeed) * Math.cos(tilt);
            m.position.set(mX, mY, mZ);
            m.rotateY(0.01);
          });
        }
      });

      // Asteroid Ring Rotation
      if (!paused) {
        asteroidGroup.rotation.y += 0.00015 * currentOrbitAccel;
      }

      // Outline Pass: Highlight hovered or focused planet (Matches original demo!)
      raycaster.setFromCamera(mouse, camera);
      const hoverTargets: THREE.Object3D[] = [];
      planetMeshesRef.current.forEach((val, id) => {
        if (id !== 'sun') {
          hoverTargets.push(val.mesh);
          if (val.atmosphere) hoverTargets.push(val.atmosphere);
        }
      });

      const hoverIntersects = raycaster.intersectObjects(hoverTargets);
      if (hoverIntersects.length > 0) {
        const hitObj = hoverIntersects[0].object;
        let targetMesh: THREE.Object3D = hitObj;
        planetMeshesRef.current.forEach((p) => {
          if (p.atmosphere === hitObj) targetMesh = p.mesh;
        });
        if (outlinePassRef.current) outlinePassRef.current.selectedObjects = [targetMesh];
        renderer.domElement.style.cursor = 'pointer';
      } else if (focusedPlanetMeshRef.current) {
        if (outlinePassRef.current) outlinePassRef.current.selectedObjects = [focusedPlanetMeshRef.current];
        renderer.domElement.style.cursor = 'default';
      } else {
        if (outlinePassRef.current) outlinePassRef.current.selectedObjects = [];
        renderer.domElement.style.cursor = 'default';
      }

      // Smooth Camera Transition
      if (isTransitioningRef.current) {
        const elapsed = performance.now() - transitionStartRef.current;
        const progress = Math.min(1.0, elapsed / transitionDurationRef.current);
        const ease = 1 - Math.pow(1 - progress, 3);

        camera.position.lerpVectors(startCamPosRef.current, endCamPosRef.current, ease);
        controls.target.lerpVectors(startTargetPosRef.current, endTargetPosRef.current, ease);

        if (progress >= 1.0) {
          isTransitioningRef.current = false;
        }
      } else if (focusedPlanetMeshRef.current) {
        const currentWorldPos = new THREE.Vector3();
        focusedPlanetMeshRef.current.getWorldPosition(currentWorldPos);

        if (lastPlanetWorldPosRef.current) {
          const deltaMove = currentWorldPos.clone().sub(lastPlanetWorldPosRef.current);
          camera.position.add(deltaMove);
          controls.target.add(deltaMove);
        }
        lastPlanetWorldPosRef.current = currentWorldPos.clone();
      }

      controls.update();
      composer.render();
    };

    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('dblclick', handleDblClick);
      renderer.domElement.removeEventListener('wheel', onCanvasWheel);
      renderer.dispose();
    };
  }, [flyToPlanet]);

  // Sync Orbit Line Visibility
  useEffect(() => {
    planetMeshesRef.current.forEach((item) => {
      if (item.orbitLine) {
        item.orbitLine.visible = showOrbits;
      }
    });
  }, [showOrbits]);

  const currentPlanet = useMemo(() => {
    return CELESTIAL_BODIES.find((p) => p.id === selectedPlanetId) || CELESTIAL_BODIES[3];
  }, [selectedPlanetId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black font-sans text-slate-100 flex flex-col select-none">
      {/* ==================================================== */}
      {/* 1. TOP SLEEK COMPACT HEADER                          */}
      {/* ==================================================== */}
      <header className="z-30 h-11 shrink-0 flex items-center justify-between px-3 sm:px-4 bg-slate-950/85 backdrop-blur-md border-b border-cyan-900/40">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate('/playlab')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition border border-cyan-800/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PlayLab</span>
          </button>

          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <h1 className="text-xs sm:text-sm font-bold tracking-wide text-white flex items-center gap-1.5">
              Solar Odyssey 3D
              <span className="hidden md:inline-block text-[9px] uppercase px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
                NCERT High-Fidelity Physics
              </span>
            </h1>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              spaceAudio.playClick();
              setActiveTab('info');
              setShowInfoPanel(true);
            }}
            className={clsx(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5',
              activeTab === 'info' && showInfoPanel
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Planet Info</span>
          </button>

          <button
            onClick={() => {
              spaceAudio.playClick();
              setActiveTab('gravity');
              setShowInfoPanel(true);
            }}
            className={clsx(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5',
              activeTab === 'gravity' && showInfoPanel
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Gravity Lab</span>
          </button>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowControlsDrawer(!showControlsDrawer)}
            className={clsx(
              'flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition',
              showControlsDrawer
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            )}
            title="Adjust Sun Brightness, Rotation & Orbit Speed"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 transition"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ==================================================== */}
      {/* 2. 3D VIEWPORT CONTAINER                              */}
      {/* ==================================================== */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* 3D WebGL Canvas with Postprocessing */}
        <div
          ref={mountRef}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        />

        {/* ==================================================== */}
        {/* ORIGINAL DAT.GUI STYLE HUD (Top-Right / Top-Left)    */}
        {/* ==================================================== */}
        {/* AUTHENTIC DAT.GUI STYLE HUD (Top-Left)               */}
        {/* ==================================================== */}
        <div className="absolute top-3 left-3 z-30 flex flex-col items-start space-y-1.5 select-none font-mono">
          <div className="w-64 bg-[#1a1a1a]/95 text-neutral-200 border border-neutral-700/60 shadow-2xl rounded-sm overflow-hidden text-[11px]">
            {showControlsDrawer && (
              <div className="divide-y divide-neutral-800">
                {/* 1. accelerationOrbit */}
                <div className="flex items-center px-2 py-1.5 bg-[#1f1f1f] hover:bg-[#252525] transition">
                  <span className="w-32 truncate text-neutral-300">accelerationOrbit</span>
                  <div className="flex-1 flex items-center space-x-1.5">
                    <input
                      type="range"
                      min="0.0"
                      max="10.0"
                      step="0.1"
                      disabled={isPaused}
                      value={accelerationOrbit}
                      onChange={(e) => setAccelerationOrbit(parseFloat(e.target.value))}
                      className="w-full h-2 bg-neutral-700 rounded-none appearance-none cursor-pointer accent-[#2fa1d6]"
                    />
                    <span className="w-7 text-right text-cyan-400 font-bold">
                      {isPaused ? '0' : accelerationOrbit.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* 2. acceleration */}
                <div className="flex items-center px-2 py-1.5 bg-[#1f1f1f] hover:bg-[#252525] transition">
                  <span className="w-32 truncate text-neutral-300">acceleration</span>
                  <div className="flex-1 flex items-center space-x-1.5">
                    <input
                      type="range"
                      min="0.0"
                      max="10.0"
                      step="0.1"
                      value={acceleration}
                      onChange={(e) => setAcceleration(parseFloat(e.target.value))}
                      className="w-full h-2 bg-neutral-700 rounded-none appearance-none cursor-pointer accent-[#2fa1d6]"
                    />
                    <span className="w-7 text-right text-cyan-400 font-bold">
                      {acceleration.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* 3. sunIntensity */}
                <div className="flex items-center px-2 py-1.5 bg-[#1f1f1f] hover:bg-[#252525] transition">
                  <span className="w-32 truncate text-neutral-300">sunIntensity</span>
                  <div className="flex-1 flex items-center space-x-1.5">
                    <input
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.1"
                      value={sunIntensity}
                      onChange={(e) => setSunIntensity(parseFloat(e.target.value))}
                      className="w-full h-2 bg-neutral-700 rounded-none appearance-none cursor-pointer accent-[#2fa1d6]"
                    />
                    <span className="w-7 text-right text-cyan-400 font-bold">
                      {sunIntensity.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Close Controls toggle bar */}
            <button
              onClick={() => setShowControlsDrawer(!showControlsDrawer)}
              className="w-full py-1 text-center bg-[#282828] hover:bg-[#333333] text-neutral-300 text-[10px] tracking-wider transition border-t border-neutral-700/40"
            >
              {showControlsDrawer ? 'Close Controls' : 'Open Controls'}
            </button>
          </div>

          {/* Quick HUD Toolbar */}
          <div className="flex items-center space-x-1 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg border border-neutral-800 text-[11px]">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={clsx(
                'px-1.5 py-0.5 rounded transition flex items-center gap-1',
                isPaused ? 'text-amber-400 bg-amber-950/50' : 'text-neutral-300 hover:text-white'
              )}
              title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            >
              {isPaused ? <Play className="w-3 h-3 fill-amber-400" /> : <Pause className="w-3 h-3" />}
              <span>{isPaused ? 'Paused' : 'Pause'}</span>
            </button>

            <span className="text-neutral-700">|</span>

            <button
              onClick={resetCameraOverview}
              className="px-1.5 py-0.5 rounded text-neutral-300 hover:text-cyan-400 transition"
              title="Reset camera to Heliocentric Overview (-175, 115, 5)"
            >
              Overview
            </button>

            <span className="text-neutral-700">|</span>

            <button
              onClick={() => setShowOrbits(!showOrbits)}
              className={clsx(
                'px-1.5 py-0.5 rounded transition',
                showOrbits ? 'text-cyan-400' : 'text-neutral-500'
              )}
              title="Toggle Orbital Path Lines"
            >
              Orbits {showOrbits ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* PLANET DESCRIPTION CARD & GRAVITY LAB (Right side)   */}
        {/* ==================================================== */}
        <AnimatePresence>
          {showInfoPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-3 right-3 z-20 w-80 sm:w-96 max-h-[calc(100vh-6.5rem)] flex flex-col pointer-events-auto"
            >
              {/* TAB 1: PLANET DESCRIPTION CARD (Matches original showPlanetInfo) */}
              {activeTab === 'info' && (
                <div className="p-4 rounded-3xl bg-black/85 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: currentPlanet.color }}
                        />
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                          {currentPlanet.type}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-white mt-0.5">{currentPlanet.name}</h2>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={closeInfoAndZoomOut}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-800"
                        title="Close and zoom out to Solar System overview"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Planet Description */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                      {currentPlanet.info}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      {currentPlanet.details}
                    </p>
                  </div>

                  {/* Physical Data Table (Radius, Tilt, Rotation, Orbit, Distance, Gravity, Moons) */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase block font-sans">Radius</span>
                      <span className="text-xs font-bold text-white">{currentPlanet.radiusKm.toLocaleString()} km</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase block font-sans">Tilt</span>
                      <span className="text-xs font-bold text-amber-300">{currentPlanet.axialTiltDeg}°</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase block font-sans">Rotation</span>
                      <span className="text-xs font-bold text-cyan-300">{Math.abs(currentPlanet.rotationHours)} hrs</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase block font-sans">Orbit</span>
                      <span className="text-xs font-bold text-emerald-300">
                        {currentPlanet.orbitalPeriodDays > 0 ? `${currentPlanet.orbitalPeriodDays} d` : 'Center'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase block font-sans">Distance</span>
                      <span className="text-xs font-bold text-white">{currentPlanet.actualDistAU} AU</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase block font-sans">Gravity</span>
                      <span className="text-xs font-bold text-white">{currentPlanet.surfaceGravity} m/s²</span>
                    </div>
                  </div>

                  {/* Moons */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Moons:</span>
                    <span className="font-bold text-amber-300 font-mono">
                      {currentPlanet.moonsCount} {currentPlanet.notableMoons.length > 0 && `(${currentPlanet.notableMoons.join(', ')})`}
                    </span>
                  </div>

                  {/* NCERT Syllabus Concept */}
                  <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-800/50">
                    <div className="flex items-center space-x-1.5 text-cyan-400 text-xs font-bold mb-1">
                      <Info className="w-3.5 h-3.5" />
                      <span>NCERT Curriculum Focus</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{currentPlanet.ncertFocus}</p>
                  </div>

                  {/* Zoom out button */}
                  <button
                    onClick={closeInfoAndZoomOut}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-slate-800"
                  >
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Zoom Out to Full Solar System</span>
                  </button>
                </div>
              )}

              {/* TAB 2: GRAVITY LAB (SHOWS ALL PLANETS AT ONCE) */}
              {activeTab === 'gravity' && (
                <div className="p-4 rounded-3xl bg-black/85 backdrop-blur-xl border border-slate-800 shadow-2xl flex flex-col space-y-3 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-emerald-400" />
                        Planetary Gravity & Jump Lab
                      </h3>
                      <p className="text-[10px] text-slate-400">Real-time weight & agility comparison across all worlds</p>
                    </div>
                    <button onClick={() => setShowInfoPanel(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Input Baseline */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Your Earth Weight:</span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min={10}
                          max={200}
                          value={earthWeightInput}
                          onChange={(e) => setEarthWeightInput(Number(e.target.value) || 50)}
                          className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-right font-mono text-cyan-300 font-bold"
                        />
                        <span className="text-slate-400">kg</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Your Earth Jump:</span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min={10}
                          max={150}
                          value={earthJumpInput}
                          onChange={(e) => setEarthJumpInput(Number(e.target.value) || 45)}
                          className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-right font-mono text-amber-300 font-bold"
                        />
                        <span className="text-slate-400">cm</span>
                      </div>
                    </div>
                  </div>

                  {/* ALL PLANETS COMPARISON TABLE */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-2 uppercase tracking-wider">
                      <span>Celestial World</span>
                      <div className="flex space-x-4">
                        <span>Weight</span>
                        <span>Jump</span>
                      </div>
                    </div>

                    {CELESTIAL_BODIES.map((b) => {
                      const weight = ((earthWeightInput * b.surfaceGravity) / 9.807).toFixed(1);
                      const jump = b.surfaceGravity > 0 ? ((earthJumpInput * 9.807) / b.surfaceGravity).toFixed(0) : '0';
                      const ratio = b.surfaceGravity > 0 ? (9.807 / b.surfaceGravity).toFixed(1) : '0';
                      const isCurrent = b.id === selectedPlanetId;

                      return (
                        <div
                          key={b.id}
                          onClick={() => flyToPlanet(b.id)}
                          className={clsx(
                            'p-2 rounded-xl border flex items-center justify-between cursor-pointer transition',
                            isCurrent
                              ? 'bg-emerald-950/60 border-emerald-500/70 text-white shadow-md'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                            <div>
                              <span className="font-bold text-xs block">{b.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">g = {b.surfaceGravity} m/s²</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 font-mono text-right">
                            <div className="w-14">
                              <span className="font-bold text-cyan-300 text-xs block">{weight} kg</span>
                            </div>
                            <div className="w-16">
                              <span className="font-bold text-amber-300 text-xs block">{jump} cm</span>
                              <span className="text-[9px] text-slate-400 block font-sans">({ratio}x)</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================================================== */}
        {/* 3. BOTTOM SLEEK PLANET BAR                           */}
        {/* ==================================================== */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1 p-1 rounded-2xl bg-black/85 backdrop-blur-xl border border-slate-800 shadow-2xl overflow-x-auto max-w-[96vw]">
          <button
            onClick={resetCameraOverview}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700/60 transition whitespace-nowrap"
            title="Solar System Overview"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Solar System</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {CELESTIAL_BODIES.map((body) => {
            const isSelected = selectedPlanetId === body.id;
            return (
              <button
                key={body.id}
                onClick={() => flyToPlanet(body.id)}
                className={clsx(
                  'px-2.5 py-1 rounded-xl text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap border',
                  isSelected
                    ? 'bg-cyan-500/25 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                    : 'bg-slate-950/50 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800'
                )}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block ring-1 ring-white/20"
                  style={{ backgroundColor: body.color }}
                />
                <span>{body.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
