import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ApplicationRecord } from '../types';
import { Sparkles, Trophy, Star, CheckCircle, Share2, Users, Rocket, Award } from 'lucide-react';
import { sounds } from '../lib/audio';

interface CosmicSuccessModalProps {
  record: ApplicationRecord;
  onClose: () => void;
  onViewApplicants: () => void;
}

export function CosmicSuccessModal({ record, onClose, onViewApplicants }: CosmicSuccessModalProps) {
  useEffect(() => {
    sounds.playSuccessChime();

    // Trigger star-burst confetti
    try {
      const count = 200;
      const defaults = { origin: { y: 0.6 } };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } catch {
      // Ignore confetti errors
    }
  }, []);

  const handleShare = () => {
    sounds.playStarBlip();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `🚀 Tôi vừa nộp hồ sơ gia nhập NK Tech Club với AI Score: ${record.scoreByAI}/10 - Vibe: ${record.aiVibe}! Đăng ký ngay cùng tôi nhé!`
      );
      alert('✨ Đã sao chép thẻ thành tích hồ sơ vũ trụ vào khay nhớ tạm!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-xl bg-amber-50 text-slate-900 border-4 border-amber-950 rounded-3xl p-6 md:p-8 shadow-[0_16px_0_rgba(15,23,42,0.8)] relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Confetti Star Accents */}
        <div className="absolute top-2 left-4 text-3xl animate-bounce">🎉</div>
        <div className="absolute top-2 right-4 text-3xl animate-bounce delay-100">✨</div>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 bg-emerald-300 text-emerald-950 font-black px-4 py-1.5 rounded-full border-2 border-amber-950 shadow-sm text-xs md:text-sm">
            <CheckCircle className="w-4 h-4 stroke-[3]" />
            <span>NỘP HỒ SƠ VŨ TRỤ THÀNH CÔNG!</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-amber-950 leading-tight">
            Chúc mừng {record.fullName}! 🚀
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-semibold">
            Hồ sơ của bạn đã được lưu trữ an toàn trên Trạm Vũ Trụ NK Tech Club
          </p>
        </div>


        {/* Gemini AI Telescope Evaluation Card */}
        <div className="bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900 text-indigo-100 border-3 border-amber-950 rounded-2xl p-5 md:p-6 shadow-[0_6px_0_rgba(120,53,15,0.6)] space-y-4 relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-indigo-700/80 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-black text-amber-300 text-sm tracking-wider uppercase">
                Kết Quả Quét Radar AI
              </span>
            </div>
            <div className="bg-amber-300 text-amber-950 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-amber-950">
              Gemini 3.6 Flash
            </div>
          </div>

          {/* AI Score & Vibe Tag */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-indigo-900/90 border-2 border-indigo-700 rounded-2xl p-3 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-indigo-300 uppercase">Điểm Tiềm Năng</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl md:text-4xl font-black text-amber-300 leading-none">
                  {record.scoreByAI}
                </span>
                <span className="text-xs font-bold text-indigo-400">/10</span>
              </div>
            </div>

            <div className="bg-indigo-900/90 border-2 border-indigo-700 rounded-2xl p-3 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-indigo-300 uppercase">AI Vibe Tag</span>
              <span className="text-xs md:text-sm font-black text-pink-300 mt-1 line-clamp-2">
                {record.aiVibe}
              </span>
            </div>
          </div>

          {/* President's Review */}
          <div className="bg-indigo-900/60 border border-indigo-700 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
              <Trophy className="w-4 h-4" />
              <span>Đánh giá từ Chủ Nhiệm NK Tech Club:</span>
            </div>
            <p className="text-xs md:text-sm text-indigo-100 italic leading-relaxed">
              "{record.aiReview}"
            </p>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleShare}
              className="py-3 bg-amber-200 hover:bg-amber-300 text-amber-950 border-2 border-amber-950 font-black rounded-2xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(120,53,15,0.4)] cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Khoe thành tích</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                sounds.playPop();
                onViewApplicants();
              }}
              className="py-3 bg-cyan-300 hover:bg-cyan-400 text-cyan-950 border-2 border-amber-950 font-black rounded-2xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(120,53,15,0.4)] cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Xem các phi hành gia</span>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-amber-950 border-3 border-amber-950 font-black rounded-2xl text-sm md:text-base shadow-[0_4px_0_rgba(120,53,15,0.8)] cursor-pointer"
          >
            Đóng & Hoàn tất
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
}
