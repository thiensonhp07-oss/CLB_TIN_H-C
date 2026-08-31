import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Sparkles, Rocket, Users, BookOpen } from 'lucide-react';
import { sounds } from '../lib/audio';

interface HeaderProps {
  activeTab: 'form' | 'departments' | 'applicants';
  setActiveTab: (tab: 'form' | 'departments' | 'applicants') => void;
  applicantsCount: number;
}

export function Header({ activeTab, setActiveTab, applicantsCount }: HeaderProps) {
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());

  const toggleSound = () => {
    const nextMuted = !isMuted;
    sounds.setMuted(nextMuted);
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sounds.playStarBlip();
    }
  };

  const handleTabClick = (tab: 'form' | 'departments' | 'applicants') => {
    sounds.playPop();
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 bg-indigo-950/80 backdrop-blur-md border-b-4 border-amber-300/80 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="w-11 h-11 bg-amber-300 text-amber-950 rounded-2xl border-3 border-amber-950 shadow-[0_4px_0_rgba(120,53,15,0.8)] flex items-center justify-center font-black text-xl cursor-pointer"
            onClick={() => handleTabClick('form')}
          >
            🪐
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-amber-300 text-base md:text-lg tracking-wide leading-none">
                NK TECH CLUB
              </h1>
              <span className="bg-pink-400 text-pink-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-pink-950 uppercase shadow-sm">
                Vũ Trụ Recruits
              </span>
            </div>
            <p className="text-[11px] text-indigo-200 font-bold">
              Google Form Vũ Trụ • Single Stream Flow
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-indigo-900/90 border-2 border-indigo-700/80 p-1 rounded-2xl shadow-inner">
          <button
            onClick={() => handleTabClick('form')}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'form'
                ? 'bg-amber-300 text-amber-950 border-2 border-amber-950 shadow-[0_3px_0_rgba(120,53,15,0.6)]'
                : 'text-indigo-200 hover:text-white hover:bg-indigo-800/50'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nộp Đơn 🚀</span>
          </button>

          <button
            onClick={() => handleTabClick('departments')}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'departments'
                ? 'bg-amber-300 text-amber-950 border-2 border-amber-950 shadow-[0_3px_0_rgba(120,53,15,0.6)]'
                : 'text-indigo-200 hover:text-white hover:bg-indigo-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>3 Ban CLB 🪐</span>
          </button>

          <button
            onClick={() => handleTabClick('applicants')}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'applicants'
                ? 'bg-amber-300 text-amber-950 border-2 border-amber-950 shadow-[0_3px_0_rgba(120,53,15,0.6)]'
                : 'text-indigo-200 hover:text-white hover:bg-indigo-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Ứng Viên</span>
            <span className="bg-cyan-400 text-cyan-950 text-[10px] font-black px-1.5 rounded-full border border-cyan-950">
              {applicantsCount}
            </span>
          </button>
        </div>

        {/* Sound Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSound}
          className={`p-2 rounded-xl border-2 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
            isMuted
              ? 'bg-indigo-900 border-indigo-700 text-indigo-400'
              : 'bg-amber-300 border-amber-950 text-amber-950 shadow-[0_2px_0_rgba(120,53,15,0.6)]'
          }`}
          title={isMuted ? 'Mở âm thanh hoạt hình' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 stroke-[2.5]" />}
          <span className="hidden md:inline">{isMuted ? 'Mute' : 'Audio On'}</span>
        </motion.button>

      </div>
    </header>
  );
}
