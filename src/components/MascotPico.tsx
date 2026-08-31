import React from 'react';
import { motion } from 'motion/react';

export type MascotMood = 'idle' | 'writing' | 'excited' | 'celebrating' | 'thinking';

interface MascotPicoProps {
  mood?: MascotMood;
  message?: string;
  className?: string;
}

export function MascotPico({ mood = 'idle', message, className = '' }: MascotPicoProps) {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          key={message}
          className="relative mb-3 bg-amber-100 text-slate-900 border-4 border-amber-900 font-bold px-4 py-2.5 rounded-2xl shadow-[0_6px_0_rgba(120,53,15,0.4)] text-xs md:text-sm max-w-[260px] text-center leading-snug z-20"
        >
          {message}
          {/* Speech Bubble Pointer */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-amber-900" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber-100" />
        </motion.div>
      )}

      {/* Mascot Cartoon Avatar */}
      <motion.div
        animate={
          mood === 'excited'
            ? { y: [0, -12, 0], rotate: [-4, 4, -4] }
            : mood === 'writing'
            ? { y: [0, -4, 0] }
            : mood === 'celebrating'
            ? { y: [0, -16, 0], scale: [1, 1.08, 1] }
            : { y: [0, -8, 0] }
        }
        transition={{
          duration: mood === 'excited' ? 0.8 : mood === 'writing' ? 0.6 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center group"
      >
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-amber-300/30 rounded-full blur-xl animate-pulse" />

        {/* Astronaut Suit Helmet Body */}
        <div className="relative w-20 h-20 md:w-28 md:h-28 bg-gradient-to-b from-sky-100 via-sky-200 to-amber-100 rounded-full border-4 border-amber-950 shadow-[0_8px_0_rgba(120,53,15,0.5)] flex flex-col items-center justify-center overflow-hidden">
          {/* Helmet Glass Reflection */}
          <div className="absolute top-2 left-3 w-8 h-4 bg-white/70 rounded-full -rotate-45" />

          {/* Cat Visor Face Area */}
          <div className="relative w-16 h-12 md:w-22 md:h-16 bg-slate-900 rounded-2xl border-2 border-amber-400 flex flex-col items-center justify-center p-1 overflow-hidden">
            {/* Stars background inside helmet visor */}
            <div className="absolute top-1 right-2 text-[8px] text-amber-300">✨</div>
            <div className="absolute bottom-1 left-2 text-[8px] text-cyan-300">⭐</div>

            {/* Eyes */}
            <div className="flex items-center gap-3 relative z-10">
              {mood === 'excited' ? (
                <>
                  <span className="text-amber-300 text-sm md:text-base font-extrabold">⭐</span>
                  <span className="text-amber-300 text-sm md:text-base font-extrabold">⭐</span>
                </>
              ) : mood === 'celebrating' ? (
                <>
                  <span className="text-pink-400 text-sm md:text-base font-extrabold">^</span>
                  <span className="text-pink-400 text-sm md:text-base font-extrabold">^</span>
                </>
              ) : mood === 'writing' ? (
                <>
                  <div className="w-2.5 h-2.5 bg-cyan-300 rounded-full animate-bounce" />
                  <div className="w-2.5 h-2.5 bg-cyan-300 rounded-full animate-bounce delay-100" />
                </>
              ) : mood === 'thinking' ? (
                <>
                  <div className="w-2.5 h-2.5 bg-amber-300 rounded-full -translate-y-1" />
                  <div className="w-2.5 h-2.5 bg-amber-300 rounded-full translate-y-1" />
                </>
              ) : (
                <>
                  <div className="w-2.5 h-3 md:w-3.5 md:h-4 bg-amber-300 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-slate-900 rounded-full translate-x-0.5 -translate-y-0.5" />
                  </div>
                  <div className="w-2.5 h-3 md:w-3.5 md:h-4 bg-amber-300 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-slate-900 rounded-full translate-x-0.5 -translate-y-0.5" />
                  </div>
                </>
              )}
            </div>

            {/* Nose & Cute Mouth */}
            <div className="w-1.5 h-1 bg-pink-400 rounded-full my-0.5" />
            <div className="text-[9px] text-amber-200 font-bold leading-none">
              {mood === 'celebrating' ? '3' : mood === 'excited' ? 'O' : 'w'}
            </div>
          </div>

          {/* Cute Cat Ears on top of helmet */}
          <div className="absolute -top-1 left-2 w-4 h-4 bg-amber-200 border-2 border-amber-950 rounded-tl-lg rotate-12" />
          <div className="absolute -top-1 right-2 w-4 h-4 bg-amber-200 border-2 border-amber-950 rounded-tr-lg -rotate-12" />
        </div>

        {/* Mascot Accessories / Props */}
        {mood === 'writing' && (
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 0.3, repeat: Infinity }}
            className="absolute -bottom-2 bg-gradient-to-r from-cyan-400 to-blue-500 border-2 border-slate-900 text-[10px] px-2 py-0.5 rounded-lg text-white font-bold shadow-md z-20 flex items-center gap-1"
          >
            <span>💻</span> Pico Coding...
          </motion.div>
        )}

        {mood === 'celebrating' && (
          <div className="absolute -top-3 text-2xl z-20 animate-bounce">
            🎉
          </div>
        )}

        {/* Cute Name Tag */}
        <div className="absolute -bottom-4 bg-amber-300 text-amber-950 text-[10px] md:text-xs font-black px-2.5 py-0.5 rounded-full border-2 border-amber-950 shadow-[0_2px_0_rgba(120,53,15,0.6)] whitespace-nowrap z-20">
          Pico 🪐 Coder Vũ Trụ
        </div>
      </motion.div>
    </div>
  );
}
