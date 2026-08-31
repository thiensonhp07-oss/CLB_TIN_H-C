import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ApplicationRecord } from '../types';
import { Sparkles, Trophy, Copy, Check, ListOrdered, UserPlus, X, Terminal } from 'lucide-react';

interface SuccessModalProps {
  record: ApplicationRecord;
  onClose: () => void;
  onViewApplicants: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ record, onClose, onViewApplicants }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire confetti when modal opens
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const handleCopyId = () => {
    if (record.id) {
      navigator.clipboard.writeText(record.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_80px_rgba(6,182,212,0.3)] overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
            <Trophy className="w-8 h-8 text-cyan-400 animate-bounce" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            NỘP ĐƠN THÀNH CÔNG!
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Ứng viên: <strong className="text-cyan-300">{record.fullName}</strong> ({record.studentClass})
          </p>
        </div>

        {/* AI Score & Vibe Card */}
        <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 text-center relative overflow-hidden mb-6">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>GEMINI AI RATING SCORE</span>
          </div>

          <div className="text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 my-2">
            {record.scoreByAI} <span className="text-xl text-slate-500 font-normal">/ 10</span>
          </div>

          <div className="inline-block px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-xs font-semibold shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            VIBE: {record.aiVibe}
          </div>
        </div>

        {/* Head of Club Review Block */}
        <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 mb-6 font-mono text-xs sm:text-sm text-cyan-200 leading-relaxed relative">
          <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>LỜI NHẬN XÉT TỪ AI CHỦ NHIỆM CLB:</span>
          </div>
          <p className="italic font-sans text-slate-200 text-sm">
            "{record.aiReview}"
          </p>
        </div>

        {/* Application ID & Copy */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between mb-6 font-mono text-xs">
          <div className="text-slate-400 truncate mr-2">
            Mã đơn: <span className="text-slate-200">{record.id}</span>
          </div>
          <button
            onClick={handleCopyId}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              onClose();
              onViewApplicants();
            }}
            className="py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold font-mono text-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
            <span>Xem Bảng Ứng Viên</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-mono text-sm hover:bg-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Đóng / Nộp Đơn Khác</span>
          </button>
        </div>

      </div>
    </div>
  );
};
