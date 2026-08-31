import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 w-full py-8 px-4 mt-12 bg-indigo-950/90 border-t-4 border-amber-300/80 text-indigo-200 text-center">
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2 font-black text-amber-300 text-sm">
          <span>🪐 NK TECH CLUB</span>
          <span>•</span>
          <span>RECRUITMENT PORTAL VŨ TRỤ</span>
        </div>

        <p className="text-xs text-indigo-300 font-medium">
          Trải nghiệm nộp đơn trên một dòng chuẩn Google Form Vũ Trụ • Tích hợp Gemini AI chấm điểm hồ sơ
        </p>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-indigo-400 font-bold pt-2 border-t border-indigo-900">
          <span>Sáng tạo bởi Ban Chủ Nhiệm NK Tech Club với</span>
          <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400 inline" />
          <span>& Tinh thần Gen Z vui vẻ!</span>
        </div>
      </div>
    </footer>
  );
}
