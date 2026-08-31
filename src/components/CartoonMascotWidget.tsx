import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MascotPico, MascotMood } from './MascotPico';
import { sounds } from '../lib/audio';
import { Sparkles, MessageCircle, X } from 'lucide-react';

const CARTOON_TIPS = [
  "🚀 Ban Chuyên Môn NK Tech Club có Game 2D, Roblox 3D, AI & Robotics cực cháy!",
  "✨ Ban Truyền Thông đang chiêu mộ Coder & Viết bài Post Facebook!",
  "🎨 Ban Truyền Thông tuyển Viết bài Post Facebook & Content Fanpage!",
  "👥 Ban Nhân Sự cầm trịch Event, Team Building & Logistics!",
  "🪐 Nhấp vào bong bóng trên màn hình để nghe tiếng nổ nảy!",
  "💖 AI Pico sẵn sàng đánh giá hồ sơ vũ trụ NK Tech Club 100%!"
];

export function CartoonMascotWidget() {
  const [tipIndex, setTipIndex] = useState(0);
  const [mood, setMood] = useState<MascotMood>('idle');
  const [isOpen, setIsOpen] = useState(false);

  const handleMascotClick = () => {
    sounds.playStarBlip();
    const moods: MascotMood[] = ['excited', 'celebrating', 'thinking', 'writing', 'idle'];
    const nextMood = moods[Math.floor(Math.random() * moods.length)];
    setMood(nextMood);
    setTipIndex((prev) => (prev + 1) % CARTOON_TIPS.length);
  };

  return (
    <div className="fixed bottom-3 right-3 md:bottom-6 md:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="pointer-events-auto relative flex flex-col items-end cursor-pointer group"
            onClick={handleMascotClick}
          >
            {/* Cartoon Mascot */}
            <div className="relative">
              <MascotPico
                mood={mood}
                message={CARTOON_TIPS[tipIndex]}
                className="transform hover:scale-105 transition-transform"
              />
              {/* Tap to change tip badge */}
              <div className="absolute -top-1 -right-1 bg-pink-400 text-pink-950 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-pink-950 shadow-sm animate-bounce">
                Click me! ✨
              </div>
            </div>

            {/* Minimize button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playPop();
                setIsOpen(false);
              }}
              className="mt-1 bg-amber-200/90 text-amber-950 hover:bg-amber-300 p-1 rounded-full border border-amber-950 shadow text-xs cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              title="Ẩn trợ lý cartoon"
            >
              <X className="w-3 h-3 stroke-[3]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => {
            sounds.playPop();
            setIsOpen(true);
          }}
          className="pointer-events-auto bg-amber-300 text-amber-950 font-black px-3 py-2 rounded-2xl border-3 border-amber-950 shadow-[0_4px_0_rgba(120,53,15,0.8)] text-xs flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer"
        >
          <span>🐱 Pico Assistant</span>
          <Sparkles className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </div>
  );
}
