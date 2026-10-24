// =========================================================
// VIDYAVERSE NEWTON'S CARROM — LOBBY & MATCH SETUP VIEW
// =========================================================

import React, { useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Users,
  Swords,
  Globe,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Trophy,
  Shield,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { CarromPlayMode, CarromSubMode, BotDifficulty, PlayerSlot } from '../types';

export interface CarromSetupViewProps {
  playMode: CarromPlayMode;
  setPlayMode: (mode: CarromPlayMode) => void;
  subMode: CarromSubMode;
  setSubMode: (subMode: CarromSubMode) => void;
  players: PlayerSlot[];
  setPlayers: React.Dispatch<React.SetStateAction<PlayerSlot[]>>;
  botDifficulty: BotDifficulty;
  setBotDifficulty: (diff: BotDifficulty) => void;
  targetScore: number;
  setTargetScore: (score: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  hasSavedGame: boolean;
  onResumeSavedGame: () => void;
  onStartMatch: () => void;
  onNavigateBack: () => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  onJoinRoom: () => void;
  onCreateRoom: () => void;
}

export const CarromSetupView: React.FC<CarromSetupViewProps> = ({
  playMode,
  setPlayMode,
  subMode,
  setSubMode,
  players,
  setPlayers,
  botDifficulty,
  setBotDifficulty,
  targetScore,
  setTargetScore,
  soundEnabled,
  setSoundEnabled,
  hasSavedGame,
  onResumeSavedGame,
  onStartMatch,
  onNavigateBack,
  roomCode,
  setRoomCode,
  onJoinRoom,
  onCreateRoom,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputJoinCode, setInputJoinCode] = useState('');

  // Mode Preset Selectors
  const selectSoloMode = () => {
    setPlayMode('solo');
    setPlayers([
      {
        id: 'p1',
        name: players[0]?.name || 'Player 1',
        isBot: false,
        score: 0,
        coinsPocketed: { white: 0, black: 0, queen: 0 },
        side: 'south',
        isActive: true,
      },
      {
        id: 'p2_bot',
        name: 'Newton AI',
        isBot: true,
        botDifficulty,
        score: 0,
        coinsPocketed: { white: 0, black: 0, queen: 0 },
        side: 'north',
        isActive: true,
      },
    ]);
  };

  const selectDuelMode = () => {
    setPlayMode('duel');
    setPlayers([
      {
        id: 'p1',
        name: players[0]?.name || 'Player 1',
        isBot: false,
        score: 0,
        coinsPocketed: { white: 0, black: 0, queen: 0 },
        side: 'south',
        isActive: true,
      },
      {
        id: 'p2',
        name: players[1]?.isBot ? 'Player 2' : players[1]?.name || 'Player 2',
        isBot: false,
        score: 0,
        coinsPocketed: { white: 0, black: 0, queen: 0 },
        side: 'north',
        isActive: true,
      },
    ]);
  };

  const selectTeamMode = () => {
    setPlayMode('team');
    setPlayers([
      {
        id: 'p1',
        name: players[0]?.name || 'Player 1 (Team A)',
        isBot: false,
        score: 0,
        coinsPocketed: { white: 0, black: 0, queen: 0 },
        side: 'south',
        teamId: 1,
        isActive: true,
      },
      {
        id: 'p2',
        name: 'Player 2 (Team B)',
        isBot: false,
        score: 0,
        coinsPocketed: { white: 0, black: 0, queen: 0 },
        side: 'east',
        teamId: 2,
        isActive: true,
      },
      {
        id: 'p3',
        name: 'Player 3 (Team A)',
        isBot: true,
        botDifficulty,
        score: 0,
        coinsPocketed: { white: 0, black: 0, queen: 0 },
        side: 'north',
        teamId: 1,
        isActive: true,
      },
      {
        id: 'p4',
        name: 'Player 4 (Team B)',
        isBot: true,
        botDifficulty,
        score: 0,
        coinsPocketed: { white: 0, black: 0, queen: 0 },
        side: 'west',
        teamId: 2,
        isActive: true,
      },
    ]);
  };

  const selectFriendsMode = () => {
    setPlayMode('friends');
    onCreateRoom();
    setPlayers([
      {
        id: 'p1',
        name: players[0]?.name || 'Host (You)',
        isBot: false,
        score: 0,
        coinsPocketed: { white: 0, black: 0, queen: 0 },
        side: 'south',
        isActive: true,
      },
      {
        id: 'p2',
        name: 'Waiting for friend...',
        isBot: false,
        score: 0,
        coinsPocketed: { white: 0, black: 0, queen: 0 },
        side: 'north',
        isActive: true,
      },
    ]);
  };

  const handlePlayerNameChange = (index: number, newName: string) => {
    setPlayers((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], name: newName };
      }
      return updated;
    });
  };

  const togglePlayerBot = (index: number) => {
    setPlayers((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        const isBot = !updated[index].isBot;
        updated[index] = {
          ...updated[index],
          isBot,
          name: isBot ? `AI Bot ${index + 1}` : `Player ${index + 1}`,
          botDifficulty: isBot ? botDifficulty : undefined,
        };
      }
      return updated;
    });
  };

  const copyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="h-full min-h-screen bg-canvas text-text-primary flex flex-col font-sans select-none">
      {/* 1. TOP HEADER */}
      <header className="h-14 border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateBack}
            className="p-2 rounded-xl bg-card hover:bg-canvas text-text-muted hover:text-text-primary transition-colors border border-border"
            title="Back to PlayLab"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold font-display text-text-primary tracking-tight">
                  Newton’s Carrom
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Physics & Carrom King Controls
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {hasSavedGame && (
            <button
              onClick={onResumeSavedGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs hover:bg-amber-500/25 transition-all shadow-xs"
              title="Resume active match"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resume Match</span>
            </button>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-card hover:bg-canvas text-text-muted hover:text-text-primary transition-colors border border-border"
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-500" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* 2. MAIN SETUP DASHBOARD */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: 4 Game Modes in 2x2 Grid + Submode Switcher */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Mode Category Banner: Classic vs Physics Lab */}
            <div className="card p-3 bg-card border border-border flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Game Discipline:
                </span>
              </div>

              <div className="flex items-center p-0.5 bg-canvas rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setSubMode('classic')}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all',
                    subMode === 'classic'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Classic Carrom</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubMode('lab')}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all',
                    subMode === 'lab'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Physics Lab Mode</span>
                </button>
              </div>
            </div>

            {/* 4 Mode Cards (2 x 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
              
              {/* MODE 1: Solo vs AI */}
              <button
                type="button"
                onClick={selectSoloMode}
                className={clsx(
                  'card p-4 text-left transition-all relative flex flex-col justify-between group cursor-pointer border',
                  playMode === 'solo'
                    ? 'border-amber-500/80 bg-amber-500/10 ring-2 ring-amber-500/25 shadow-md'
                    : 'border-border/80 bg-card hover:border-amber-500/40 hover:bg-card/90 shadow-xs'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      Offline Solo
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary group-hover:text-amber-500 transition-colors">
                    Solo vs AI
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Play against Newton Bot with trajectory-based aiming and adjustable skill levels.
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
                  <span>1 Human • 1 Bot</span>
                  <span className="font-bold text-amber-500">Select</span>
                </div>
              </button>

              {/* MODE 2: 1 vs 1 Duel */}
              <button
                type="button"
                onClick={selectDuelMode}
                className={clsx(
                  'card p-4 text-left transition-all relative flex flex-col justify-between group cursor-pointer border',
                  playMode === 'duel'
                    ? 'border-amber-500/80 bg-amber-500/10 ring-2 ring-amber-500/25 shadow-md'
                    : 'border-border/80 bg-card hover:border-amber-500/40 hover:bg-card/90 shadow-xs'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Swords className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      Pass & Play
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary group-hover:text-emerald-500 transition-colors">
                    1 vs 1 Duel
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Two players take alternate turns sitting opposite on South & North baselines.
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
                  <span>2 Humans • Single Screen</span>
                  <span className="font-bold text-emerald-500">Select</span>
                </div>
              </button>

              {/* MODE 3: 2 vs 2 Team Match */}
              <button
                type="button"
                onClick={selectTeamMode}
                className={clsx(
                  'card p-4 text-left transition-all relative flex flex-col justify-between group cursor-pointer border',
                  playMode === 'team'
                    ? 'border-amber-500/80 bg-amber-500/10 ring-2 ring-amber-500/25 shadow-md'
                    : 'border-border/80 bg-card hover:border-amber-500/40 hover:bg-card/90 shadow-xs'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
                      4-Player Doubles
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary group-hover:text-blue-500 transition-colors">
                    2 vs 2 Team Match
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Four players on 4 sides (South, East, North, West). Teammates sit opposite!
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
                  <span>Team A vs Team B</span>
                  <span className="font-bold text-blue-500">Select</span>
                </div>
              </button>

              {/* MODE 4: Play with Friends */}
              <button
                type="button"
                onClick={selectFriendsMode}
                className={clsx(
                  'card p-4 text-left transition-all relative flex flex-col justify-between group cursor-pointer border',
                  playMode === 'friends'
                    ? 'border-amber-500/80 bg-amber-500/10 ring-2 ring-amber-500/25 shadow-md'
                    : 'border-border/80 bg-card hover:border-amber-500/40 hover:bg-card/90 shadow-xs'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400">
                      Online Room
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary group-hover:text-purple-500 transition-colors">
                    Play with Friends
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Create a private room with a 6-digit code or join a classmate across devices.
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
                  <span>Room Code • Live Sync</span>
                  <span className="font-bold text-purple-500">Select</span>
                </div>
              </button>

            </div>

            {/* Online Room Box (when Friends mode is active) */}
            {playMode === 'friends' && (
              <div className="card p-3.5 bg-card border border-border shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">
                    Private Room Code: <span className="font-mono text-sm tracking-wider font-black text-amber-500">{roomCode}</span>
                  </span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-400 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                  <input
                    type="text"
                    placeholder="ENTER FRIEND'S CODE"
                    value={inputJoinCode}
                    onChange={(e) => setInputJoinCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-canvas border border-border text-xs font-mono uppercase font-bold text-text-primary focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (inputJoinCode.trim()) {
                        setRoomCode(inputJoinCode.trim());
                        onJoinRoom();
                      }
                    }}
                    disabled={!inputJoinCode.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold disabled:opacity-50 hover:bg-amber-600 transition-all shadow-xs"
                  >
                    Join
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Player Slots, Rules & Start Match CTA       */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Player Slots Configuration Card */}
            <div className="card p-4 bg-card border border-border shadow-xs flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border/80 pb-2 mb-3">
                  <h3 className="text-xs sm:text-sm font-bold text-text-primary uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>Player Lineup ({players.length} Players)</span>
                  </h3>

                  {playMode === 'solo' && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-text-muted">AI Level:</span>
                      <select
                        value={botDifficulty}
                        onChange={(e) => setBotDifficulty(e.target.value as BotDifficulty)}
                        className="bg-canvas border border-border rounded-lg text-xs font-bold text-text-primary px-2 py-0.5 outline-hidden"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Player Row Items */}
                <div className="space-y-2">
                  {players.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-canvas/60 border border-border/80 flex items-center gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center font-bold text-xs text-text-muted shrink-0">
                        {p.side.charAt(0).toUpperCase()}
                      </div>

                      <input
                        type="text"
                        value={p.name}
                        disabled={p.isBot && playMode === 'solo'}
                        onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded-lg bg-card border border-border text-xs font-bold text-text-primary outline-hidden focus:border-amber-500"
                        placeholder={`Player ${idx + 1}`}
                      />

                      {playMode === 'team' && (
                        <span className={clsx(
                          'text-[10px] font-bold px-2 py-0.5 rounded-md',
                          p.teamId === 1 ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                        )}>
                          Team {p.teamId === 1 ? 'A' : 'B'}
                        </span>
                      )}

                      {playMode !== 'solo' && (
                        <button
                          type="button"
                          onClick={() => togglePlayerBot(idx)}
                          className={clsx(
                            'px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors shrink-0',
                            p.isBot
                              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
                              : 'bg-canvas text-text-muted border-border hover:text-text-primary'
                          )}
                        >
                          {p.isBot ? 'Bot' : 'Human'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Score Selection */}
              <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                <span className="font-bold text-text-muted uppercase tracking-wider text-[11px]">
                  Target Match Score:
                </span>
                <div className="flex items-center gap-1.5">
                  {[15, 25, 40].map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setTargetScore(sc)}
                      className={clsx(
                        'px-2.5 py-1 rounded-lg text-xs font-bold border transition-all',
                        targetScore === sc
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-canvas text-text-muted border-border hover:text-text-primary'
                      )}
                    >
                      {sc} pts
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* START MATCH ACTION BUTTON */}
            <button
              type="button"
              onClick={onStartMatch}
              className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-[0.99] cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Enter Carrom Board & Start Match</span>
            </button>

          </div>

        </div>
      </main>
    </div>
  );
};
