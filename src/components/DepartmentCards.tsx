import React from 'react';
import { DEPARTMENTS } from '../data/departments';
import { DepartmentType } from '../types';
import { motion } from 'motion/react';
import { Rocket, Sparkles, Check, Code, Award, Users } from 'lucide-react';
import { sounds } from '../lib/audio';

interface DepartmentCardsProps {
  onSelectDepartmentForApply: (deptId: DepartmentType) => void;
}

export function DepartmentCards({ onSelectDepartmentForApply }: DepartmentCardsProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 relative z-10">
      
      {/* Title Banner */}
      <div className="bg-amber-50 text-slate-900 border-4 border-amber-950 rounded-3xl p-6 md:p-8 shadow-[0_12px_0_rgba(120,53,15,0.4)] mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-amber-300 text-amber-950 font-black px-4 py-1.5 rounded-full border-2 border-amber-950 text-xs md:text-sm shadow-sm">
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>3 BAN CHÍNH TRÊN THUYỀN VŨ TRỤ 🚀</span>
        </div>

        <h2 className="text-2xl md:text-4xl font-black text-amber-950 leading-tight">
          Khám Phá Các Ban NK Tech Club
        </h2>
        <p className="text-xs md:text-sm text-slate-600 font-semibold max-w-xl mx-auto">
          Mỗi Ban là một trạm sức mạnh độc đáo. Chọn trạm phù hợp với sở trường của bạn để tỏa sáng nhé!
        </p>
      </div>

      {/* 3 Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEPARTMENTS.map((dept, idx) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-amber-50 text-slate-900 border-4 border-amber-950 rounded-3xl p-6 shadow-[0_10px_0_rgba(120,53,15,0.4)] flex flex-col justify-between hover:translate-y-[-4px] transition-transform"
          >
            <div className="relative">
              {/* Cartoon Pop Badge Sticker */}
              <div className="absolute -top-9 -right-2 bg-pink-400 text-pink-950 text-[10px] font-black px-2.5 py-1 rounded-full border-2 border-amber-950 shadow-[0_3px_0_rgba(120,53,15,0.7)] rotate-6 z-10 animate-bounce">
                {dept.id === 'chuyen-mon' ? '🔥 HARDCORE TECH' : dept.id === 'truyen-thong' ? '✨ TRIỆU VIEW' : '💪 BỘ NÃO EVENT'}
              </div>

              {/* Card Header Icon & Tag */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-300 border-3 border-amber-950 flex items-center justify-center text-2xl shadow-[0_4px_0_rgba(120,53,15,0.6)]">
                  {dept.id === 'chuyen-mon' ? '💻' : dept.id === 'truyen-thong' ? '🎨' : '👥'}
                </div>
                <span className="bg-amber-200 text-amber-950 font-black text-xs px-3 py-1 rounded-full border border-amber-400">
                  {dept.id === 'chuyen-mon' ? 'Tech Core' : dept.id === 'truyen-thong' ? 'Media & Content' : 'HR & Operations'}
                </span>
              </div>

              {/* Name & Tagline */}
              <h3 className="text-lg md:text-xl font-black text-amber-950 leading-tight mb-2">
                {dept.name}
              </h3>
              <p className="text-xs font-bold text-amber-900 bg-amber-100 p-2.5 rounded-xl border border-amber-300 mb-4">
                "{dept.tagline}"
              </p>

              {/* Description */}
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                {dept.description}
              </p>

              {/* Sub-roles List */}
              <div className="space-y-1.5 mb-4">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                  Vị trí tuyển dụng:
                </span>
                {dept.subRoles.map((role, rIdx) => (
                  <div key={rIdx} className="flex items-start gap-1.5 text-xs font-bold text-slate-800">
                    <span className="text-amber-600">✦</span>
                    <span>{role}</span>
                  </div>
                ))}
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1 mb-6">
                {dept.skillsList.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="bg-white border border-amber-900/30 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Select for Apply Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                sounds.playRocketWhoosh();
                onSelectDepartmentForApply(dept.id);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 text-amber-950 border-3 border-amber-950 font-black rounded-2xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(120,53,15,0.7)] cursor-pointer"
            >
              <Rocket className="w-4 h-4 stroke-[2.5]" />
              <span>Nộp đơn Ban này 🚀</span>
            </motion.button>

          </motion.div>
        ))}
      </div>

    </div>
  );
}
