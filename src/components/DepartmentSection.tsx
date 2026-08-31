import React, { useState } from 'react';
import { DEPARTMENTS } from '../data/departments';
import { DepartmentType } from '../types';
import { Code, Sparkles, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

interface DepartmentSectionProps {
  onSelectDepartmentForApply: (deptId: DepartmentType) => void;
}

export const DepartmentSection: React.FC<DepartmentSectionProps> = ({ onSelectDepartmentForApply }) => {
  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentType>('chuyen-mon');

  const currentDept = DEPARTMENTS.find(d => d.id === selectedDeptId) || DEPARTMENTS[0];

  const getIcon = (id: DepartmentType) => {
    switch (id) {
      case 'chuyen-mon':
        return <Code className="w-5 h-5" />;
      case 'truyen-thong':
        return <Sparkles className="w-5 h-5" />;
      case 'nhan-su':
        return <Users className="w-5 h-5" />;
    }
  };

  return (
    <div id="departments" className="py-12 md:py-20 relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-300 text-amber-950 font-black text-xs mb-3 border-2 border-slate-900 shadow-[0_3px_0_rgba(0,0,0,0.4)]">
            <span>🪐 PHÂN BAN THỦ THỦ VŨ TRỤ 2026</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            3 BAN CLB TIN HỌC THPT
          </h2>
          <p className="mt-4 text-slate-200 text-base sm:text-lg font-bold">
            Mỗi ban mang một sứ mệnh cốt lõi để giữ cho CLB luôn sáng tạo, bùng nổ và dẫn đầu phong trào công nghệ học đường.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {DEPARTMENTS.map(dept => {
            const isSelected = dept.id === selectedDeptId;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all cursor-pointer border-4 border-slate-900 ${
                  isSelected
                    ? 'bg-amber-300 text-amber-950 shadow-[0_6px_0_rgba(0,0,0,0.5)] scale-105'
                    : 'bg-indigo-900/80 text-amber-100 hover:bg-indigo-800 shadow-[0_4px_0_rgba(0,0,0,0.3)]'
                }`}
              >
                {getIcon(dept.id)}
                <span>{dept.name.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Department Details Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-amber-50 text-slate-900 border-4 border-slate-900 relative overflow-hidden shadow-[0_12px_0_rgba(120,53,15,0.4)]">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Info & Sub-roles */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-300 border-2 border-amber-950 text-amber-950 shadow-xs">
                  {currentDept.name}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 leading-snug">
                  {currentDept.tagline}
                </h3>
                <p className="mt-4 text-slate-800 text-base font-semibold leading-relaxed">
                  {currentDept.description}
                </p>
              </div>

              {/* Specific Sub-Roles */}
              <div>
                <h4 className="text-sm font-black text-amber-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>⚡ Vị trí ứng tuyển trọng điểm:</span>
                  <span className="text-[10px] bg-pink-400 text-pink-950 px-2 py-0.5 rounded-full border border-slate-900">Cho phép chọn nhiều</span>
                </h4>
                <div className="space-y-2.5">
                  {currentDept.subRoles.map((role, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border-3 border-amber-950 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 stroke-[3]" />
                      <span className="text-sm font-black text-slate-900">{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Required Skills & Action */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-amber-200/90 border-3 border-amber-950 flex flex-col justify-between h-full space-y-6 shadow-[0_6px_0_rgba(120,53,15,0.3)]">
              <div>
                <h4 className="text-sm font-black text-amber-950 uppercase tracking-wider mb-3">
                  🎨 Kỹ năng & Bộ công cụ ưu tiên:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentDept.skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-white border-2 border-amber-950 text-xs font-black text-amber-950 shadow-xs hover:bg-amber-300 transition-colors"
                    >
                      #{skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t-2 border-amber-950/30">
                <button
                  onClick={() => onSelectDepartmentForApply(currentDept.id)}
                  className="w-full py-4 rounded-2xl bg-pink-400 hover:bg-pink-300 text-pink-950 font-black text-sm border-3 border-slate-900 shadow-[0_5px_0_rgba(0,0,0,0.5)] hover:translate-y-[-2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>ỨNG TUYỂN VÀO {currentDept.name.split(' (')[0].toUpperCase()}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform stroke-[3]" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
