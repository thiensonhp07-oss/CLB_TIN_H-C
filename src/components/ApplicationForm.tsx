import React, { useState, useEffect } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEPARTMENTS, ALL_SKILL_TAGS } from '../data/departments';
import { ApplicationFormData, DepartmentType, ApplicationRecord, AIReviewResult } from '../types';
import { User, Mail, Phone, School, Cpu, Code2, Sparkles, Send, Terminal, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';

interface ApplicationFormProps {
  initialDepartment?: DepartmentType;
  onSuccessSubmitted: (record: ApplicationRecord) => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ initialDepartment = 'chuyen-mon', onSuccessSubmitted }) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '',
    studentClass: '',
    schoolName: '',
    email: '',
    phone: '',
    facebook: '',
    department: initialDepartment,
    subRole: '',
    skills: [],
    flexZone: '',
    motivation: ''
  });

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Update department if initialDepartment prop changes
  useEffect(() => {
    if (initialDepartment) {
      setFormData(prev => ({
        ...prev,
        department: initialDepartment,
        subRole: DEPARTMENTS.find(d => d.id === initialDepartment)?.subRoles[0] || ''
      }));
    }
  }, [initialDepartment]);

  const parseSubRoles = (subRoleStr: string, availableRoles: string[]): string[] => {
    if (!subRoleStr) return [];
    if (subRoleStr.includes(' | ')) {
      return subRoleStr.split(' | ').filter(Boolean);
    }
    if (availableRoles.includes(subRoleStr)) {
      return [subRoleStr];
    }
    const rolesHaveComma = availableRoles.some((r) => r.includes(','));
    if (!rolesHaveComma && subRoleStr.includes(', ')) {
      return subRoleStr.split(', ').filter(Boolean);
    }
    return [subRoleStr];
  };

  const currentDeptObj = DEPARTMENTS.find(d => d.id === formData.department) || DEPARTMENTS[0];

  // Set default subrole when department changes
  const handleDepartmentChange = (deptId: DepartmentType) => {
    const deptObj = DEPARTMENTS.find(d => d.id === deptId) || DEPARTMENTS[0];
    setFormData(prev => ({
      ...prev,
      department: deptId,
      subRole: deptObj.subRoles[0] || ''
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
      };
    });
  };

  const validateStep = (currentStep: number): boolean => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        setErrorMsg('Vui lòng nhập Họ và Tên đầy đủ.');
        return false;
      }
      if (!formData.studentClass.trim()) {
        setErrorMsg('Vui lòng nhập Lớp và Mã Số Học Sinh (MSSV).');
        return false;
      }
      if (!formData.schoolName.trim()) {
        setErrorMsg('Vui lòng nhập Trường Trung học Phổ thông (THPT).');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMsg('Vui lòng nhập email hợp lệ.');
        return false;
      }
      if (!formData.phone.trim()) {
        setErrorMsg('Vui lòng nhập Số điện thoại hoặc Zalo.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.subRole) {
        setErrorMsg('Vui lòng chọn vị trí chuyên môn cụ thể.');
        return false;
      }
      if (formData.skills.length === 0) {
        setErrorMsg('Vui lòng chọn ít nhất 1 kỹ năng hoặc công cụ.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.motivation.trim() || formData.motivation.length < 15) {
        setErrorMsg('Vui lòng chia sẻ lý do gia nhập CLB (tối thiểu 15 ký tự).');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: document.getElementById('apply-form')?.offsetTop ? document.getElementById('apply-form')!.offsetTop - 100 : 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setTerminalLogs([
      '🤖 [SYS_INIT] Đang khởi động tiến trình đánh giá Gemini AI 2.5...',
      '🔍 [PARSE] Phân tích hồ sơ ứng viên & Flex Zone...',
      '⚡ [COMPUTE] Tính toán chỉ số Cyber Vibe & Tiềm năng...'
    ]);

    try {
      // Step 1: Call Express Gemini Evaluation API
      const backendUrl = ((import.meta as any).env?.VITE_BACKEND_URL || 'https://clb-tin-h-c-3.onrender.com').replace(/\/$/, '');
      const evalRes = await fetch(`${backendUrl}/api/evaluate-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          studentClass: formData.studentClass,
          departmentName: currentDeptObj.name,
          subRole: formData.subRole,
          skills: formData.skills,
          flexZone: formData.flexZone,
          motivation: formData.motivation
        })
      });

      const aiData: AIReviewResult = await evalRes.json();

      setTerminalLogs(prev => [
        ...prev,
        '✨ [AI_HEAD] Ban Chủ Nhiệm AI đã chấm xong điểm rating!',
        '💾 [FIRESTORE] Đồng bộ dữ liệu ứng viên vào Firestore Realtime DB...'
      ]);

      // Step 2: Save to Firestore `applications` collection
      const docPayload = {
        fullName: formData.fullName,
        studentClass: formData.studentClass,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        departmentName: currentDeptObj.name,
        subRole: formData.subRole,
        skills: formData.skills,
        flexZone: formData.flexZone || 'Chưa cung cấp',
        motivation: formData.motivation,
        scoreByAI: aiData.score,
        aiVibe: aiData.vibe,
        aiReview: aiData.review,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'applications'), docPayload);

      setTerminalLogs(prev => [
        ...prev,
        '🎉 [SUCCESS] Hồ sơ nộp thành công! Mã đơn: ' + docRef.id
      ]);

      setTimeout(() => {
        setIsSubmitting(false);
        onSuccessSubmitted({
          ...docPayload,
          id: docRef.id
        });
      }, 1200);

    } catch (err) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
      setErrorMsg('Đã xảy ra lỗi khi kết nối hệ thống. Vui lòng thử lại!');
    }
  };

  return (
    <div id="apply-form" className="py-12 md:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Form Container */}
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.15)] relative overflow-hidden">
          
          {/* Top Form Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-400 font-mono text-xs mb-3">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>FORM ĐĂNG KÝ TUYỂN THÀNH VIÊN 2026</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono">
              GIA NHẬP CLB TIN HỌC
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Điền thông tin bên dưới để Ban Chủ Nhiệm & Gemini AI chấm điểm đơn của bạn!
            </p>
          </div>

          {/* Multi-step Progress Bar */}
          <div className="mb-10">
            <div className="flex items-center justify-between max-w-xl mx-auto relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 -z-10" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 -translate-y-1/2 -z-10 transition-all duration-300"
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
              />

              {[1, 2, 3].map(stepNum => (
                <div key={stepNum} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all ${
                      step >= stepNum
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {step > stepNum ? <CheckCircle className="w-5 h-5 text-slate-950" /> : stepNum}
                  </div>
                  <span className="text-xs font-mono mt-2 text-slate-400 hidden sm:block">
                    {stepNum === 1 ? 'Cá nhân' : stepNum === 2 ? 'Ban & Skill' : 'Flex Zone'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-sm font-mono flex items-center gap-3 animate-headShake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Content Steps */}
          <form onSubmit={handleSubmit}>
            
            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-mono text-slate-300 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Họ và Tên đầy đủ *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn Coder"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 font-sans focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-slate-300 mb-2 flex items-center gap-2">
                    <School className="w-4 h-4 text-cyan-400" />
                    <span>Lớp & Mã Số Học Sinh (MSSV) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Lớp 10A1 - MSSV: 241088"
                    value={formData.studentClass}
                    onChange={e => setFormData({ ...formData, studentClass: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 font-sans focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-slate-300 mb-2 flex items-center gap-2">
                    <School className="w-4 h-4 text-cyan-400" />
                    <span>Trường Trung Học Phổ Thông (THPT) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: THPT Nguyễn Khuyến"
                    value={formData.schoolName}
                    onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 font-sans focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-mono text-slate-300 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span>Email liên hệ *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="coder@gmail.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 font-sans focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-mono text-slate-300 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <span>Số Điện Thoại / Zalo *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0912345678"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 font-sans focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-mono text-slate-300 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Link Facebook cá nhân</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://facebook.com/profile"
                    value={formData.facebook}
                    onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 font-sans focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Department & Skills */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-mono text-slate-300 mb-2">
                    Lựa chọn Phân Ban Nguyện Vọng *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {DEPARTMENTS.map(dept => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => handleDepartmentChange(dept.id)}
                        className={`p-4 rounded-xl border text-left font-mono transition-all cursor-pointer ${
                          formData.department === dept.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-sm text-white mb-1">{dept.name.split(' (')[0]}</div>
                        <div className="text-xs text-slate-400 line-clamp-1">{dept.tagline}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-mono text-slate-300">
                      Vị Trí Chuyên Môn Cụ Thể (Sub-Role) *
                    </label>
                    <span className="text-[11px] text-cyan-400 font-mono bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-800">
                      ⚡ Có thể chọn nhiều vị trí
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentDeptObj.subRoles.map((role, idx) => {
                      const selectedRoles = parseSubRoles(formData.subRole, currentDeptObj.subRoles);
                      const isSelected = selectedRoles.includes(role);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            let updated: string[];
                            if (isSelected) {
                              updated = selectedRoles.filter((r) => r !== role);
                              if (updated.length === 0) updated = [role];
                            } else {
                              updated = [...selectedRoles, role];
                            }
                            setFormData({ ...formData, subRole: updated.join(' | ') });
                          }}
                          className={`w-full p-3 rounded-xl border text-left font-mono text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span>{isSelected ? '✓ ' : '+ '}{role}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(() => {
                  const deptSkills = currentDeptObj ? currentDeptObj.skillsList : [];
                  const otherSkills = ALL_SKILL_TAGS.filter((s) => !deptSkills.includes(s));

                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-mono text-cyan-400 mb-2 font-bold flex items-center gap-1.5">
                          <span>🏆</span> Huy Hiệu Skill Đặc Trưng ({currentDeptObj.name.split(' (')[0]}) *
                        </label>
                        <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
                          {deptSkills.map((skill) => {
                            const isSelected = formData.skills.includes(skill);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => handleSkillToggle(skill)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:text-white'
                                }`}
                              >
                                {isSelected ? '✨ ' : '+ '}{skill}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-2">
                          ✨ Huy Hiệu Kỹ Năng Bổ Sung / Khác
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                          {otherSkills.map((skill) => {
                            const isSelected = formData.skills.includes(skill);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => handleSkillToggle(skill)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold'
                                    : 'bg-slate-900 border border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}{skill}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* STEP 3: Flex Zone & Motivation */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-mono text-slate-300 mb-2 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Flex Zone (Link GitHub, LeetCode, Portfolio, Demos hoặc Sản phẩm)</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    Dành cho Ban Chuyên Môn: Link GitHub, LeetCode, Roblox game, Web demo... / Ban Truyền Thông: Link Behance, Canva, TikTok video...
                  </p>
                  <textarea
                    rows={3}
                    placeholder="https://github.com/my-username hoặc https://tiktok.com/@my-portfolio..."
                    value={formData.flexZone}
                    onChange={e => setFormData({ ...formData, flexZone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-slate-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Tại sao bạn muốn gia nhập CLB Tin Học? *</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Chia sẻ lý do, mục tiêu học tập hoặc điều bạn mong muốn trải nghiệm tại CLB..."
                    value={formData.motivation}
                    onChange={e => setFormData({ ...formData, motivation: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 font-sans text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-mono text-sm hover:bg-slate-700 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold font-mono text-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-500 text-slate-950 font-bold font-mono text-sm hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>NỘP ĐƠN & AI PHÂN TÍCH</span>
                </button>
              )}
            </div>

          </form>

          {/* Loading Terminal Overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-30 p-8 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-500 p-0.5 animate-spin-slow mb-6">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <h3 className="text-xl font-mono font-bold text-cyan-300 mb-2">
                🤖 AI ĐANG PHÂN TÍCH NĂNG LƯỢNG CODE CỦA BẠN...
              </h3>
              <p className="text-xs font-mono text-slate-400 mb-6">
                Powered by Gemini 2.5 Flash & Firestore Realtime Database
              </p>

              {/* Terminal Screen */}
              <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-left text-xs space-y-2 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-slate-500 ml-2">gemini-evaluator.sh</span>
                </div>
                {terminalLogs.map((log, index) => (
                  <div key={index} className="text-cyan-400/90 font-mono animate-fadeIn">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
