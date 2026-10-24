// =========================================================
// VIDYAVERSE NEWTON'S CARROM — CONTROLS & SHOOT BAR
// =========================================================

import React from 'react';
import { Zap, Play, Compass, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { PlayerSlot } from '../types';

export interface CarromControlsBarProps {
  activePlayer: PlayerSlot;
  isShotInMotion: boolean;
  strikerBaselinePos: number;
  onBaselinePosChange: (pos: number) => void;
  aimAngleRad: number;
  onAimAngleChange: (angleRad: number) => void;
  shotPower: number;
  onShotPowerChange: (power: number) => void;
  onShoot: () => void;
}

export const CarromControlsBar: React.FC<CarromControlsBarProps> = ({
  activePlayer,
  isShotInMotion,
  strikerBaselinePos,
  onBaselinePosChange,
  aimAngleRad,
  onAimAngleChange,
  shotPower,
  onShotPowerChange,
  onShoot,
}) => {
  const isDisabled = isShotInMotion || activePlayer.isBot;
  const currentAngleDeg = Math.round(((aimAngleRad * 180) / Math.PI + 360) % 360);

  const adjustAngleBy = (deltaDeg: number) => {
    if (isDisabled) return;
    const newRad = aimAngleRad + (deltaDeg * Math.PI) / 180;
    onAimAngleChange(newRad);
  };

  return (
    <div className="card p-3 sm:p-4 bg-card border border-border shadow-md space-y-3">
      {/* 1. Striker Placement on Legal Baseline */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-text-primary flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span>Striker Position</span>
          </span>
          <span className="font-mono text-amber-500 font-bold">{Math.round(strikerBaselinePos)} px</span>
        </div>
        <input
          type="range"
          min="200"
          max="600"
          value={strikerBaselinePos}
          disabled={isDisabled}
          onChange={(e) => onBaselinePosChange(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer disabled:opacity-50 h-2 bg-canvas rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>Left Circle</span>
          <span>Baseline Center (400px)</span>
          <span>Right Circle</span>
        </div>
      </div>

      {/* 2. Aim Angle & Power Tuning */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/80">
        {/* Aim Angle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              <span>Aim Angle</span>
            </span>
            <span className="font-mono text-blue-500 font-bold">{currentAngleDeg}°</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => adjustAngleBy(-5)}
              className="p-1 rounded-lg bg-canvas hover:bg-card border border-border text-text-muted hover:text-text-primary disabled:opacity-40"
              title="-5 degrees"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0"
              max="360"
              value={currentAngleDeg}
              disabled={isDisabled}
              onChange={(e) => onAimAngleChange((Number(e.target.value) * Math.PI) / 180)}
              className="flex-1 accent-blue-500 cursor-pointer disabled:opacity-50 h-2 bg-canvas rounded-lg"
            />
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => adjustAngleBy(5)}
              className="p-1 rounded-lg bg-canvas hover:bg-card border border-border text-text-muted hover:text-text-primary disabled:opacity-40"
              title="+5 degrees"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shot Power */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Shot Power</span>
            </span>
            <span className="font-mono text-emerald-500 font-bold">{shotPower}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={shotPower}
            disabled={isDisabled}
            onChange={(e) => onShotPowerChange(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer disabled:opacity-50 h-2 bg-canvas rounded-lg"
          />
        </div>
      </div>

      {/* 3. PROMINENT SHOOT ACTION BUTTON */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={onShoot}
        className={clsx(
          'w-full py-3 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer',
          isDisabled
            ? 'bg-canvas text-text-muted border border-border cursor-not-allowed opacity-60'
            : 'bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25'
        )}
      >
        <Play className="w-4 h-4 fill-current" />
        <span>
          {isShotInMotion
            ? 'Simulating Motion...'
            : activePlayer.isBot
            ? `${activePlayer.name} is Aiming...`
            : `SHOOT STRIKER (${shotPower}% Power)`}
        </span>
      </button>
    </div>
  );
};
