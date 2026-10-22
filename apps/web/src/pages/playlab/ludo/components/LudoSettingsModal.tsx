import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Volume2, VolumeX, ArrowLeft, Play, X, Zap } from 'lucide-react';

interface LudoSettingsModalProps {
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
  autoMoveSingleToken: boolean;
  setAutoMoveSingleToken: (auto: boolean) => void;
  onClose: () => void;
  onQuitToLobby: () => void;
}

export const LudoSettingsModal: React.FC<LudoSettingsModalProps> = ({
  soundOn,
  setSoundOn,
  autoMoveSingleToken,
  setAutoMoveSingleToken,
  onClose,
  onQuitToLobby,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-card border-2 border-border rounded-3xl p-5 shadow-2xl relative space-y-4"
      >
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-playlab-500" />
            <h3 className="text-sm font-bold text-text-primary">Match Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-canvas border border-border">
            <div className="flex items-center gap-2">
              {soundOn ? (
                <Volume2 className="w-4 h-4 text-playlab-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-text-muted" />
              )}
              <span className="text-xs font-bold text-text-primary">Sound Effects</span>
            </div>
            <button
              onClick={() => setSoundOn(!soundOn)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                soundOn ? 'bg-playlab-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  soundOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Auto-Move Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-canvas border border-border">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-xs font-bold text-text-primary block">Auto-Move Single Pawn</span>
                <span className="text-[10px] text-text-muted block">Skip tap if only 1 move is legal</span>
              </div>
            </div>
            <button
              onClick={() => setAutoMoveSingleToken(!autoMoveSingleToken)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                autoMoveSingleToken ? 'bg-playlab-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoMoveSingleToken ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onQuitToLobby}
            className="py-2 px-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quit Match</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-3 rounded-xl bg-playlab-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-playlab-500 transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Resume</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
