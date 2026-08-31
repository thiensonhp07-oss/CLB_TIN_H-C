import React from 'react';
import { Sparkles, Terminal, Rocket, Cpu, Award, Code2, Users, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  onStartApply: () => void;
  onExploreDepts: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartApply, onExploreDepts }) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 select-none">
      {/* Cartoon Floating Stickers Background */}
      <div className="absolute top-10 left-[5%] animate-bounce hidden lg:block opacity-90 pointer-events-none">
        <div className="bg-pink-400 text-pink-950 text-xs font-black px-3 py-1.5 rounded-2xl border-3 border-slate-900 shadow-[0_4px_0_rgba(0,0,0,0.4)] -rotate-12">
          ✨ Game 2D-3D Core!
        </div>
      </div>

      <div className="absolute top-20 right-[7%] animate-pulse hidden lg:block opacity-90 pointer-events-none">
        <div className="bg-amber-300 text-amber-950 text-xs font-black px-3 py-1.5 rounded-2xl border-3 border-slate-900 shadow-[0_4px_0_rgba(0,0,0,0.4)] rotate-6">
          🔥 Chuyên Môn x Media x HR
        </div>
      </div>

      <div className="absolute bottom-12 left-[10%] hidden lg:block opacity-80 pointer-events-none">
        <div className="bg-cyan-300 text-cyan-950 text-xs font-black px-3 py-1.5 rounded-2xl border-3 border-slate-900 shadow-[0_4px_0_rgba(0,0,0,0.4)] rotate-12">
          ⚡ 100+ Members Active!
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Cartoon Chip Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-300 text-amber-950 border-3 border-slate-900 shadow-[0_4px_0_rgba(0,0,0,0.4)] text-xs sm:text-sm font-black">
            <Sparkles className="w-4 h-4 text-amber-950 animate-spin" />
            <span>🚀 VŨ TRỤ TUYỂN THÀNH VIÊN 2026</span>
            <span className="bg-pink-400 text-pink-950 px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase border border-slate-900 shadow-xs">
              Mở Đơn Đăng Ký
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto relative">
          <div className="hidden sm:inline-block absolute -top-6 -right-4 bg-yellow-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full border-2 border-slate-900 rotate-12 shadow-[0_3px_0_rgba(0,0,0,0.3)] animate-pulse">
            💥 SIÊU CHUẨN CARTOON
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15]">
            BIẾN NHỮNG DÒNG CODE THÀNH{' '}
            <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]">
              DẤU ẤN HỌC ĐƯỜNG
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-xl text-slate-200 font-bold leading-relaxed max-w-3xl mx-auto">
            Chào mừng bạn đến với portal tuyển dụng cartoon của <strong className="text-amber-300 underline underline-offset-4 decoration-amber-400 decoration-wavy">NK Tech Club</strong>. Nơi hội tụ các bạn đam mê Lập trình C++/Python, Game 2D, Roblox 3D, AI & Robotics, Viết bài Post Facebook, Media Sáng tạo và Quản lý Sự kiện đỉnh cao!
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartApply}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-300 hover:bg-amber-200 text-amber-950 border-4 border-slate-900 shadow-[0_6px_0_rgba(0,0,0,0.6)] font-black text-base hover:translate-y-[-2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Rocket className="w-6 h-6 text-amber-950 group-hover:rotate-12 transition-transform" />
              <span>NỘP ĐƠN VŨ TRỤ [AI REVIEW]</span>
              <ArrowRight className="w-5 h-5 text-amber-950 group-hover:translate-x-1 transition-transform stroke-[3]" />
            </button>

            <button
              onClick={onExploreDepts}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-900/90 hover:bg-indigo-800 text-amber-300 border-4 border-amber-300 shadow-[0_6px_0_rgba(120,53,15,0.6)] font-black text-base hover:translate-y-[-2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Terminal className="w-5 h-5 text-amber-300" />
              <span>Khám Phá 3 Ban CLB 🪐</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row - Cartoon Style */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-5 rounded-3xl bg-amber-100 text-slate-900 border-4 border-slate-900 shadow-[0_6px_0_rgba(0,0,0,0.4)] text-center hover:scale-105 transition-transform relative">
            <div className="absolute -top-3 -right-2 bg-pink-400 text-pink-950 text-[9px] font-black px-2 py-0.5 rounded-full border border-slate-900">HOT</div>
            <div className="flex justify-center mb-1 text-2xl">👥</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">120+</div>
            <div className="text-xs font-extrabold text-slate-800 mt-1">Thành Viên Active</div>
          </div>

          <div className="p-5 rounded-3xl bg-purple-200 text-slate-900 border-4 border-slate-900 shadow-[0_6px_0_rgba(0,0,0,0.4)] text-center hover:scale-105 transition-transform relative">
            <div className="flex justify-center mb-1 text-2xl">🎮</div>
            <div className="text-2xl sm:text-3xl font-black text-purple-950">15+</div>
            <div className="text-xs font-extrabold text-purple-950 mt-1">Dự Án Web & Game</div>
          </div>

          <div className="p-5 rounded-3xl bg-emerald-200 text-slate-900 border-4 border-slate-900 shadow-[0_6px_0_rgba(0,0,0,0.4)] text-center hover:scale-105 transition-transform relative">
            <div className="flex justify-center mb-1 text-2xl">🏆</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950">5+</div>
            <div className="text-xs font-extrabold text-emerald-950 mt-1">Giải KHKT & HSG</div>
          </div>

          <div className="p-5 rounded-3xl bg-cyan-200 text-slate-900 border-4 border-slate-900 shadow-[0_6px_0_rgba(0,0,0,0.4)] text-center hover:scale-105 transition-transform relative">
            <div className="flex justify-center mb-1 text-2xl">⚡</div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-950">100%</div>
            <div className="text-xs font-extrabold text-cyan-950 mt-1">Vibe Coder Genuine</div>
          </div>
        </div>

        {/* Feature Highlights Grid - Cartoon Pop Art Style */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-amber-50 text-slate-900 border-4 border-slate-900 shadow-[0_8px_0_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-transform relative group">
            <div className="w-12 h-12 rounded-2xl bg-amber-300 border-3 border-slate-900 flex items-center justify-center text-slate-900 text-2xl font-black mb-4 shadow-[0_3px_0_rgba(0,0,0,0.4)] group-hover:rotate-12 transition-transform">
              💻
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Lập Trình & Nghiên Cứu</h3>
            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              Cùng nhau ôn luyện C++, Python chinh phục HSG, phát triển Game 2D-3D và hiện thực hóa đề tài KHKT cấp Tỉnh/Thành phố.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-pink-50 text-slate-900 border-4 border-slate-900 shadow-[0_8px_0_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-transform relative group">
            <div className="w-12 h-12 rounded-2xl bg-pink-300 border-3 border-slate-900 flex items-center justify-center text-slate-900 text-2xl font-black mb-4 shadow-[0_3px_0_rgba(0,0,0,0.4)] group-hover:rotate-12 transition-transform">
              🎨
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Sáng Tạo Media Gen Z</h3>
            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              Thiết kế ấn phẩm truyền thông độc quái bằng Canva/Figma, dựng Reels/TikTok bão view và sáng tạo nội dung meme học đường.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-emerald-50 text-slate-900 border-4 border-slate-900 shadow-[0_8px_0_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-transform relative group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-300 border-3 border-slate-900 flex items-center justify-center text-slate-900 text-2xl font-black mb-4 shadow-[0_3px_0_rgba(0,0,0,0.4)] group-hover:rotate-12 transition-transform">
              🤖
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">AI Head Review Mode</h3>
            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              Tích hợp Gemini AI đóng vai Chủ nhiệm CLB hóm hỉnh. Đơn ứng tuyển của bạn sẽ được AI chấm điểm và nhận xét cực chất ngay lập tức!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
