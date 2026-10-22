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
  X,
  ExternalLink,
  CheckCircle2,
  Info,
} from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // Closed by default to unblock the simulation!
  const [theoryOpen, setTheoryOpen] = useState<boolean>(false);
  const [infoOpen, setInfoOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [isLoadingIframe, setIsLoadingIframe] = useState<boolean>(true);
  const stageContainerRef = useRef<HTMLDivElement>(null);

  // Track explored simulations
  const [exploredSims, setExploredSims] = useState<Set<string>>(
    () => new Set(['mech-circular-motion'])
  );

  // Synchronize URL query parameter with selected simulation
  useEffect(() => {
    const simParam = searchParams.get('sim');
    if (simParam && simParam !== selectedSim.id) {
      const match = PHYSICS_SIMULATIONS.find((s) => s.id === simParam);
      if (match) {
        setSelectedSim(match);
      }
    }
  }, [searchParams]);

  // Handle simulation selection
  const handleSelectSim = (sim: PhysicsSimulationItem) => {
    setSelectedSim(sim);
    setSearchParams({ sim: sim.id });
    setIsLoadingIframe(true);
    setIframeKey((prev) => prev + 1);

    // Stop active audio
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
    const textToSpeak = `${selectedSim.title}. ${selectedSim.subtitle}. ${selectedSim.description}. Use your mouse to rotate and inspect the apparatus, adjust variables, and observe real-world physical laws.`;
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
      stageContainerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
      item.topicTag.toLowerCase().includes(query) ||
      item.tags.some((t) => t.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });



  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mechanics':
        return <Activity className="w-3.5 h-3.5 text-sky-400" />;
      case 'Optics':
        return <Eye className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Electricity':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'Magnetism':
        return <Compass className="w-3.5 h-3.5 text-rose-400" />;
      case 'Fluids & Thermal':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'Modern Physics':
        return <Atom className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
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
      case 'Fluids & Thermal':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Modern Physics':
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
    'Fluids & Thermal',
    'Modern Physics',
  ];

  return (
    <div
      ref={stageContainerRef}
      className="flex flex-col h-full w-full bg-[#070b14] text-[#F0F0FA] overflow-hidden font-sans select-none"
    >
      {/* ================= UNIFIED TOP TOOLBAR (VIDYAVERSE THEME) ================= */}
      <header className="h-12 min-h-[48px] border-b border-[#2A2A3E] bg-[#161624]/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Back to PlayLab */}
          <button
            onClick={() => navigate('/playlab')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#9D9DB5] hover:text-white hover:bg-[#1C1C2A] border border-[#2A2A3E] transition-all"
            title="Return to PlayLab"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PlayLab</span>
          </button>

          {/* Directory Toggle Button */}
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
              sidebarOpen
                ? 'bg-[#26233E] text-[#7C5CFA] border-[#6541F5] shadow-[0_0_12px_rgba(101,65,245,0.3)]'
                : 'bg-[#1C1C2A] text-[#9D9DB5] border-[#2A2A3E] hover:text-white hover:bg-[#26233E]/50'
            }`}
            title="Toggle Labs Directory"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Simulations</span>
            <span className="text-[10px] px-1 rounded bg-[#12121A] text-[#7C5CFA] font-bold border border-[#2A2A3E]">
              {PHYSICS_SIMULATIONS.length}
            </span>
          </button>

          <div className="h-4 w-px bg-[#2A2A3E] hidden sm:block" />

          {/* Active Sim Category Pill & Title */}
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClass(
                selectedSim.category
              )}`}
            >
              {getCategoryIcon(selectedSim.category)}
              {selectedSim.category}
            </span>

            <div className="flex items-center gap-1.5 truncate">
              <h1 className="text-xs sm:text-sm font-bold text-[#F0F0FA] truncate">
                {selectedSim.title}
              </h1>
              <span className="hidden lg:inline text-[11px] text-[#9D9DB5] font-normal truncate">
                • {selectedSim.topicTag}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Info Drawer / Modal Toggle */}
          <button
            onClick={() => setInfoOpen((prev) => !prev)}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              infoOpen
                ? 'bg-[#26233E] text-[#7C5CFA] border-[#6541F5]'
                : 'bg-[#1C1C2A] text-[#9D9DB5] border-[#2A2A3E] hover:text-white'
            }`}
            title="Experiment Information & Objectives"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Audio Voice Lab Assistant */}
          <button
            onClick={toggleNarration}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
              isNarrating
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 animate-pulse'
                : 'bg-[#1C1C2A] text-[#9D9DB5] border-[#2A2A3E] hover:text-white'
            }`}
            title="Read Experiment Briefing"
          >
            {isNarrating ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden xl:inline">Voice Lab</span>
          </button>

          {/* Theory Panel Toggle */}
          <button
            onClick={() => setTheoryOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
              theoryOpen
                ? 'bg-[#26233E] text-[#7C5CFA] border-[#6541F5] shadow-[0_0_12px_rgba(101,65,245,0.3)]'
                : 'bg-[#1C1C2A] text-[#9D9DB5] border-[#2A2A3E] hover:text-white'
            }`}
            title="View Theory & Mathematical Formulas"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Theory</span>
          </button>

          {/* Reload Simulation Button */}
          <button
            onClick={() => {
              setIsLoadingIframe(true);
              setIframeKey((k) => k + 1);
            }}
            className="p-1.5 rounded-lg bg-[#1C1C2A] hover:bg-[#26233E] border border-[#2A2A3E] text-[#9D9DB5] hover:text-white transition-all"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-[#1C1C2A] hover:bg-[#26233E] border border-[#2A2A3E] text-[#9D9DB5] hover:text-white transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* ================= WORKSPACE BODY (ZERO UNNECESSARY OVERLAYS) ================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ================= COLLAPSIBLE LABS DIRECTORY (DRAWER) ================= */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute sm:relative top-0 left-0 bottom-0 w-80 max-w-[85vw] border-r border-[#2A2A3E] bg-[#161624]/98 backdrop-blur-xl flex flex-col z-30 shadow-2xl"
            >
              {/* Directory Search & Filters */}
              <div className="p-3 border-b border-[#2A2A3E] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F0F0FA]">
                    <Sparkles className="w-3.5 h-3.5 text-[#7C5CFA]" />
                    <span>Physics Laboratories</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#26233E] text-[#7C5CFA] font-bold border border-[#6541F5]/40">
                      {PHYSICS_SIMULATIONS.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded text-[#9D9DB5] hover:text-white hover:bg-[#1C1C2A]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#9D9DB5] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search physics experiments..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#12121A] border border-[#2A2A3E] rounded-lg text-[#F0F0FA] placeholder-[#74748C] focus:outline-none focus:border-[#7C5CFA]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9D9DB5] hover:text-white p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Category Filter Chips (Segmented Selector) */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
                        activeCategory === cat
                          ? 'bg-[#26233E] text-[#7C5CFA] border border-[#6541F5]/60 shadow-[0_0_12px_rgba(101,65,245,0.25)] font-semibold'
                          : 'bg-[#1C1C2A] text-[#9D9DB5] border border-[#2A2A3E] hover:text-[#F0F0FA] hover:bg-[#26233E]/40 font-medium'
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
                  <div className="text-center py-10 px-4 text-xs text-[#9D9DB5]">
                    <p>No physics simulations match "{searchQuery}"</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('All');
                      }}
                      className="mt-2 text-[#7C5CFA] hover:underline"
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
                        onClick={() => {
                          handleSelectSim(sim);
                          if (window.innerWidth < 640) setSidebarOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all relative group flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-[#26233E]/90 border-[#6541F5] shadow-[0_0_16px_rgba(101,65,245,0.25)] ring-1 ring-[#6541F5]/50'
                            : 'bg-[#1C1C2A]/60 hover:bg-[#1C1C2A] border-[#2A2A3E] hover:border-[#3E3E58]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5 w-full">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {getCategoryIcon(sim.category)}
                            <h3
                              className={`text-xs font-semibold truncate ${
                                isSelected
                                  ? 'text-white'
                                  : 'text-[#CBCBD9] group-hover:text-white'
                              }`}
                            >
                              {sim.title}
                            </h3>
                          </div>
                          {hasExplored && (
                            <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#9D9DB5] line-clamp-1">
                          {sim.subtitle}
                        </p>

                        <div className="flex items-center justify-between text-[10px] pt-0.5">
                          <span className="text-[#7C5CFA] font-medium">
                            {sim.topicTag}
                          </span>
                          {sim.formula && (
                            <span className="font-mono text-[#9D9DB5] truncate max-w-[120px]">
                              {sim.formula}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ================= MAIN CANVASES (100% UNOBSTRUCTED) ================= */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#070b14]">
          <div className="flex-1 w-full h-full relative overflow-hidden bg-[#070b14]">
            {/* Simulation Iframe Loading Overlay */}
            {isLoadingIframe && (
              <div className="absolute inset-0 bg-[#070b14] flex flex-col items-center justify-center gap-3 z-10 transition-opacity">
                <div className="w-8 h-8 border-2 border-[#6541F5]/20 border-t-[#7C5CFA] rounded-full animate-spin" />
                <p className="text-xs text-[#9D9DB5] font-medium">
                  Loading 3D Simulation...
                </p>
              </div>
            )}

            {/* Edge-to-Edge 3D Simulation Frame (No Overlays Over Controls!) */}
            <iframe
              key={`${selectedSim.id}-${iframeKey}`}
              src={`/physics/Simulations/${selectedSim.filename}`}
              title={selectedSim.title}
              onLoad={() => setIsLoadingIframe(false)}
              className="w-full h-full border-none select-none bg-[#070b14]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />

            {/* Floating Re-Open Sidebar Tab (When Sidebar is Closed) */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="absolute top-3 left-3 z-10 px-2.5 py-1.5 rounded-lg bg-[#1C1C2A]/90 hover:bg-[#26233E] text-[#F0F0FA] border border-[#2A2A3E] hover:border-[#6541F5]/50 shadow-xl text-xs font-medium flex items-center gap-1.5 transition-all"
                title="Open Simulations Menu"
              >
                <Layers className="w-3.5 h-3.5 text-[#7C5CFA]" />
                <span>Labs Menu</span>
              </button>
            )}
          </div>
        </main>

        {/* ================= EXPERIMENT INFO MODAL ================= */}
        <AnimatePresence>
          {infoOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-14 left-4 z-40 w-96 max-w-[calc(100vw-32px)] bg-[#161624]/98 backdrop-blur-xl border border-[#2A2A3E] rounded-2xl shadow-2xl p-4 text-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7C5CFA] tracking-wider">
                    {selectedSim.category} • {selectedSim.topicTag}
                  </span>
                  <h3 className="text-sm font-bold text-[#F0F0FA] mt-0.5">
                    {selectedSim.title}
                  </h3>
                </div>
                <button
                  onClick={() => setInfoOpen(false)}
                  className="p-1 rounded text-[#9D9DB5] hover:text-white hover:bg-[#1C1C2A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[#CBCBD9] leading-relaxed">
                {selectedSim.description}
              </p>

              {selectedSim.formula && (
                <div className="p-2.5 rounded-lg bg-[#26233E]/60 border border-[#6541F5]/30 flex items-center justify-between">
                  <span className="text-[11px] text-[#C4B5FD] font-medium">
                    Governing Equation
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    {selectedSim.formula}
                  </span>
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <span className="font-semibold text-[#F0F0FA]">
                  Key Observations:
                </span>
                {selectedSim.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[#9D9DB5]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFA] shrink-0 mt-1" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= THEORY SLIDE-OVER DRAWER ================= */}
        <AnimatePresence>
          {theoryOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute top-0 right-0 bottom-0 w-full sm:w-[480px] bg-[#161624]/98 backdrop-blur-xl border-l border-[#2A2A3E] shadow-2xl z-40 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-3.5 border-b border-[#2A2A3E] flex items-center justify-between bg-[#12121A]/80">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#7C5CFA]" />
                  <h3 className="text-sm font-bold text-white">Theory & Formulas</h3>
                </div>
                <button
                  onClick={() => setTheoryOpen(false)}
                  className="p-1 rounded-lg text-[#9D9DB5] hover:text-white hover:bg-[#1C1C2A] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7C5CFA] tracking-wider">
                    {selectedSim.category} • {selectedSim.topicTag}
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    {selectedSim.title}
                  </h2>
                  <p className="text-[#9D9DB5] mt-1">{selectedSim.subtitle}</p>
                </div>

                {/* Formatted Governing Mathematical Expression */}
                {selectedSim.formula && (
                  <div className="p-3.5 rounded-xl bg-[#26233E]/50 border border-[#6541F5]/30">
                    <span className="text-[10px] text-[#C4B5FD] font-semibold uppercase tracking-wider">
                      Governing Mathematical Formula
                    </span>
                    <div className="font-mono text-base font-bold text-white mt-1">
                      {selectedSim.formula}
                    </div>
                  </div>
                )}

                {/* Conceptual Overview */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-[#F0F0FA]">Physical Principle</h4>
                  <p className="text-[#CBCBD9] leading-relaxed">
                    {selectedSim.description}
                  </p>
                </div>

                {/* Core Learning Concepts */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[#F0F0FA]">Key Concepts & Derivations</h4>
                  <div className="space-y-1.5">
                    {selectedSim.learningObjectives.map((obj, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-[#12121A]/70 border border-[#2A2A3E] text-[#CBCBD9] flex items-start gap-2.5"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#26233E] text-[#7C5CFA] border border-[#6541F5]/40 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {i + 1}
                        </span>
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dedicated Theory Document Link */}
                {selectedSim.theoryPath && (
                  <div className="pt-2">
                    <a
                      href={selectedSim.theoryPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-lg bg-[#6541F5] hover:bg-[#7C5CFA] text-white font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Open Theory Document</span>
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
