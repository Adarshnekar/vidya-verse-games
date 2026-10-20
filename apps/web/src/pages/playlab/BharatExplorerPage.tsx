import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  MapPin,
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Mountain,
  Sun,
  Waves,
  Trees,
  Landmark,
  Award,
  ChevronRight,
  BookOpen,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../stores/authStore';

// ==========================================
// TYPES & CONSTANTS
// ==========================================

export interface StateRegion {
  id: string;
  name: string;
  capital: string;
  zone: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast';
  terrain: string;
  pathD: string;
  labelCoord: { x: number; y: number };
  facts: string[];
}

export interface MissionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExpeditionMission {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  stateIds: string[];
  badgeName: string;
  badgeIcon: string;
  description: string;
  questions: MissionQuestion[];
}

// 22 Representative Geographic Polygons for India Map (Coordinate Space: 0 0 600 700)
const INDIA_STATES: StateRegion[] = [
  {
    id: 'ladakh_jk',
    name: 'Ladakh & Jammu-Kashmir',
    capital: 'Srinagar / Leh',
    zone: 'North',
    terrain: 'Himalayan Glaciers & Cold Desert',
    labelCoord: { x: 230, y: 85 },
    pathD:
      'M 190,50 L 260,30 L 320,65 L 300,120 L 250,140 L 210,130 L 175,100 Z',
    facts: ['Home to Siachen Glacier and Pangong Tso Lake', 'Zoji La and Khardung La passes'],
  },
  {
    id: 'himachal_uttarakhand',
    name: 'Himachal & Uttarakhand',
    capital: 'Shimla / Dehradun',
    zone: 'North',
    terrain: 'Alpine Valleys & Sacred River Origins',
    labelCoord: { x: 255, y: 160 },
    pathD:
      'M 210,130 L 250,140 L 300,120 L 315,160 L 290,195 L 245,185 L 225,150 Z',
    facts: ['Origin of sacred rivers Ganga (Gangotri) & Yamuna', 'Nanda Devi National Park'],
  },
  {
    id: 'punjab_haryana',
    name: 'Punjab & Haryana',
    capital: 'Chandigarh',
    zone: 'North',
    terrain: 'Fertile Alluvial Plains',
    labelCoord: { x: 195, y: 175 },
    pathD: 'M 175,100 L 210,130 L 225,150 L 210,195 L 170,185 L 165,140 Z',
    facts: ['The granary of India and cradle of Green Revolution', 'Land of 5 Rivers'],
  },
  {
    id: 'delhi',
    name: 'Delhi NCT',
    capital: 'New Delhi',
    zone: 'North',
    terrain: 'National Capital Territory',
    labelCoord: { x: 232, y: 202 },
    pathD: 'M 225,195 L 240,195 L 240,210 L 225,210 Z',
    facts: ['Seat of Indian Government and historic Red Fort', 'Qutub Minar complex'],
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    capital: 'Jaipur',
    zone: 'West',
    terrain: 'Thar Desert & Aravalli Hills',
    labelCoord: { x: 145, y: 245 },
    pathD:
      'M 170,185 L 210,195 L 225,240 L 205,300 L 140,320 L 95,270 L 110,210 Z',
    facts: ['Great Indian Desert (Thar) and Keoladeo Bird Sanctuary', 'Aravalli — oldest fold mountains'],
  },
  {
    id: 'uttar_pradesh',
    name: 'Uttar Pradesh',
    capital: 'Lucknow',
    zone: 'North',
    terrain: 'Gangetic Basin & Alluvial Plain',
    labelCoord: { x: 295, y: 240 },
    pathD:
      'M 225,210 L 290,195 L 355,230 L 370,270 L 310,295 L 260,290 L 225,240 Z',
    facts: ['Most populous state; confluence of Ganga & Yamuna at Prayagraj', 'Taj Mahal at Agra'],
  },
  {
    id: 'bihar',
    name: 'Bihar',
    capital: 'Patna',
    zone: 'East',
    terrain: 'Middle Ganga Plain',
    labelCoord: { x: 395, y: 265 },
    pathD: 'M 355,230 L 430,240 L 440,290 L 370,295 Z',
    facts: ['Ancient centers of learning: Nalanda & Vikramshila', 'Bodh Gaya sacred pilgrimage'],
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    capital: 'Gandhinagar',
    zone: 'West',
    terrain: 'Rann of Kutch & Kathiawar Coast',
    labelCoord: { x: 105, y: 350 },
    pathD:
      'M 140,320 L 175,320 L 180,380 L 145,410 L 80,390 L 65,340 L 95,310 Z',
    facts: ['Gir National Park — sole refuge of Asiatic Lions', 'Longest coastline in India (1,600 km)'],
  },
  {
    id: 'madhya_pradesh',
    name: 'Madhya Pradesh',
    capital: 'Bhopal',
    zone: 'Central',
    terrain: 'Malwa Plateau & Vindhya-Satpura Forests',
    labelCoord: { x: 250, y: 345 },
    pathD:
      'M 205,300 L 260,290 L 310,295 L 340,350 L 305,400 L 220,405 L 175,350 Z',
    facts: ['Tiger State of India with Kanha & Bandhavgarh', 'Sanchi Stupa & Khajuraho temples'],
  },
  {
    id: 'chhattisgarh_jharkhand',
    name: 'Chhattisgarh & Jharkhand',
    capital: 'Raipur / Ranchi',
    zone: 'East',
    terrain: 'Chota Nagpur Plateau & Sal Forests',
    labelCoord: { x: 375, y: 345 },
    pathD:
      'M 340,350 L 370,295 L 430,290 L 435,360 L 385,420 L 335,410 Z',
    facts: ['Rich mineral heartland of iron, coal & bauxite', 'Chitrakote — Niagara of India'],
  },
  {
    id: 'west_bengal',
    name: 'West Bengal',
    capital: 'Kolkata',
    zone: 'East',
    terrain: 'Sundarbans Mangrove Delta',
    labelCoord: { x: 445, y: 320 },
    pathD: 'M 430,240 L 460,245 L 475,330 L 440,370 L 430,290 Z',
    facts: ['World’s largest mangrove delta: Sundarbans', 'Royal Bengal Tiger habitat'],
  },
  {
    id: 'northeast_seven_sisters',
    name: 'Northeastern States',
    capital: 'Guwahati / Shillong',
    zone: 'Northeast',
    terrain: 'Brahmaputra Valley & Rainforests',
    labelCoord: { x: 520, y: 235 },
    pathD:
      'M 460,245 L 530,200 L 580,240 L 560,310 L 490,320 L 475,270 Z',
    facts: ['Kaziranga — home to Great Indian One-horned Rhinoceros', 'Living root bridges in Meghalaya'],
  },
  {
    id: 'odisha',
    name: 'Odisha',
    capital: 'Bhubaneswar',
    zone: 'East',
    terrain: 'Chilika Lagoon & Coastal Plains',
    labelCoord: { x: 385, y: 430 },
    pathD: 'M 385,420 L 440,370 L 460,420 L 400,475 L 355,450 Z',
    facts: ['Chilika Lake — Asia’s largest brackish water lagoon', 'Konark Sun Temple heritage'],
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    capital: 'Mumbai',
    zone: 'West',
    terrain: 'Deccan Basalt Plateau & Sahyadri',
    labelCoord: { x: 195, y: 445 },
    pathD:
      'M 145,410 L 220,405 L 305,400 L 300,470 L 230,510 L 160,490 L 140,430 Z',
    facts: ['Ajanta & Ellora UNESCO rock-cut caves', 'Source of Godavari river at Trimbakeshwar'],
  },
  {
    id: 'telangana_andhra',
    name: 'Telangana & Andhra Pradesh',
    capital: 'Hyderabad / Amaravati',
    zone: 'South',
    terrain: 'Eastern Ghats & Krishna-Godavari Delta',
    labelCoord: { x: 295, y: 495 },
    pathD:
      'M 300,470 L 355,450 L 400,475 L 350,560 L 290,560 L 265,510 Z',
    facts: ['Rice bowl of India watered by Krishna & Godavari', 'Sriharikota ISRO spaceport'],
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    capital: 'Bengaluru',
    zone: 'South',
    terrain: 'Western Ghats & Mysore Plateau',
    labelCoord: { x: 205, y: 555 },
    pathD:
      'M 160,490 L 230,510 L 265,510 L 255,600 L 195,615 L 180,540 Z',
    facts: ['Silicon Valley of India (Bengaluru)', 'Hampi Vijayanagara ruins & Jog Falls'],
  },
  {
    id: 'tamil_nadu',
    name: 'Tamil Nadu',
    capital: 'Chennai',
    zone: 'South',
    terrain: 'Coromandel Coast & Kaveri Delta',
    labelCoord: { x: 260, y: 625 },
    pathD:
      'M 255,600 L 290,560 L 310,630 L 265,680 L 235,660 L 230,620 Z',
    facts: ['Dravidian architecture: Brihadeeswarar Temple', 'Kanyakumari — meeting of 3 oceans'],
  },
  {
    id: 'kerala',
    name: 'Kerala',
    capital: 'Thiruvananthapuram',
    zone: 'South',
    terrain: 'Malabar Coast, Lagoons & Spices',
    labelCoord: { x: 195, y: 635 },
    pathD: 'M 180,540 L 195,615 L 230,620 L 235,660 L 205,675 L 180,600 Z',
    facts: ['Vembanad Lake and lush backwaters', 'Silent Valley tropical rainforest reserve'],
  },
];

// 5 THEMED EXPEDITIONS
const EXPEDITIONS: ExpeditionMission[] = [
  {
    id: 'himalayas',
    title: 'Himalayan Heights',
    subtitle: 'High-altitude glaciers, peaks, and mountain passes',
    icon: Mountain,
    color: '#38bdf8',
    stateIds: ['ladakh_jk', 'himachal_uttarakhand', 'northeast_seven_sisters'],
    badgeName: 'Himalayan Sherpa',
    badgeIcon: '🏔️',
    description:
      'Traverse the highest mountain range on Earth. Test your understanding of glacial sources, cold deserts, and Himalayan biodiversity.',
    questions: [
      {
        question: 'Which is the highest peak situated entirely within Indian territory?',
        options: ['K2 (Godwin-Austen)', 'Kangchenjunga', 'Nanda Devi', 'Kamet'],
        correctIndex: 1,
        explanation: 'Kangchenjunga (8,586 m) in Sikkim is the highest peak in India.',
      },
      {
        question: 'Which mountain pass connects the Kashmir Valley with Ladakh?',
        options: ['Rohtang Pass', 'Zoji La', 'Nathu La', 'Shipki La'],
        correctIndex: 1,
        explanation: 'Zoji La pass links Srinagar in Kashmir with Kargil and Leh in Ladakh.',
      },
      {
        question: 'The glacier that is the primary source of the holy river Ganga is called:',
        options: ['Siachen', 'Gangotri (Gaumukh)', 'Pindari', 'Baltoro'],
        correctIndex: 1,
        explanation: 'Gangotri Glacier in Uttarkashi (Uttarakhand) terminates at Gaumukh to feed the Bhagirathi river.',
      },
    ],
  },
  {
    id: 'desert',
    title: 'Thar Desert & Heartland',
    subtitle: 'Arid ecosystems, Aravalli ridges, and Kathiawar coast',
    icon: Sun,
    color: '#f59e0b',
    stateIds: ['rajasthan', 'gujarat', 'madhya_pradesh'],
    badgeName: 'Desert Nomad',
    badgeIcon: '🐪',
    description:
      'Investigate adaptation in the Great Indian Desert, inland salt lakes, and the ancient Aravalli mountain system.',
    questions: [
      {
        question: 'What is India’s largest inland saline salt lake located in Rajasthan?',
        options: ['Sambhar Lake', 'Chilika Lake', 'Wular Lake', 'Pulicat Lake'],
        correctIndex: 0,
        explanation: 'Sambhar Salt Lake near Jaipur is India’s largest inland salt lake.',
      },
      {
        question: 'Which Indian national park is the world’s last remaining natural refuge for Asiatic Lions?',
        options: ['Ranthambore', 'Gir National Park', 'Jim Corbett', 'Sundarbans'],
        correctIndex: 1,
        explanation: 'Gir Forest National Park in Gujarat is the only natural home of the Asiatic lion (Panthera leo persica).',
      },
      {
        question: 'What is the geological significance of the Aravalli Range?',
        options: [
          'Youngest fold mountain in India',
          'Oldest fold mountain system in India',
          'A volcanic island arc',
          'A rift valley escarpment',
        ],
        correctIndex: 1,
        explanation: 'The Aravallis are one of the world’s oldest fold mountain systems, deeply eroded over millions of years.',
      },
    ],
  },
  {
    id: 'ghats',
    title: 'Western Ghats & Coasts',
    subtitle: 'Biodiversity hotspots, rainforests, and backwaters',
    icon: Trees,
    color: '#10b981',
    stateIds: ['maharashtra', 'karnataka', 'kerala', 'tamil_nadu'],
    badgeName: 'Sahyadri Naturalist',
    badgeIcon: '🌿',
    description:
      'Examine the UNESCO World Heritage Western Ghats (Sahyadri), tropical evergreen rainforests, and Kaveri river networks.',
    questions: [
      {
        question: 'Which is the highest peak in South India and the Western Ghats?',
        options: ['Doda Betta', 'Anamudi', 'Mullayanagiri', 'Agasthyamalai'],
        correctIndex: 1,
        explanation: 'Anamudi (2,695 m) located in Kerala’s Eravikulam National Park is the highest peak in peninsular India.',
      },
      {
        question: 'The coastal stretch along Kerala is traditionally referred to as:',
        options: ['Coromandel Coast', 'Konkan Coast', 'Malabar Coast', 'Utkal Coast'],
        correctIndex: 2,
        explanation: 'The southwestern coastline running along Kerala is the historic Malabar Coast.',
      },
      {
        question: 'Why are the Western Ghats classified as an international biodiversity hotspot?',
        options: [
          'Because they are made of sandstone',
          'Due to exceptional species richness and high degree of endemism',
          'Because they receive no rainfall',
          'Because they have gold mines',
        ],
        correctIndex: 1,
        explanation: 'The Western Ghats host over 5,000 vascular plant species, with more than 30% being endemic found nowhere else on Earth.',
      },
    ],
  },
  {
    id: 'rivers',
    title: 'Mighty Rivers of India',
    subtitle: 'River basins, alluvial plains, and deltaic networks',
    icon: Waves,
    color: '#06b6d4',
    stateIds: ['uttar_pradesh', 'bihar', 'west_bengal', 'odisha', 'telangana_andhra'],
    badgeName: 'River Navigator',
    badgeIcon: '🌊',
    description:
      'Map the life-giving arterial rivers of Bharat: the Ganga-Brahmaputra system, Godavari (Dakshin Ganga), and Sundarbans.',
    questions: [
      {
        question: 'Which peninsular river is commonly venerated as the "Dakshin Ganga" (Ganga of the South)?',
        options: ['Krishna', 'Kaveri', 'Godavari', 'Narmada'],
        correctIndex: 2,
        explanation: 'Godavari is the longest peninsular river (1,465 km) and is known as Dakshin Ganga.',
      },
      {
        question: 'What unique ecosystem characterizes the Sundarbans Delta in West Bengal?',
        options: ['Alpine tundra', 'Mangrove tidal forests', 'Cold desert scrub', 'Sub-tropical savanna'],
        correctIndex: 1,
        explanation: 'The Sundarbans is the world’s largest contiguous mangrove tidal forest formed by the Ganga-Brahmaputra confluence.',
      },
      {
        question: 'Which river flows west through a prominent rift valley between the Vindhya and Satpura ranges?',
        options: ['Mahanadi', 'Narmada', 'Godavari', 'Ganga'],
        correctIndex: 1,
        explanation: 'Narmada and Tapti flow westward through fault/rift valleys into the Arabian Sea.',
      },
    ],
  },
  {
    id: 'heritage',
    title: 'Heritage & Capitals',
    subtitle: 'Monumental architecture, stupas, and historic sanctuaries',
    icon: Landmark,
    color: '#e11d48',
    stateIds: ['delhi', 'punjab_haryana', 'chhattisgarh_jharkhand', 'tamil_nadu'],
    badgeName: 'Bharat Scholar',
    badgeIcon: '🏛️',
    description:
      'Discover architectural marvels, ancient Buddhist universities, and temple wonders celebrating India’s civilizational journey.',
    questions: [
      {
        question: 'In which state is the ancient Nalanda Mahavihara university UNESCO World Heritage site located?',
        options: ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Odisha'],
        correctIndex: 1,
        explanation: 'Nalanda was a world-famous 5th-century Buddhist monastic university located in Bihar.',
      },
      {
        question: 'The Brihadeeswarar Temple in Thanjavur, built by Rajaraja Chola I, is dedicated to which deity?',
        options: ['Lord Vishnu', 'Lord Shiva', 'Goddess Durga', 'Lord Brahma'],
        correctIndex: 1,
        explanation: 'Completed in 1010 CE, the magnificent Great Living Chola Temple is dedicated to Lord Shiva.',
      },
      {
        question: 'Which monument served as the royal residence of Mughal emperors in Delhi?',
        options: ['Hawa Mahal', 'Red Fort (Lal Qila)', 'Gol Gumbaz', 'Charminar'],
        correctIndex: 1,
        explanation: 'The Red Fort was commissioned by Emperor Shah Jahan in 1638 as his palatial fortified capital.',
      },
    ],
  },
];

export const BharatExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, addXP, addCoins, unlockBadge } = useAuthStore();

  // Selected State / Mission
  const [selectedStateId, setSelectedStateId] = useState<string>('ladakh_jk');
  const [activeExpedition, setActiveExpedition] = useState<ExpeditionMission | null>(null);

  // Mission Quiz Flow
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  // State Stars (stateId -> 0..3 stars)
  const [stateStars, setStateStars] = useState<Record<string, number>>({
    ladakh_jk: 3,
    rajasthan: 2,
    kerala: 3,
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sound Synthesizer
  const playSfx = (type: 'correct' | 'wrong' | 'victory') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.setValueAtTime(130, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'victory') {
        [440, 554.37, 659.25, 880].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.setValueAtTime(f, now + i * 0.1);
          g.gain.setValueAtTime(0.3, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.25);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.25);
        });
      }
    } catch {
      // AudioContext policy fallback
    }
  };

  const selectedState = useMemo(
    () => INDIA_STATES.find((s) => s.id === selectedStateId) || INDIA_STATES[0],
    [selectedStateId]
  );

  const startExpedition = (expedition: ExpeditionMission) => {
    setActiveExpedition(expedition);
    setCurrentQIndex(0);
    setSelectedAns(null);
    setQuizScore(0);
    setIsQuizCompleted(false);
  };

  const handleSelectOption = (idx: number) => {
    if (selectedAns !== null || !activeExpedition) return;
    setSelectedAns(idx);

    const isCorrect = idx === activeExpedition.questions[currentQIndex].correctIndex;
    if (isCorrect) {
      playSfx('correct');
      setQuizScore((prev) => prev + 1);
    } else {
      playSfx('wrong');
    }

    setTimeout(() => {
      if (currentQIndex < activeExpedition.questions.length - 1) {
        setCurrentQIndex((prev) => prev + 1);
        setSelectedAns(null);
      } else {
        // Completed expedition!
        setIsQuizCompleted(true);
        playSfx('victory');

        const finalScore = isCorrect ? quizScore + 1 : quizScore;
        const starsAwarded = finalScore === 3 ? 3 : finalScore === 2 ? 2 : 1;

        // Update state stars for states in this mission
        setStateStars((prev) => {
          const updated = { ...prev };
          activeExpedition.stateIds.forEach((sid) => {
            updated[sid] = Math.max(updated[sid] || 0, starsAwarded);
          });
          return updated;
        });

        addXP(150);
        addCoins(40);
        unlockBadge(activeExpedition.id);
      }
    }, 1200);
  };

  // Total stars collected across states
  const totalStars = Object.values(stateStars).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="min-h-screen bg-surface-900 text-surface-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar Header */}
      <header className="border-b border-surface-800 bg-surface-850/80 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/playlab')}
            className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-display text-white">Bharat Explorer</h1>
              <span className="badge-brand text-[10px]">NCERT Social Science</span>
            </div>
            <p className="text-xs text-surface-400 hidden sm:block">
              Interactive geographical expedition across India’s states, rivers, and sanctuaries
            </p>
          </div>
        </div>

        {/* Explorer Passport Badge Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{totalStars} Stars</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute' : 'Enable sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-amber-400" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Themed Expeditions (3 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-4 space-y-3 bg-surface-800 border-surface-700/80">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Expedition Missions</span>
              </h2>
              <span className="text-[10px] text-amber-400 font-bold">5 Available</span>
            </div>

            <div className="space-y-2">
              {EXPEDITIONS.map((exp) => {
                const Icon = exp.icon;
                const isSelected = activeExpedition?.id === exp.id;

                return (
                  <button
                    key={exp.id}
                    onClick={() => startExpedition(exp)}
                    className={clsx(
                      'w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 relative overflow-hidden',
                      isSelected
                        ? 'bg-surface-700/80 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-surface-850/60 hover:bg-surface-700/50 border-surface-700/50'
                    )}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${exp.color}20`,
                        color: exp.color,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-white truncate">
                          {exp.title}
                        </h3>
                        <span className="text-sm">{exp.badgeIcon}</span>
                      </div>
                      <p className="text-[11px] text-surface-400 truncate mt-0.5">
                        {exp.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Achievement Badges Showcase */}
          <div className="card p-4 space-y-3 bg-surface-800/80 border-surface-700/60">
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Explorer Passport</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              {EXPEDITIONS.map((exp) => {
                const isUnlocked = Boolean(user?.badges?.includes(exp.id)) || totalStars > 5;
                return (
                  <div
                    key={exp.id}
                    className={clsx(
                      'p-2 rounded-xl border flex flex-col items-center justify-center space-y-1',
                      isUnlocked
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-surface-900/40 border-surface-800 text-surface-600 opacity-50'
                    )}
                  >
                    <span className="text-xl">{exp.badgeIcon}</span>
                    <span className="text-[10px] font-bold truncate max-w-full">
                      {exp.badgeName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: INTERACTIVE SVG INDIA MAP (6 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[560px] aspect-[6/7] bg-surface-950 rounded-3xl p-4 sm:p-5 border-2 border-surface-700/80 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
            {/* Compass Watermark */}
            <div className="absolute top-4 left-4 pointer-events-none opacity-20">
              <Compass className="w-14 h-14 text-amber-400" />
            </div>

            {/* Indian Flag Gradient Subtle Watermark */}
            <div className="absolute bottom-4 right-4 pointer-events-none flex items-center gap-1 opacity-40 text-[10px] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-surface-300 ml-1">Jana Gana Mana</span>
            </div>

            <svg
              viewBox="0 0 600 700"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.6))' }}
            >
              {/* Regional Polygons */}
              {INDIA_STATES.map((state) => {
                const isSelected = state.id === selectedStateId;
                const isInActiveMission = activeExpedition?.stateIds.includes(state.id);
                const stars = stateStars[state.id] || 0;

                let fillHex = '#1e293b';
                if (isSelected) fillHex = '#ea580c';
                else if (isInActiveMission) fillHex = '#0284c7';
                else if (stars > 0) fillHex = '#065f46';

                return (
                  <g
                    key={state.id}
                    onClick={() => setSelectedStateId(state.id)}
                    className="cursor-pointer transition-all duration-200 group"
                  >
                    <path
                      d={state.pathD}
                      fill={fillHex}
                      stroke={isSelected ? '#fed7aa' : '#334155'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="group-hover:opacity-90 group-hover:stroke-amber-400 transition-colors"
                    />

                    {/* State Pins / Stars */}
                    <circle
                      cx={state.labelCoord.x}
                      cy={state.labelCoord.y}
                      r={isSelected ? 7 : 5}
                      fill={isSelected ? '#ffffff' : '#facc15'}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />

                    {stars > 0 && (
                      <text
                        x={state.labelCoord.x}
                        y={state.labelCoord.y - 8}
                        fill="#facc15"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {'★'.repeat(stars)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: State Factsheet or Mission Quiz (3 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <AnimatePresence mode="wait">
            {activeExpedition ? (
              /* Active Mission Modal / Card */
              <motion.div
                key="mission-quiz"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="card p-5 space-y-4 bg-surface-800 border-2 border-amber-500/60 shadow-xl"
              >
                <div className="flex items-center justify-between pb-2 border-b border-surface-700/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{activeExpedition.badgeIcon}</span>
                    <div>
                      <h3 className="text-xs font-bold text-white">
                        {activeExpedition.title}
                      </h3>
                      <p className="text-[10px] text-amber-400">
                        Question {currentQIndex + 1} of {activeExpedition.questions.length}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveExpedition(null)}
                    className="text-xs text-surface-400 hover:text-white"
                  >
                    Exit
                  </button>
                </div>

                {!isQuizCompleted ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-white leading-relaxed">
                      {activeExpedition.questions[currentQIndex].question}
                    </p>

                    <div className="space-y-2">
                      {activeExpedition.questions[currentQIndex].options.map((opt, oIdx) => {
                        const isCorrect =
                          oIdx === activeExpedition.questions[currentQIndex].correctIndex;
                        const isChosen = selectedAns === oIdx;

                        let btnClass =
                          'bg-surface-750 hover:bg-surface-700 text-surface-200 border-surface-700';

                        if (selectedAns !== null) {
                          if (isCorrect) {
                            btnClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold';
                          } else if (isChosen) {
                            btnClass = 'bg-red-500/20 text-red-300 border-red-500';
                          } else {
                            btnClass = 'opacity-50 text-surface-500 border-surface-800';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={selectedAns !== null}
                            onClick={() => handleSelectOption(oIdx)}
                            className={clsx(
                              'w-full text-left p-2.5 rounded-xl text-xs border transition-all flex items-center justify-between',
                              btnClass
                            )}
                          >
                            <span>{opt}</span>
                            {selectedAns !== null && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {selectedAns !== null && isChosen && !isCorrect && (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <Trophy className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Expedition Complete!</h4>
                      <p className="text-xs text-amber-300 mt-1">
                        Score: {quizScore} / {activeExpedition.questions.length} Correct
                      </p>
                    </div>

                    <p className="text-[11px] text-surface-300 leading-relaxed px-2">
                      Badge unlocked: <strong>{activeExpedition.badgeName}</strong> (+150 XP)
                    </p>

                    <button
                      onClick={() => setActiveExpedition(null)}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                    >
                      Return to Map
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              /* State Profile Factsheet */
              <motion.div
                key="state-factsheet"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="card p-5 space-y-4 bg-surface-800 border-surface-700/80"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedState.zone} India Region</span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-white">
                    {selectedState.name}
                  </h3>
                  <p className="text-xs text-surface-300 font-medium">
                    Capital: <strong className="text-white">{selectedState.capital}</strong>
                  </p>
                </div>

                {/* Geography Overview */}
                <div className="p-3 rounded-xl bg-surface-900/80 border border-surface-700/60 space-y-1 text-xs">
                  <span className="text-[10px] text-surface-400 font-semibold uppercase">
                    Terrain & Ecosystem
                  </span>
                  <p className="text-white font-medium">{selectedState.terrain}</p>
                </div>

                {/* State NCERT Facts */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
                    NCERT Curriculum Highlights
                  </span>
                  <ul className="space-y-1.5 text-xs text-surface-300 list-disc list-inside">
                    {selectedState.facts.map((fact, idx) => (
                      <li key={idx} className="leading-snug">
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* State Progress & Stars */}
                <div className="pt-3 border-t border-surface-700/60 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-surface-400">Mastery: </span>
                    <span className="text-amber-400 font-bold">
                      {'★'.repeat(stateStars[selectedState.id] || 0) || 'Unrated'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const relatedExp =
                        EXPEDITIONS.find((e) => e.stateIds.includes(selectedState.id)) ||
                        EXPEDITIONS[0];
                      startExpedition(relatedExp);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>Launch Quiz</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default BharatExplorerPage;
