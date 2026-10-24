// =========================================================
// VIDYAVERSE NEWTON'S CARROM — VICTORY & RESULTS MODAL
// =========================================================

import React from 'react';
import { Trophy, RotateCcw, ArrowLeft, Sparkles, Award } from 'lucide-react';
import { PlayerSlot } from '../types';

export interface CarromVictoryModalProps {
  winner: PlayerSlot;
  players: PlayerSlot[];
  onRematch: () => void;
  onBackToLobby: () => void;
}

export const CarromVictoryModal: React.FC<CarromVictoryModalProps> = ({
  winner,
  players,
  onRematch,
  onBackToLobby,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-6 bg-card border border-border shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Victory Icon Trophy */}
        <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
          <Trophy className="w-8 h-8" />
        </div>

        {/* Winner Announcement */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
            Match Completed!
          </span>
          <h2 className="text-2xl font-black font-display text-text-primary tracking-tight mt-1">
            {winner.name} Wins!
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Masterful momentum control and pocketing accuracy!
          </p>
        </div>

        {/* Final Scores Leaderboard */}
        <div className="p-3.5 rounded-2xl bg-canvas border border-border space-y-2">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block text-left">
            Final Scores:
          </span>
          {players.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-card border border-border/80 text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <span className="text-text-muted">#{idx + 1}</span>
                <span className="text-text-primary">{p.name}</span>
                {p.teamId && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-500">
                    Team {p.teamId === 1 ? 'A' : 'B'}
                  </span>
                )}
              </div>
              <span className="font-mono text-sm font-black text-amber-500">{p.score} pts</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex-1 py-3 px-4 rounded-xl bg-card hover:bg-canvas border border-border text-text-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lobby</span>
          </button>

          <button
            type="button"
            onClick={onRematch}
            className="flex-1 py-3 px-4 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Rematch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
