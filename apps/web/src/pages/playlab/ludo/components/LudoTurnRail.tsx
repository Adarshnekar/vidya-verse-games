import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Sparkles,
  Bot,
  Trophy,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
} from 'lucide-react';
import { clsx } from 'clsx';
import { PlayerConfig } from '../types';

interface LudoTurnRailProps {
  players: PlayerConfig[];
  currentPlayer: number;
  tokens: number[][];
  scores: number[];
  phase: string;
  isRolling: boolean;
  diceValue: number;
  isCurrentHuman: boolean;
  onRollDice: () => void;
}

export const LudoTurnRail: React.FC<LudoTurnRailProps> = ({
  players,
  currentPlayer,
  tokens,
  scores,
  phase,
  isRolling,
  diceValue,
  isCurrentHuman,
  onRollDice,
}) => {
  // Render Dice Icon (with customizable sizing & high-contrast coloring)
  const renderDiceFace = (val: number, sizeClass = 'w-12 h-12', colorClass = 'text-white') => {
    switch (val) {
      case 1:
        return <Dice1 className={clsx(sizeClass, colorClass)} />;
      case 2:
        return <Dice2 className={clsx(sizeClass, colorClass)} />;
      case 3:
        return <Dice3 className={clsx(sizeClass, colorClass)} />;
      case 4:
        return <Dice4 className={clsx(sizeClass, colorClass)} />;
      case 5:
        return <Dice5 className={clsx(sizeClass, colorClass)} />;
      case 6:
      default:
        return <Dice6 className={clsx(sizeClass, colorClass)} />;
    }
  };

  const activePlayer = players[currentPlayer];

  return (
    <div className="hidden lg:flex shrink-0 w-72 xl:w-80 2xl:w-88 h-full max-h-[740px] flex-col justify-between py-1 gap-2.5">
      {/* Active Turn & Giant 3D Dice Box */}
      <div className="card text-center p-2.5 sm:p-3 space-y-1.5 bg-card border-border shadow-md flex-1 min-h-0 flex flex-col justify-between items-center shrink-0">
        <div className="flex items-center justify-between pb-1 border-b border-border w-full shrink-0">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Turn Action
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs"
            style={{
              backgroundColor: activePlayer.bgHex,
              color: activePlayer.hexColor,
            }}
          >
            <span>{activePlayer.avatar}</span>
            <span>{activePlayer.name}</span>
          </div>
        </div>

        {/* Giant 3D Dice Display Button */}
        <div className="flex flex-col items-center justify-center flex-1 my-auto">
          <motion.button
            whileHover={phase === 'rolling' && isCurrentHuman ? { scale: 1.05, translateY: -3 } : {}}
            whileTap={phase === 'rolling' && isCurrentHuman ? { scale: 0.94 } : {}}
            animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.45, repeat: isRolling ? Infinity : 0 }}
            onClick={() => {
              if (isCurrentHuman && phase === 'rolling') {
                onRollDice();
              }
            }}
            disabled={phase !== 'rolling' || !isCurrentHuman || isRolling}
            style={
              !isCurrentHuman && activePlayer.isBot
                ? {
                    background: `linear-gradient(135deg, ${activePlayer.hexColor}cc, #0f172a)`,
                    borderColor: activePlayer.hexColor,
                  }
                : undefined
            }
            className={clsx(
              'w-32 h-32 sm:w-36 sm:h-36 xl:w-40 xl:h-40 2xl:w-44 2xl:h-44 rounded-3xl flex items-center justify-center shadow-2xl transition-all relative group',
              isCurrentHuman && phase === 'rolling'
                ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 hover:shadow-orange-500/50 cursor-pointer ring-4 ring-orange-500/40 ring-offset-2 ring-offset-card'
                : !isCurrentHuman && activePlayer.isBot
                ? 'border-2 shadow-xl ring-2 ring-playlab-500/40 cursor-not-allowed'
                : 'bg-canvas border-2 border-border cursor-not-allowed opacity-90 shadow-inner'
            )}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
            {renderDiceFace(
              diceValue,
              'w-18 h-18 sm:w-20 sm:h-20 xl:w-24 xl:h-24 2xl:w-28 2xl:h-28 drop-shadow-lg',
              isCurrentHuman || activePlayer.isBot ? 'text-white' : 'text-text-primary'
            )}
          </motion.button>

          <div className="text-center space-y-0.5 mt-2">
            {isRolling ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold text-xs sm:text-sm animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Rolling 3D Die...
              </span>
            ) : phase === 'rolling' ? (
              isCurrentHuman ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 font-extrabold text-xs tracking-wide ring-1.5 ring-orange-500/40 animate-pulse shadow-sm">
                  🎲 TAP DICE TO ROLL!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-canvas text-text-muted font-bold text-xs border border-border">
                  <Bot className="w-3.5 h-3.5" />
                  {activePlayer.name} is rolling...
                </span>
              )
            ) : phase === 'question' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-playlab-500/20 text-playlab-600 dark:text-playlab-300 font-extrabold text-xs border border-playlab-500/40">
                🎯 Rolled {diceValue}! Solve quiz on right
              </span>
            ) : phase === 'moving' ? (
              isCurrentHuman ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-extrabold text-xs border border-emerald-500/40">
                  👉 Tap your glowing token on board!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-canvas text-text-muted font-bold text-xs border border-border">
                  Bot moving token...
                </span>
              )
            ) : (
              <span className="text-xs font-bold text-text-muted">Game Completed</span>
            )}
            <p className="text-[10px] text-text-muted font-medium pt-0.5">
              {phase === 'rolling' && isCurrentHuman
                ? 'Roll 6 to launch tokens from your base!'
                : 'Solve math questions to advance and score +20 XP!'}
            </p>
          </div>
        </div>
      </div>

      {/* Compact Players & Standings */}
      <div className="card p-2 sm:p-2.5 bg-card border-border shadow-md shrink-0 space-y-1">
        <div className="flex items-center justify-between pb-1 border-b border-border shrink-0">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Players & Standings
            </h2>
          </div>
          <span className="text-[9px] px-2 py-0.2 rounded-full bg-playlab-500/15 text-playlab-600 dark:text-playlab-300 font-bold">
            {players.filter((p) => p.isActive).length} Active Bases
          </span>
        </div>

        <div className="space-y-1">
          {players.map((p, idx) => {
            const isCurrent = currentPlayer === idx;
            const homeTokensCount = tokens[idx]?.filter((pos) => pos === 100).length || 0;

            if (!p.isActive) {
              return (
                <div
                  key={p.id}
                  className="px-2 py-0.5 rounded-lg border border-dashed border-border/60 bg-canvas/40 opacity-40 flex items-center justify-between text-[10px] text-text-muted"
                >
                  <span className="font-semibold">{p.color.toUpperCase()} BASE</span>
                  <span className="text-[9px]">Inactive in Duel</span>
                </div>
              );
            }

            return (
              <div
                key={p.id}
                className={clsx(
                  'px-2 py-0.5 rounded-lg border transition-all duration-200 relative overflow-hidden flex items-center justify-between gap-1.5',
                  isCurrent
                    ? 'bg-card shadow-sm ring-1.5'
                    : 'bg-canvas/50 hover:bg-canvas border-border/80'
                )}
                style={{
                  borderColor: isCurrent ? p.hexColor : undefined,
                }}
              >
                {isCurrent && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: p.hexColor }}
                  />
                )}

                {/* Left: Avatar, Name & Base */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base leading-none shrink-0">{p.avatar}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 leading-tight">
                      <span className="text-xs font-bold text-text-primary truncate max-w-[85px]">
                        {p.name}
                      </span>
                      {p.isBot ? (
                        <span className="text-[8px] px-1 py-0.2 rounded bg-card text-text-muted font-medium border border-border">
                          AI
                        </span>
                      ) : (
                        <span className="text-[8px] px-1 py-0.2 rounded bg-playlab-500/15 text-playlab-600 dark:text-playlab-300 font-bold border border-playlab-500/30">
                          You
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[9px] font-semibold capitalize leading-none block mt-0.5"
                      style={{ color: p.hexColor }}
                    >
                      {p.color} Base
                    </span>
                  </div>
                </div>

                {/* Right: Tokens tracker + Score */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Compact token pips */}
                  <div className="flex items-center gap-0.5">
                    {tokens[idx]?.map((pos, tIdx) => {
                      const isHome = pos === 100;
                      const isTrack = pos >= 0 && pos < 100;
                      return (
                        <span
                          key={tIdx}
                          className={clsx(
                            'w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold transition-all',
                            isHome
                              ? 'bg-emerald-500 text-white'
                              : isTrack
                              ? 'text-white font-bold ring-1 ring-white/50'
                              : 'bg-card border border-border text-text-muted opacity-40'
                          )}
                          style={{
                            backgroundColor: isTrack ? p.hexColor : undefined,
                            borderColor: !isTrack && !isHome ? p.hexColor : undefined,
                          }}
                          title={`Token ${tIdx + 1}: ${isHome ? 'Home 🎉' : isTrack ? `Track cell ${pos}` : 'In Bay'}`}
                        >
                          {isHome ? '✓' : tIdx + 1}
                        </span>
                      );
                    })}
                  </div>

                  {/* Score & Home count */}
                  <div className="text-right min-w-[46px]">
                    <div className="text-xs font-black text-text-primary leading-tight">
                      {scores[idx] || 0} pts
                    </div>
                    <div className="text-[8px] text-text-muted font-semibold leading-none">
                      {homeTokensCount}/4 Home
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
