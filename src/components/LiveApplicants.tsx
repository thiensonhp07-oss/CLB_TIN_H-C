import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ApplicationRecord, DepartmentType } from '../types';
import { DEPARTMENTS } from '../data/departments';
import { Search, Trophy, Sparkles, Code2, Terminal, ExternalLink, Calendar, Eye, User, X } from 'lucide-react';

export const LiveApplicants: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterDept, setFilterDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);

  useEffect(() => {
    // Listen to Firestore `applications` collection in real-time
    const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: ApplicationRecord[] = [];
      snapshot.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() } as ApplicationRecord);
      });
      setApplications(records);
      setLoading(false);
    }, (error) => {
      console.error('Realtime Firestore applications listener error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredApps = applications.filter(app => {
    const matchesDept = filterDept === 'all' || app.department === filterDept;
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.subRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const getDepartmentName = (deptId: DepartmentType) => {
    const found = DEPARTMENTS.find(d => d.id === deptId);
    return found ? found.name.split(' (')[0] : deptId;
  };

  return (
    <div id="applicants" className="py-12 md:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 font-mono text-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>FIRESTORE REALTIME FEED</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-mono">
            DANH SÁCH ỨNG VIÊN LIVE
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Tổng cộng <strong className="text-cyan-400 font-mono">{applications.length}</strong> đơn ứng tuyển đã được lưu trữ & chấm điểm tự động bởi AI!
          </p>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          
          {/* Dept Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setFilterDept('all')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                filterDept === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              Tất cả ({applications.length})
            </button>
            {DEPARTMENTS.map(dept => {
              const count = applications.filter(a => a.department === dept.id).length;
              return (
                <button
                  key={dept.id}
                  onClick={() => setFilterDept(dept.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                    filterDept === dept.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {dept.name.split(' (')[0]} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top.1/2 -translate-y-1/2 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên, lớp, skill..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>

        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="p-16 text-center font-mono text-cyan-400 animate-pulse">
            ⚡ Đang tải danh sách hồ sơ từ Firestore Realtime Database...
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800/80 font-mono text-slate-400">
            Chưa có đơn ứng tuyển nào phù hợp với bộ lọc. Hãy là người đầu tiên nộp đơn!
          </div>
        ) : (
          /* Applicants Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all backdrop-blur-md flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Dept & Score */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
                      {getDepartmentName(app.department)}
                    </span>
                    <div className="flex items-center gap-1 font-mono font-extrabold text-sm text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                      <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{app.scoreByAI}</span>
                    </div>
                  </div>

                  {/* Name & Class */}
                  <h3 className="text-lg font-bold font-mono text-white group-hover:text-cyan-300 transition-colors">
                    {app.fullName}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mb-3">
                    {app.studentClass} • <span className="text-purple-300">{app.subRole}</span>
                  </div>

                  {/* Vibe Badge */}
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-[11px] mb-4">
                    Vibe: {app.aiVibe}
                  </div>

                  {/* Witty AI Review Snippet */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-sans text-slate-300 italic line-clamp-2 mb-4">
                    "{app.aiReview}"
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {app.skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                        #{skill}
                      </span>
                    ))}
                    {app.skills.length > 4 && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-500">
                        +{app.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                  </span>

                  <button
                    onClick={() => setSelectedApp(app)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi tiết</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Detailed Application Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
              
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-mono text-white">{selectedApp.fullName}</h3>
                  <p className="text-xs font-mono text-cyan-400">
                    {selectedApp.studentClass} • {selectedApp.departmentName} ({selectedApp.subRole})
                  </p>
                </div>
              </div>

              {/* AI Score Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs font-mono text-slate-400">DIỂM RATING CỦA GEMINI AI:</div>
                  <div className="text-3xl font-extrabold font-mono text-cyan-300">{selectedApp.scoreByAI} / 10</div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 font-mono text-xs font-semibold">
                  {selectedApp.aiVibe}
                </div>
              </div>

              {/* Head of Club Review */}
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 mb-6">
                <div className="text-xs font-mono text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  <span>NHẬN XÉT CỦA BCN:</span>
                </div>
                <p className="text-sm font-sans text-slate-200 italic">"{selectedApp.aiReview}"</p>
              </div>

              {/* Flex Zone & Motivation */}
              <div className="space-y-4 mb-6 text-sm font-sans">
                <div>
                  <div className="text-xs font-mono text-slate-400 mb-1 flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>FLEX ZONE / DỰ ÁN DEMO:</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 break-all">
                    {selectedApp.flexZone}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono text-slate-400 mb-1">LÝ DO GIA NHẬP:</div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                    "{selectedApp.motivation}"
                  </div>
                </div>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-mono text-xs hover:bg-slate-700 cursor-pointer"
                >
                  Đóng cửa sổ
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
