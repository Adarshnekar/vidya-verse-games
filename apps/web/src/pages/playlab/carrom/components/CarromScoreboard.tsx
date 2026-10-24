// =========================================================
// VIDYAVERSE NEWTON'S CARROM — SCOREBOARD & MATCH HUD
// =========================================================

import React from 'react';
import { Trophy, Bot, User, Crown, Flame, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { PlayerSlot, CarromMatchState } from '../types';

export interface CarromScoreboardProps {
  matchState: CarromMatchState;
  remainingCoins: {
    white: number;
    black: number;
    queen: boolean;
  };
  turnMessage: string;
}

export const CarromScoreboard: React.FC<CarromScoreboardProps> = ({
  matchState,
  remainingCoins,
  turnMessage,
}) => {
  const { players, activePlayerIndex, targetScore, queenState, queenCoverPlayerIndex } = matchState;
  const activePlayer = players[activePlayerIndex];

  return (
    <div className="card p-3 sm:p-4 bg-card border border-border shadow-xs space-y-3">
      {/* 1. Header with Target Score */}
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs sm:text-sm font-bold text-text-primary uppercase tracking-wide">
            Match Scoreboard
          </h2>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
          Race to {targetScore} pts
        </span>
      </div>

      {/* 2. Player Score Cards */}
      <div className={clsx('grid gap-2', players.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2')}>
        {players.map((p, idx) => {
          const isTurn = idx === activePlayerIndex;
          const isCoveringQueen = queenState === 'pocketed_uncovered' && queenCoverPlayerIndex === idx;

          return (
            <div
              key={p.id}
              className={clsx(
                'p-2.5 rounded-xl border text-center transition-all relative flex flex-col justify-between',
                isTurn
                  ? 'bg-amber-500/10 border-amber-500/80 ring-2 ring-amber-500/30 shadow-xs'
                  : 'bg-canvas/50 border-border/70'
              )}
            >
              {isTurn && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider">
                  Active
                </span>
              )}

              <div className="flex items-center justify-center gap-1 text-xs font-bold text-text-primary truncate mb-1">
                {p.isBot ? <Bot className="w-3.5 h-3.5 text-purple-500 shrink-0" /> : <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                <span className="truncate">{p.name}</span>
              </div>

              <div className="text-2xl font-black font-display text-text-primary">
                {p.score}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-text-muted mt-1">
                <span>{p.side.toUpperCase()}</span>
                {p.teamId && <span>• Team {p.teamId === 1 ? 'A' : 'B'}</span>}
              </div>

              {isCoveringQueen && (
                <div className="mt-1.5 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3" />
                  <span>Cover Queen!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Coins on Board Remaining Status Bar */}
      <div className="p-2.5 rounded-xl bg-canvas/60 border border-border/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-white border border-slate-400 inline-block" />
          <span className="text-text-primary font-bold">White: {remainingCoins.white}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600 inline-block" />
          <span className="text-text-primary font-bold">Black: {remainingCoins.black}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 border border-yellow-300 inline-block" />
          <span className={clsx('font-bold', remainingCoins.queen ? 'text-red-500' : 'text-text-muted line-through')}>
            Queen: {remainingCoins.queen ? 'In Play' : 'Pocketed'}
          </span>
        </div>
      </div>

      {/* 4. Live Match Announcements & Guidance */}
      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-text-primary flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          {turnMessage || (activePlayer?.isBot ? `${activePlayer.name} is calculating shot...` : 'Your turn! Aim and shoot.')}
        </p>
      </div>
    </div>
  );
};
