import React, { useState } from 'react';
import {
  Gamepad2,
  ArrowLeft,
  Users,
  Globe,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  User,
  Bot,
  Play,
  Copy,
  Check,
  RotateCcw,
  Swords,
  Lock,
  Timer,
  GraduationCap,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  PlayerConfig,
  MatchPreset,
  GameMode,
  GradeCategory,
  BotDifficulty,
  DEFAULT_PLAYERS,
} from '../types';

interface LudoSetupViewProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  activePreset: MatchPreset;
  setActivePreset: (preset: MatchPreset) => void;
  playerConfigs: PlayerConfig[];
  setPlayerConfigs: React.Dispatch<React.SetStateAction<PlayerConfig[]>>;
  selectedGradeCategory: GradeCategory;
  setSelectedGradeCategory: (grade: GradeCategory) => void;
  questionTimerDuration: number;
  setQuestionTimerDuration: (sec: number) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  copiedRoomCode: boolean;
  copyRoomLink: () => void;
  onlineConnected: boolean;
  onlinePlayersCount: number;
  onJoinOnlineRoom: () => void;
  onCreateOnlineRoom: () => void;
  onAddOnlineBot: () => void;
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
  hasSavedGame: boolean;
  onResumeSavedGame: () => void;
  onStartGame: () => void;
  onNavigateBack: () => void;
}

export const LudoSetupView: React.FC<LudoSetupViewProps> = ({
  gameMode,
  setGameMode,
  activePreset,
  setActivePreset,
  playerConfigs,
  setPlayerConfigs,
  selectedGradeCategory,
  setSelectedGradeCategory,
  questionTimerDuration,
  setQuestionTimerDuration,
  roomCode,
  setRoomCode,
  copiedRoomCode,
  copyRoomLink,
  onlineConnected,
  onlinePlayersCount,
  onJoinOnlineRoom,
  onCreateOnlineRoom,
  onAddOnlineBot,
  soundOn,
  setSoundOn,
  hasSavedGame,
  onResumeSavedGame,
  onStartGame,
  onNavigateBack,
}) => {
  const [inputJoinCode, setInputJoinCode] = useState('');

  // ------------------------------------------
  // PRESET HANDLERS
  // ------------------------------------------
  const handleSelectSolo = () => {
    setActivePreset('solo');
    setGameMode('offline');
    setPlayerConfigs([
      { ...DEFAULT_PLAYERS[0], name: playerConfigs[0]?.name || 'Explorer', isBot: false, isActive: true },
      { ...DEFAULT_PLAYERS[1], name: 'Ramanujan Bot', isBot: true, botDifficulty: 'advanced', isActive: true },
      { ...DEFAULT_PLAYERS[2], name: 'Aryabhata Bot', isBot: true, botDifficulty: 'intermediate', isActive: true },
      { ...DEFAULT_PLAYERS[3], name: 'Bhaskara Bot', isBot: true, botDifficulty: 'advanced', isActive: true },
    ]);
  };

  const handleSelectDuel = () => {
    setActivePreset('duel');
    setGameMode('offline');
    // In 1v1 Duel: Red and Yellow face each other across the board; Green and Blue are inactive
    setPlayerConfigs([
      { ...DEFAULT_PLAYERS[0], name: playerConfigs[0]?.name || 'Explorer', isBot: false, isActive: true },
      { ...DEFAULT_PLAYERS[1], name: 'Green Base', isBot: true, isActive: false },
      { ...DEFAULT_PLAYERS[2], name: 'Ramanujan Bot', isBot: true, botDifficulty: 'advanced', isActive: true },
      { ...DEFAULT_PLAYERS[3], name: 'Blue Base', isBot: true, isActive: false },
    ]);
  };

  const handleSelectPass = () => {
    setActivePreset('pass');
    setGameMode('offline');
    setPlayerConfigs([
      { ...DEFAULT_PLAYERS[0], name: 'Player 1 (Red)', isBot: false, isActive: true },
      { ...DEFAULT_PLAYERS[1], name: 'Player 2 (Green)', isBot: false, isActive: true },
      { ...DEFAULT_PLAYERS[2], name: 'Player 3 (Yellow)', isBot: false, isActive: true },
      { ...DEFAULT_PLAYERS[3], name: 'Player 4 (Blue)', isBot: false, isActive: true },
    ]);
  };

  const togglePlayerBot = (index: number) => {
    setActivePreset('custom');
    setPlayerConfigs((prev) =>
      prev.map((p, idx) => {
        if (idx !== index) return p;
        const nextIsBot = !p.isBot;
        return {
          ...p,
          isBot: nextIsBot,
          avatar: nextIsBot ? '🤖' : '👨‍🎓',
          name: nextIsBot ? DEFAULT_PLAYERS[idx].name : `Player ${idx + 1}`,
        };
      })
    );
  };

  const updatePlayerDifficulty = (index: number, difficulty: BotDifficulty) => {
    setPlayerConfigs((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, botDifficulty: difficulty } : p))
    );
  };

  const updatePlayerName = (index: number, newName: string) => {
    setActivePreset('custom');
    setPlayerConfigs((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, name: newName } : p))
    );
  };

  return (
    <div className="h-full max-h-full overflow-hidden bg-canvas text-text-primary selection:bg-playlab-500/30 selection:text-playlab-200 flex flex-col font-sans">
      {/* ========================================================= */}
      {/* 1. TOP HEADER (Preserved Shell & Title with Refined Spacing) */}
      {/* ========================================================= */}
      <header className="h-12 sm:h-14 shrink-0 border-b border-border bg-card/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onNavigateBack}
            className="p-1.5 sm:p-2 rounded-xl bg-card hover:bg-canvas text-text-muted hover:text-text-primary transition-colors border border-border shrink-0"
            title="Back to PlayLab"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-playlab-500/15 text-playlab-500 flex items-center justify-center border border-playlab-500/25 shrink-0">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold font-display text-text-primary tracking-tight">
                  Math Ludo
                </h1>
                <span className="badge-playlab text-[10px] px-2 py-0.5 whitespace-nowrap">
                  NCERT 4-Player Battle
                </span>
              </div>
              <p className="text-[11px] text-text-muted hidden md:block truncate">
                Solve curriculum challenges, roll the dice & maneuver tokens to the center sanctuary
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {hasSavedGame && (
            <button
              onClick={onResumeSavedGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs hover:bg-amber-500/25 transition-all shadow-xs"
              title="Resume unfinished match"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resume Match</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-text-muted">
            <span
              className={clsx(
                'w-2 h-2 rounded-full',
                gameMode === 'online'
                  ? onlineConnected
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500'
                  : 'bg-emerald-500'
              )}
            />
            <span className="font-medium text-[11px]">
              {gameMode === 'online'
                ? onlineConnected
                  ? 'Multiplayer Live'
                  : 'Connecting Server...'
                : 'Offline Bot & Online Multiplayer'}
            </span>
          </div>

          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-2 rounded-xl bg-card hover:bg-canvas text-text-muted hover:text-text-primary transition-colors border border-border"
            title={soundOn ? 'Mute sound' : 'Enable sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-playlab-500" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN SETUP DASHBOARD (Balanced, Compact, Zero Waste) */}
      {/* ========================================================= */}
      <main className="flex-1 min-h-0 w-full max-w-[1680px] mx-auto p-2.5 sm:p-3.5 lg:p-4 flex flex-col overflow-y-auto lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 lg:gap-4 flex-1 min-h-0 items-stretch">
          
          {/* ------------------------------------------------------- */}
          {/* LEFT COLUMN: Match Mode, Presets, Curriculum & Timers */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 min-h-0 justify-between">
            
            {/* CARD 1: MATCH MODE & PRESETS */}
            <div className="card p-3 sm:p-3.5 bg-card border border-border shadow-xs flex flex-col gap-2.5 min-h-0 flex-1 justify-between">
              {/* Header with Mode Toggle Tabs */}
              <div className="flex items-center justify-between pb-2 border-b border-border/80 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-playlab-500" />
                  <h2 className="text-xs sm:text-sm font-bold text-text-primary uppercase tracking-wide">
                    Match Mode & Presets
                  </h2>
                </div>

                {/* Mode Tabs (Offline / Bot vs Online Room) */}
                <div className="flex items-center p-0.5 bg-canvas rounded-xl border border-border">
                  <button
                    onClick={() => {
                      setGameMode('offline');
                      handleSelectSolo();
                    }}
                    className={clsx(
                      'px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all',
                      gameMode === 'offline'
                        ? 'bg-amber-500/90 text-white shadow-xs'
                        : 'text-text-muted hover:text-text-primary'
                    )}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Offline / Bot</span>
                  </button>

                  <button
                    onClick={() => {
                      setGameMode('online');
                      onCreateOnlineRoom();
                    }}
                    className={clsx(
                      'px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all',
                      gameMode === 'online'
                        ? 'bg-playlab-600 text-white shadow-xs'
                        : 'text-text-muted hover:text-text-primary'
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Online Room</span>
                  </button>
                </div>
              </div>

              {/* Offline Presets / Online Room Box */}
              {gameMode === 'offline' ? (
                <div className="space-y-2 flex-1 flex flex-col justify-center py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                    Select Quick Preset
                  </span>

                  {/* Preset 1: Solo vs 3 Bots */}
                  <button
                    onClick={handleSelectSolo}
                    className={clsx(
                      'w-full p-2.5 rounded-xl border text-left transition-all relative flex items-center gap-3 group cursor-pointer',
                      activePreset === 'solo'
                        ? 'border-amber-500/70 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/30'
                        : 'border-border/80 bg-canvas/40 hover:bg-canvas hover:border-border'
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-text-primary">Solo vs 3 Bots</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-tight truncate">
                        Play alone against smart Ramanujan, Shakuntala & Aryabhata AI.
                      </p>
                    </div>
                    {activePreset === 'solo' && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </button>

                  {/* Preset 2: 1 vs 1 Duel */}
                  <button
                    onClick={handleSelectDuel}
                    className={clsx(
                      'w-full p-2.5 rounded-xl border text-left transition-all relative flex items-center gap-3 group cursor-pointer',
                      activePreset === 'duel'
                        ? 'border-amber-500/70 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/30'
                        : 'border-border/80 bg-canvas/40 hover:bg-canvas hover:border-border'
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/25 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                      <Swords className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-text-primary">1 vs 1 Duel</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold">
                          Head-to-Head
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-tight truncate">
                        Head-to-head match (Red vs Yellow). Unused bases are locked.
                      </p>
                    </div>
                    {activePreset === 'duel' && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </button>

                  {/* Preset 3: Pass & Play */}
                  <button
                    onClick={handleSelectPass}
                    className={clsx(
                      'w-full p-2.5 rounded-xl border text-left transition-all relative flex items-center gap-3 group cursor-pointer',
                      activePreset === 'pass'
                        ? 'border-amber-500/70 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/30'
                        : 'border-border/80 bg-canvas/40 hover:bg-canvas hover:border-border'
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-text-primary">Pass & Play (4 Humans)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                          Local 4P
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-tight truncate">
                        Pass the device around for 4 local friends taking turns on one screen.
                      </p>
                    </div>
                    {activePreset === 'pass' && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </button>
                </div>
              ) : (
                /* Online Room Controls */
                <div className="space-y-2.5 flex-1 flex flex-col justify-center py-1">
                  <div className="p-3 rounded-xl bg-playlab-500/10 border border-playlab-500/25 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-playlab-600 dark:text-playlab-300">
                        Room Code: <span className="font-mono text-sm tracking-wider font-black">{roomCode}</span>
                      </span>
                      <button
                        onClick={copyRoomLink}
                        className="flex items-center gap-1 text-[11px] font-bold text-playlab-500 hover:text-playlab-400 cursor-pointer"
                      >
                        {copiedRoomCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedRoomCode ? 'Copied' : 'Share Code'}</span>
                      </button>
                    </div>
                    <div className="text-[11px] text-text-muted flex items-center justify-between pt-1 border-t border-playlab-500/15">
                      <span>Connected Players: {onlinePlayersCount}/4</span>
                      <button
                        onClick={onAddOnlineBot}
                        className="text-[11px] font-bold text-playlab-500 hover:underline cursor-pointer"
                      >
                        + Add AI Bot
                      </button>
                    </div>
                  </div>

                  {/* Join Existing Room Input */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      Join Existing Room
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="ENTER 6-DIGIT CODE"
                        value={inputJoinCode}
                        onChange={(e) => setInputJoinCode(e.target.value.toUpperCase())}
                        maxLength={8}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-canvas border border-border text-xs font-mono uppercase font-bold text-text-primary focus:outline-hidden focus:ring-1 focus:ring-playlab-500"
                      />
                      <button
                        onClick={() => {
                          if (inputJoinCode.trim()) {
                            setRoomCode(inputJoinCode.trim());
                            onJoinOnlineRoom();
                          }
                        }}
                        disabled={!inputJoinCode.trim()}
                        className="px-3.5 py-1.5 rounded-xl bg-playlab-600 text-white text-xs font-bold disabled:opacity-50 hover:bg-playlab-500 transition-all shadow-xs cursor-pointer"
                      >
                        Join Room
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CARD 2: CURRICULUM & MATCH RULES */}
            <div className="card p-3 sm:p-3.5 bg-card border border-border shadow-xs space-y-2 shrink-0">
              <div className="flex items-center gap-1.5 border-b border-border/80 pb-1.5">
                <BookOpen className="w-4 h-4 text-playlab-500" />
                <h3 className="text-xs sm:text-sm font-bold text-text-primary uppercase tracking-wide">
                  Curriculum & Match Rules
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Grade Category Selection */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-playlab-500" />
                      <span>NCERT Math Grade</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: 'all', label: 'All Classes' },
                      { id: 'primary', label: 'Class 1-4' },
                      { id: 'foundational', label: 'Class 5-6' },
                      { id: 'middle', label: 'Class 7-8' },
                      { id: 'high', label: 'Class 9-10' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedGradeCategory(cat.id as GradeCategory)}
                        className={clsx(
                          'px-2 py-1 rounded-lg text-[11px] font-bold text-center border transition-all truncate cursor-pointer',
                          selectedGradeCategory === cat.id
                            ? 'bg-amber-500/90 text-white border-amber-600 shadow-xs'
                            : 'bg-canvas/50 text-text-muted border-border/70 hover:text-text-primary hover:bg-canvas'
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timer Duration Selection */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                      <Timer className="w-3 h-3 text-amber-500" />
                      <span>Quiz Question Timer</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { sec: 10, label: '10s (Blitz)' },
                      { sec: 15, label: '15s (Mid)' },
                      { sec: 20, label: '20s (Relax)' },
                    ].map((t) => (
                      <button
                        key={t.sec}
                        type="button"
                        onClick={() => setQuestionTimerDuration(t.sec)}
                        className={clsx(
                          'px-1 py-1 rounded-lg text-[11px] font-bold text-center border transition-all truncate cursor-pointer',
                          questionTimerDuration === t.sec
                            ? 'bg-amber-500/90 text-white border-amber-600 shadow-xs'
                            : 'bg-canvas/50 text-text-muted border-border/70 hover:text-text-primary hover:bg-canvas'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-muted pt-1 truncate leading-tight">
                    💡 Correct answers award token move & +20 pts!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* RIGHT COLUMN: 4 Compact Player Cards + Primary CTA Button */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 min-h-0 justify-between">
            
            {/* CARD 3: 4 CONFIGURED PLAYER SLOTS */}
            <div className="card p-3 sm:p-3.5 bg-card border border-border shadow-xs flex-1 min-h-0 flex flex-col justify-between">
              {/* Header with Title and 4-Color Indicator Dots */}
              <div className="flex items-center justify-between border-b border-border/80 pb-2 shrink-0">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2 uppercase tracking-wide">
                    <Users className="w-4 h-4 text-playlab-500" />
                    <span>Configure 4 Player Slots</span>
                  </h3>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {activePreset === 'duel'
                      ? '1v1 Duel Mode: Red & Yellow are active competitors. Green & Blue are locked.'
                      : 'Customize names & toggle each slot between Human or Smart AI Bot'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 bg-canvas px-2 py-1 rounded-lg border border-border/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs" title="Red Base" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" title="Green Base" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" title="Yellow Base" />
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs" title="Blue Base" />
                </div>
              </div>

              {/* 2x2 Grid of 4 Compact Player Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 py-2 flex-1 min-h-0 items-stretch">
                {playerConfigs.map((p, idx) => {
                  const startEntry = idx === 0 ? '#1' : idx === 1 ? '#14' : idx === 2 ? '#27' : '#40';
                  const isLockedDuel = activePreset === 'duel' && !p.isActive;

                  // Theme-specific styles per player slot
                  const slotStyles = {
                    0: {
                      border: 'border-red-500/40 dark:border-red-500/30',
                      bg: 'bg-red-500/[0.03] dark:bg-red-500/[0.06]',
                      hoverBorder: 'hover:border-red-500/70',
                      accentText: 'text-red-600 dark:text-red-400',
                      dotBg: 'bg-red-500',
                      badgeBg: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
                      humanBadge: 'bg-amber-600 text-white',
                    },
                    1: {
                      border: 'border-emerald-500/40 dark:border-emerald-500/30',
                      bg: 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]',
                      hoverBorder: 'hover:border-emerald-500/70',
                      accentText: 'text-emerald-600 dark:text-emerald-400',
                      dotBg: 'bg-emerald-500',
                      badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
                      humanBadge: 'bg-emerald-600 text-white',
                    },
                    2: {
                      border: 'border-amber-500/40 dark:border-amber-500/30',
                      bg: 'bg-amber-500/[0.03] dark:bg-amber-500/[0.06]',
                      hoverBorder: 'hover:border-amber-500/70',
                      accentText: 'text-amber-600 dark:text-amber-400',
                      dotBg: 'bg-amber-500',
                      badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
                      humanBadge: 'bg-amber-600 text-white',
                    },
                    3: {
                      border: 'border-blue-500/40 dark:border-blue-500/30',
                      bg: 'bg-blue-500/[0.03] dark:bg-blue-500/[0.06]',
                      hoverBorder: 'hover:border-blue-500/70',
                      accentText: 'text-blue-600 dark:text-blue-400',
                      dotBg: 'bg-blue-500',
                      badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
                      humanBadge: 'bg-blue-600 text-white',
                    },
                  }[idx as 0 | 1 | 2 | 3];

                  return (
                    <div
                      key={p.id}
                      className={clsx(
                        'rounded-xl border p-2.5 sm:p-3 transition-all flex flex-col justify-between relative shadow-2xs',
                        isLockedDuel
                          ? 'opacity-40 bg-canvas/60 border-dashed border-border cursor-not-allowed'
                          : clsx(slotStyles.border, slotStyles.bg, slotStyles.hoverBorder, 'hover:shadow-xs')
                      )}
                    >
                      {/* 1. Card Top Bar: Color Label & Track Entry */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={clsx(
                              'w-2.5 h-2.5 rounded-full shrink-0 shadow-xs',
                              isLockedDuel ? 'bg-text-muted' : slotStyles.dotBg
                            )}
                          />
                          <span
                            className={clsx(
                              'text-xs font-black uppercase tracking-wider',
                              isLockedDuel ? 'text-text-muted' : slotStyles.accentText
                            )}
                          >
                            {p.color} Base
                          </span>
                        </div>

                        {isLockedDuel ? (
                          <span className="text-[10px] font-bold text-text-muted flex items-center gap-1 px-1.5 py-0.5 rounded bg-canvas border border-border">
                            <Lock className="w-3 h-3" /> Locked in Duel
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-text-muted px-1.5 py-0.5 rounded bg-card/80 border border-border/60">
                            Track Entry {startEntry}
                          </span>
                        )}
                      </div>

                      {/* 2. Card Middle: Player Avatar & Aligned Name Input */}
                      <div className="flex items-center gap-2.5 py-1.5">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-card border border-border/80 flex items-center justify-center text-2xl shadow-xs shrink-0">
                          {p.avatar}
                        </div>

                        <div className="flex-1 min-w-0">
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                            Player Name
                          </label>
                          <input
                            type="text"
                            disabled={isLockedDuel}
                            value={p.name}
                            onChange={(e) => updatePlayerName(idx, e.target.value)}
                            className="w-full mt-0.5 px-2.5 py-1 rounded-lg bg-card border border-border/80 text-xs sm:text-sm font-bold text-text-primary focus:outline-hidden focus:ring-1 focus:ring-playlab-500 disabled:opacity-50"
                            maxLength={18}
                          />
                        </div>
                      </div>

                      {/* 3. Card Bottom: Toggle Human/Bot & Bot Difficulty */}
                      <div className="pt-1.5 border-t border-border/40 flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          disabled={isLockedDuel}
                          onClick={() => togglePlayerBot(idx)}
                          className={clsx(
                            'flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between border cursor-pointer disabled:opacity-50',
                            !p.isBot
                              ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                              : 'bg-card text-text-primary border-border/80 hover:bg-canvas'
                          )}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {!p.isBot ? (
                              <User className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <Bot className="w-3.5 h-3.5 text-playlab-500 shrink-0" />
                            )}
                            <span className="truncate">
                              {!p.isBot ? 'Human Player (Local)' : 'Bot (Automated AI)'}
                            </span>
                          </div>
                          <span
                            className={clsx(
                              'text-[9px] uppercase font-black px-1.5 py-0.5 rounded ml-1 shrink-0',
                              !p.isBot
                                ? 'bg-black/20 text-white'
                                : 'bg-canvas text-text-muted border border-border/60'
                            )}
                          >
                            {!p.isBot ? 'SWITCH TO BOT' : 'SWITCH TO HUMAN'}
                          </span>
                        </button>

                        {/* Bot Difficulty Selector Dropdown */}
                        {p.isBot && !isLockedDuel && (
                          <select
                            value={p.botDifficulty}
                            onChange={(e) => updatePlayerDifficulty(idx, e.target.value as BotDifficulty)}
                            className="px-2 py-1 rounded-lg bg-card border border-border/80 text-[11px] font-bold text-text-primary focus:outline-hidden cursor-pointer"
                            title="AI Bot Difficulty"
                          >
                            <option value="beginner">Easy</option>
                            <option value="intermediate">Med</option>
                            <option value="advanced">Hard</option>
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTION CTA: Prominent Purple Primary Button */}
            <div className="shrink-0 pt-0.5">
              <button
                type="button"
                onClick={onStartGame}
                className="w-full h-12 sm:h-13.5 rounded-2xl bg-gradient-to-r from-[#6541F5] via-[#5b36ed] to-[#5230E8] hover:from-[#5833eb] hover:to-[#4623dc] active:from-[#4623dc] active:to-[#3816c8] text-white flex items-center justify-center gap-3 text-sm sm:text-base font-black tracking-wide shadow-lg shadow-purple-500/20 hover:shadow-purple-glow group transition-all cursor-pointer"
              >
                <span>Enter Board & Start Match</span>
                <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-125" />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
