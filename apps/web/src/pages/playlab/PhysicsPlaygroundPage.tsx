import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  BookOpen,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Atom,
  Eye,
  Zap,
  Compass,
  Flame,
  Activity,
  Sliders,
  Play,
  Pause,
  Trash2,
  X,
  ExternalLink,
  Award,
  CheckCircle2,
  Info,
} from 'lucide-react';
import Matter from 'matter-js';
import { useAuthStore } from '../../stores/authStore';
import {
  PHYSICS_SIMULATIONS,
  PhysicsCategory,
  PhysicsSimulationItem,
} from '../../data/physicsSimulationsData';

export const PhysicsPlaygroundPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addXP, addCoins } = useAuthStore();

  // Active state
  const initialSimId = searchParams.get('sim') || 'mech-circular-motion';
  const [selectedSim, setSelectedSim] = useState<PhysicsSimulationItem>(() => {
    return (
      PHYSICS_SIMULATIONS.find((s) => s.id === initialSimId) ||
      PHYSICS_SIMULATIONS[0]
    );
  });

  const [activeCategory, setActiveCategory] = useState<PhysicsCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [theoryOpen, setTheoryOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'3d-sim' | 'theory' | '2d-sandbox'>('3d-sim');
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [isLoadingIframe, setIsLoadingIframe] = useState<boolean>(true);

  // Matter.js 2D Sandbox state
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);

  const [gravityY, setGravityY] = useState<number>(1);
  const [restitution, setRestitution] = useState<number>(0.8);
  const [friction, setFriction] = useState<number>(0.05);
  const [launchAngle, setLaunchAngle] = useState<number>(45);
  const [launchSpeed, setLaunchSpeed] = useState<number>(18);
  const [is2dRunning, setIs2dRunning] = useState<boolean>(true);
  const [telemetry, setTelemetry] = useState({
    bodyCount: 0,
    kineticEnergy: 0,
    potentialEnergy: 0,
    maxVelocity: 0,
  });

  // Track explored simulations
  const [exploredSims, setExploredSims] = useState<Set<string>>(() => new Set(['mech-circular-motion']));

  // Handle URL params
  useEffect(() => {
    const simParam = searchParams.get('sim');
    if (simParam && simParam !== selectedSim.id) {
      const match = PHYSICS_SIMULATIONS.find((s) => s.id === simParam);
      if (match) {
        setSelectedSim(match);
      }
    }
  }, [searchParams]);

  // Update URL and reward XP on simulation selection
  const handleSelectSim = (sim: PhysicsSimulationItem) => {
    setSelectedSim(sim);
    setSearchParams({ sim: sim.id });
    setIsLoadingIframe(true);
    setIframeKey((prev) => prev + 1);

    // Stop ongoing narration
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }

    if (!exploredSims.has(sim.id)) {
      setExploredSims((prev) => new Set(prev).add(sim.id));
      addXP(15);
      addCoins(5);
    }
  };

  // Text-to-Speech Lab Briefing
  const toggleNarration = () => {
    if (!('speechSynthesis' in window)) return;

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${selectedSim.title}. ${selectedSim.subtitle}. ${selectedSim.description}. In this simulation, you can orbit in 3D, manipulate parameters, and observe physical laws in action.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((v) => v.lang.includes('en-IN')) ||
      voices.find((v) => v.lang.includes('en-GB')) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);

    setIsNarrating(true);
    window.speechSynthesis.speak(utterance);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!stageContainerRef.current) return;
    if (!document.fullscreenElement) {
      stageContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Filtered simulations list
  const filteredSims = PHYSICS_SIMULATIONS.filter((item) => {
    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some((t) => t.toLowerCase().includes(query)) ||
      item.classGrade.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Matter.js 2D Sandbox lifecycle (only active when tab === '2d-sandbox')
  useEffect(() => {
    if (activeTab !== '2d-sandbox' || !sceneRef.current) return;

    const width = sceneRef.current.clientWidth || 800;
    const height = sceneRef.current.clientHeight || 500;

    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const Runner = Matter.Runner;
    const Bodies = Matter.Bodies;
    const Composite = Matter.Composite;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;
    const Events = Matter.Events;

    const engine = Engine.create({
      gravity: { x: 0, y: gravityY, scale: 0.001 },
    });
    engineRef.current = engine;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: '#0B1120',
      },
    });
    renderRef.current = render;
    Render.run(render);

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    const wallOptions = { isStatic: true, render: { fillStyle: '#1E293B' } };
    const floor = Bodies.rectangle(width / 2, height - 10, width, 20, wallOptions);
    const leftWall = Bodies.rectangle(10, height / 2, 20, height, wallOptions);
    const rightWall = Bodies.rectangle(width - 10, height / 2, 20, height, wallOptions);
    const ceiling = Bodies.rectangle(width / 2, 10, width, 20, wallOptions);

    Composite.add(engine.world, [floor, leftWall, rightWall, ceiling]);

    // Initial objects
    const ball1 = Bodies.circle(width * 0.35, height * 0.4, 28, {
      restitution,
      friction,
      render: { fillStyle: '#38BDF8' },
    });
    const box1 = Bodies.rectangle(width * 0.65, height * 0.6, 50, 50, {
      restitution,
      friction,
      render: { fillStyle: '#A855F7' },
    });
    Composite.add(engine.world, [ball1, box1]);

    // Mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Telemetry updates
    const updateInterval = setInterval(() => {
      if (!engineRef.current) return;
      const bodies = Composite.allBodies(engineRef.current.world).filter((b) => !b.isStatic);
      let ke = 0;
      let pe = 0;
      let maxV = 0;

      bodies.forEach((b) => {
        const speed = Math.hypot(b.velocity.x, b.velocity.y);
        if (speed > maxV) maxV = speed;
        ke += 0.5 * b.mass * speed * speed;
        const h = Math.max(0, height - b.position.y);
        pe += b.mass * gravityY * h * 0.05;
      });

      setTelemetry({
        bodyCount: bodies.length,
        kineticEnergy: Math.round(ke),
        potentialEnergy: Math.round(pe),
        maxVelocity: parseFloat(maxV.toFixed(2)),
      });
    }, 200);

    return () => {
      clearInterval(updateInterval);
      if (renderRef.current) {
        Render.stop(renderRef.current);
        if (renderRef.current.canvas) renderRef.current.canvas.remove();
      }
      if (runnerRef.current) Runner.stop(runnerRef.current);
      if (engineRef.current) Composite.clear(engineRef.current.world, false);
    };
  }, [activeTab]);

  // Update Matter 2D physics properties live
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.gravity.y = gravityY;
    const bodies = Matter.Composite.allBodies(engineRef.current.world);
    bodies.forEach((b) => {
      if (!b.isStatic) {
        b.restitution = restitution;
        b.friction = friction;
      }
    });
  }, [gravityY, restitution, friction]);

  const spawn2dObject = (type: 'circle' | 'box') => {
    if (!engineRef.current || !renderRef.current) return;
    const width = renderRef.current.options.width || 800;
    const x = width / 2 + (Math.random() * 100 - 50);
    const y = 80;

    let body: Matter.Body;
    if (type === 'circle') {
      body = Matter.Bodies.circle(x, y, 22 + Math.random() * 12, {
        restitution,
        friction,
        render: {
          fillStyle: ['#38BDF8', '#818CF8', '#34D399', '#F472B6', '#FBBF24'][
            Math.floor(Math.random() * 5)
          ],
        },
      });
    } else {
      const size = 35 + Math.random() * 20;
      body = Matter.Bodies.rectangle(x, y, size, size, {
        restitution,
        friction,
        render: {
          fillStyle: ['#C084FC', '#FB7185', '#38BDF8', '#4ADE80'][
            Math.floor(Math.random() * 4)
          ],
        },
      });
    }
    Matter.Composite.add(engineRef.current.world, body);
  };

  const clear2dObjects = () => {
    if (!engineRef.current) return;
    const all = Matter.Composite.allBodies(engineRef.current.world);
    const nonStatic = all.filter((b) => !b.isStatic);
    Matter.Composite.remove(engineRef.current.world, nonStatic);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mechanics':
        return <Activity className="w-4 h-4 text-sky-400" />;
      case 'Optics':
        return <Eye className="w-4 h-4 text-emerald-400" />;
      case 'Electricity':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Magnetism':
        return <Compass className="w-4 h-4 text-rose-400" />;
      case 'Thermodynamics':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'Quantum':
        return <Atom className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Mechanics':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Optics':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Electricity':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Magnetism':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Thermodynamics':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Quantum':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  const categories: PhysicsCategory[] = [
    'All',
    'Mechanics',
    'Optics',
    'Electricity',
    'Magnetism',
    'Thermodynamics',
    'Quantum',
  ];

  return (
    <div
      ref={stageContainerRef}
      className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-none"
    >
      {/* ================= TOP WORKSPACE APPBAR ================= */}
      <header className="h-14 min-h-[56px] border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/playlab')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all"
            title="Return to PlayLab"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PlayLab</span>
          </button>

          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              sidebarOpen
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Labs Directory"
          >
            <Layers className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 hidden md:block" />

          {/* Active Sim Header Badge & Title */}
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClass(
                selectedSim.category
              )}`}
            >
              {getCategoryIcon(selectedSim.category)}
              {selectedSim.category}
            </span>

            <div className="truncate">
              <h1 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                {selectedSim.title}
                <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  {selectedSim.classGrade}
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* View Mode Switcher & Lab Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode Tabs */}
          <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('3d-sim')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeTab === '3d-sim'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D Lab</span>
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'theory'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">NCERT Theory</span>
            </button>
            <button
              onClick={() => setActiveTab('2d-sandbox')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeTab === '2d-sandbox'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2D Sandbox</span>
            </button>
          </div>

          {/* Audio Voice Narration Assistant */}
          <button
            onClick={toggleNarration}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
              isNarrating
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-750'
            }`}
            title="Read Experiment Briefing"
          >
            {isNarrating ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isNarrating ? 'Mute' : 'Voice Lab'}</span>
          </button>

          {/* Theory Slideover Drawer Toggle */}
          <button
            onClick={() => setTheoryOpen((prev) => !prev)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
              theoryOpen
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Toggle NCERT Theory Panel"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Theory</span>
          </button>

          {/* Reset Iframe Button */}
          {activeTab === '3d-sim' && (
            <button
              onClick={() => {
                setIsLoadingIframe(true);
                setIframeKey((k) => k + 1);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all"
              title="Reload Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ================= WORKSPACE BODY (SIDEBAR + MAIN CANVAS) ================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ================= COLLAPSIBLE LABS DIRECTORY SIDEBAR ================= */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="h-full border-r border-slate-800/80 bg-slate-900/95 flex flex-col shrink-0 overflow-hidden z-10 shadow-2xl"
            >
              {/* Directory Search & Filter Header */}
              <div className="p-3 border-b border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Physics 3D Studios</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/20 text-purple-300 font-bold">
                      {PHYSICS_SIMULATIONS.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 3D labs, formulas, tags..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-950 border border-slate-700/70 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Category Chips Scrollbar */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
                        activeCategory === cat
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation Cards List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
                {filteredSims.length === 0 ? (
                  <div className="text-center py-10 px-4 text-xs text-slate-500">
                    <p>No physics simulations match "{searchQuery}"</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('All');
                      }}
                      className="mt-2 text-purple-400 hover:underline"
                    >
                      Clear search filters
                    </button>
                  </div>
                ) : (
                  filteredSims.map((sim) => {
                    const isSelected = selectedSim.id === sim.id;
                    const hasExplored = exploredSims.has(sim.id);

                    return (
                      <button
                        key={sim.id}
                        onClick={() => handleSelectSim(sim)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all relative group flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-950/70 to-indigo-950/70 border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/40'
                            : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5 w-full">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {getCategoryIcon(sim.category)}
                            <h3
                              className={`text-xs font-semibold truncate ${
                                isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                              }`}
                            >
                              {sim.title}
                            </h3>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 border ${getCategoryBadgeClass(
                              sim.category
                            )}`}
                          >
                            {sim.classGrade}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {sim.subtitle}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                          <span className="font-mono text-purple-400/90 truncate">
                            {sim.formula || sim.category}
                          </span>
                          {hasExplored && (
                            <span className="flex items-center gap-0.5 text-emerald-400 text-[10px]">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Done</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer Stats */}
              <div className="p-2.5 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Labs Explored:</span>
                </span>
                <span className="font-bold text-white">
                  {exploredSims.size} / {PHYSICS_SIMULATIONS.length}
                </span>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ================= MAIN SIMULATION STAGE ================= */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-950">
          {/* Active Tab View */}
          {activeTab === '3d-sim' ? (
            <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-950">
              {/* Simulation Iframe Loading Overlay */}
              {isLoadingIframe && (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3 z-10 transition-opacity">
                  <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-xs text-slate-400 font-medium">
                    Initializing 3D Physics Apparatus...
                  </p>
                </div>
              )}

              {/* 3D Simulation Frame */}
              <iframe
                key={`${selectedSim.id}-${iframeKey}`}
                src={`/physics/Simulations/${selectedSim.filename}`}
                title={selectedSim.title}
                onLoad={() => setIsLoadingIframe(false)}
                className="w-full h-full border-none select-none bg-slate-900"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />

              {/* Floating Bottom Learning Card (HUD Overlay) */}
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 shadow-2xl pointer-events-auto transition-all z-10">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-purple-500/20 text-purple-300">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedSim.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {selectedSim.subtitle}
                      </p>
                    </div>
                  </div>
                  {selectedSim.formula && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 font-bold shrink-0">
                      {selectedSim.formula}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-[11px] text-slate-300 space-y-1">
                  {selectedSim.learningObjectives.slice(0, 2).map((obj, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-purple-400 shrink-0" />
                      <span className="truncate">{obj}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Rotate: Left Click + Drag | Pan: Right Click
                  </span>
                  <button
                    onClick={() => setTheoryOpen(true)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Full Theory</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'theory' ? (
            /* ================= FULLSCREEN THEORY VIEW ================= */
            <div className="flex-1 w-full h-full overflow-y-auto bg-slate-900 p-4 sm:p-8 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
                    <span>NCERT Class {selectedSim.classGrade} Curriculum</span>
                    <span>•</span>
                    <span>{selectedSim.category}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedSim.title}</h2>
                  <p className="text-sm text-slate-400 mt-1">{selectedSim.subtitle}</p>
                </div>

                {/* Key Mathematical Expression */}
                {selectedSim.formula && (
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
                        Core Mathematical Formula
                      </span>
                      <div className="text-lg font-mono font-bold text-white mt-0.5">
                        {selectedSim.formula}
                      </div>
                    </div>
                    <BookOpen className="w-8 h-8 text-purple-400/50" />
                  </div>
                )}

                {/* Learning Objectives */}
                <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Key Conceptual Objectives
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300">
                    {selectedSim.learningObjectives.map((obj, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {i + 1}
                        </span>
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Embedded HTML Theory or Markdown Derivation */}
                {selectedSim.theoryPath ? (
                  <div className="rounded-xl overflow-hidden border border-slate-800 h-[600px] bg-white">
                    <iframe
                      src={selectedSim.theoryPath}
                      title={`${selectedSim.title} Theory`}
                      className="w-full h-full border-none"
                    />
                  </div>
                ) : (
                  <div className="bg-slate-950/60 rounded-xl p-6 border border-slate-800 space-y-4 text-slate-300 text-sm leading-relaxed">
                    <h3 className="text-base font-bold text-white">Physical Mechanism & Derivation</h3>
                    <p>{selectedSim.description}</p>
                    <p>
                      In typical laboratory conditions, students observe how variables interact dynamically. In
                      this 3D digital laboratory, all parameters adhere strictly to classical mechanics and
                      electromagnetism formulas without friction or measurement anomalies unless specified.
                    </p>
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
                      <strong className="text-slate-200">Interactive Tip:</strong> Switch back to the "3D Lab" tab to
                      interact with the physical apparatus and verify each stage of this derivation.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= 2D MATTER.JS MECHANICAL SANDBOX ================= */
            <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
              {/* 2D Sandbox Controls Header */}
              <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Gravity:</span>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={gravityY}
                      onChange={(e) => setGravityY(parseFloat(e.target.value))}
                      className="w-20 accent-purple-500"
                    />
                    <span className="font-mono text-purple-400 w-8">{gravityY}g</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Bounciness:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={restitution}
                      onChange={(e) => setRestitution(parseFloat(e.target.value))}
                      className="w-20 accent-purple-500"
                    />
                    <span className="font-mono text-purple-400 w-8">{restitution}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Friction:</span>
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.01"
                      value={friction}
                      onChange={(e) => setFriction(parseFloat(e.target.value))}
                      className="w-20 accent-purple-500"
                    />
                    <span className="font-mono text-purple-400 w-8">{friction}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => spawn2dObject('circle')}
                    className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold flex items-center gap-1 transition-all"
                  >
                    + Spawn Ball
                  </button>
                  <button
                    onClick={() => spawn2dObject('box')}
                    className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold flex items-center gap-1 transition-all"
                  >
                    + Spawn Box
                  </button>
                  <button
                    onClick={clear2dObjects}
                    className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 border border-slate-700 rounded-lg text-slate-300 transition-all"
                    title="Clear Sandbox"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 2D Canvas Stage */}
              <div ref={sceneRef} className="flex-1 w-full h-full relative cursor-crosshair overflow-hidden" />

              {/* Live Telemetry Footer Bar */}
              <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-around text-xs font-mono text-slate-300">
                <div>
                  <span className="text-slate-500">Bodies: </span>
                  <span className="text-white font-bold">{telemetry.bodyCount}</span>
                </div>
                <div>
                  <span className="text-slate-500">Kinetic Energy: </span>
                  <span className="text-sky-400 font-bold">{telemetry.kineticEnergy} J</span>
                </div>
                <div>
                  <span className="text-slate-500">Potential Energy: </span>
                  <span className="text-emerald-400 font-bold">{telemetry.potentialEnergy} J</span>
                </div>
                <div>
                  <span className="text-slate-500">Max Velocity: </span>
                  <span className="text-amber-400 font-bold">{telemetry.maxVelocity} m/s</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ================= THEORY SLIDE-OVER DRAWER ================= */}
        <AnimatePresence>
          {theoryOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute top-0 right-0 bottom-0 w-full sm:w-[460px] bg-slate-900/98 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-30 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">NCERT Lab Theory & Notes</h3>
                </div>
                <button
                  onClick={() => setTheoryOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                    {selectedSim.category} • {selectedSim.classGrade}
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">{selectedSim.title}</h2>
                  <p className="text-slate-400 mt-1">{selectedSim.subtitle}</p>
                </div>

                {selectedSim.formula && (
                  <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/30">
                    <span className="text-[10px] text-purple-300 font-semibold uppercase">
                      Mathematical Governing Formula
                    </span>
                    <div className="font-mono text-sm font-bold text-white mt-0.5">
                      {selectedSim.formula}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200">Experiment Overview</h4>
                  <p className="text-slate-300 leading-relaxed">{selectedSim.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200">Core Learning Concepts</h4>
                  <div className="space-y-1.5">
                    {selectedSim.learningObjectives.map((obj, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {i + 1}
                        </span>
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct link to open standalone NCERT theory if available */}
                {selectedSim.theoryPath && (
                  <div className="pt-2">
                    <a
                      href={selectedSim.theoryPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Open Dedicated NCERT Theory Document</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PhysicsPlaygroundPage;
