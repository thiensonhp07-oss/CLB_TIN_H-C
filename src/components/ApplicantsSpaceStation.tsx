import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ApplicationRecord } from '../types';
import { DEPARTMENTS } from '../data/departments';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Users, Star, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { sounds } from '../lib/audio';

const ApplicantCard: React.FC<{ app: ApplicationRecord; index: number }> = ({ app, index }) => {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const deptObj = DEPARTMENTS.find((d) => d.id === app.department);
  const skills = app.skills || [];
  const SKILL_LIMIT = 4;
  const hasMoreSkills = skills.length > SKILL_LIMIT;
  const displayedSkills = showAllSkills ? skills : skills.slice(0, SKILL_LIMIT);

  const toggleSkills = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPop();
    setShowAllSkills(!showAllSkills);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-amber-50 text-slate-900 border-3 border-amber-950 rounded-2xl p-5 shadow-[0_6px_0_rgba(120,53,15,0.4)] hover:shadow-[0_8px_0_rgba(120,53,15,0.6)] transition-all relative overflow-hidden flex flex-col justify-between group"
    >
      {/* Top Details */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-300 border-2 border-amber-950 flex items-center justify-center font-black text-lg text-amber-950 shadow-[0_3px_0_rgba(120,53,15,0.5)] shrink-0">
              {app.department === 'chuyen-mon' ? '💻' : app.department === 'truyen-thong' ? '🎨' : '👥'}
            </div>
            <div>
              <h3 className="font-extrabold text-amber-950 text-base leading-tight">
                {app.fullName}
              </h3>
              <p className="text-xs font-bold text-slate-500">
                {app.studentClass}{app.schoolName ? ` • ${app.schoolName}` : ''}
              </p>
            </div>
          </div>

          {/* AI Score Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="bg-indigo-950 text-amber-300 border-2 border-amber-950 font-black px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{app.scoreByAI}/10</span>
            </div>
          </div>
        </div>

        {/* Vibe Tag & Sub-role */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <span className="bg-pink-100 text-pink-950 font-black text-[11px] px-2.5 py-0.5 rounded-full border border-pink-300">
            {app.aiVibe || '⚡ Tech Vibe'}
          </span>
          <span className="bg-amber-200 text-amber-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-amber-400">
            {deptObj ? deptObj.name.split(' ')[1] : app.department}
          </span>
        </div>

        {/* Sub-role Badge */}
        {app.subRole && (
          <div className="mb-2.5">
            <span className="inline-block bg-indigo-100 text-indigo-950 font-black text-xs px-2.5 py-1 rounded-xl border border-indigo-300 shadow-xs">
              🎯 Vị trí: {app.subRole}
            </span>
          </div>
        )}

        {/* Skills Chips with Expand / Collapse Toggle */}
        {skills.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1 items-center">
              {displayedSkills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="bg-white border border-amber-900/30 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs transition-all hover:border-amber-700"
                >
                  {skill}
                </span>
              ))}

              {/* Show More / Show Less Toggle Button */}
              {hasMoreSkills && (
                <button
                  onClick={toggleSkills}
                  type="button"
                  className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg border transition-all cursor-pointer shadow-xs ${
                    showAllSkills
                      ? 'bg-amber-300 border-amber-950 text-amber-950 hover:bg-amber-400'
                      : 'bg-amber-200 hover:bg-amber-300 border-amber-800/40 text-amber-950 hover:border-amber-900'
                  }`}
                  title={showAllSkills ? 'Thu gọn danh sách kỹ năng' : 'Xem toàn bộ kỹ năng'}
                >
                  {showAllSkills ? (
                    <>
                      <span>Thu gọn</span>
                      <ChevronUp className="w-3 h-3 stroke-[3]" />
                    </>
                  ) : (
                    <>
                      <span>+{skills.length - SKILL_LIMIT} xem thêm</span>
                      <ChevronDown className="w-3 h-3 stroke-[3]" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Review summary quote */}
        <p className="text-xs text-slate-600 italic bg-amber-100/70 p-2.5 rounded-xl border border-amber-300/80 mb-3 leading-relaxed">
          "{app.aiReview}"
        </p>
      </div>

      {/* Footer status */}
      <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-xs font-bold text-slate-500">
        <span className="flex items-center gap-1.5 font-extrabold text-emerald-800 bg-emerald-100 px-2 rounded-xl border border-emerald-300 py-0.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
          <span>Đã nộp & Gửi mail BCN</span>
        </span>
        {app.createdAt && (
          <span className="text-[11px] font-semibold text-slate-400">
            {new Date(app.createdAt).toLocaleDateString('vi-VN')}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function ApplicantsSpaceStation() {
  const [applicants, setApplicants] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  useEffect(() => {
    // Real-time listener for applications in Firestore
    const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ApplicationRecord[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as ApplicationRecord),
        }));
        setApplicants(list);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore listener error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filtered = applicants.filter((app) => {
    const matchesSearch =
      app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentClass?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.aiVibe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.subRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.skills?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDeptFilter === 'all' || app.department === selectedDeptFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 relative z-10">
      
      {/* Station Header */}
      <div className="bg-amber-50 text-slate-900 border-4 border-amber-950 rounded-3xl p-6 md:p-8 shadow-[0_12px_0_rgba(120,53,15,0.4)] mb-8 text-center space-y-3">
        <div className="flex justify-center mb-2">
          <div className="inline-flex items-center gap-2 bg-amber-300 text-amber-950 font-black px-4 py-1.5 rounded-full border-2 border-amber-950 text-xs md:text-sm shadow-sm">
            <Users className="w-4 h-4 stroke-[2.5]" />
            <span>DANH SÁCH PHI HÀNH GIA 🚀</span>
          </div>
        </div>

        <h2 className="text-2xl md:text-4xl font-black text-amber-950 leading-tight">
          Trạm Vũ Trụ Tuyển Thành Viên
        </h2>
        
        {/* Privacy Notice Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 bg-emerald-100/90 text-emerald-950 font-extrabold px-3.5 py-1.5 rounded-2xl border-2 border-emerald-500 text-xs shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />
            <span>Bảo vệ quyền riêng tư: Ẩn SĐT & Email cá nhân ở giao diện công khai</span>
          </div>
        </div>

        <p className="text-xs md:text-sm text-slate-600 font-semibold max-w-2xl mx-auto">
          Tổng cộng <span className="font-extrabold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400">{applicants.length} ứng viên</span> đã nộp hồ sơ và được AI chấm điểm!
        </p>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-amber-200">
          {/* Search Bar */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, lớp, kỹ năng hoặc vibe..."
              className="w-full bg-white text-slate-900 border-2 border-amber-950 rounded-2xl pl-10 pr-4 py-2.5 text-xs md:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-300 placeholder:font-normal"
            />
          </div>

          {/* Department Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                sounds.playPop();
                setSelectedDeptFilter('all');
              }}
              className={`px-3 py-2 rounded-xl border-2 font-black text-xs cursor-pointer ${
                selectedDeptFilter === 'all'
                  ? 'bg-amber-300 border-amber-950 text-amber-950 shadow-[0_3px_0_rgba(120,53,15,0.6)]'
                  : 'bg-white border-amber-950/20 text-slate-700 hover:bg-amber-100'
              }`}
            >
              Tất cả ({applicants.length})
            </button>
            {DEPARTMENTS.map((dept) => {
              const count = applicants.filter((a) => a.department === dept.id).length;
              return (
                <button
                  key={dept.id}
                  onClick={() => {
                    sounds.playPop();
                    setSelectedDeptFilter(dept.id);
                  }}
                  className={`px-3 py-2 rounded-xl border-2 font-black text-xs cursor-pointer ${
                    selectedDeptFilter === dept.id
                      ? 'bg-amber-300 border-amber-950 text-amber-950 shadow-[0_3px_0_rgba(120,53,15,0.6)]'
                      : 'bg-white border-amber-950/20 text-slate-700 hover:bg-amber-100'
                  }`}
                >
                  {dept.id === 'chuyen-mon' ? '💻 Tech' : dept.id === 'truyen-thong' ? '🎨 Media' : '👥 HR'} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="text-center py-12 text-indigo-200 font-bold flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-300 border-t-transparent rounded-full animate-spin" />
          <span>Đang kết nối tín hiệu vệ tinh vũ trụ...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-amber-50 border-4 border-amber-950 rounded-3xl p-12 text-center text-slate-700 space-y-3 shadow-[0_8px_0_rgba(120,53,15,0.4)]">
          <span className="text-4xl">🪐</span>
          <h3 className="text-xl font-black text-amber-950">Chưa có ứng viên nào trong danh sách</h3>
          <p className="text-xs font-semibold text-slate-500">
            {searchTerm ? 'Thử tìm kiếm với từ khóa khác hoặc nộp đơn để là người đầu tiên!' : 'Danh sách hiện tại đang trống. Hãy nộp đơn để trở thành ứng viên đầu tiên xuất hiện ở đây!'}
          </p>
        </div>
      ) : (
        /* Applicant Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((app, index) => (
            <ApplicantCard key={app.id || index} app={app} index={index} />
          ))}
        </div>
      )}

    </div>
  );
}



