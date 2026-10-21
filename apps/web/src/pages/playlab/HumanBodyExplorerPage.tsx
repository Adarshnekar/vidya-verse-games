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
  Compass,
  CircleHelp,
  BookOpen,
  Microscope,
  Share2,
  Play,
  FileText,
  Check,
  X,
  Sparkles,
  Heart,
  Globe,
  Stethoscope,
  Bookmark,
  BrainCircuit,
  LibraryBig,
  NotebookPen,
  ArrowRight,
  Tag,
  Sliders,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import {
  ANATOMY_ORGANS,
  OrganId,
  HotspotItem,
} from './anatomy/anatomyData';
import {
  AnatomyEngine,
} from './anatomy/threeEngine';
import './anatomy/anatomy.css';

type ActiveModal = 'lesson' | 'animation' | 'microscopic' | 'compare' | 'system' | null;

export const HumanBodyExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const { addXP } = useAuthStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const labelsContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AnatomyEngine | null>(null);

  // Core state
  const [selectedOrganId, setSelectedOrganId] = useState<OrganId>('heart');
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotItem | null>(null);
  const [partModalHotspot, setPartModalHotspot] = useState<HotspotItem | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [query, setQuery] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [crossSection, setCrossSection] = useState(false);
  const [sliceDepth, setSliceDepth] = useState(0);

  // Modals & Quiz
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
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
  const [quizSummaryOpen, setQuizSummaryOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentOrgan = useMemo(
    () => ANATOMY_ORGANS.find((o) => o.id === selectedOrganId) || ANATOMY_ORGANS[0],
    [selectedOrganId]
  );

  const filteredOrgans = useMemo(() => {
    if (!query.trim()) return ANATOMY_ORGANS;
    const q = query.toLowerCase();
    return ANATOMY_ORGANS.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.nameHi.toLowerCase().includes(q) ||
        o.system.toLowerCase().includes(q)
    );
  }, [query]);

  // Web Speech audio helper
  const speakText = useCallback(
    (text: string) => {
      if (!audioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    },
    [audioEnabled, lang]
  );

  const quizPickRef = useRef<(hotspot: HotspotItem) => void>(() => {});
  const handlePartClickRef = useRef<(hotspot: HotspotItem) => void>(() => {});

  useEffect(() => {
    handlePartClickRef.current = (hotspot: HotspotItem) => {
      if (quizActive) return;
      setPartModalHotspot(hotspot);
      setSelectedHotspot(hotspot);
      if (audioEnabled) {
        const name = lang === 'hi' ? hotspot.nameHi : hotspot.name;
        const detail = lang === 'hi' ? hotspot.detailHi : hotspot.detail;
        speakText(`${name}. Latin: ${hotspot.ta}. ${detail}`);
      }
    };
  });

  // Initialize Three.js Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new AnatomyEngine(containerRef.current, {
      onLoading: () => {},
      onSelect: (hotspot) => {
        setSelectedHotspot(hotspot);
        if (hotspot) {
          handlePartClickRef.current(hotspot);
        }
      },
      onPick: (hotspot) => {
        quizPickRef.current(hotspot);
      },
    });

    engineRef.current = engine;
    engine.attachLabelsContainer(labelsContainerRef.current);
    engine.setShowLabels(showLabels);
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
      setPartModalHotspot(null);
      engineRef.current.setOrgan(currentOrgan);
    }
  }, [currentOrgan]);

  // Synchronize labels visibility
  useEffect(() => {
    engineRef.current?.setShowLabels(showLabels);
  }, [showLabels]);

  // Tool actions
  const handleTool = (toolId: string) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (toolId === 'rotate') {
      const next = !autoRotate;
      setAutoRotate(next);
      engine.setAutoRotate(next);
    } else if (toolId === 'zoom') {
      engine.zoom(-1);
    } else if (toolId === 'isolate') {
      const active = engine.toggleIsolate();
      setActiveTool(active ? 'isolate' : null);
    } else if (toolId === 'section') {
      const active = engine.toggleCrossSection();
      setCrossSection(active);
      setActiveTool(active ? 'section' : null);
    } else if (toolId === 'layers') {
      const active = engine.toggleWireframe();
      setActiveTool(active ? 'layers' : null);
    } else if (toolId === 'labels') {
      setShowLabels((prev) => !prev);
    } else if (toolId === 'compare') {
      setActiveModal('compare');
    } else if (toolId === 'reset') {
      engine.reset();
      setActiveTool(null);
      setCrossSection(false);
    }
  };

  // Labelling quiz controls
  const startQuiz = () => {
    const shuffled = [...currentOrgan.hotspots].sort(() => Math.random() - 0.5);
    setQuizOrder(shuffled);
    setQuizStep(0);
    setQuizScore(0);
    setQuizResults([]);
    setQuizFeedback(null);
    setQuizSummaryOpen(false);
    setQuizActive(true);
    setAutoRotate(false);
    engineRef.current?.setAutoRotate(false);
    engineRef.current?.setQuizMode(true);
  };

  const exitQuiz = () => {
    setQuizActive(false);
    setQuizFeedback(null);
    setQuizSummaryOpen(false);
    engineRef.current?.setQuizMode(false);
    engineRef.current?.setAutoRotate(autoRotate);
  };

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
            setQuizSummaryOpen(true);
            addXP(Math.round(((quizScore + (correct ? 1 : 0)) / quizOrder.length) * 50));
          } else {
            setQuizStep((s) => s + 1);
          }
        },
        correct ? 1200 : 2400
      );
    };
  });

  return (
    <div className="anatomy-scope">
      {/* Topbar matching Anatomy Atelier header */}
      <header className="anatomy-topbar">
        {/* PlayLab Back Link */}
        <button onClick={() => navigate('/playlab')} className="anatomy-back-btn" title="Back to PlayLab">
          <ArrowLeft size={16} />
          <span>PlayLab</span>
        </button>

        {/* Brand */}
        <button
          className="anatomy-brand"
          type="button"
          onClick={() => setSelectedOrganId('heart')}
          aria-label="Anatomy Atelier"
        >
          <strong>Anatomy Atelier<sup>✦</sup></strong>
          <em>A living index of the human form</em>
        </button>

        {/* Main Nav Pills */}
        <nav className="anatomy-main-nav">
          <button className="active"><Compass size={15} /> Explore</button>
          <button onClick={() => setActiveModal('system')}><BrainCircuit size={15} /> Systems</button>
          <button onClick={() => setActiveModal('lesson')}><BookOpen size={15} /> Lessons</button>
          <button onClick={() => setQuery('')}><LibraryBig size={15} /> Library</button>
          <button onClick={() => setActiveModal('lesson')}><NotebookPen size={15} /> NCERT Notes</button>
        </nav>

        {/* Search */}
        <label className="anatomy-search-box">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organs, topics..."
          />
        </label>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="anatomy-lang-btn"
            title={audioEnabled ? 'Speech Pronunciation On' : 'Speech Pronunciation Off'}
          >
            {audioEnabled ? <Volume2 size={15} className="text-[#eb7c6b]" /> : <VolumeX size={15} />}
          </button>

          {/* Language switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="anatomy-lang-btn"
            title="Switch Language"
          >
            <Globe size={15} />
            <span>{lang === 'en' ? 'English' : 'हिंदी'}</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="anatomy-lang-btn"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* 3-Column Workspace (Original Design) */}
      <div className="anatomy-workspace">
        {/* LEFT COLUMN: Organ Library */}
        <aside className="organ-library">
          <div className="panel-heading">
            <span>Organ Library</span>
            <button aria-label="Library saved" type="button">
              <Bookmark size={15} />
            </button>
          </div>

          <div className="organ-list">
            {filteredOrgans.map((item) => {
              const isActive = selectedOrganId === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`organ-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedOrganId(item.id);
                    if (quizActive) exitQuiz();
                    addXP(3);
                    speakText(lang === 'hi' ? item.nameHi : item.name);
                  }}
                  style={{ '--item-accent': item.accent } as React.CSSProperties}
                >
                  <span className="organ-glyph">
                    <img
                      src={`/anatomy/${item.id}/thumb.webp`}
                      alt={item.name}
                      loading="eager"
                    />
                  </span>
                  <span>
                    <b>{lang === 'hi' ? item.nameHi : item.name}</b>
                    <small>{lang === 'hi' ? item.systemHi : item.system}</small>
                  </span>
                  {isActive && <Heart className="favorite" size={14} fill="currentColor" />}
                </button>
              );
            })}
          </div>

          <button className="view-all" type="button" onClick={() => setQuery('')}>
            View all organs <ArrowRight size={13} />
          </button>
        </aside>

        {/* CENTER COLUMN: 3D Viewer */}
        <section
          className="viewer-shell"
          aria-label={`3D Model of ${currentOrgan.name}`}
          style={{ '--organ-accent': currentOrgan.accent } as React.CSSProperties}
        >
          {/* Subtle Radial Glow behind Organ */}
          <div className="viewer-glow" />

          {/* Three.js Canvas Mount */}
          <div ref={containerRef} className="three-mount" />

          {/* Floating Left Vertical Tool Pill */}
          <div className="viewer-tools">
            <button
              type="button"
              className={`tool-button ${autoRotate ? 'active' : ''}`}
              onClick={() => handleTool('rotate')}
              title="Rotate"
            >
              <RotateCcw size={18} strokeWidth={1.7} />
              <span>Rotate</span>
            </button>
            <button
              type="button"
              className="tool-button"
              onClick={() => handleTool('zoom')}
              title="Zoom In"
            >
              <Search size={18} strokeWidth={1.7} />
              <span>Zoom</span>
            </button>
            <button
              type="button"
              className={`tool-button ${activeTool === 'isolate' ? 'active' : ''}`}
              onClick={() => handleTool('isolate')}
              title="Isolate"
            >
              <CircleDashed size={18} strokeWidth={1.7} />
              <span>Isolate</span>
            </button>
            <button
              type="button"
              className={`tool-button ${crossSection ? 'active' : ''}`}
              onClick={() => handleTool('section')}
              title="Cross-section"
            >
              <ScanLine size={18} strokeWidth={1.7} />
              <span>Section</span>
            </button>
            <button
              type="button"
              className={`tool-button ${activeTool === 'layers' ? 'active' : ''}`}
              onClick={() => handleTool('layers')}
              title="Layers / X-Ray"
            >
              <Layers3 size={18} strokeWidth={1.7} />
              <span>Layers</span>
            </button>
            <button
              type="button"
              className={`tool-button ${showLabels ? 'active' : ''}`}
              onClick={() => handleTool('labels')}
              title="Show / Hide Labels"
            >
              <Tag size={18} strokeWidth={1.7} />
              <span>Labels</span>
            </button>
            <button
              type="button"
              className="tool-button"
              onClick={() => handleTool('compare')}
              title="Compare"
            >
              <Share2 size={18} strokeWidth={1.7} />
              <span>Compare</span>
            </button>
            <button
              type="button"
              className="tool-button"
              onClick={() => handleTool('reset')}
              title="Reset"
            >
              <RotateCcw size={18} strokeWidth={1.7} />
              <span>Reset</span>
            </button>
          </div>

          {/* Cross-section slice depth slider when active */}
          {crossSection && (
            <div
              className="absolute left-24 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-md border border-[#755b46]/20 rounded-2xl p-3 shadow-lg flex flex-col gap-2 w-40 text-xs"
            >
              <div className="flex items-center justify-between text-[#2f2a27]">
                <span className="flex items-center gap-1 font-semibold text-[#eb7c6b]">
                  <Sliders size={13} />
                  Slice Depth
                </span>
                <span className="font-mono text-[10px] text-[#8d847c]">
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
                className="w-full accent-[#eb7c6b] cursor-pointer"
              />
            </div>
          )}

          {/* Yellow Tilted Tip Note */}
          {!quizActive && (
            <aside className="tip-note">
              <span><Sparkles size={14} /> Tip</span>
              <p>Drag to rotate<br />Scroll to zoom<br />Click a dot to learn more</p>
            </aside>
          )}

          {/* FLOATING 3D PART LABELS (Labels Container) */}
          <div ref={labelsContainerRef} className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {currentOrgan.hotspots.map((spot) => (
              <div
                key={spot.id}
                data-hotspot-id={spot.id}
                className="part-floating-tag pointer-events-auto"
                onClick={() => {
                  engineRef.current?.focusHotspot(spot);
                  handlePartClickRef.current(spot);
                }}
                title={`Click to inspect ${spot.name}`}
              >
                <span className="tag-dot" style={{ backgroundColor: spot.color }} />
                <span>{lang === 'hi' ? spot.nameHi : spot.name}</span>
                <span className="tag-ta">{spot.ta}</span>
              </div>
            ))}
          </div>

          {/* 3D Labelling Quiz Bar Overlay */}
          {quizActive && quizOrder[quizStep] && (
            <div className="quiz-bar" role="status">
              <div className="quiz-prompt">
                <em>Find this structure:</em>
                <strong>
                  {lang === 'hi' ? quizOrder[quizStep].nameHi : quizOrder[quizStep].name}
                  <span className="text-xs font-mono font-normal ml-2 opacity-75">
                    ({quizOrder[quizStep].ta})
                  </span>
                </strong>
              </div>
              <div className="quiz-meta">
                <span className="quiz-progress">
                  Question {quizStep + 1} of {quizOrder.length} • Score {quizScore}
                </span>
                <ol className="quiz-pips" aria-hidden>
                  {quizOrder.map((h, i) => (
                    <li
                      key={h.id}
                      className={
                        i < quizResults.length
                          ? quizResults[i] ? 'ok' : 'no'
                          : i === quizStep ? 'now' : ''
                      }
                    />
                  ))}
                </ol>
                <small>Click directly on the 3D model</small>
              </div>
              <button type="button" onClick={exitQuiz} aria-label="Exit quiz">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Quiz Answer Feedback Toast */}
          {quizFeedback && (
            <div
              className={`quiz-answer ${quizFeedback.correct ? 'ok' : 'no'} ${
                quizFeedback.atTop ? 'at-top' : ''
              }`}
            >
              <span className="quiz-answer-icon">
                {quizFeedback.correct ? <Check size={20} /> : <X size={20} />}
              </span>
              <div>
                <strong>{quizFeedback.correct ? 'Correct!' : 'Incorrect Structure'}</strong>
                {quizFeedback.correct ? (
                  <span>{quizFeedback.target}</span>
                ) : (
                  <>
                    <span>You selected: {quizFeedback.picked}</span>
                    <span className="quiz-answer-hint">
                      Look for the green ring at: {quizFeedback.target}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quiz Completion Modal */}
          {quizSummaryOpen && (
            <div className="quiz-summary">
              <span className="modal-icon">{quizScore === quizOrder.length ? '★' : '✓'}</span>
              <h2>Quiz Complete!</h2>
              <p>
                You identified {quizScore} out of {quizOrder.length} structures accurately.
              </p>
              <div className="quiz-summary-actions">
                <button type="button" className="lesson-button" onClick={startQuiz}>
                  Retake Quiz <ArrowRight size={14} />
                </button>
                <button type="button" onClick={exitQuiz}>
                  Back to Explorer
                </button>
              </div>
            </div>
          )}

          {/* Bottom Left Specimen Caption */}
          <div className="view-caption">
            <span>3D Specimen • Click a dot to explore</span>
            <strong>{currentOrgan.scientificName}</strong>
          </div>

          {/* Bottom Right Auto-Rotate Switch */}
          {!quizActive && (
            <button
              className="auto-rotate"
              type="button"
              onClick={() => {
                const next = !autoRotate;
                setAutoRotate(next);
                engineRef.current?.setAutoRotate(next);
              }}
              aria-pressed={autoRotate}
            >
              <RotateCcw size={13} /> Auto rotate
              <span className={`switch ${autoRotate ? 'on' : ''}`}><i /></span>
            </button>
          )}
        </section>

        {/* RIGHT COLUMN: Info Panel (Anatomical Dossier) */}
        <aside className="info-panel">
          <div className="info-kicker">
            <Heart size={13} fill="currentColor" /> {lang === 'hi' ? currentOrgan.nameHi : `The ${currentOrgan.name}`}
          </div>

          <div className="info-title-row">
            <div>
              <h1>{lang === 'hi' ? currentOrgan.nameHi : currentOrgan.name}</h1>
              <em>{currentOrgan.poetic}</em>
            </div>
            <span className="specimen-stamp">
              <img
                src={`/anatomy/${currentOrgan.id}/organ.webp`}
                alt={currentOrgan.name}
              />
            </span>
          </div>

          <p className="description">
            {lang === 'hi' ? currentOrgan.descriptionHi : currentOrgan.description}
          </p>

          <div className="rule" />

          <h2>Key Facts</h2>
          <dl className="key-facts">
            <div>
              <dt><span>◇</span> Size</dt>
              <dd>{currentOrgan.size}</dd>
            </div>
            <div>
              <dt><span>♙</span> Weight</dt>
              <dd>{currentOrgan.weight}</dd>
            </div>
            <div>
              <dt><span>⌁</span> Daily</dt>
              <dd>{currentOrgan.dailyFact}</dd>
            </div>
            <div>
              <dt><span>⌖</span> Location</dt>
              <dd>{currentOrgan.location}</dd>
            </div>
            <div>
              <dt><span>❋</span> Blood supply</dt>
              <dd>{currentOrgan.bloodSupply}</dd>
            </div>
            <div>
              <dt><span>◈</span> Function</dt>
              <dd>{currentOrgan.functionDesc}</dd>
            </div>
          </dl>

          <div className="medical-note">
            <Stethoscope size={16} />
            <p>
              <b>Medical importance</b>
              {currentOrgan.medical}
            </p>
          </div>

          <div className="fun-note">
            <Sparkles size={15} />
            <p>
              <b>Did you know</b>
              {currentOrgan.funFact}
            </p>
          </div>

          <button className="lesson-button" onClick={() => setActiveModal('lesson')}>
            View lesson <ArrowRight size={15} />
          </button>

          <div className="action-grid">
            <button onClick={() => setActiveModal('animation')}>
              <Play size={14} /> Animate
            </button>
            <button onClick={startQuiz}>
              <CircleHelp size={14} /> Quiz
            </button>
          </div>
        </aside>
      </div>

      {/* BOTTOM STRIP: Learning Cards (Original 6-Card Suite) */}
      <section className="learning-cards">
        {/* Card 1: Curiosity Card */}
        <article className="curiosity-card">
          <span>✿</span>
          <p>The human body is an orchestra of synchronized cellular wonders.</p>
          <em>Leonardo da Vinci, Anatomical Studies</em>
        </article>

        {/* Card 2: Microscopic Histology */}
        <article>
          <header>
            <div>
              <em>Microscopic</em>
              <h3>{currentOrgan.tissue}</h3>
            </div>
            <Microscope size={16} />
          </header>
          <div className="microscope-visual organ-card-image">
            <img src={`/anatomy/${currentOrgan.id}/microscopic.webp`} alt="Microscopic histology" />
          </div>
          <button onClick={() => setActiveModal('microscopic')}>
            Explore tissue <ArrowRight size={13} />
          </button>
        </article>

        {/* Card 3: Compare Organs */}
        <article>
          <header>
            <div>
              <em>Compare</em>
              <h3>{currentOrgan.comparison}</h3>
            </div>
            <Share2 size={16} />
          </header>
          <div className="comparison-visual organ-card-image">
            <img src={`/anatomy/${currentOrgan.id}/compare.webp`} alt="Comparative anatomy" />
          </div>
          <button onClick={() => setActiveModal('compare')}>
            Open comparison <ArrowRight size={13} />
          </button>
        </article>

        {/* Card 4: Function Animation */}
        <article>
          <header>
            <div>
              <em>Animation</em>
              <h3>Rhythmic Pumping</h3>
            </div>
            <Play size={16} />
          </header>
          <button
            type="button"
            className="function-visual organ-card-image"
            onClick={() => setActiveModal('animation')}
          >
            <img src={`/anatomy/${currentOrgan.id}/organ.webp`} alt="Physiological motion" />
            <i className="function-pulse" />
            <span className="play-badge"><Play size={16} fill="currentColor" /></span>
          </button>
          <button onClick={() => setActiveModal('animation')}>
            Play animation <ArrowRight size={13} />
          </button>
        </article>

        {/* Card 5: Clinical Notes */}
        <article>
          <header>
            <div>
              <em>Clinical notes</em>
              <h3>Common conditions</h3>
            </div>
            <FileText size={16} />
          </header>
          <ul>
            {currentOrgan.conditions.slice(0, 4).map((cond, i) => (
              <li key={i}>{cond}</li>
            ))}
          </ul>
          <button onClick={() => setActiveModal('lesson')}>
            See all conditions <ArrowRight size={13} />
          </button>
        </article>

        {/* Card 6: Where It Works */}
        <article className="system-card">
          <header>
            <div>
              <em>Where it works</em>
              <h3>{currentOrgan.system}</h3>
            </div>
            <BrainCircuit size={16} />
          </header>
          <button
            type="button"
            className="system-visual organ-card-image"
            onClick={() => setActiveModal('system')}
          >
            <img src={`/anatomy/${currentOrgan.id}/location.webp`} alt="Whole body location" />
          </button>
          <button onClick={() => setActiveModal('system')}>
            See system <ArrowRight size={13} />
          </button>
        </article>
      </section>

      {/* Part Detail Pop-up Modal (like 2nd pic) */}
      {partModalHotspot && !quizActive && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
            setPartModalHotspot(null);
          }}
        >
          <section
            className="learning-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={partModalHotspot.name}
          >
            {/* Top Close Button */}
            <button
              className="modal-close"
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                setPartModalHotspot(null);
              }}
              aria-label="Close modal"
            >
              <X size={17} />
            </button>

            {/* Top Audio / Play Badge */}
            <button
              className="modal-icon cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              type="button"
              title="Click to hear speech pronunciation"
              onClick={() => {
                const name = lang === 'hi' ? partModalHotspot.nameHi : partModalHotspot.name;
                const detail = lang === 'hi' ? partModalHotspot.detailHi : partModalHotspot.detail;
                speakText(`${name}. Latin: ${partModalHotspot.ta}. ${detail}`);
              }}
            >
              <Play size={18} fill="currentColor" />
            </button>

            {/* Subtitle matching Pic 2 */}
            <em>Guided Exploration</em>

            {/* Big Part Name */}
            <h2>{lang === 'hi' ? partModalHotspot.nameHi : partModalHotspot.name}</h2>

            {/* Latin & System Badge */}
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <span className="inline-block text-[11px] font-mono font-medium text-[#eb7c6b] bg-[#eb7c6b]/10 px-2.5 py-0.5 rounded-full border border-[#eb7c6b]/20">
                TA2: {partModalHotspot.ta}
              </span>
              <span className="inline-block text-[11px] font-serif text-[#8d847c]">
                {lang === 'hi' ? currentOrgan.nameHi : currentOrgan.name} • {lang === 'hi' ? currentOrgan.systemHi : currentOrgan.system}
              </span>
            </div>

            {/* Content Explanation Block */}
            <div className="my-3 px-3.5 py-3 rounded-xl bg-[#eb7c6b]/[0.07] border-l-4 border-[#eb7c6b] text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#eb7c6b] block mb-1">
                Content Explanation & Anatomical Function
              </span>
              <p className="text-[#3b342f] text-[13.5px] leading-relaxed m-0 font-serif">
                {lang === 'hi' ? partModalHotspot.detailHi : partModalHotspot.detail}
              </p>
            </div>

            {/* Circular Organ / Part Artwork Preview matching Pic 2 */}
            <div className="modal-demo">
              <img
                src={`/anatomy/${currentOrgan.id}/organ.webp`}
                alt={partModalHotspot.name}
                loading="lazy"
              />
            </div>

            {/* Continue Exploring Button */}
            <button
              className="lesson-button"
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                setPartModalHotspot(null);
              }}
            >
              Continue exploring <ArrowRight size={15} />
            </button>
          </section>
        </div>
      )}

      {/* Interactive Guided Modals */}
      {activeModal && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <section
            className={`learning-modal ${activeModal === 'system' ? 'wide' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setActiveModal(null)} aria-label="Close modal">
              <X size={17} />
            </button>

            <span className="modal-icon">
              {activeModal === 'animation' ? '▶' : activeModal === 'system' ? '⌖' : '✦'}
            </span>
            <em>Guided Exploration</em>

            <h2>
              {activeModal === 'lesson' && `Inside the ${currentOrgan.name}`}
              {activeModal === 'animation' && `${currentOrgan.name} in Motion`}
              {activeModal === 'microscopic' && `Microscopic Histology`}
              {activeModal === 'compare' && `Comparative Anatomy`}
              {activeModal === 'system' && `Where the ${currentOrgan.name} Works`}
            </h2>

            {activeModal === 'system' ? (
              <>
                <p>
                  Integrated within the {currentOrgan.system}. Located in {currentOrgan.location}.
                </p>
                <figure className="modal-figure">
                  <img src={`/anatomy/${currentOrgan.id}/location.webp`} alt="System placement" />
                </figure>
                <dl className="modal-facts">
                  <div>
                    <dt>System</dt>
                    <dd>{currentOrgan.system}</dd>
                  </div>
                  <div>
                    <dt>Primary role</dt>
                    <dd>{currentOrgan.functionDesc}</dd>
                  </div>
                  <div>
                    <dt>Blood supply</dt>
                    <dd>{currentOrgan.bloodSupply}</dd>
                  </div>
                </dl>
                <button className="lesson-button" onClick={() => setActiveModal(null)}>
                  Continue exploring <ArrowRight size={15} />
                </button>
              </>
            ) : (
              <>
                <p>
                  {activeModal === 'lesson' &&
                    `Explore the structural architecture, chambers, and cellular tissues of the ${currentOrgan.name}.`}
                  {activeModal === 'animation' && currentOrgan.functionDesc}
                  {activeModal === 'microscopic' &&
                    `Histological tissue cytology: ${currentOrgan.tissue}. Displays specialized cells and capillary beds.`}
                  {activeModal === 'compare' &&
                    `Comparative anatomical analysis: ${currentOrgan.comparison}.`}
                </p>
                <div className={`modal-demo ${activeModal === 'animation' ? 'moving' : ''}`}>
                  <img
                    src={`/anatomy/${currentOrgan.id}/${
                      activeModal === 'microscopic'
                        ? 'microscopic'
                        : activeModal === 'compare'
                        ? 'compare'
                        : 'organ'
                    }.webp`}
                    alt="Modal demo"
                  />
                </div>

                {/* NCERT Alignment Section in Lesson Modal */}
                {activeModal === 'lesson' && (
                  <div className="text-left mt-4 p-3.5 rounded-2xl bg-[#eb7c6b]/10 border border-[#eb7c6b]/20 text-xs">
                    <strong className="block font-bold text-[#eb7c6b] mb-1">
                      NCERT Class 10 / Ch 6: Life Processes Notes:
                    </strong>
                    <ul className="list-disc pl-4 space-y-1 text-[#2f2a27]/80">
                      {currentOrgan.ncertNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button className="lesson-button" onClick={() => setActiveModal(null)}>
                  Continue exploring <ArrowRight size={15} />
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default HumanBodyExplorerPage;
