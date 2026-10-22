import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Check } from 'lucide-react';
import { PlayerConfig } from '../types';

interface LudoPassDeviceModalProps {
  player: PlayerConfig;
  onReady: () => void;
}

export const LudoPassDeviceModal: React.FC<LudoPassDeviceModalProps> = ({ player, onReady }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md bg-card border-2 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden flex flex-col items-center gap-4"
        style={{ borderColor: player.hexColor }}
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl ring-4 ring-offset-2 ring-offset-card"
          style={{ backgroundColor: player.bgHex, color: player.hexColor }}
        >
          <Smartphone className="w-10 h-10" />
        </div>

        <div>
          <span
            className="text-xs font-bold uppercase tracking-widest block"
            style={{ color: player.hexColor }}
          >
            Pass & Play Turn
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary mt-1">
            Pass the Device to {player.name}
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            It is your turn on <span className="font-bold capitalize">{player.color} Base</span>. Roll the dice and answer your math question!
          </p>
        </div>

        <button
          onClick={onReady}
          className="w-full py-3 rounded-2xl text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: player.hexColor }}
        >
          <Check className="w-5 h-5" />
          <span>I am Ready — Let's Play!</span>
        </button>
      </motion.div>
    </div>
  );
};
