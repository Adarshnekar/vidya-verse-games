import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, CheckCircle2, RotateCcw, ArrowLeft, Swords, BookOpen, Clock } from 'lucide-react';
import { PlayerConfig, MatchStats } from '../types';

interface LudoVictoryModalProps {
  winner: PlayerConfig;
  stats: MatchStats;
  scores: number[];
  players: PlayerConfig[];
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const LudoVictoryModal: React.FC<LudoVictoryModalProps> = ({
  winner,
  stats,
  scores,
  players,
  onPlayAgain,
  onReturnToLobby,
}) => {
  const matchDurationSeconds = Math.round(((stats.endTime || Date.now()) - stats.startTime) / 1000);
  const minutes = Math.floor(matchDurationSeconds / 60);
  const seconds = matchDurationSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  const accuracyPercent =
    stats.questionsAnswered > 0
      ? Math.round((stats.questionsCorrect / stats.questionsAnswered) * 100)
      : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-xl bg-card border-2 border-amber-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col gap-4 text-center"
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Trophy & Badge */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 flex items-center justify-center shadow-xl ring-4 ring-amber-500/30 text-white mb-2">
            <Trophy className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-md text-amber-950" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
            Victory Celebration
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-text-primary mt-1">
            {winner.name} Wins!
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Champion of the VidyaVerse Math Ludo Arena
          </p>
        </div>

        {/* XP Reward Banner */}
        <div className="p-3 rounded-2xl bg-playlab-500/15 border border-playlab-500/30 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-playlab-600 dark:text-playlab-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-playlab-500" />
            <span>XP Earned This Match</span>
          </div>
          <span className="text-lg font-black text-playlab-600 dark:text-playlab-300 font-mono">
            +{stats.xpEarned} XP
          </span>
        </div>

        {/* 4 Key Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
          <div className="p-2.5 rounded-xl bg-canvas border border-border">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
              MATCH TIME
            </span>
            <span className="text-xs sm:text-sm font-black text-text-primary flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {timeFormatted}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-canvas border border-border">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
              QUIZ ACCURACY
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {accuracyPercent}% ({stats.questionsCorrect}/{stats.questionsAnswered})
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-canvas border border-border">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
              CAPTURES
            </span>
            <span className="text-xs sm:text-sm font-black text-orange-500 flex items-center gap-1 mt-0.5">
              <Swords className="w-3.5 h-3.5" />
              {Object.values(stats.captures).reduce((a, b) => a + b, 0)} Pawns
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-canvas border border-border">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
              TURNS PLAYED
            </span>
            <span className="text-xs sm:text-sm font-black text-text-primary flex items-center gap-1 mt-0.5">
              <BookOpen className="w-3.5 h-3.5 text-playlab-500" />
              {stats.turnsPlayed} Turns
            </span>
          </div>
        </div>

        {/* Final Standings Row */}
        <div className="space-y-1.5 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
            Final Standings
          </span>
          <div className="space-y-1">
            {players
              .filter((p) => p.isActive)
              .map((p, idx) => (
                <div
                  key={p.id}
                  className="p-1.5 px-3 rounded-xl bg-canvas border border-border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.hexColor }} />
                    <span className="font-bold text-text-primary">{p.name}</span>
                    <span className="text-[10px] text-text-muted">({p.color} base)</span>
                  </div>
                  <span className="font-black font-mono text-text-primary">{scores[idx] || 0} pts</span>
                </div>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onReturnToLobby}
            className="py-2.5 px-4 rounded-xl border border-border bg-card hover:bg-canvas text-xs sm:text-sm font-bold text-text-primary flex items-center justify-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Lobby</span>
          </button>
          <button
            onClick={onPlayAgain}
            className="py-2.5 px-4 rounded-xl bg-playlab-600 hover:bg-playlab-500 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
