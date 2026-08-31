import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sounds } from '../lib/audio';

interface StarBubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  emoji: string;
  speed: number;
}

export function CosmicCartoonBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bubbles, setBubbles] = useState<StarBubble[]>([]);

  // Initialize interactive floating star bubbles
  useEffect(() => {
    const emojis = ['⭐', '🪐', '🚀', '✨', '👾', '🎨', '💻', '🔮'];
    const colors = ['bg-amber-300', 'bg-pink-300', 'bg-purple-300', 'bg-cyan-300', 'bg-emerald-300'];

    const initialBubbles: StarBubble[] = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 80 + 10,
      size: Math.floor(Math.random() * 16) + 36,
      color: colors[i % colors.length],
      emoji: emojis[i % emojis.length],
      speed: Math.random() * 4 + 3,
    }));

    setBubbles(initialBubbles);
  }, []);

  // Twinkling Canvas Starfield
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate stars
    const stars = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
      color: ['#FDE047', '#F472B6', '#38BDF8', '#A78BFA', '#FFFFFF'][Math.floor(Math.random() * 5)]
    }));

    // Shooting stars
    const shootingStars: { x: number; y: number; length: number; speed: number; alpha: number }[] = [];

    const addShootingStar = () => {
      if (Math.random() < 0.03) {
        shootingStars.push({
          x: Math.random() * width,
          y: Math.random() * (height / 2),
          length: Math.random() * 80 + 40,
          speed: Math.random() * 10 + 10,
          alpha: 1,
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw starry dots
      stars.forEach((star) => {
        star.alpha += star.speed;
        const opacity = (Math.sin(star.alpha) + 1) / 2;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = opacity * 0.8;
        ctx.fill();
      });

      // Draw shooting stars
      addShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.length, ss.y + ss.length * 0.5);
        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 2;
        ctx.globalAlpha = ss.alpha;
        ctx.stroke();

        ss.x += ss.speed;
        ss.y += ss.speed * 0.5;
        ss.alpha -= 0.02;

        if (ss.alpha <= 0 || ss.x > width || ss.y > height) {
          shootingStars.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handlePopBubble = (id: number) => {
    sounds.playPop();
    setBubbles((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return {
            ...b,
            x: Math.random() * 85 + 5,
            y: Math.random() * 80 + 10,
          };
        }
        return b;
      })
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Bright, Cartoon Cosmic Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#4338ca] transition-colors duration-1000" />

      {/* Pastel Soft Nebula Glows */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute -bottom-20 left-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Twinkling Starfield Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Cartoon UFO Flying Alien Cat */}
      <motion.div
        animate={{
          x: [-100, 1200],
          y: [80, 140, 80],
          rotate: [5, -5, 5],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-1/4 left-0 pointer-events-auto cursor-pointer z-10 hidden sm:block"
        onClick={() => sounds.playStarBlip()}
      >
        <div className="relative bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 border-3 border-slate-900 rounded-full px-3 py-1.5 shadow-[0_4px_0_rgba(0,0,0,0.4)] flex items-center gap-1.5 group hover:scale-110 transition-transform">
          <span className="text-xl">🛸</span>
          <span className="text-xs font-black text-slate-900">Pico Ship 👽</span>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-amber-300 text-amber-950 font-bold text-[9px] px-2 py-0.5 rounded-full border border-slate-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
            Vũ trụ Tin Học THPT
          </div>
        </div>
      </motion.div>

      {/* Cute Floating Cartoon Planets */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-12 left-6 md:left-16 pointer-events-auto cursor-pointer"
        onClick={() => sounds.playStarBlip()}
      >
        <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-amber-400 via-pink-400 to-rose-400 border-4 border-amber-200 shadow-[0_8px_0_rgba(0,0,0,0.2)] flex items-center justify-center group">
          {/* Planet Ring */}
          <div className="absolute w-24 h-6 md:w-36 md:h-8 border-4 border-amber-200/80 rounded-full -rotate-12 transform group-hover:scale-110 transition-transform" />
          <span className="text-2xl md:text-3xl relative z-10">🪐</span>
          <div className="absolute -bottom-6 bg-amber-300 text-amber-950 font-bold text-[10px] md:text-xs px-2 py-0.5 rounded-full border border-amber-950 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
            Hành tinh Chuyên Môn
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 18, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-28 right-8 md:right-20 pointer-events-auto cursor-pointer"
        onClick={() => sounds.playStarBlip()}
      >
        <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-cyan-300 via-sky-400 to-blue-500 border-4 border-sky-100 shadow-[0_8px_0_rgba(0,0,0,0.2)] flex items-center justify-center group">
          <span className="text-xl md:text-2xl relative z-10">🚀</span>
          <div className="absolute -bottom-6 bg-cyan-200 text-cyan-950 font-bold text-[10px] md:text-xs px-2 py-0.5 rounded-full border border-cyan-950 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
            Trạm Vũ Trụ CLB
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-12 left-10 md:left-24 pointer-events-auto cursor-pointer hidden md:block"
        onClick={() => sounds.playStarBlip()}
      >
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 border-4 border-purple-200 shadow-[0_6px_0_rgba(0,0,0,0.2)] flex items-center justify-center group">
          <span className="text-2xl relative z-10">🎨</span>
          <div className="absolute -bottom-6 bg-purple-200 text-purple-950 font-bold text-xs px-2 py-0.5 rounded-full border border-purple-950 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
            Ban Truyền Thông
          </div>
        </div>
      </motion.div>

      {/* Interactive Clickable Star-Bubbles */}
      {bubbles.map((b) => (
        <motion.button
          key={b.id}
          style={{ left: `${b.x}%`, top: `${b.y}%` }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: b.speed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.8 }}
          onClick={() => handlePopBubble(b.id)}
          className={`absolute pointer-events-auto p-2 rounded-full border-2 border-white/80 shadow-md ${b.color} flex items-center justify-center text-lg md:text-xl cursor-pointer hover:shadow-lg transition-shadow active:translate-y-1`}
          title="Nhấp để làm nổ bong bóng vũ trụ!"
        >
          {b.emoji}
        </motion.button>
      ))}
    </div>
  );
}
