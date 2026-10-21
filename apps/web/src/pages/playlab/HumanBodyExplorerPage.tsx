import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Search,
  ScanLine,
  Layers3,
  CircleDashed,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Compass,
  CircleHelp,
  BookOpen,
  Microscope,
  Share2,
  Play,
  FileText,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  ChevronRight,
  Info,
  Trophy,
  Sliders,
  Eye,
  Heart,
  Globe,
  Stethoscope,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import {
  ANATOMY_ORGANS,
  OrganId,
  OrganItem,
  HotspotItem,
} from './anatomy/anatomyData';
import {
  AnatomyEngine,
  CameraPreset,
} from './anatomy/threeEngine';

type ActiveModal = 'microscopic' | 'compare' | 'animation' | 'location' | 'quiz-summary' | null;

export const HumanBodyExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const { addXP } = useAuthStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AnatomyEngine | null>(null);
  const calloutRef = useRef<HTMLDivElement>(null);

  // Core state
  const [selectedOrganId, setSelectedOrganId] = useState<OrganId>('heart');
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotItem | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Viewer tool states
  const [autoRotate, setAutoRotate] = useState(true);
  const [crossSection, setCrossSection] = useState(false);
  const [sliceDepth, setSliceDepth] = useState(0);
  const [wireframe, setWireframe] = useState(false);
  const [isolated, setIsolated] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'dossier' | 'parts' | 'ncert'>('dossier');
  const [partSearch, setPartSearch] = useState('');

  // Modals
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // Labelling Quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [quizOrder, setQuizOrder] = useState<HotspotItem[]>([]);
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<{
    correct: boolean;
    picked: string;
    target: string;
    atTop: boolean;
  } | null>(null);

  const currentOrgan = useMemo(
    () => ANATOMY_ORGANS.find((o) => o.id === selectedOrganId) || ANATOMY_ORGANS[0],
    [selectedOrganId]
  );

  // Voice speech synthesis helper
  const speakText = useCallback(
    (text: string, langCode: string = 'en-US') => {
      if (!audioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = lang === 'hi' ? 'hi-IN' : langCode;
      window.speechSynthesis.speak(utterance);
    },
    [audioEnabled, lang]
  );

  // Ref callback for engine pick during quiz
  const quizPickRef = useRef<(hotspot: HotspotItem) => void>(() => {});

  // Initialize Three.js Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new AnatomyEngine(containerRef.current, {
      onLoading: (isLoading, progress) => {
        setLoading(isLoading);
        setLoadProgress(Math.round(progress * 100));
      },
      onSelect: (hotspot) => {
        setSelectedHotspot(hotspot);
        if (hotspot && audioEnabled) {
          const nameToSpeak = lang === 'hi' ? hotspot.nameHi : hotspot.name;
          speakText(`${nameToSpeak}. Latin: ${hotspot.ta}.`);
        }
      },
      onPick: (hotspot) => {
        quizPickRef.current(hotspot);
      },
    });

    engineRef.current = engine;
    engine.attachCallout(calloutRef.current);
    engine.setOrgan(currentOrgan);

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Update organ in engine when changed
  useEffect(() => {
    if (engineRef.current) {
      setSelectedHotspot(null);
      engineRef.current.setOrgan(currentOrgan);
    }
  }, [currentOrgan]);

  // Quiz state handlers
  const startQuiz = () => {
    const shuffled = [...currentOrgan.hotspots].sort(() => Math.random() - 0.5);
    setQuizOrder(shuffled);
    setQuizStep(0);
    setQuizScore(0);
    setQuizResults([]);
    setQuizFeedback(null);
    setQuizActive(true);
    setAutoRotate(false);
    engineRef.current?.setAutoRotate(false);
    engineRef.current?.setQuizMode(true);
  };

  const exitQuiz = () => {
    setQuizActive(false);
    setQuizFeedback(null);
    engineRef.current?.setQuizMode(false);
    engineRef.current?.setAutoRotate(autoRotate);
  };

  // Keep quizPickRef updated with current target
  useEffect(() => {
    quizPickRef.current = (hotspot: HotspotItem) => {
      if (!quizActive || quizFeedback) return;
      const target = quizOrder[quizStep];
      if (!target) return;

      const correct = hotspot.id === target.id;
      engineRef.current?.flash(hotspot.id, correct);
      if (!correct) {
        engineRef.current?.flash(target.id, true);
      }

      const screenY = engineRef.current?.hotspotScreenY(correct ? hotspot.id : target.id) ?? 0.5;

      setQuizFeedback({
        correct,
        picked: lang === 'hi' ? hotspot.nameHi : hotspot.name,
        target: lang === 'hi' ? target.nameHi : target.name,
        atTop: screenY > 0.55,
      });

      setQuizResults((prev) => [...prev, correct]);
      if (correct) {
        setQuizScore((s) => s + 1);
        speakText('Correct!');
      } else {
        speakText(`Missed. That was ${lang === 'hi' ? hotspot.nameHi : hotspot.name}`);
      }

      window.setTimeout(
        () => {
          setQuizFeedback(null);
          if (quizStep + 1 >= quizOrder.length) {
            setQuizActive(false);
            engineRef.current?.setQuizMode(false);
            setActiveModal('quiz-summary');
            addXP(Math.round(((quizScore + (correct ? 1 : 0)) / quizOrder.length) * 50));
          } else {
            setQuizStep((s) => s + 1);
          }
        },
        correct ? 1300 : 2500
      );
    };
  });

  // Hotspot search filter
  const filteredHotspots = useMemo(() => {
    if (!partSearch.trim()) return currentOrgan.hotspots;
    const q = partSearch.toLowerCase();
    return currentOrgan.hotspots.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.nameHi.toLowerCase().includes(q) ||
        h.ta.toLowerCase().includes(q) ||
        h.detail.toLowerCase().includes(q)
    );
  }, [currentOrgan.hotspots, partSearch]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFullscreen(false);
    }
  };

  return (
    <div className="space-y-4 max-w-[1720px] mx-auto pb-10">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/playlab')}
            className="p-2.5 rounded-xl bg-card border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors shadow-soft"
            title="Back to PlayLab"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                Human Body <span className="text-[#E95778]">Explorer</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FCE5EB] text-[#E95778] dark:bg-[#381521] dark:text-[#FFA0B6]">
                <Stethoscope className="w-3.5 h-3.5" />
                Classes 3–10 / NCERT Life Processes
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Interactive 3D Anatomical Observatory, Cross-Sections & Microstructure (ta2 Latin & NCERT Aligned)
            </p>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Toggle */}
          <button
            onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-text-primary transition-all shadow-soft"
            title="Switch Language (English / हिंदी)"
          >
            <Globe className="w-3.5 h-3.5 text-[#E95778]" />
            <span>{lang === 'en' ? 'English' : 'हिंदी'}</span>
          </button>

          {/* Audio Speech Toggle */}
          <button
            onClick={() => setAudioEnabled((a) => !a)}
            className={`p-2 rounded-xl border border-border transition-colors shadow-soft ${
              audioEnabled
                ? 'bg-rose-500/10 text-[#E95778] border-[#E95778]/30'
                : 'bg-card text-text-muted hover:text-text-primary'
            }`}
            title={audioEnabled ? 'Speech Pronunciation On' : 'Speech Pronunciation Off'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Quiz Mode Trigger */}
          <button
            onClick={quizActive ? exitQuiz : startQuiz}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-soft ${
              quizActive
                ? 'bg-amber-500 text-white shadow-amber-500/30'
                : 'bg-card border border-border text-text-primary hover:border-amber-500 hover:text-amber-500'
            }`}
          >
            <CircleHelp className="w-4 h-4" />
            <span>{quizActive ? 'Exit Quiz' : 'Labelling Quiz'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-card border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors shadow-soft"
            title="Toggle Fullscreen"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 9-Organ Quick Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-card border border-border rounded-2xl p-2 shadow-soft">
        {ANATOMY_ORGANS.map((organ) => {
          const isActive = organ.id === selectedOrganId;
          return (
            <button
              key={organ.id}
              onClick={() => {
                setSelectedOrganId(organ.id);
                if (quizActive) exitQuiz();
                addXP(3);
                speakText(lang === 'hi' ? organ.nameHi : organ.name);
              }}
              style={{
                borderColor: isActive ? organ.accent : undefined,
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-black/5 dark:bg-white/10 text-text-primary shadow-sm ring-1'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: organ.accent }}
              >
                {organ.icon}
              </span>
              <div className="text-left">
                <span className="block leading-tight font-medium">
                  {lang === 'hi' ? organ.nameHi : organ.name}
                </span>
                <span className="text-[10px] text-text-muted block leading-none">
                  {lang === 'hi' ? organ.systemHi : organ.system}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 3D WebGL Canvas Stage (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl relative flex flex-col min-h-[580px] h-[640px] shadow-soft overflow-hidden select-none">
          {/* Subtle Bio-Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

          {/* Three.js Container Mount */}
          <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 border-2 border-dashed border-[#E95778] rounded-full animate-spin flex items-center justify-center text-[#E95778]">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <strong className="text-slate-100 font-display text-sm tracking-wide">
                Loading 3D {lang === 'hi' ? currentOrgan.nameHi : currentOrgan.name}...
              </strong>
              <span className="text-xs text-slate-400 font-mono">{loadProgress}%</span>
            </div>
          )}

          {/* 3D Hotspot Callout Floating Badge */}
          {selectedHotspot && !quizActive && (
            <div
              ref={calloutRef}
              className="absolute left-0 top-0 z-20 pointer-events-auto transition-transform duration-75"
              style={{ willChange: 'transform' }}
            >
              <div
                className="relative -top-8 left-6 w-64 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200"
                style={{
                  boxShadow: `0 10px 30px -5px ${selectedHotspot.color}33`,
                }}
              >
                <button
                  onClick={() => engineRef.current?.clearSelection()}
                  className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-pulse"
                    style={{ backgroundColor: selectedHotspot.color }}
                  />
                  <strong className="text-xs font-bold text-white font-display">
                    {lang === 'hi' ? selectedHotspot.nameHi : selectedHotspot.name}
                  </strong>
                  <button
                    onClick={() =>
                      speakText(
                        `${lang === 'hi' ? selectedHotspot.nameHi : selectedHotspot.name}. ${selectedHotspot.ta}`
                      )
                    }
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 transition-colors ml-auto"
                    title="Pronounce"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-[10px] text-rose-400 font-mono italic block mb-1.5">
                  TA2: {selectedHotspot.ta}
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {lang === 'hi' ? selectedHotspot.detailHi : selectedHotspot.detail}
                </p>
              </div>
            </div>
          )}

          {/* Top-Left Tool Overlays (Auto-Rotate, Zoom, Cross-Section, Wireframe, Camera Presets) */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1.5 flex flex-col gap-1 shadow-lg">
              <button
                onClick={() => {
                  const next = !autoRotate;
                  setAutoRotate(next);
                  engineRef.current?.setAutoRotate(next);
                }}
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                  autoRotate
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="Toggle Auto-Rotation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => engineRef.current?.zoom(-1)}
                className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center"
                title="Zoom In"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const state = engineRef.current?.toggleCrossSection() ?? false;
                  setCrossSection(state);
                }}
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                  crossSection
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="Toggle Cross-Section Slice"
              >
                <ScanLine className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const state = engineRef.current?.toggleWireframe() ?? false;
                  setWireframe(state);
                }}
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                  wireframe
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="Toggle X-Ray / Wireframe"
              >
                <Layers3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const state = engineRef.current?.toggleIsolate() ?? false;
                  setIsolated(state);
                }}
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                  isolated
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="Toggle Pedestal Isolation"
              >
                <CircleDashed className="w-4 h-4" />
              </button>

              <div className="h-px bg-slate-700 my-1" />

              <button
                onClick={() => engineRef.current?.reset()}
                className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center"
                title="Reset Camera & Rotation"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>

            {/* Cross-section Slider when active */}
            {crossSection && (
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-lg flex flex-col gap-2 w-44 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 font-semibold text-amber-400">
                    <Sliders className="w-3.5 h-3.5" />
                    Slice Depth
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {sliceDepth > 0 ? `+${sliceDepth.toFixed(1)}` : sliceDepth.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1.6"
                  max="1.6"
                  step="0.1"
                  value={sliceDepth}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSliceDepth(val);
                    engineRef.current?.setSliceDepth(val);
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Camera View Presets Strip (Bottom-Left) */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1.5 shadow-lg text-[11px]">
            <span className="text-slate-400 px-2 font-medium hidden sm:inline">Views:</span>
            {[
              { id: 'anterior', label: 'Anterior (Front)' },
              { id: 'posterior', label: 'Posterior (Back)' },
              { id: 'lateral-l', label: 'Left' },
              { id: 'lateral-r', label: 'Right' },
              { id: 'superior', label: 'Top' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => engineRef.current?.setCameraPreset(p.id as CameraPreset)}
                className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Organ Specimen Label (Bottom-Right) */}
          <div className="absolute bottom-4 right-4 z-10 text-right bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl px-3.5 py-2">
            <span className="text-[10px] font-mono tracking-wider text-rose-400 uppercase block">
              {currentOrgan.system}
            </span>
            <strong className="text-sm text-white font-display">
              {lang === 'hi' ? currentOrgan.nameHi : currentOrgan.name} (
              <span className="italic font-serif">{currentOrgan.scientificName}</span>)
            </strong>
          </div>

          {/* Quiz Active Bar Overlay (When Labelling Quiz is running) */}
          {quizActive && quizOrder[quizStep] && (
            <div className="absolute top-4 inset-x-20 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Find & Click on 3D Model:
                </span>
                <strong className="text-base sm:text-lg font-bold text-white font-display">
                  {lang === 'hi' ? quizOrder[quizStep].nameHi : quizOrder[quizStep].name}
                  <span className="text-xs text-rose-400 font-mono ml-2 italic">
                    ({quizOrder[quizStep].ta})
                  </span>
                </strong>
              </div>

              {/* Progress Pips & Score */}
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[11px] font-mono text-slate-300">
                  Question {quizStep + 1} of {quizOrder.length} • Score: {quizScore}
                </span>
                <div className="flex items-center gap-1">
                  {quizOrder.map((q, idx) => {
                    const status =
                      idx < quizResults.length
                        ? quizResults[idx]
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                        : idx === quizStep
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-slate-700';
                    return <div key={q.id} className={`w-3 h-1.5 rounded-full ${status}`} />;
                  })}
                </div>
              </div>

              <button
                onClick={exitQuiz}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Exit Quiz"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Quiz Answer Feedback Toast */}
          {quizFeedback && (
            <div
              className={`absolute left-1/2 -translate-x-1/2 z-30 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white border transition-all animate-in zoom-in-95 duration-200 ${
                quizFeedback.atTop ? 'top-20' : 'bottom-20'
              } ${
                quizFeedback.correct
                  ? 'bg-emerald-600/95 border-emerald-400'
                  : 'bg-rose-600/95 border-rose-400'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                {quizFeedback.correct ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
              <div>
                <strong className="block text-sm font-bold">
                  {quizFeedback.correct ? 'Correct! Well Done!' : 'Incorrect Structure'}
                </strong>
                <span className="text-xs opacity-90">
                  {quizFeedback.correct
                    ? quizFeedback.target
                    : `You selected "${quizFeedback.picked}". Look for the green ring for "${quizFeedback.target}"!`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Anatomical Dossier & Parts Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-soft space-y-4">
            {/* Sidebar Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-border text-xs font-semibold">
              <button
                onClick={() => setSidebarTab('dossier')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  sidebarTab === 'dossier'
                    ? 'bg-card text-text-primary shadow-sm font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Dossier
              </button>
              <button
                onClick={() => setSidebarTab('parts')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  sidebarTab === 'parts'
                    ? 'bg-card text-text-primary shadow-sm font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                All Parts ({currentOrgan.hotspots.length})
              </button>
              <button
                onClick={() => setSidebarTab('ncert')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  sidebarTab === 'ncert'
                    ? 'bg-card text-text-primary shadow-sm font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                NCERT Notes
              </button>
            </div>

            {/* TAB 1: Organ Dossier */}
            {sidebarTab === 'dossier' && (
              <div className="space-y-4 text-xs leading-relaxed animate-in fade-in duration-150">
                <div className="flex items-start justify-between border-b border-border pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E95778] bg-[#FCE5EB] dark:bg-[#381521] px-2 py-0.5 rounded-md">
                      {lang === 'hi' ? currentOrgan.systemHi : currentOrgan.system}
                    </span>
                    <h2 className="text-xl font-bold font-display text-text-primary mt-1 flex items-center gap-2">
                      {lang === 'hi' ? currentOrgan.nameHi : currentOrgan.name}
                      <button
                        onClick={() =>
                          speakText(
                            `${lang === 'hi' ? currentOrgan.nameHi : currentOrgan.name}. Latin: ${
                              currentOrgan.scientificName
                            }. ${currentOrgan.functionDesc}`
                          )
                        }
                        className="p-1 rounded-md text-text-muted hover:text-[#E95778] transition-colors"
                        title="Pronounce Organ"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </h2>
                    <em className="text-[11px] text-text-muted italic block font-serif">
                      "{currentOrgan.poetic}" (Latin: {currentOrgan.scientificName})
                    </em>
                  </div>
                </div>

                <p className="text-text-muted">
                  {lang === 'hi' ? currentOrgan.descriptionHi : currentOrgan.description}
                </p>

                {/* Metrics Table */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-border">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block font-medium">
                      Dimensions:
                    </span>
                    <strong className="text-text-primary text-[11px]">{currentOrgan.size}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block font-medium">
                      Adult Weight:
                    </span>
                    <strong className="text-text-primary text-[11px]">{currentOrgan.weight}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-border">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block font-medium">
                      Anatomical Location:
                    </span>
                    <strong className="text-text-primary text-[11px]">{currentOrgan.location}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-border">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider block font-medium">
                      Blood Supply & Vasculature:
                    </span>
                    <span className="text-text-muted text-[11px]">{currentOrgan.bloodSupply}</span>
                  </div>
                </div>

                {/* Primary Physiological Function */}
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200">
                  <strong className="block mb-1 font-bold text-rose-700 dark:text-rose-300">
                    ⚙️ Primary Function:
                  </strong>
                  <p className="text-[11px] leading-relaxed">{currentOrgan.functionDesc}</p>
                </div>

                {/* Medical & Fun Note */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200">
                  <strong className="block mb-0.5 font-bold">💡 Did You Know?</strong>
                  <span className="text-[11px]">{currentOrgan.funFact}</span>
                </div>
              </div>
            )}

            {/* TAB 2: All Parts List (Search & Focus) */}
            {sidebarTab === 'parts' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="relative">
                  <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    placeholder="Search structures by name or Latin TA..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-[#E95778]"
                  />
                </div>

                <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {filteredHotspots.map((part) => {
                    const isSelected = selectedHotspot?.id === part.id;
                    return (
                      <button
                        key={part.id}
                        onClick={() => {
                          setSelectedHotspot(part);
                          engineRef.current?.focusHotspot(part);
                        }}
                        className={`w-full text-left p-2.5 rounded-2xl border transition-all text-xs ${
                          isSelected
                            ? 'bg-rose-500/10 border-[#E95778] text-text-primary shadow-sm'
                            : 'bg-card border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-primary'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: part.color }}
                            />
                            <strong className="font-semibold text-text-primary">
                              {lang === 'hi' ? part.nameHi : part.name}
                            </strong>
                          </div>
                          <span className="text-[10px] font-mono text-[#E95778] italic">
                            {part.ta}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted line-clamp-2">
                          {lang === 'hi' ? part.detailHi : part.detail}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: NCERT Life Processes Notes */}
            {sidebarTab === 'ncert' && (
              <div className="space-y-3 text-xs animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200">
                  <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400 mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>NCERT Class 10 / Chapter 6: Life Processes</span>
                  </div>
                  <ul className="space-y-1.5 list-disc pl-4 text-[11px] text-text-muted">
                    {currentOrgan.ncertNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>

                {/* Clinical Conditions */}
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-border">
                  <strong className="font-bold text-text-primary block mb-1.5">
                    🏥 Associated Pathologies & Clinical Conditions:
                  </strong>
                  <div className="flex flex-wrap gap-1.5">
                    {currentOrgan.conditions.map((cond, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 text-text-muted text-[10px] font-medium"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learning Cards Strip (Microscopic, Comparative, Motion, Location) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {/* Card 1: Microscopic Histology */}
        <div
          onClick={() => setActiveModal('microscopic')}
          className="group cursor-pointer bg-card border border-border hover:border-[#E95778] rounded-3xl p-4 shadow-soft transition-all hover:shadow-lg space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-muted uppercase tracking-wider text-[10px]">
              Microscopic Histology
            </span>
            <Microscope className="w-4 h-4 text-[#E95778] group-hover:scale-110 transition-transform" />
          </div>
          <div className="aspect-square w-full rounded-2xl bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center p-2">
            <img
              src={`/anatomy/${currentOrgan.id}/microscopic.webp`}
              alt="Microscopic view"
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <strong className="text-text-primary font-display truncate">
              {currentOrgan.tissue}
            </strong>
            <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Comparative Anatomy */}
        <div
          onClick={() => setActiveModal('compare')}
          className="group cursor-pointer bg-card border border-border hover:border-amber-500 rounded-3xl p-4 shadow-soft transition-all hover:shadow-lg space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-muted uppercase tracking-wider text-[10px]">
              Comparative Anatomy
            </span>
            <Share2 className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="aspect-square w-full rounded-2xl bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center p-2">
            <img
              src={`/anatomy/${currentOrgan.id}/compare.webp`}
              alt="Comparative view"
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <strong className="text-text-primary font-display truncate">
              {currentOrgan.comparison}
            </strong>
            <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Physiological Motion */}
        <div
          onClick={() => setActiveModal('animation')}
          className="group cursor-pointer bg-card border border-border hover:border-emerald-500 rounded-3xl p-4 shadow-soft transition-all hover:shadow-lg space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-muted uppercase tracking-wider text-[10px]">
              Physiological Motion
            </span>
            <Play className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="aspect-square w-full rounded-2xl bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center p-2 relative">
            <img
              src={`/anatomy/${currentOrgan.id}/organ.webp`}
              alt="Physiological motion"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md flex items-center justify-center text-emerald-600">
                <Play className="w-4 h-4 ml-0.5 fill-current" />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <strong className="text-text-primary font-display truncate">
              Rhythmic Pumping & Flow
            </strong>
            <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: Whole-Body Location */}
        <div
          onClick={() => setActiveModal('location')}
          className="group cursor-pointer bg-card border border-border hover:border-sky-500 rounded-3xl p-4 shadow-soft transition-all hover:shadow-lg space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-muted uppercase tracking-wider text-[10px]">
              System Integration
            </span>
            <Compass className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="aspect-square w-full rounded-2xl bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center p-2">
            <img
              src={`/anatomy/${currentOrgan.id}/location.webp`}
              alt="System location"
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <strong className="text-text-primary font-display truncate">
              {currentOrgan.system}
            </strong>
            <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Interactive Atlas Modal */}
      {activeModal && activeModal !== 'quiz-summary' && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-[#E95778] uppercase tracking-wider">
                {currentOrgan.name} • {currentOrgan.system}
              </span>
              <h3 className="text-xl font-bold font-display text-text-primary">
                {activeModal === 'microscopic' && 'Microscopic Histological Atlas'}
                {activeModal === 'compare' && 'Comparative Organ Relationships'}
                {activeModal === 'animation' && 'Physiological Dynamic Motion'}
                {activeModal === 'location' && 'Anatomical Mediastinum & Cavity Placement'}
              </h3>
            </div>

            <div className="w-full max-h-[380px] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 p-2 flex items-center justify-center">
              <img
                src={`/anatomy/${currentOrgan.id}/${
                  activeModal === 'animation'
                    ? 'organ'
                    : activeModal === 'microscopic'
                    ? 'microscopic'
                    : activeModal === 'compare'
                    ? 'compare'
                    : 'location'
                }.webp`}
                alt="Modal visual"
                className={`max-h-[360px] w-auto object-contain rounded-xl ${
                  activeModal === 'animation' ? 'animate-pulse' : ''
                }`}
              />
            </div>

            <p className="text-xs text-text-muted leading-relaxed text-center">
              {activeModal === 'microscopic' &&
                `Microscopic cytology and tissue histology: ${currentOrgan.tissue}. Specimen shows specialized cell structures, capillaries, and matrix.`}
              {activeModal === 'compare' &&
                `Comparison analysis: ${currentOrgan.comparison}. Highlights physiological synergy between organ systems.`}
              {activeModal === 'animation' &&
                `Physiological motion mechanics: ${currentOrgan.functionDesc}`}
              {activeModal === 'location' &&
                `Whole body positioning: Located in ${currentOrgan.location}. Connected via major vascular and neural conduits.`}
            </p>
          </div>
        </div>
      )}

      {/* Quiz Completion Modal */}
      {activeModal === 'quiz-summary' && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-2xl font-bold border border-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-display text-text-primary">
                Labelling Quiz Completed!
              </h3>
              <p className="text-xs text-text-muted mt-1">
                You tested your knowledge of {currentOrgan.name}'s 3D anatomy.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border">
              <span className="text-3xl font-extrabold text-[#E95778] font-display">
                {quizScore} / {quizOrder.length}
              </span>
              <span className="block text-xs text-text-muted mt-1">
                Score: {Math.round((quizScore / quizOrder.length) * 100)}% Accuracy
              </span>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                +50 XP Earned
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setActiveModal(null);
                  startQuiz();
                }}
                className="w-full py-2.5 rounded-xl bg-[#E95778] hover:bg-[#d84869] text-white font-semibold text-xs transition-colors shadow-soft"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-primary font-semibold text-xs transition-colors"
              >
                Back to Explorer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HumanBodyExplorerPage;
