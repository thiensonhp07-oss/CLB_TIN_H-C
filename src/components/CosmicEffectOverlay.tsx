import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../lib/audio';
import { Sparkles, Zap, Rocket, Cat, Flame } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: 'star' | 'orb' | 'spark' | 'ring';
  rotation: number;
}

interface ClickBurst {
  id: number;
  x: number;
  y: number;
  label?: string;
  particles: Particle[];
  ringSize: number;
}

interface CursorSpark {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

const COMIC_TAGS = ['ZAP! ⚡', 'BOOM! ✨', 'POWER! 🚀', 'MAGIC! 🌟', 'CODE! 💻', 'SUPER! 🏆', 'MEOW! 🐱', '100%! 🔥'];
const NEON_COLORS = ['#fde047', '#f472b6', '#38bdf8', '#a78bfa', '#34d399', '#fb923c'];

export function CosmicEffectOverlay() {
  const [bursts, setBursts] = useState<ClickBurst[]>([]);
  const [trail, setTrail] = useState<CursorSpark[]>([]);
  const [isZapFlashing, setIsZapFlashing] = useState(false);
  const [activeRockets, setActiveRockets] = useState<{ id: number; y: number }[]>([]);
  const [picoQuote, setPicoQuote] = useState<string | null>(null);
  const [isBarExpanded, setIsBarExpanded] = useState(true);

  // 1. Sleek Light Burst Particles on Click
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('button')
      ) {
        return;
      }

      const count = 12;
      const particles: Particle[] = Array.from({ length: count }).map((_, i) => {
        const angle = (i * (360 / count) + Math.random() * 15) * (Math.PI / 180);
        const speed = Math.random() * 45 + 20;
        const types: ('star' | 'orb' | 'spark')[] = ['star', 'orb', 'spark'];
        return {
          id: Math.random(),
          x: 0,
          y: 0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 15,
          size: Math.random() * 10 + 8,
          color: NEON_COLORS[i % NEON_COLORS.length],
          type: types[i % types.length],
          rotation: Math.random() * 360,
        };
      });

      const burstId = Date.now() + Math.random();
      const label = COMIC_TAGS[Math.floor(Math.random() * COMIC_TAGS.length)];

      setBursts((prev) => [
        ...prev.slice(-4),
        {
          id: burstId,
          x: e.clientX,
          y: e.clientY,
          label,
          particles,
          ringSize: Math.random() * 20 + 50,
        },
      ]);

      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, 800);
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // 2. Delicate Cursor Stardust Trail
  useEffect(() => {
    let lastTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime < 70) return;
      lastTime = now;

      const newSpark: CursorSpark = {
        id: Math.random(),
        x: e.clientX + (Math.random() * 8 - 4),
        y: e.clientY + (Math.random() * 8 - 4),
        size: Math.random() * 6 + 4,
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
      };

      setTrail((prev) => [...prev.slice(-10), newSpark]);

      setTimeout(() => {
        setTrail((prev) => prev.filter((s) => s.id !== newSpark.id));
      }, 500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3. Action Handlers
  const handleTriggerFireworks = () => {
    sounds.playFanfare();
    const count = 28;
    const particles: Particle[] = Array.from({ length: count }).map((_, i) => {
      const angle = (i * (360 / count)) * (Math.PI / 180);
      const speed = Math.random() * 90 + 40;
      return {
        id: Math.random(),
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: Math.random() * 12 + 10,
        color: NEON_COLORS[i % NEON_COLORS.length],
        type: i % 2 === 0 ? 'star' : 'orb',
        rotation: Math.random() * 360,
      };
    });

    const burstId = Date.now() + Math.random();
    setBursts((prev) => [
      ...prev,
      {
        id: burstId,
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.35,
        label: 'FIREWORKS! 🎆✨',
        particles,
        ringSize: 120,
      },
    ]);

    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 1200);
  };

  const handleTriggerZap = () => {
    sounds.playLightningZap();
    setIsZapFlashing(true);
    setTimeout(() => setIsZapFlashing(false), 250);
  };

  const handleLaunchRocket = () => {
    sounds.playRocketWhoosh();
    const rocketId = Date.now();
    const randomY = Math.random() * (window.innerHeight * 0.5) + 120;

    setActiveRockets((prev) => [...prev, { id: rocketId, y: randomY }]);

    setTimeout(() => {
      setActiveRockets((prev) => prev.filter((r) => r.id !== rocketId));
    }, 1800);
  };

  const handlePicoMascotCall = () => {
    sounds.playMascotMeow();
    const quotes = [
      'Meow! Chúc bạn đỗ CLB Tin Học THPT 100%! 🚀',
      'Pico đã sẵn sàng chào đón bạn! ✨',
      'Đừng quên gửi đơn sớm nha ứng viên ơi! 🐾',
      'Cùng làm nên siêu phẩm với CLB Tin Học! 💻',
    ];
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    setPicoQuote(q);

    setTimeout(() => setPicoQuote(null), 3200);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {/* Lightning Flash Overlay */}
      <AnimatePresence>
        {isZapFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-amber-300 z-50 pointer-events-none mix-blend-screen"
          />
        )}
      </AnimatePresence>

      {/* Flying Space Rocket */}
      {activeRockets.map((r) => (
        <motion.div
          key={r.id}
          initial={{ x: -120, y: r.y }}
          animate={{ x: window.innerWidth + 180 }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
          className="absolute z-40 flex items-center gap-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]"
        >
          <div className="text-3xl">🚀</div>
          <div className="px-3 py-1 bg-amber-300/90 text-amber-950 text-xs font-black rounded-full border border-amber-950 shadow-md backdrop-blur-sm uppercase tracking-wider">
            CLB TIN HỌC 2026 ✨
          </div>
        </motion.div>
      ))}

      {/* Cursor Stardust Trail */}
      {trail.map((s) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 1, scale: 0.6, x: s.x - s.size / 2, y: s.y - s.size / 2 }}
          animate={{ opacity: 0, scale: 1.6, y: s.y - 18 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            boxShadow: `0 0 10px ${s.color}`,
          }}
        />
      ))}

      {/* Click Explosive Particles & Shockwave Ring */}
      {bursts.map((burst) => (
        <div key={burst.id} className="absolute" style={{ left: burst.x, top: burst.y }}>
          {/* Shockwave Ring Effect */}
          <motion.div
            initial={{ scale: 0.1, opacity: 0.9 }}
            animate={{ scale: burst.ringSize / 20, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.8)]"
            style={{ width: '40px', height: '40px' }}
          />

          {/* Label Pop */}
          {burst.label && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 0, rotate: -6 }}
              animate={{ scale: 1, opacity: 1, y: -38, rotate: 3 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute -translate-x-1/2 px-2.5 py-0.5 bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 font-black text-xs rounded-xl border-2 border-amber-950 shadow-[0_3px_0_rgba(120,53,15,0.9)] whitespace-nowrap z-50 pointer-events-none uppercase tracking-wider"
            >
              {burst.label}
            </motion.div>
          )}

          {/* Particles */}
          {burst.particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: p.rotation }}
              animate={{
                x: p.vx,
                y: p.vy,
                opacity: 0,
                scale: 1.4,
                rotate: p.rotation + 180,
              }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute flex items-center justify-center pointer-events-none"
            >
              {p.type === 'star' ? (
                /* 4-point SVG Vector Star Particle */
                <svg
                  viewBox="0 0 24 24"
                  className="drop-shadow-[0_0_8px_currentColor]"
                  style={{ width: `${p.size}px`, height: `${p.size}px`, fill: p.color }}
                >
                  <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
                </svg>
              ) : p.type === 'spark' ? (
                /* Glowing Sparkle Dot */
                <div
                  className="rounded-full shadow-lg"
                  style={{
                    width: `${p.size * 0.8}px`,
                    height: `${p.size * 0.8}px`,
                    backgroundColor: p.color,
                    boxShadow: `0 0 12px ${p.color}`,
                  }}
                />
              ) : (
                /* Glowing Ring/Orb Particle */
                <div
                  className="rounded-full border-2 border-white/80"
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: `${p.color}aa`,
                    boxShadow: `0 0 10px ${p.color}`,
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      ))}

      {/* Pico Speech Bubble Notification */}
      <AnimatePresence>
        {picoQuote && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-20 right-6 md:right-28 z-50 bg-slate-900/95 text-amber-300 border-2 border-amber-400/80 p-3.5 rounded-2xl font-bold text-xs shadow-[0_8px_25px_rgba(0,0,0,0.6)] backdrop-blur-md max-w-xs pointer-events-auto"
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-black text-amber-400 border-b border-amber-400/20 pb-1">
              <span>🐱 Mascot Pico:</span>
            </div>
            <p className="text-slate-200 font-bold leading-snug">{picoQuote}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek & Compact Floating Action Pill Dock (Bottom Left) */}
      <div className="fixed bottom-4 left-4 z-40 pointer-events-auto flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <button
          onClick={() => setIsBarExpanded(!isBarExpanded)}
          className="p-2 text-amber-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-xs font-black flex items-center gap-1"
          title="Bật / Tắt hiệu ứng"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="hidden sm:inline">Hiệu Ứng ✨</span>
        </button>

        {isBarExpanded && (
          <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
            <button
              onClick={handleTriggerFireworks}
              className="px-2.5 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 rounded-xl font-bold text-xs flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
              title="Bắn pháo hoa"
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Pháo Hoa</span>
            </button>

            <button
              onClick={handleTriggerZap}
              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
              title="Tia sét"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tia Sét</span>
            </button>

            <button
              onClick={handleLaunchRocket}
              className="px-2.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold text-xs flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
              title="Phóng tàu"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Phóng Tàu</span>
            </button>

            <button
              onClick={handlePicoMascotCall}
              className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-xs flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
              title="Lời chúc Mascot Pico"
            >
              <Cat className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Pico</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
