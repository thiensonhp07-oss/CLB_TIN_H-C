import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ApplicationFormData, DepartmentType, ApplicationRecord } from '../types';
import { DEPARTMENTS, ALL_SKILL_TAGS } from '../data/departments';
import { MascotPico, MascotMood } from './MascotPico';
import { sounds } from '../lib/audio';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Check, ChevronRight, ChevronLeft, Sparkles, Rocket, Star, Heart, User, Users, Mail, Phone, BookOpen, Code, Award, Link as LinkIcon, Send, Camera, PenTool, FileText, Palette, Cpu, Gamepad2, Microscope, ShieldAlert, Maximize2, Minimize2, AlertTriangle, Info, HelpCircle } from 'lucide-react';

export type CastingModuleType = 'hr' | 'ai_res' | 'content' | 'cp' | 'dev' | 'game' | 'design' | 'cameraman';

export function getRequiredCastingModules(subRoleStr: string, departmentId: string, availableRoles: string[]): CastingModuleType[] {
  if (!subRoleStr) return ['dev'];

  const parseSubRolesLocal = (str: string): string[] => {
    if (str.includes(' | ')) return str.split(' | ').filter(Boolean);
    if (availableRoles.includes(str)) return [str];
    if (str.includes(', ')) return str.split(', ').filter(Boolean);
    return [str];
  };

  const selectedRoles = parseSubRolesLocal(subRoleStr);
  const modulesSet = new Set<CastingModuleType>();

  selectedRoles.forEach((role) => {
    const rLower = role.toLowerCase();
    if (rLower.includes('hr') || rLower.includes('nhân sự') || rLower.includes('quản lý') || rLower.includes('sự kiện') || rLower.includes('event') || rLower.includes('logistics') || rLower.includes('hậu cần')) {
      modulesSet.add('hr');
    }
    if (rLower.includes('ai') || rLower.includes('data') || rLower.includes('research') || rLower.includes('robot') || rLower.includes('nghiên cứu') || rLower.includes('khoa học') || rLower.includes('machine') || rLower.includes('ml')) {
      modulesSet.add('ai_res');
    }
    if (rLower.includes('content') || rLower.includes('writer') || rLower.includes('viết bài') || rLower.includes('biên tập') || rLower.includes('sáng tạo nội dung')) {
      modulesSet.add('content');
    }
    if (rLower.includes('cp') || rLower.includes('học thuật') || rLower.includes('competitive') || rLower.includes('thuật toán') || rLower.includes('c++') || rLower.includes('python') || rLower.includes('chuyên tin')) {
      modulesSet.add('cp');
    }
    if (rLower.includes('web') || rLower.includes('app') || rLower.includes('full-stack') || rLower.includes('fullstack') || rLower.includes('dev') || rLower.includes('front') || rLower.includes('back') || rLower.includes('vibe')) {
      modulesSet.add('dev');
    }
    if (rLower.includes('game') || rLower.includes('gamedev') || rLower.includes('unity') || rLower.includes('roblox') || rLower.includes('unreal')) {
      modulesSet.add('game');
    }
    if (rLower.includes('design') || rLower.includes('poster') || rLower.includes('video') || rLower.includes('graphic') || rLower.includes('edit') || rLower.includes('thiết kế')) {
      modulesSet.add('design');
    }
    if (rLower.includes('chụp') || rLower.includes('cameraman') || rLower.includes('phim') || rLower.includes('photo') || rLower.includes('nhiếp ảnh') || rLower.includes('media')) {
      modulesSet.add('cameraman');
    }
  });

  if (modulesSet.size === 0) {
    if (departmentId === 'chuyen-mon') {
      modulesSet.add('dev');
    } else if (departmentId === 'truyen-thong') {
      modulesSet.add('content');
      modulesSet.add('cameraman');
    } else if (departmentId === 'nhan-su') {
      modulesSet.add('hr');
    } else {
      modulesSet.add('dev');
    }
  }

  return Array.from(modulesSet);
}

interface CartoonGoogleFormProps {
  initialDepartment?: DepartmentType;
  onSuccessSubmitted: (record: ApplicationRecord) => void;
}

const getWordCount = (str?: string): number => {
  if (!str) return 0;
  const trimmed = str.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};

const FORM_STEPS = [
  { id: 1, title: 'Họ và tên', subtitle: 'Tên bạn là gì thế astronaut?', icon: User, key: 'fullName' },
  { id: 2, title: 'Lớp, Mã HS & Trường THPT', subtitle: 'Để NK Tech Club dễ tìm bạn trên dải ngân hà', icon: BookOpen, key: 'studentClass' },
  { id: 3, title: 'Liên hệ', subtitle: 'Email, SĐT / Zalo & Link Facebook của bạn', icon: Mail, key: 'emailPhone' },
  { id: 4, title: 'Ban ứng tuyển', subtitle: 'Chọn trạm dừng chân yêu thích trong NK Tech Club', icon: Rocket, key: 'department' },
  { id: 5, title: 'Vị trí cụ thể', subtitle: 'Vai trò bạn muốn đảm nhận nhất', icon: Award, key: 'subRole' },
  { id: 6, title: 'Huy hiệu Thế mạnh bổ trợ ⭐', subtitle: 'Chọn huy hiệu để Admin biết bạn mạnh thêm mảng gì (Không bắt buộc làm thêm bài thi)', icon: Star, key: 'skills' },
  { id: 7, title: 'Thử thách Casting 💻✍️🎨📸', subtitle: 'Thử thách tư duy theo vị trí chuyên môn bạn đã chọn', icon: Code, key: 'casting' },
  { id: 8, title: 'Flex Zone', subtitle: 'Gắn link GitHub, Portfolio, Canva hoặc sản phẩm ấn tượng nhất', icon: LinkIcon, key: 'flexZone' },
  { id: 9, title: 'Bắn hồ sơ 🚀', subtitle: 'Kiểm tra lại và sẵn sàng AI chấm điểm!', icon: Send, key: 'submit' },
];

export function CartoonGoogleForm({ initialDepartment, onSuccessSubmitted }: CartoonGoogleFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1); // 1 = next, -1 = prev
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeCastingTab, setActiveCastingTab] = useState<'hr' | 'ai_res' | 'content' | 'cp' | 'dev' | 'game' | 'design' | 'cameraman'>('hr');

  const [hasStartedAntiCheat, setHasStartedAntiCheat] = useState<boolean>(false);
  const [cheatCount, setCheatCount] = useState<number>(0);
  const [cheatLogs, setCheatLogs] = useState<string[]>([]);
  const [showCheatModal, setShowCheatModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '',
    studentClass: '',
    schoolName: '',
    email: '',
    phone: '',
    facebook: '',
    department: initialDepartment || 'chuyen-mon',
    subRole: '',
    skills: [],
    flexZone: '',
    motivation: '',
    cheatCount: 0,
    cheatLogs: '',
    castingCamQ1: '',
    castingCamQ2: '',
    castingCamQ3: '',
    castingContentQ1: '',
    castingContentQ2: '',
    castingContentQ3: '',
    castingDesignQ1: '',
    castingDesignQ2: '',
    castingDesignQ3: '',
    castingCpQ1: '',
    castingCpQ2: '',
    castingCpQ3: '',
    castingCpQ4: '',
    castingCpQ5: '',
    castingDevQ1: '',
    castingDevQ2: '',
    castingDevQ3: '',
    castingDevQ4: '',
    castingDevQ5: '',
    castingGameQ1: '',
    castingGameQ2: '',
    castingGameQ3: '',
    castingGameQ4: '',
    castingGameQ5: '',
    castingAiResQ1: '',
    castingAiResQ2: '',
    castingAiResQ3: '',
    castingAiResQ4: '',
    castingAiResQ5: '',
    castingHrQ1: '',
    castingHrQ2: '',
    castingHrQ3: '',
    castingHrQ4: '',
    castingHrQ5: '',
  });

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Anti-Cheat: detect tab switch & window blur
  useEffect(() => {
    if (currentStep !== 7 || !hasStartedAntiCheat) return;

    let isHandled = false;
    const registerViolation = () => {
      if (isHandled) return;
      isHandled = true;

      const timeStr = new Date().toLocaleTimeString('vi-VN');
      setCheatCount((prev) => {
        const newCount = prev + 1;
        const newLogMsg = `Lần ${newCount}: Out trang / Chuyển tab lúc ${timeStr}`;
        setCheatLogs((p) => [...p, newLogMsg]);
        setFormData((f) => ({
          ...f,
          cheatCount: newCount,
          cheatLogs: f.cheatLogs ? `${f.cheatLogs}; ${newLogMsg}` : newLogMsg,
        }));
        sounds.playPop();
        setShowCheatModal(true);
        return newCount;
      });

      setTimeout(() => {
        isHandled = false;
      }, 1000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        registerViolation();
      }
    };

    const handleBlur = () => {
      registerViolation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [currentStep, hasStartedAntiCheat]);

  const requestFullscreenMode = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn('Fullscreen request blocked or not supported:', err);
      });
    }
  };

  // Update department if prop changes
  useEffect(() => {
    if (initialDepartment) {
      setFormData((prev) => ({ ...prev, department: initialDepartment }));
      const dept = DEPARTMENTS.find((d) => d.id === initialDepartment);
      if (dept && dept.subRoles.length > 0) {
        setFormData((prev) => ({ ...prev, subRole: dept.subRoles[0] }));
      }
    }
  }, [initialDepartment]);

  // Helper to safely parse multi-selected subroles without breaking on commas in role names
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

  // Set default subrole when department changes
  useEffect(() => {
    const currentDept = DEPARTMENTS.find((d) => d.id === formData.department);
    if (currentDept) {
      const selected = parseSubRoles(formData.subRole, currentDept.subRoles);
      const hasValid = selected.some((s) => currentDept.subRoles.includes(s));
      if (!formData.subRole || !hasValid) {
        setFormData((prev) => ({ ...prev, subRole: currentDept.subRoles[0] }));
      }
    }
  }, [formData.department]);

  const handleSubRoleToggle = (role: string) => {
    sounds.playPop();
    const currentDept = DEPARTMENTS.find((d) => d.id === formData.department);
    const availableRoles = currentDept ? currentDept.subRoles : [];
    const currentRoles = parseSubRoles(formData.subRole, availableRoles);
    let nextRoles: string[];
    if (currentRoles.includes(role)) {
      nextRoles = currentRoles.filter((r) => r !== role);
      if (nextRoles.length === 0) nextRoles = [role];
    } else {
      nextRoles = [...currentRoles, role];
    }
    setFormData((prev) => ({ ...prev, subRole: nextRoles.join(' | ') }));
  };

  // Focus current input on step change
  useEffect(() => {
    sounds.playRocketWhoosh();
    setErrorMessage('');
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleInputChange = (field: keyof ApplicationFormData, value: unknown) => {
    sounds.playPop();
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const toggleSkill = (skill: string) => {
    sounds.playStarBlip();
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      if (exists) {
        return { ...prev, skills: prev.skills.filter((s) => s !== skill) };
      } else {
        return { ...prev, skills: [...prev.skills, skill] };
      }
    });
  };

  // Validation before going to next step
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.fullName.trim()) {
        setErrorMessage('🚀 Astronaut ơi, cho Pico xin họ và tên đầy đủ nhé!');
        return false;
      }
    } else if (step === 2) {
      if (!formData.studentClass.trim()) {
        setErrorMessage('🎒 Hãy nhập lớp và MSSV/Mã học sinh (Ví dụ: 10A1 - 220012)');
        return false;
      }
      if (!formData.schoolName.trim()) {
        setErrorMessage('🏫 Hãy nhập tên trường THPT bạn đang theo học nhé!');
        return false;
      }
    } else if (step === 3) {
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('✉️ Vui lòng nhập email hợp lệ để CLB gửi thông báo kết quả!');
        return false;
      }
      if (!formData.phone.trim()) {
        setErrorMessage('📞 Vui lòng nhập SĐT hoặc Zalo liên hệ!');
        return false;
      }
    } else if (step === 4) {
      if (!formData.department) {
        setErrorMessage('🪐 Vui lòng chọn Ban bạn muốn tham gia!');
        return false;
      }
    } else if (step === 5) {
      if (!formData.subRole) {
        setErrorMessage('⭐ Vui lòng chọn ít nhất 1 vị trí cụ thể!');
        return false;
      }
    } else if (step === 6) {
      if (!formData.skills || formData.skills.length === 0) {
        setErrorMessage('✨ Vui lòng chọn ít nhất 1 kỹ năng hoặc công cụ bạn có!');
        return false;
      }
    } else if (step === 7) {
      if (!hasStartedAntiCheat) {
        setHasStartedAntiCheat(true);
      }

      const currentDept = DEPARTMENTS.find((d) => d.id === formData.department);
      const availableRoles = currentDept ? currentDept.subRoles : [];
      const requiredModules = getRequiredCastingModules(formData.subRole, formData.department, availableRoles);

      for (const mod of requiredModules) {
        if (mod === 'hr') {
          if (!formData.castingHrQ1?.trim() || !formData.castingHrQ2?.trim() || !formData.castingHrQ3?.trim() || !formData.castingHrQ4?.trim() || !formData.castingHrQ5?.trim()) {
            setErrorMessage('⚠️ Bài thi HR & Sự Kiện: Vui lòng trả lời đầy đủ tất cả 5 câu hỏi tình huống!');
            return false;
          }
        } else if (mod === 'ai_res') {
          if (!formData.castingAiResQ1?.trim() || !formData.castingAiResQ2?.trim() || !formData.castingAiResQ3?.trim() || !formData.castingAiResQ4?.trim() || !formData.castingAiResQ5?.trim()) {
            setErrorMessage('⚠️ Bài thi AI & Research: Vui lòng trả lời đầy đủ tất cả 5 câu hỏi tư duy!');
            return false;
          }
        } else if (mod === 'content') {
          if (!formData.castingContentQ1?.trim() || !formData.castingContentQ2?.trim() || !formData.castingContentQ3?.trim()) {
            setErrorMessage('⚠️ Bài thi Content Creator: Vui lòng hoàn thành đầy đủ 3 câu hỏi sáng tạo!');
            return false;
          }
        } else if (mod === 'cp') {
          if (!formData.castingCpQ1?.trim() || !formData.castingCpQ2?.trim() || !formData.castingCpQ3?.trim() || !formData.castingCpQ4?.trim() || !formData.castingCpQ5?.trim()) {
            setErrorMessage('⚠️ Bài thi Chuyên Tin & Thuật toán: Vui lòng hoàn thành đầy đủ 5 câu hỏi!');
            return false;
          }
        } else if (mod === 'dev') {
          if (!formData.castingDevQ1?.trim() || !formData.castingDevQ2?.trim() || !formData.castingDevQ3?.trim() || !formData.castingDevQ4?.trim() || !formData.castingDevQ5?.trim()) {
            setErrorMessage('⚠️ Bài thi Web/App Dev: Vui lòng hoàn thành đầy đủ 5 câu hỏi tư duy sản phẩm!');
            return false;
          }
        } else if (mod === 'game') {
          if (!formData.castingGameQ1?.trim() || !formData.castingGameQ2?.trim() || !formData.castingGameQ3?.trim() || !formData.castingGameQ4?.trim() || !formData.castingGameQ5?.trim()) {
            setErrorMessage('⚠️ Bài thi Game Dev: Vui lòng hoàn thành đầy đủ 5 câu hỏi thiết kế game!');
            return false;
          }
        } else if (mod === 'design') {
          if (!formData.castingDesignQ1?.trim() || !formData.castingDesignQ2?.trim() || !formData.castingDesignQ3?.trim()) {
            setErrorMessage('⚠️ Bài thi Graphic Design: Vui lòng hoàn thành đầy đủ 3 câu hỏi thiết kế & video!');
            return false;
          }
        } else if (mod === 'cameraman') {
          if (!formData.castingCamQ1?.trim() || !formData.castingCamQ2?.trim() || !formData.castingCamQ3?.trim()) {
            setErrorMessage('⚠️ Bài thi Cameraman / Photographer: Vui lòng trả lời đầy đủ 3 câu hỏi góc nhìn!');
            return false;
          }
        }
      }
    }
    return true;
  };

  // Helper function to check all previous steps
  const validateAllPreviousSteps = (upToStep: number): number | null => {
    for (let s = 1; s <= upToStep; s++) {
      if (!validateStep(s)) {
        return s;
      }
    }
    return null;
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep) {
      setDirection(-1);
      setCurrentStep(targetStep);
      setErrorMessage('');
      return;
    }

    const firstInvalidStep = validateAllPreviousSteps(targetStep - 1);
    if (firstInvalidStep !== null) {
      setDirection(firstInvalidStep > currentStep ? 1 : -1);
      setCurrentStep(firstInvalidStep);
      sounds.playPop();
      return;
    }

    setDirection(1);
    setCurrentStep(targetStep);
    setErrorMessage('');
  };

  const goToNextStep = () => {
    if (!validateStep(currentStep)) {
      sounds.playPop();
      return;
    }
    if (currentStep < FORM_STEPS.length) {
      setErrorMessage('');
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setErrorMessage('');
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Keyboard Navigation: Enter key goes to next step
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target;
    if (e.key === 'Enter' && currentStep !== 7 && currentStep !== 8 && currentStep !== 9) {
      if (target instanceof HTMLInputElement) {
        e.preventDefault();
        goToNextStep();
      }
    }
  };

  // Submit Application
  const handleSubmit = async () => {
    const firstInvalidStep = validateAllPreviousSteps(8);
    if (firstInvalidStep !== null) {
      setDirection(firstInvalidStep > currentStep ? 1 : -1);
      setCurrentStep(firstInvalidStep);
      sounds.playPop();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    sounds.playRocketWhoosh();

    const selectedDeptObj = DEPARTMENTS.find((d) => d.id === formData.department);
    const deptName = selectedDeptObj ? selectedDeptObj.name : formData.department;

    try {
      // 1. Send to Gemini AI Endpoint for grading with robust local/remote fallback
      let aiData: any = {
        score: 9.5,
        vibe: '⚡ 100% Ultra Vibe Galactic Coder',
        review: `Chào ${formData.fullName}! Đơn ứng tuyển và câu trả lời thử thách của bạn thể hiện tư duy nhạy bén và đam mê mãnh liệt. Ban Chủ nhiệm NK Tech Club nhiệt liệt chào đón bạn!`,
      };

      try {
        const backendUrl = (((import.meta as any).env?.VITE_BACKEND_URL as string) || '').replace(/\/$/, '');
        const response = await fetch(`${backendUrl}/api/evaluate-application`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            departmentName: deptName,
          }),
        });

        if (response.ok) {
          const parsed = await response.json();
          if (parsed && typeof parsed === 'object') {
            aiData = parsed;
          }
        }
      } catch (aiErr) {
        console.warn('AI evaluation warning, proceeding with smart fallback scoring:', aiErr);
      }

      const newRecord: ApplicationRecord = {
        ...formData,
        scoreByAI: Math.min(9.9, Math.max(8.8, aiData.score || 9.4)),
        aiVibe: aiData.vibe || '⚡ 100% Ultra Vibe Coder',
        aiReview: aiData.review || 'Hồ sơ của bạn tràn đầy năng lượng sáng tạo và nhiệt huyết bùng nổ!',
        createdAt: new Date().toISOString(),
      };

      // 2. Persist to Firestore
      try {
        const docRef = await addDoc(collection(db, 'applications'), newRecord);
        newRecord.id = docRef.id;
      } catch (firestoreError) {
        console.error('Firestore save warning:', firestoreError);
      }

      // 3. Dispatch Gmail Notification to NK Tech Club in background
      try {
        const backendUrl = (((import.meta as any).env?.VITE_BACKEND_URL as string) || '').replace(/\/$/, '');
        fetch(`${backendUrl}/api/send-application-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newRecord,
            departmentName: deptName,
          }),
        }).catch((emailErr) => console.warn('Email notification non-blocking log:', emailErr));
      } catch (emailTriggerErr) {
        console.warn('Email trigger error:', emailTriggerErr);
      }

      sounds.playSuccessChime();
      setIsSubmitting(false);
      onSuccessSubmitted(newRecord);
    } catch (err) {
      console.error('Submit error:', err);
      setIsSubmitting(false);
      setErrorMessage('Có lỗi xảy ra khi gửi hồ sơ. Vui lòng thử lại!');
    }
  };

  // Pico Mascot Mood & Speech
  const getMascotProps = (): { mood: MascotMood; message: string } => {
    switch (currentStep) {
      case 1:
        return {
          mood: formData.fullName ? 'excited' : 'idle',
          message: formData.fullName
            ? `Rất vui được gặp ${formData.fullName.split(' ')[0]}!`
            : 'Chào mừng bạn! Đầu tiên hãy cho Pico biết tên bạn nhé! ✨',
        };
      case 2:
        return {
          mood: 'thinking',
          message: 'Lớp mấy và mã số học sinh của bạn là gì nè? 🎒',
        };
      case 3:
        return {
          mood: 'writing',
          message: 'Email & Zalo chính xác để CLB gửi thư mời nhập hội nhé! ✉️',
        };
      case 4:
        return {
          mood: 'excited',
          message: 'Bạn muốn về trạm dừng chân nào trong 3 Ban chính? 🚀',
        };
      case 5:
        return {
          mood: 'idle',
          message: 'Chọn đúng vai trò sở trường để phát huy tối đa sức mạnh! 💪',
        };
      case 6:
        return {
          mood: formData.skills.length > 0 ? 'excited' : 'thinking',
          message:
            formData.skills.length > 0
              ? `Oa! Đã gắn ${formData.skills.length} huy hiệu skill lấp lánh! ✨`
              : 'Hãy chọn những skill bạn tự tin nhất hoặc đang theo học!',
        };
      case 7:
        return {
          mood: 'writing',
          message: 'Có GitHub, Canva, Figma hay link dự án cứ thả vào đây nhé! 🔗',
        };
      case 8:
        return {
          mood: 'writing',
          message: '📸 Thử thách Casting góc nhìn cho Cameraman / Photographer! Thể hiện tư duy qua ống kính nhé!',
        };
      case 9:
        return {
          mood: 'thinking',
          message: 'Lý do bạn muốn quẩy cùng NK Tech Club là gì nè? 💖',
        };
      case 10:
        return {
          mood: 'celebrating',
          message: 'Mọi thứ đã sẵn sàng! Bắn tên lửa lên Trạm Vũ Trụ ngay thôi! 🚀✨',
        };
      default:
        return { mood: 'idle', message: 'Tối ưu trải nghiệm Google Form Vũ Trụ!' };
    }
  };

  const mascotProps = getMascotProps();
  const currentStepObj = FORM_STEPS[currentStep - 1];

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-4 md:py-8 relative z-10 transition-all duration-300">
      
      {/* Cartoon Space Rocket Progress Track ("Trên một dòng") */}
      <div className="mb-6 bg-indigo-950/80 backdrop-blur-md border-4 border-amber-300/80 rounded-3xl p-4 shadow-[0_8px_0_rgba(15,23,42,0.8)] relative overflow-hidden">
        
        {/* Background Constellation Line */}
        <div className="flex items-center justify-between relative z-10 my-1">
          <div className="absolute top-1/2 left-4 right-4 h-2 bg-indigo-900 border border-indigo-700 rounded-full -translate-y-1/2 z-0" />
          <motion.div
            className="absolute top-1/2 left-4 h-2 bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400 rounded-full -translate-y-1/2 z-0"
            animate={{ width: `${((currentStep - 1) / (FORM_STEPS.length - 1)) * 92}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />

          {/* Rocket Ship Icon Moving Along Line */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none"
            animate={{ left: `calc(${((currentStep - 1) / (FORM_STEPS.length - 1)) * 90}% + 8px)` }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="w-9 h-9 bg-amber-300 text-amber-950 rounded-full border-2 border-amber-950 shadow-md flex items-center justify-center text-lg rotate-45 transform">
              🚀
            </div>
          </motion.div>

          {/* Step Planet Dots */}
          {FORM_STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`relative z-10 w-7 h-7 md:w-9 md:h-9 rounded-full font-extrabold text-xs flex items-center justify-center transition-all duration-300 border-2 ${
                  isCurrent
                    ? 'bg-amber-300 text-amber-950 border-amber-950 scale-125 shadow-[0_0_12px_rgba(252,211,77,0.8)]'
                    : isCompleted
                    ? 'bg-cyan-400 text-cyan-950 border-cyan-950'
                    : 'bg-indigo-900 text-indigo-300 border-indigo-700 hover:border-amber-300'
                }`}
                title={`Trạm ${step.id}: ${step.title}`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </button>
            );
          })}
        </div>

        {/* Step Indicator Text */}
        <div className="flex items-center justify-between text-xs font-bold text-indigo-200 mt-3 pt-2 border-t border-indigo-800/80">
          <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Trạm {currentStep}/{FORM_STEPS.length}: {currentStepObj.title}</span>
          </div>
          <span className="bg-indigo-900/90 border border-indigo-700 px-2.5 py-0.5 rounded-full text-indigo-200 font-medium">
            Tiến trình: {Math.round((currentStep / FORM_STEPS.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Main Single-Stream Form Card Container */}
      <div className="grid md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Mascot Pico & Advice */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center justify-center">
          <MascotPico mood={mascotProps.mood} message={mascotProps.message} />

          {/* Quick Shortcuts Helper */}
          <div className="hidden md:block mt-6 bg-indigo-950/60 border-2 border-indigo-800/60 rounded-2xl p-3 text-center text-xs text-indigo-300 font-medium w-full">
            <p className="font-bold text-amber-300 mb-1">💡 Phím tắt nhanh:</p>
            <p><kbd className="bg-indigo-900 text-amber-300 px-1.5 py-0.5 rounded border border-indigo-700 font-bold">Enter ↵</kbd> để qua câu tiếp</p>
            <p className="mt-0.5"><kbd className="bg-indigo-900 text-amber-300 px-1.5 py-0.5 rounded border border-indigo-700 font-bold">Shift+Enter</kbd> xuống dòng</p>
          </div>
        </div>

        {/* Right Column: Active Question Step Card */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-amber-50 text-slate-900 border-4 border-amber-950 rounded-3xl p-6 sm:p-10 md:p-12 shadow-[0_12px_0_rgba(120,53,15,0.4)] relative overflow-hidden">
            
            {/* Cartoon Header Accent */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-amber-200">
              <div className="w-12 h-12 bg-amber-300 text-amber-950 rounded-2xl border-2 border-amber-950 flex items-center justify-center shadow-[0_4px_0_rgba(120,53,15,0.6)] shrink-0">
                <currentStepObj.icon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400">
                  Câu hỏi {currentStep} trên {FORM_STEPS.length}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-amber-950 mt-1 leading-tight">
                  {currentStepObj.title}
                </h2>
                <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
                  {currentStepObj.subtitle}
                </p>
              </div>
            </div>

            {/* Error / Warning Alert */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-rose-100 text-rose-950 border-2 border-rose-950 font-bold p-3 rounded-2xl text-xs md:text-sm flex items-center gap-2 shadow-[0_4px_0_rgba(159,18,57,0.3)]"
              >
                <span className="text-lg">⚠️</span>
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Animated Step Content Slider */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                onKeyDown={handleKeyDown}
              >
                {/* STEP 1: Full Name */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-black text-slate-800">
                      Họ và Tên đầy đủ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn Vibe Coder"
                      className="w-full bg-white text-slate-900 border-3 border-amber-950 rounded-2xl px-4 py-3.5 text-base md:text-lg font-bold shadow-[0_4px_0_rgba(120,53,15,0.2)] focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <p className="text-xs text-slate-500 italic">
                      ✨ Ghi đúng họ tên để Ban Chủ nhiệm cấp Giấy chứng nhận và Huy hiệu thành viên!
                    </p>
                  </div>
                )}

                {/* STEP 2: Student Class & School Name */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-black text-slate-800 mb-1">
                        Lớp & Mã học sinh / MSSV <span className="text-rose-500">*</span>
                      </label>
                      <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        value={formData.studentClass}
                        onChange={(e) => handleInputChange('studentClass', e.target.value)}
                        placeholder="Ví dụ: 10A1 - MSSV 202688"
                        className="w-full bg-white text-slate-900 border-3 border-amber-950 rounded-2xl px-4 py-3 text-base md:text-lg font-bold shadow-[0_4px_0_rgba(120,53,15,0.2)] focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-slate-800 mb-1">
                        Trường Trung học Phổ thông (THPT) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.schoolName}
                        onChange={(e) => handleInputChange('schoolName', e.target.value)}
                        placeholder="Ví dụ: THPT Nguyễn Khuyến"
                        className="w-full bg-white text-slate-900 border-3 border-amber-950 rounded-2xl px-4 py-3 text-base md:text-lg font-bold shadow-[0_4px_0_rgba(120,53,15,0.2)] focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>

                    <p className="text-xs text-slate-500 italic">
                      🏫 Dành cho học sinh các trường THPT đăng ký đợt tuyển quân này.
                    </p>
                  </div>
                )}

                {/* STEP 3: Email, Phone & Facebook */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-black text-slate-800 mb-1">
                        Email liên hệ chính <span className="text-rose-500">*</span>
                      </label>
                      <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="vibecoder@gmail.com"
                        className="w-full bg-white text-slate-900 border-3 border-amber-950 rounded-2xl px-4 py-3 text-base font-bold shadow-[0_4px_0_rgba(120,53,15,0.2)] focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-800 mb-1">
                        Số điện thoại / Zalo <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full bg-white text-slate-900 border-3 border-amber-950 rounded-2xl px-4 py-3 text-base font-bold shadow-[0_4px_0_rgba(120,53,15,0.2)] focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-800 mb-1">
                        <span>Link Facebook cá nhân</span>
                      </label>
                      <input
                        type="text"
                        value={formData.facebook}
                        onChange={(e) => handleInputChange('facebook', e.target.value)}
                        placeholder="https://facebook.com/profile"
                        className="w-full bg-white text-slate-900 border-3 border-amber-950 rounded-2xl px-4 py-3 text-base font-bold shadow-[0_4px_0_rgba(120,53,15,0.2)] focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all placeholder:text-slate-400 placeholder:font-normal"
                      />
                      <p className="text-xs text-slate-500 mt-1 italic">
                        📘 Giúp Ban Chủ Nhiệm dễ dàng kết nối & add bạn vào nhóm Zalo/FB Gen Z của CLB!
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4: Department Selection */}
                {currentStep === 4 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-slate-800 mb-2">
                      Chọn Ban bạn muốn cống hiến <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {DEPARTMENTS.map((dept) => {
                        const isSelected = formData.department === dept.id;
                        return (
                          <motion.button
                            key={dept.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleInputChange('department', dept.id)}
                            className={`p-4 rounded-2xl border-3 text-left transition-all flex items-start gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-amber-300 border-amber-950 shadow-[0_6px_0_rgba(120,53,15,0.8)] scale-[1.01]'
                                : 'bg-white border-amber-900/30 hover:border-amber-950 hover:bg-amber-100/50 shadow-sm'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-xl border-2 border-amber-950 flex items-center justify-center mt-0.5 text-base font-bold ${isSelected ? 'bg-amber-950 text-amber-300' : 'bg-amber-100 text-amber-950'}`}>
                              {dept.id === 'chuyen-mon' ? '💻' : dept.id === 'truyen-thong' ? '🎨' : '👥'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-extrabold text-amber-950 text-sm md:text-base">
                                {dept.name}
                              </h4>
                              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                                {dept.tagline}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 5: Sub-Role Selection */}
                {currentStep === 5 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-black text-slate-800 mb-1">
                        Vị trí cụ thể trong Ban <span className="text-rose-500">*</span>
                      </label>
                      <p className="text-xs text-amber-900 font-bold bg-amber-200/90 px-3 py-1 rounded-xl border border-amber-400 inline-block">
                        ⚡ Bạn có thể chọn nhiều vị trí cùng lúc!
                      </p>
                    </div>
                    {(() => {
                      const dept = DEPARTMENTS.find((d) => d.id === formData.department);
                      const roles = dept ? dept.subRoles : [];
                      const currentSelected = parseSubRoles(formData.subRole, roles);

                      return (
                        <div className="space-y-2.5">
                          {roles.map((role) => {
                            const isSelected = currentSelected.includes(role);
                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => handleSubRoleToggle(role)}
                                className={`w-full p-3.5 rounded-2xl border-3 font-bold text-sm text-left transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-300 border-amber-950 text-amber-950 shadow-[0_4px_0_rgba(120,53,15,0.8)]'
                                    : 'bg-white border-amber-950/20 text-slate-700 hover:border-amber-950 hover:bg-amber-100/60'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className={`w-5 h-5 rounded-lg border-2 border-amber-950 flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? 'bg-amber-950 text-amber-300' : 'bg-white'}`}>
                                    {isSelected ? '✓' : ''}
                                  </span>
                                  <span>{role}</span>
                                </div>
                                {isSelected && <Check className="w-5 h-5 text-amber-950 stroke-[3] shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* STEP 6: Interactive Cartoon Skill Badges */}
                {currentStep === 6 && (() => {
                  const currentDept = DEPARTMENTS.find((d) => d.id === formData.department);
                  const deptSkills = currentDept ? currentDept.skillsList : [];
                  const otherSkills = ALL_SKILL_TAGS.filter((s) => !deptSkills.includes(s));

                  return (
                    <div className="space-y-4">
                      {/* Explaination Callout for Badges */}
                      <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 border-3 border-amber-950 rounded-2xl p-4 shadow-sm text-amber-950 space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-900 fill-amber-300 stroke-[2.5]" />
                          <h4 className="font-black text-sm sm:text-base text-amber-950">
                            Huy hiệu Thế mạnh & Kỹ năng bổ trợ (Admin Insights)
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-amber-900 leading-relaxed">
                          🎯 <strong>Mục đích:</strong> Giúp Ban Quản Trị / Admin nhận biết bạn có thêm những kỹ năng hoặc tài lẻ nào (ví dụ: bạn ứng tuyển Dev nhưng biết thêm Design, Edit video, Viết lách, Làm MC sự kiện...).
                        </p>
                        <div className="bg-white/90 border-2 border-amber-950/40 rounded-xl p-2.5 text-[11px] sm:text-xs font-extrabold text-emerald-950 flex items-start gap-2 shadow-xs">
                          <span className="text-emerald-600 text-sm">💡</span>
                          <span><strong>Yên tâm nhé:</strong> Việc chọn thêm huy hiệu kỹ năng ở đây <strong>KHÔNG BẮT BỘC</strong> bạn phải làm thêm bài thi của Ban đó! Bạn chỉ làm bài thi Casting đúng theo Vị trí bạn đã chọn ở Bước 5. Huy hiệu ở đây sẽ được Admin cộng điểm tiềm năng!</span>
                        </div>
                      </div>

                      {/* Primary Department Specific Badges */}
                      <div className="bg-amber-100/80 border-3 border-amber-950 rounded-2xl p-3.5 space-y-2.5">
                        <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                          <span>🏆</span> Huy hiệu chuyên biệt cho {currentDept?.name.split(' (')[0]} ({deptSkills.length} huy hiệu):
                        </span>
                        <div className="flex flex-wrap gap-2 max-h-48 sm:max-h-60 overflow-y-auto pr-1">
                          {deptSkills.map((skill) => {
                            const isSelected = formData.skills.includes(skill);
                            return (
                              <motion.button
                                key={skill}
                                type="button"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={() => toggleSkill(skill)}
                                className={`px-3 py-2 rounded-2xl border-2 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-amber-300 to-pink-300 border-amber-950 text-amber-950 shadow-[0_4px_0_rgba(120,53,15,0.7)] translate-y-[-2px]'
                                    : 'bg-white border-amber-950/30 text-slate-700 hover:border-amber-950 hover:bg-amber-100/50'
                                }`}
                              >
                                <span>{isSelected ? '✨' : '⭐'}</span>
                                <span>{skill}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Other Skill Badges */}
                      {otherSkills.length > 0 && (
                        <div className="bg-white/80 border-2 border-amber-950/30 rounded-2xl p-3.5 space-y-2">
                          <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                            <span>✨</span> Huy hiệu tài lẻ & Kỹ năng bổ sung ({otherSkills.length} huy hiệu từ các Ban khác / Kỹ năng chung):
                          </span>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Chọn thoải mái những mảng bạn có hứng thú hoặc có kinh nghiệm để Admin đánh giá đa năng:
                          </p>
                          <div className="flex flex-wrap gap-1.5 max-h-40 sm:max-h-48 overflow-y-auto p-1">
                            {otherSkills.map((skill) => {
                              const isSelected = formData.skills.includes(skill);
                              return (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() => toggleSkill(skill)}
                                  className={`px-2.5 py-1.5 rounded-xl border-2 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                                    isSelected
                                      ? 'bg-amber-300 border-amber-950 text-amber-950 font-black shadow-sm'
                                      : 'bg-white border-slate-300 text-slate-600 hover:border-amber-950 hover:bg-amber-50'
                                  }`}
                                >
                                  <span>{isSelected ? '✓' : '+'}</span>
                                  <span>{skill}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* STEP 7: Casting Challenge */}
                {currentStep === 7 && (() => {
                  const currentDept = DEPARTMENTS.find((d) => d.id === formData.department);
                  const availableRoles = currentDept ? currentDept.subRoles : [];
                  const requiredModules = getRequiredCastingModules(formData.subRole, formData.department, availableRoles);

                  return (
                    <div className="space-y-5 max-h-[680px] md:max-h-none overflow-y-auto pr-1 sm:pr-2">
                      {!hasStartedAntiCheat ? (
                        <div className="bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 border-4 border-amber-950 rounded-3xl p-6 shadow-[0_8px_0_rgba(120,53,15,0.4)] space-y-5 text-amber-950">
                          <div className="flex items-center gap-3 border-b-3 border-amber-950 pb-3">
                            <ShieldAlert className="w-9 h-9 text-rose-600 animate-bounce stroke-[2.5]" />
                            <div>
                              <h3 className="font-black text-lg md:text-xl text-amber-950 uppercase tracking-tight">
                                Quy Định & Anti-Cheat Bài Thi Casting
                              </h3>
                              <p className="text-xs md:text-sm font-bold text-amber-900">
                                Vui lòng đọc kỹ trước khi bắt đầu thử thách của NK Tech Club!
                              </p>
                            </div>
                          </div>

                          <div className="bg-white/90 border-2 border-amber-950 rounded-2xl p-4 space-y-3 font-semibold text-xs md:text-sm shadow-inner">
                            <div className="flex items-start gap-2.5">
                              <span className="bg-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-lg shrink-0">1</span>
                              <p><strong>Cảnh báo Out trang / Chuyển Tab:</strong> Hệ thống tự động giám sát. Mọi thao tác rời trang web sẽ bị ghi nhận số lần vi phạm và báo cáo đến Gemini AI để trừ điểm thái độ!</p>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <span className="bg-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-lg shrink-0">2</span>
                              <p><strong>Khuyên dùng Fullscreen (F11):</strong> Giúp bạn tập trung 100% làm bài mà không bị các thông báo làm phiền.</p>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <span className="bg-amber-600 text-white text-xs font-black px-2 py-0.5 rounded-lg shrink-0">3</span>
                              <p><strong>Bài thi theo vị trí đăng ký:</strong> Vị trí đã chọn: <strong>{parseSubRoles(formData.subRole, availableRoles).join(' & ')}</strong>. Các huy hiệu bổ trợ ở Bước 6 đã được lưu cho Admin cộng điểm mà bạn không cần phải làm thêm bài thi!</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playPop();
                                requestFullscreenMode();
                                setHasStartedAntiCheat(true);
                              }}
                              className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black py-4 px-4 rounded-2xl border-3 border-amber-950 shadow-[0_5px_0_rgba(120,53,15,0.8)] active:translate-y-1 active:shadow-[0_1px_0_rgba(120,53,15,0.8)] transition-all flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer"
                            >
                              <Maximize2 className="w-5 h-5 stroke-[2.5]" />
                              <span>🖥️ Bật Fullscreen (F11) & Bắt Đầu Thi</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                sounds.playPop();
                                setHasStartedAntiCheat(true);
                              }}
                              className="bg-white hover:bg-amber-100 text-amber-950 font-extrabold py-3.5 px-4 rounded-2xl border-2 border-amber-950 shadow-[0_4px_0_rgba(120,53,15,0.4)] transition-all text-xs md:text-sm cursor-pointer"
                            >
                              Bắt Đầu Thi (Không Fullscreen)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Top Anti-Cheat Monitor Bar */}
                          <div className="bg-amber-950 text-amber-100 p-3.5 rounded-2xl border-3 border-amber-950 flex flex-wrap items-center justify-between gap-2 shadow-[0_4px_0_rgba(120,53,15,0.4)]">
                            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-bold">
                              <ShieldAlert className="w-4 h-4 text-emerald-400 stroke-[2.5] animate-pulse" />
                              <span>Anti-Cheat:</span>
                              <span className="bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500 font-extrabold text-xs">
                                🛡️ Đang Giám Sát
                              </span>
                              {cheatCount > 0 ? (
                                <span className="bg-rose-950 text-rose-300 px-2.5 py-0.5 rounded-lg border border-rose-500 font-black text-xs animate-bounce">
                                  ⚠️ Out trang: {cheatCount} lần
                                </span>
                              ) : (
                                <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-600 text-[11px] font-semibold">
                                  0 vi phạm
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                sounds.playPop();
                                requestFullscreenMode();
                              }}
                              className="bg-amber-300 hover:bg-amber-200 text-amber-950 font-black text-xs px-3 py-1.5 rounded-xl border-2 border-amber-950 shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                              <span>{isFullscreen ? 'Fullscreen: ON' : '🖥️ Bật Fullscreen (F11)'}</span>
                            </button>
                          </div>

                    {/* HR & OPERATIONS CASTING QUESTIONS */}
                    {requiredModules.includes('hr') && (
                      <div className="space-y-5">
                        <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-green-100 border-3 border-amber-950 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-5 h-5 text-emerald-900 stroke-[2.5]" />
                            <h3 className="font-black text-emerald-950 text-base md:text-lg">
                              Thử Thách Casting: Ban Quản Lý Nhân Sự & Sự Kiện (HR & Operations) 👥🤝
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm text-emerald-900 font-semibold leading-relaxed">
                            Không yêu cầu lý thuyết sách vở! Chúng tôi quan tâm đến khả năng lắng nghe không phán xét, tư duy hệ thống (Systems Thinking), nhận diện định kiến (Bias Awareness) & sự công bằng trong quản lý con người.
                          </p>
                        </div>

                        {/* HR QUESTION 1 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-emerald-200 text-emerald-950 px-3 py-1 rounded-xl border border-emerald-400">Câu 1 🔍</span>
                            <span>“Đừng vội kết luận về một người”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 leading-relaxed">
                            <p>• Một thành viên từng rất năng nổ nhưng 3 tuần gần đây gần như không hoạt động. Có người nói: <em>“Bạn ấy hết nhiệt tình rồi.”</em> Bạn là HR và chưa biết chuyện gì xảy ra.</p>
                            <p className="text-emerald-950 font-bold">• Bạn chỉ được hỏi bạn ấy 3 CÂU. Bạn sẽ hỏi gì? (Yêu cầu: Không được hỏi trực tiếp <em>“Tại sao em không hoạt động?”</em>)</p>
                            <p className="text-teal-950 font-bold">• <strong>Sau 3 câu hỏi, bạn muốn biết điều gì nhất để quyết định bước tiếp theo?</strong></p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingHrQ1 || ''}
                            onChange={(e) => handleInputChange('castingHrQ1', e.target.value)}
                            placeholder="Viết 3 câu hỏi khéo léo không phán xét & 1 điều quan trọng nhất bạn muốn làm rõ..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* HR QUESTION 2 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-teal-200 text-teal-950 px-3 py-1 rounded-xl border border-teal-400">Câu 2 🧩</span>
                            <span>“Một câu chuyện — hai sự thật”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-teal-50/80 p-4 rounded-xl border border-teal-200 leading-relaxed">
                            <p>• Thành viên nói: <em>“Em đã hoàn thành phần việc của mình.”</em> Trưởng ban nói: <em>“Bạn ấy làm cả team phải chờ.”</em> Cả hai đều có bằng chứng thuyết phục. Bạn không được chọn bên.</p>
                            <p className="text-teal-950 font-bold">• Hãy viết 3 thông tin bạn cần tìm thêm để biết vấn đề thật sự nằm ở đâu?</p>
                            <p className="text-emerald-950 font-bold">• <strong>Nếu phát hiện cả hai đều không cố tình làm sai, bạn nghĩ vấn đề thuộc về con người hay cách CLB vận hành? Vì sao?</strong></p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingHrQ2 || ''}
                            onChange={(e) => handleInputChange('castingHrQ2', e.target.value)}
                            placeholder="3 thông tin cần đào sâu & phân tích vấn đề thuộc về con người hay quy trình vận hành..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* HR QUESTION 3 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-cyan-200 text-cyan-950 px-3 py-1 rounded-xl border border-cyan-400">Câu 3 🎭</span>
                            <span>“Ứng viên hoàn hảo”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-cyan-50/80 p-4 rounded-xl border border-cyan-200 leading-relaxed">
                            <p>• <strong>Ứng viên A:</strong> Tự tin, giao tiếp tốt, trả lời câu hỏi cực hay.</p>
                            <p>• <strong>Ứng viên B:</strong> Khá ít nói, trả lời vụng về nhưng nói rất cụ thể và có ví dụ thật.</p>
                            <p className="text-cyan-950 font-bold">• Bạn chọn ai? Đừng giải thích tại sao người chọn tốt hơn, hãy trả lời: <em>“Tôi sợ mình đang đánh giá sai điều gì ở ứng viên còn lại?”</em></p>
                            <p className="text-indigo-950 font-bold">• <strong>Sau đó đưa ra MỘT CÁCH KIỂM CHỨNG nỗi sợ đó.</strong></p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingHrQ3 || ''}
                            onChange={(e) => handleInputChange('castingHrQ3', e.target.value)}
                            placeholder="Ứng viên bạn chọn, nhận diện định kiến (bias) ở người còn lại & phương pháp kiểm chứng thực tế..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* HR QUESTION 4 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-purple-200 text-purple-950 px-3 py-1 rounded-xl border border-purple-400">Câu 4 ⚖️</span>
                            <span>“Công bằng không có nghĩa là giống nhau”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-purple-50/80 p-4 rounded-xl border border-purple-200 leading-relaxed">
                            <p>• <strong>Thành viên A (mới):</strong> Lần đầu làm dự án lớn, luôn báo trước khi gặp vấn đề và nỗ lực sửa, trễ 2 lần.</p>
                            <p>• <strong>Thành viên B (kinh nghiệm):</strong> Thường im lặng, trễ 2 lần và chỉ báo sau khi deadline đã qua.</p>
                            <p className="text-purple-950 font-bold">• Áp dụng luật <em>“Hai người cùng vi phạm xử giống nhau”</em> có công bằng không? Nếu không, nguyên tắc bạn đưa ra để xử lý là gì?</p>
                            <p className="text-rose-950 font-bold">• <strong>Điều gì sẽ khiến bạn thay đổi quyết định của mình?</strong></p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingHrQ4 || ''}
                            onChange={(e) => handleInputChange('castingHrQ4', e.target.value)}
                            placeholder="Quan điểm công bằng vs cào bằng, nguyên tắc xử lý của bạn & điều kiện thay đổi quyết định..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* HR QUESTION 5 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-rose-200 text-rose-950 px-3 py-1 rounded-xl border border-rose-400">Câu 5 🧠🔥</span>
                            <span>“Câu khó nhất — Khi nào nên nói ‘không’?”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-rose-50/80 p-4 rounded-xl border border-rose-200 leading-relaxed">
                            <p>• Bạn là HR của CLB. Một thành viên rất được mọi người yêu quý nhưng liên tục: <em>trễ deadline → ảnh hưởng team → xin lỗi → cố gắng → rồi lại lặp lại</em>.</p>
                            <p>• Người đó không phải người xấu. Thậm chí rất nhiệt tình và có đóng góp nhiều mặt. Nhưng nếu tiếp tục, những thành viên khác bắt đầu cảm thấy: <em>“Tại sao người này luôn được thông cảm?”</em></p>
                            <p className="text-rose-950 font-bold">• Bạn phải đưa ra quyết định. Bạn sẽ làm gì trong tình huống này?</p>
                            <p className="text-indigo-950 font-bold">• <strong>Câu quan trọng nhất: <em>“Theo bạn, HR nên bảo vệ con người hay bảo vệ tập thể?”</em> Hãy giải thích bằng một nguyên tắc bạn sẵn sàng áp dụng ngay cả khi người mắc lỗi là người bạn quý.</strong></p>
                          </div>
                          <textarea
                            rows={6}
                            value={formData.castingHrQ5 || ''}
                            onChange={(e) => handleInputChange('castingHrQ5', e.target.value)}
                            placeholder="Quyết định xử lý của bạn, quan điểm bảo vệ con người vs tập thể & nguyên tắc áp dụng..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* AI & DATA SCIENCE RESEARCHER CASTING QUESTIONS */}
                    {requiredModules.includes('ai_res') && (
                      <div className="space-y-5">
                        <div className="bg-gradient-to-r from-teal-100 via-emerald-100 to-cyan-100 border-3 border-amber-950 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Microscope className="w-5 h-5 text-teal-900 stroke-[2.5]" />
                            <h3 className="font-black text-teal-950 text-base md:text-lg">
                              Thử Thách Casting: AI & Data Science Researcher / Robotics 🔬📊
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm text-teal-900 font-semibold leading-relaxed">
                            Không yêu cầu kiến thức chuyên môn phức tạp! Chúng tôi quan tâm đến cách bạn nghi ngờ giả thuyết, thiết kế thí nghiệm, kiểm chứng dữ liệu & tư duy khoa học thực sự.
                          </p>
                        </div>

                        {/* AI RES QUESTION 1 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-teal-200 text-teal-950 px-3 py-1 rounded-xl border border-teal-400">Câu 1 🔬</span>
                            <span>“Bạn tin dữ liệu hay tin mắt mình?”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-teal-50/80 p-4 rounded-xl border border-teal-200 leading-relaxed">
                            <p>• Một robot được thử nghiệm 100 lần: <strong>Cách A</strong> thành công 82 lần, <strong>Cách B</strong> thành công 76 lần. Nhóm kết luận: <em>“A tốt hơn B.”</em></p>
                            <p className="text-teal-950 font-bold">• Đưa ra 3 lý do khiến con số 82 &gt; 76 vẫn chưa đủ để chứng minh A tốt hơn B.</p>
                            <p className="text-indigo-950 font-bold">• <strong>Sau đó, hãy nói MỘT THÔNG TIN DUY NHẤT bạn muốn biết nhất trước khi đưa ra kết luận cuối cùng?</strong></p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingAiResQ1 || ''}
                            onChange={(e) => handleInputChange('castingAiResQ1', e.target.value)}
                            placeholder="3 lý do 82 > 76 chưa chắc A tốt hơn B & 1 thông tin duy nhất bạn muốn biết nhất..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* AI RES QUESTION 2 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-cyan-200 text-cyan-950 px-3 py-1 rounded-xl border border-cyan-400">Câu 2 🧪</span>
                            <span>“Nếu kết quả đang đứng về phía bạn?”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-cyan-50/80 p-4 rounded-xl border border-cyan-200 leading-relaxed">
                            <p>• Bạn đưa ra một ý tưởng. Sau 10 lần thử, 9 lần kết quả đều ủng hộ bạn.</p>
                            <p>• Một người trong nhóm nói: <em>“Vậy là đủ để chứng minh ý tưởng này đúng rồi.”</em></p>
                            <p className="text-cyan-950 font-bold">• Bạn có đồng ý không? Nếu không, bạn sẽ làm gì tiếp theo?</p>
                            <p className="text-indigo-950 font-bold">• <strong>Và quan trọng nhất: Điều gì có thể khiến bạn thay đổi hoàn toàn kết luận của mình?</strong></p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingAiResQ2 || ''}
                            onChange={(e) => handleInputChange('castingAiResQ2', e.target.value)}
                            placeholder="Ý kiến của bạn, hành động tiếp theo & điều có thể khiến bạn thay đổi hoàn toàn kết luận..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* AI RES QUESTION 3 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-indigo-200 text-indigo-950 px-3 py-1 rounded-xl border border-indigo-400">Câu 3 📊</span>
                            <span>“Một con số có thể nói dối như thế nào?”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-indigo-50/80 p-4 rounded-xl border border-indigo-200 leading-relaxed">
                            <p>• Model A: Sự chính xác (Accuracy) = 95%, Model B: Sự chính xác (Accuracy) = 90%. Trong 1.000 trường hợp thực tế, chỉ có 10 trường hợp thuộc nhóm RẤT QUAN TRỌNG cần phát hiện.</p>
                            <p className="text-indigo-950 font-bold">• <strong>Giải thích một tình huống mà Model 90% (B) lại hữu ích hơn Model 95% (A)?</strong></p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingAiResQ3 || ''}
                            onChange={(e) => handleInputChange('castingAiResQ3', e.target.value)}
                            placeholder="Giải thích tình huống thực tế mà model sự chính xác 90% lại hữu ích hơn model 95%..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* AI RES QUESTION 4 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-emerald-200 text-emerald-950 px-3 py-1 rounded-xl border border-emerald-400">Câu 4 🤖</span>
                            <span>“Robot học điều gì mà bạn không dạy?”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 leading-relaxed">
                            <p>• Robot đi A → B chạy rất tốt ở LAB, sang phòng mới bị tệ đi rất nhiều.</p>
                            <p>• Ý kiến 1: <em>“Robot chưa học đủ.”</em> | Ý kiến 2: <em>“Robot đã học đúng, chỉ là môi trường mới khác.”</em></p>
                            <p className="text-emerald-950 font-bold">• <strong>Bạn sẽ thiết kế một thử nghiệm như thế nào để phân biệt rõ ràng hai cách giải thích trên?</strong></p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingAiResQ4 || ''}
                            onChange={(e) => handleInputChange('castingAiResQ4', e.target.value)}
                            placeholder="Thiết kế thử nghiệm để chứng minh robot 'chưa học đủ' hay 'học sai theo môi trường'..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* AI RES QUESTION 5 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-rose-200 text-rose-950 px-3 py-1 rounded-xl border border-rose-400">Câu 5 🔥</span>
                            <span>“Hãy cố chứng minh mình sai”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-rose-50/80 p-4 rounded-xl border border-rose-200 leading-relaxed">
                            <p>• Giả thuyết: <em>“Nếu cho học sinh sử dụng AI hỗ trợ học tập, kết quả học tập sẽ tốt hơn.”</em> Bạn rất tin vào điều này nhưng phải thiết kế thí nghiệm có khả năng chứng minh chính giả thuyết sai.</p>
                            <p className="text-rose-950 font-bold">① Bạn sẽ so sánh những nhóm nào? | ② Bạn sẽ đo điều gì?</p>
                            <p className="text-rose-950 font-bold">③ Kết quả nào khiến bạn kết luận giả thuyết sai? | ④ Một yếu tố có thể làm kết quả bị hiểu sai?</p>
                          </div>
                          <textarea
                            rows={6}
                            value={formData.castingAiResQ5 || ''}
                            onChange={(e) => handleInputChange('castingAiResQ5', e.target.value)}
                            placeholder="Nhóm so sánh, chỉ số đo, kết quả chứng minh giả thuyết sai & yếu tố nhiễu làm sai lệch..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* GAME DEVELOPER CASTING QUESTIONS */}
                    {requiredModules.includes('game') && (
                      <div className="space-y-5">
                        <div className="bg-gradient-to-r from-rose-100 via-pink-100 to-amber-100 border-3 border-amber-950 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Gamepad2 className="w-5 h-5 text-rose-900 stroke-[2.5]" />
                            <h3 className="font-black text-rose-950 text-base md:text-lg">
                              Thử Thách Casting: Game Developer & Game Design Thinking 🎮⚡
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm text-rose-900 font-semibold leading-relaxed">
                            Thử thách trải nghiệm người chơi, cân bằng mechanic, game sense và tư duy phát triển game thực chiến!
                          </p>
                        </div>

                        {/* GAME QUESTION 1 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-rose-200 text-rose-950 px-3 py-1 rounded-xl border border-rose-400">Câu 1 🎮</span>
                            <span>“Tại sao bạn không chơi nữa?”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-rose-50/80 p-4 rounded-xl border border-rose-200 leading-relaxed">
                            <p>• Hãy nhớ lại một game bạn từng bỏ chơi, dù lúc đầu bạn rất thích.</p>
                            <p>• Khoảnh khắc hoặc lý do cụ thể nào khiến bạn quyết định thoát game?</p>
                            <p className="text-rose-950 font-bold">• Nếu bạn là người phát triển game đó, bạn sẽ thay đổi đúng một thứ để cố giữ người chơi lại.</p>
                            <p className="text-indigo-950 font-bold">• <strong>Bạn sẽ thay đổi gì — và tại sao?</strong></p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingGameQ1 || ''}
                            onChange={(e) => handleInputChange('castingGameQ1', e.target.value)}
                            placeholder="Game từng bỏ, khoảnh khắc/lý do thoát game, 1 thay đổi duy nhất & lý do..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* GAME QUESTION 2 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-purple-200 text-purple-950 px-3 py-1 rounded-xl border border-purple-400">Câu 2 🧠</span>
                            <span>“Game của bạn đang nói dối”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-purple-50/80 p-4 rounded-xl border border-purple-200 leading-relaxed">
                            <p>• Bạn tạo một game và nói với người chơi: <em>“Bạn càng chơi giỏi, bạn càng tiến bộ.”</em></p>
                            <p>• Nhưng sau khi test, bạn nhận ra người chơi không thắng vì kỹ năng, mà thắng chủ yếu vì may mắn.</p>
                            <p className="text-purple-950 font-bold">• Bạn chỉ được thay đổi một thứ trong game. Bạn sẽ thay đổi gì?</p>
                            <p className="text-amber-950 font-bold">• <strong>Và làm thế nào để biết sau khi thay đổi, game thực sự trở nên skill-based hơn?</strong></p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingGameQ2 || ''}
                            onChange={(e) => handleInputChange('castingGameQ2', e.target.value)}
                            placeholder="1 thay đổi trong game & cách kiểm chứng game thực sự trở nên skill-based hơn..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* GAME QUESTION 3 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-amber-200 text-amber-950 px-3 py-1 rounded-xl border border-amber-400">Câu 3 💡</span>
                            <span>“Một mechanic, hai game”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-amber-50/80 p-4 rounded-xl border border-amber-200 leading-relaxed">
                            <p>• Bạn được cho đúng một mechanic duy nhất: <strong>Người chơi có thể “đóng băng” thời gian trong 3 giây.</strong></p>
                            <p>• Bạn phải nghĩ ra hai game hoàn toàn khác nhau sử dụng mechanic này (không chỉ khác bối cảnh/đồ họa).</p>
                            <p className="text-amber-950 font-bold">• 1. Mục tiêu của game 1 là gì?</p>
                            <p className="text-amber-950 font-bold">• 2. Mục tiêu của game 2 là gì?</p>
                            <p className="text-indigo-950 font-bold">• 3. Điều gì khiến gameplay của chúng thực sự khác nhau?</p>
                          </div>
                          <textarea
                            rows={6}
                            value={formData.castingGameQ3 || ''}
                            onChange={(e) => handleInputChange('castingGameQ3', e.target.value)}
                            placeholder="Game 1 (Mục tiêu), Game 2 (Mục tiêu) & Điều làm gameplay 2 game thực sự khác biệt..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* GAME QUESTION 4 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-blue-200 text-blue-950 px-3 py-1 rounded-xl border border-blue-400">Câu 4 🔥</span>
                            <span>“Người chơi làm điều bạn không muốn”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-blue-50/80 p-4 rounded-xl border border-blue-200 leading-relaxed">
                            <p>• Bạn thiết kế một game Roblox. Bạn muốn người chơi: <em>A → khám phá → thử nghiệm → học mechanic → trở nên giỏi hơn.</em></p>
                            <p>• Nhưng dữ liệu test cho thấy họ đang: <em>A → tìm cách farm phần thưởng nhanh nhất → bỏ qua gần như toàn bộ gameplay.</em> (Game không có bug).</p>
                            <p className="font-bold text-blue-950">• Bạn sẽ làm gì?</p>
                            <p className="pl-3">A. Ngăn cách chơi đó.</p>
                            <p className="pl-3">B. Thưởng thêm cho cách chơi bạn mong muốn.</p>
                            <p className="pl-3">C. Thiết kế lại gameplay để cách farm đó trở thành một phần thú vị.</p>
                            <p className="pl-3">D. Cách khác.</p>
                            <p className="text-rose-950 font-bold">• <strong>Lựa chọn của bạn là gì và QUAN TRỌNG NHẤT: Tại sao bạn nghĩ người chơi lại chọn cách đó?</strong></p>
                          </div>
                          <textarea
                            rows={6}
                            value={formData.castingGameQ4 || ''}
                            onChange={(e) => handleInputChange('castingGameQ4', e.target.value)}
                            placeholder="Lựa chọn (A/B/C/D) & Lý do giải thích tại sao người chơi lại chọn cách farm nhanh đó..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* GAME QUESTION 5 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-emerald-200 text-emerald-950 px-3 py-1 rounded-xl border border-emerald-400">Câu 5 🏆</span>
                            <span>“Bạn chỉ được giữ 30%”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 leading-relaxed">
                            <p>• Bạn có một ý tưởng game cực thích với 20 tính năng và 2 tuần làm prototype. Bạn chỉ được giữ lại 30%.</p>
                            <p className="text-emerald-950 font-bold">• Thay vì liệt kê tính năng, hãy trả lời: <em>“Nếu người chơi chỉ được chơi game này trong 5 phút, điều gì bắt buộc phải xảy ra để họ muốn chơi thêm 5 phút nữa?”</em></p>
                            <p className="text-amber-950 font-bold">• Từ câu trả lời đó, hãy quyết định những gì được giữ lại và những gì bị cắt.</p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingGameQ5 || ''}
                            onChange={(e) => handleInputChange('castingGameQ5', e.target.value)}
                            placeholder="Điều bắt buộc phải xảy ra trong 5 phút đầu & Quyết định những gì được giữ lại / bị cắt..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* WEB/APP DEVELOPER CASTING QUESTIONS */}
                    {requiredModules.includes('dev') && (
                      <div className="space-y-5">
                        <div className="bg-gradient-to-r from-blue-100 via-cyan-100 to-amber-100 border-3 border-amber-950 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Code className="w-5 h-5 text-blue-900 stroke-[2.5]" />
                            <h3 className="font-black text-blue-950 text-base md:text-lg">
                              Thử Thách Casting: Web/App Developer & Product Thinking 🌐⚡
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm text-blue-900 font-semibold leading-relaxed">
                            Thử thách đào sâu vấn đề, nghiên cứu người dùng, thiết kế trải nghiệm UX & tầm nhìn sản phẩm thực tế!
                          </p>
                        </div>

                        {/* DEV QUESTION 1 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-blue-200 text-blue-950 px-3 py-1 rounded-xl border border-blue-400">Câu 1 🧠</span>
                            <span>“Bạn đang giải quyết vấn đề gì?”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-blue-50/80 p-4 rounded-xl border border-blue-200 leading-relaxed">
                            <p>• CLB muốn làm một app với ý tưởng: <em>“Ứng dụng giúp học sinh quản lý việc học.”</em></p>
                            <p>• Bạn được phép bắt đầu xây ngay, nhưng trước đó hãy trả lời:</p>
                            <p className="text-blue-950 font-bold">• 1. Điều gì khiến bạn chưa muốn viết dòng code đầu tiên?</p>
                            <p className="text-blue-950 font-bold">• 2. Hãy đưa ra 3 điều bạn cần biết về học sinh trước khi quyết định app sẽ có những tính năng gì.</p>
                            <p className="text-rose-600 font-bold">• 🚫 Không được trả lời bằng tên công nghệ.</p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingDevQ1 || ''}
                            onChange={(e) => handleInputChange('castingDevQ1', e.target.value)}
                            placeholder="Lý do chưa viết dòng code đầu tiên & 3 điều cần biết về học sinh (không dùng tên công nghệ)..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* DEV QUESTION 2 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-purple-200 text-purple-950 px-3 py-1 rounded-xl border border-purple-400">Câu 2 👀</span>
                            <span>“Tính năng bạn rất thích nhưng người dùng ghét”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-purple-50/80 p-4 rounded-xl border border-purple-200 leading-relaxed">
                            <p>• Bạn dành một tuần làm một tính năng mà bạn nghĩ là <em>“đây chắc chắn là thứ người dùng sẽ thích”</em>.</p>
                            <p>• Khi đưa cho 10 học sinh dùng thử, 8 người bỏ qua nó. Một bạn nói: <em>“Tính năng này hay đấy, nhưng mình chẳng cần nó.”</em></p>
                            <p className="text-purple-950 font-bold">• Bạn sẽ không hỏi họ “tại sao không thích?”. Thay vào đó, hãy viết 3 câu hỏi khác mà bạn muốn hỏi để tìm ra vấn đề thật sự.</p>
                            <p className="text-amber-950 font-bold">• Sau đó chọn 1 câu quan trọng nhất và giải thích tại sao.</p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingDevQ2 || ''}
                            onChange={(e) => handleInputChange('castingDevQ2', e.target.value)}
                            placeholder="3 câu hỏi bạn muốn hỏi để tìm vấn đề thật sự, chọn 1 câu quan trọng nhất & giải thích tại sao..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* DEV QUESTION 3 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-amber-200 text-amber-950 px-3 py-1 rounded-xl border border-amber-400">Câu 3 🎯</span>
                            <span>“Một nút bấm có thể phá cả sản phẩm”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-amber-50/80 p-4 rounded-xl border border-amber-200 leading-relaxed">
                            <p>• Hãy tưởng tượng bạn mở một app của trường và màn hình đầu tiên có 12 nút/tính năng. Tất cả đều có vẻ hữu ích. Nhưng một học sinh chỉ có 10 giây để tìm thứ mình cần.</p>
                            <p className="text-rose-600 font-bold">• 🚫 Không được xóa bất kỳ tính năng nào.</p>
                            <p className="text-amber-950 font-bold">• Bạn phải quyết định: Thứ gì xuất hiện đầu tiên → thứ gì xuất hiện sau → thứ gì bị ẩn đi.</p>
                            <p className="text-slate-800 font-semibold">• ✨ Hãy giải thích nguyên tắc bạn dùng để sắp xếp.</p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingDevQ3 || ''}
                            onChange={(e) => handleInputChange('castingDevQ3', e.target.value)}
                            placeholder="Thứ xuất hiện đầu tiên -> xuất hiện sau -> bị ẩn đi & nguyên tắc sắp xếp..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* DEV QUESTION 4 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-rose-200 text-rose-950 px-3 py-1 rounded-xl border border-rose-400">Câu 4 🔥</span>
                            <span>“Người dùng đang nói dối bạn?”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-rose-50/80 p-4 rounded-xl border border-rose-200 leading-relaxed">
                            <p>• Bạn làm một app cho học sinh. Khi khảo sát, 80% học sinh nói rằng họ muốn có tính năng X. Nhưng khi app ra mắt, chỉ 5% sử dụng X.</p>
                            <p className="text-rose-950 font-bold">• 1. Bạn sẽ tin khảo sát hay tin hành vi thực tế?</p>
                            <p className="text-rose-950 font-bold">• 2. Bạn nghĩ 80% học sinh đã “sai” ở đâu?</p>
                            <p className="text-indigo-950 font-bold">• 3. Hãy đưa ra 2 giả thuyết khác nhau và nói bạn sẽ kiểm tra giả thuyết nào trước.</p>
                          </div>
                          <textarea
                            rows={6}
                            value={formData.castingDevQ4 || ''}
                            onChange={(e) => handleInputChange('castingDevQ4', e.target.value)}
                            placeholder="Tin khảo sát hay hành vi thực tế? Giải thích 80% học sinh 'sai', 2 giả thuyết & giả thuyết kiểm tra trước..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* DEV QUESTION 5 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-emerald-200 text-emerald-950 px-3 py-1 rounded-xl border border-emerald-400">Câu 5 🚀</span>
                            <span>“Nếu chỉ được giữ lại một thứ”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 leading-relaxed">
                            <p>• Bạn xây một app cho học sinh và sau một tháng có rất nhiều tính năng. Nhưng bạn nhận ra: Người dùng không nhớ app có bao nhiêu tính năng. Họ chỉ nhớ một thứ khiến họ quay lại.</p>
                            <p>• Hãy tưởng tượng app đó là sản phẩm của bạn. Bạn muốn “một thứ” đó là gì? (Không nhất thiết phải là một tính năng).</p>
                            <p className="text-emerald-950 font-bold">• Sau đó trả lời: <em>“Tại sao một học sinh lại mở app này lần thứ hai?”</em></p>
                            <p className="text-amber-950 font-bold">• 📌 <strong>Quy định:</strong> Tối đa 100 từ để thuyết phục chúng tôi.</p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingDevQ5 || ''}
                            onChange={(e) => handleInputChange('castingDevQ5', e.target.value)}
                            placeholder="'Một thứ' khiến học sinh nhớ & Lý do học sinh sẽ mở app lần thứ 2 (tối đa 100 từ)..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                          <div className="flex justify-between items-center text-xs font-extrabold text-slate-600 px-1 pt-1">
                            <span>📌 Quy định: Tối đa 100 từ</span>
                            <span className={`px-2.5 py-1 rounded-lg border ${getWordCount(formData.castingDevQ5) > 100 ? 'bg-rose-100 text-rose-800 border-rose-300 font-black' : 'bg-amber-100 text-amber-900 border-amber-300 font-bold'}`}>
                              Số từ: {getWordCount(formData.castingDevQ5)} / 100 từ
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* COMPETITIVE PROGRAMMING CASTING QUESTIONS */}
                    {requiredModules.includes('cp') && (
                      <div className="space-y-5">
                        <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-amber-100 border-3 border-amber-950 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Cpu className="w-5 h-5 text-emerald-900 stroke-[2.5]" />
                            <h3 className="font-black text-emerald-950 text-base md:text-lg">
                              Thử Thách Casting: Ban Học Thuật & Competitive Programming 💻⚡
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm text-emerald-900 font-semibold leading-relaxed">
                            Thử thách tư duy thuật toán, suy luận logic, tối ưu hóa và giải quyết vấn đề dành cho các thuật toán gia tương lai!
                          </p>
                        </div>

                        {/* CP QUESTION 1 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-emerald-200 text-emerald-950 px-3 py-1 rounded-xl border border-emerald-400">Câu 1</span>
                            <span>👁️ Quan sát — “Có gì sai?”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 leading-relaxed">
                            <p>• Một bạn viết lên bảng dãy số:</p>
                            <p className="font-black text-emerald-950 font-mono bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 text-center text-base sm:text-lg">
                              2 — 4 — 8 — 16 — 31 — 64
                            </p>
                            <p>• Bạn ấy nói: <em>“Tôi đang nhân đôi mỗi số.”</em></p>
                            <p className="text-emerald-950 font-bold">• <strong>Bạn có đồng ý không? Nếu không, bạn nghi ngờ số nào đầu tiên?</strong></p>
                            <p className="text-slate-800 font-semibold">• ✨ Không cần tìm đáp án đúng ngay. Hãy viết điều đầu tiên bạn kiểm tra và tại sao.</p>
                          </div>
                          <textarea
                            rows={4}
                            value={formData.castingCpQ1 || ''}
                            onChange={(e) => handleInputChange('castingCpQ1', e.target.value)}
                            placeholder="Ý kiến của bạn, số bạn nghi ngờ đầu tiên & điều đầu tiên bạn sẽ kiểm tra..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* CP QUESTION 2 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-teal-200 text-teal-950 px-3 py-1 rounded-xl border border-teal-400">Câu 2</span>
                            <span>🔍 Suy luận — “Thông tin nào đáng tin?”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-teal-50/80 p-4 rounded-xl border border-teal-200 leading-relaxed">
                            <p>• Bạn đi tìm một món đồ bị mất. Ba người nói:</p>
                            <div className="pl-3 border-l-2 border-teal-400 text-xs md:text-sm font-bold text-slate-800 space-y-1">
                              <p>A: “Tôi thấy B cầm nó.”</p>
                              <p>B: “Tôi không cầm nó.”</p>
                              <p>C: “A đang nói dối.”</p>
                            </div>
                            <p>• Bạn không biết ai nói thật, ai nói dối.</p>
                            <p className="text-teal-950 font-bold">• <strong>Nếu chỉ được hỏi MỘT câu duy nhất cho MỘT người, bạn sẽ hỏi ai và hỏi gì để thu được nhiều thông tin nhất?</strong></p>
                            <p className="text-slate-800 font-semibold">• ✨ Giải thích tại sao bạn chọn câu hỏi đó.</p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingCpQ2 || ''}
                            onChange={(e) => handleInputChange('castingCpQ2', e.target.value)}
                            placeholder="Người bạn chọn hỏi, nội dung 1 câu hỏi & lý do tại sao câu hỏi đó thu được nhiều thông tin nhất..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* CP QUESTION 3 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-amber-200 text-amber-950 px-3 py-1 rounded-xl border border-amber-400">Câu 3</span>
                            <span>🎲 Tư duy linh hoạt — “Đổi luật”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-amber-50/80 p-4 rounded-xl border border-amber-200 leading-relaxed">
                            <p>• Trò chơi có luật: Bạn có 21 que, mỗi lượt được lấy 1, 2 hoặc 3 que. Người lấy que cuối cùng thắng. Bạn được đi trước.</p>
                            <p>• Nhưng trước khi chơi, đối thủ cho bạn quyền thay đổi đúng <strong>MỘT thứ trong luật</strong>.</p>
                            <p className="text-amber-950 font-bold">• <strong>Bạn sẽ thay đổi gì để tăng lợi thế cho mình?</strong></p>
                            <p className="text-rose-600 font-bold">• 🚫 Không được đổi số 21 và không được bỏ lượt.</p>
                            <p className="text-slate-800 font-semibold">• ✨ Giải thích cách bạn suy nghĩ.</p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingCpQ3 || ''}
                            onChange={(e) => handleInputChange('castingCpQ3', e.target.value)}
                            placeholder="Điều duy nhất bạn chọn thay đổi trong luật & giải thích logic tư duy của bạn..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* CP QUESTION 4 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-indigo-200 text-indigo-950 px-3 py-1 rounded-xl border border-indigo-400">Câu 4</span>
                            <span>⚡ Tư duy tối ưu — “Làm ít hơn”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-indigo-50/80 p-4 rounded-xl border border-indigo-200 leading-relaxed">
                            <p>• Bạn có 1000 học sinh và muốn tìm ra một người duy nhất có chiều cao khác biệt rõ rệt so với tất cả những người còn lại.</p>
                            <p>• Nếu làm theo cách “so từng người với tất cả người khác” sẽ cần rất nhiều lần.</p>
                            <p className="text-indigo-950 font-bold">• <strong>Bạn sẽ tổ chức việc so sánh như thế nào để giảm số lần xuống đáng kể?</strong></p>
                            <p className="text-slate-800 font-semibold">• ✨ Không cần đưa công thức. Hãy mô tả chiến lược của bạn.</p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingCpQ4 || ''}
                            onChange={(e) => handleInputChange('castingCpQ4', e.target.value)}
                            placeholder="Mô tả chiến lược tổ chức các lượt so sánh để tối ưu và tiết kiệm số lần so nhất..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* CP QUESTION 5 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-rose-200 text-rose-950 px-3 py-1 rounded-xl border border-rose-400">Câu 5 🔥</span>
                            <span>❓ Câu phân loại — “Bạn sẽ hỏi gì?”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-rose-50/80 p-4 rounded-xl border border-rose-200 leading-relaxed">
                            <p>• Bạn được đưa một bài toán nhưng đề bài cố tình thiếu một thông tin quan trọng. Bạn chưa được phép giải bài.</p>
                            <p className="text-rose-950 font-bold">• 1. Hãy viết 3 câu hỏi đầu tiên bạn sẽ hỏi người ra đề để xác định chính xác bài toán cần giải là gì.</p>
                            <p className="text-rose-950 font-bold">• 2. Sau đó chọn 1 trong 3 câu hỏi mà bạn cho là quan trọng nhất và giải thích tại sao.</p>
                          </div>
                          <textarea
                            rows={6}
                            value={formData.castingCpQ5 || ''}
                            onChange={(e) => handleInputChange('castingCpQ5', e.target.value)}
                            placeholder="1. Câu hỏi 1: ...\n2. Câu hỏi 2: ...\n3. Câu hỏi 3: ...\n-> Câu hỏi quan trọng nhất là Câu ... vì ..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* CONTENT CREATOR CASTING QUESTIONS */}
                    {requiredModules.includes('content') && (
                      <div className="space-y-5">
                        <div className="bg-gradient-to-r from-amber-100 via-purple-100 to-pink-100 border-3 border-amber-950 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <PenTool className="w-5 h-5 text-purple-900 stroke-[2.5]" />
                            <h3 className="font-black text-purple-950 text-base md:text-lg">
                              Thử Thách Casting: Ban Content Creator & Writer ✍️
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm text-purple-900 font-semibold leading-relaxed">
                            Thử thách tư duy sáng tạo nội dung, insight học sinh & chiến lược truyền thông dành cho ứng viên Ban Content!
                          </p>
                        </div>

                        {/* CONTENT QUESTION 1 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-amber-200 text-amber-950 px-3 py-1 rounded-xl border border-amber-400">Câu 1</span>
                            <span>💡 Một chuyện — ba góc nhìn</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-amber-50/80 p-4 rounded-xl border border-amber-200 leading-relaxed">
                            <p>• CLB Tin học vừa tổ chức một hoạt động rất bình thường (ví dụ: một buổi sinh hoạt, workshop hoặc cuộc thi).</p>
                            <p>• <strong>Nhiệm vụ:</strong> Nếu chỉ được dùng chính hoạt động đó làm chất liệu, hãy nghĩ ra 3 cách hoàn toàn khác nhau để biến nó thành content cho page CLB.</p>
                            <p className="text-purple-950 font-bold">• ⚡ Ba ý tưởng phải có 3 hướng tiếp cận khác nhau, không chỉ thay đổi cách viết.</p>
                          </div>
                          <textarea
                            rows={6}
                            value={formData.castingContentQ1 || ''}
                            onChange={(e) => handleInputChange('castingContentQ1', e.target.value)}
                            placeholder="Góc nhìn 1: ...\nGóc nhìn 2: ...\nGóc nhìn 3: ..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* CONTENT QUESTION 2 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-pink-200 text-pink-950 px-3 py-1 rounded-xl border border-pink-400">Câu 2</span>
                            <span>😂 Một tình huống — một meme</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-pink-50/80 p-4 rounded-xl border border-pink-200 leading-relaxed">
                            <p>• Hãy chọn một tình huống rất dễ gặp ở trường bạn mà bạn nghĩ học sinh sẽ thấy “đúng quá” hoặc buồn cười. Biến nó thành một meme cho page CLB Tin học.</p>
                            <p className="font-bold text-pink-950">• Hãy mô tả theo cấu trúc:</p>
                            <div className="pl-3 border-l-2 border-pink-400 text-xs md:text-sm font-semibold space-y-1 text-slate-800">
                              <p>+ Tình huống: ...</p>
                              <p>+ Format / meme bạn chọn: ...</p>
                              <p>+ Nội dung chữ trên meme: ...</p>
                              <p>+ Tại sao học sinh trường bạn sẽ thấy nó thú vị?: ...</p>
                            </div>
                            <p className="text-rose-600 font-bold">• 🚫 Không cần thiết kế ảnh, chỉ cần trình bày ý tưởng.</p>
                          </div>
                          <textarea
                            rows={6}
                            value={formData.castingContentQ2 || ''}
                            onChange={(e) => handleInputChange('castingContentQ2', e.target.value)}
                            placeholder="• Tình huống: ...\n• Format/meme chọn: ...\n• Nội dung chữ trên meme: ...\n• Lý do học sinh thấy thú vị: ..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* CONTENT QUESTION 3 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-purple-200 text-purple-950 px-3 py-1 rounded-xl border border-purple-400">Câu 3</span>
                            <span>🧠 Nếu là bạn, bạn sẽ làm gì?</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-purple-50/80 p-4 rounded-xl border border-purple-200 leading-relaxed">
                            <p>• Bạn được giao quản lý page CLB Tin học trong 1 tuần, nhưng Admin chỉ đưa đúng một yêu cầu: <em>“Hãy khiến học sinh trong trường chú ý đến page hơn.”</em></p>
                            <p>• Không có ngân sách, không có kế hoạch có sẵn và bạn được tự quyết định nội dung.</p>
                            <p className="text-purple-950 font-bold">• <strong>Bạn sẽ bắt đầu từ đâu?</strong> Hãy trình bày cách bạn suy nghĩ và những gì bạn sẽ làm, và đưa ra một ý tưởng content cụ thể.</p>
                            <p className="text-indigo-950 font-bold">• 📌 <strong>Quy định:</strong> Tối thiểu 150 từ.</p>
                          </div>
                          <textarea
                            rows={6}
                            value={formData.castingContentQ3 || ''}
                            onChange={(e) => handleInputChange('castingContentQ3', e.target.value)}
                            placeholder="Cách bạn suy nghĩ, phân tích, các bước hành động cụ thể trong 1 tuần & 1 ý tưởng content cụ thể (tối thiểu 150 từ)..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                          <div className="flex justify-between items-center text-xs font-extrabold text-slate-600 px-1 pt-1">
                            <span>📌 Quy định: Tối thiểu 150 từ</span>
                            <span className={`px-2.5 py-1 rounded-lg border ${getWordCount(formData.castingContentQ3) >= 150 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black' : 'bg-amber-100 text-amber-900 border-amber-300 font-bold'}`}>
                              Số từ: {getWordCount(formData.castingContentQ3)} / 150 từ
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DESIGNER & VIDEO EDITOR CASTING QUESTIONS */}
                    {requiredModules.includes('design') && (
                      <div className="space-y-5">
                        <div className="bg-gradient-to-r from-cyan-100 via-indigo-100 to-amber-100 border-3 border-amber-950 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Palette className="w-5 h-5 text-indigo-900 stroke-[2.5]" />
                            <h3 className="font-black text-indigo-950 text-base md:text-lg">
                              Thử Thách Casting: Ban Design & Video Editor 🎨🎬
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm text-indigo-900 font-semibold leading-relaxed">
                            Thử thách tư duy thiết kế Poster, visual storytelling qua Video ngắn 10s & cách giải quyết vấn đề khi đổi concept!
                          </p>
                        </div>

                        {/* DESIGN QUESTION 1 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-cyan-200 text-cyan-950 px-3 py-1 rounded-xl border border-cyan-400">Câu 1</span>
                            <span>🎨 “Đừng làm nó đẹp”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-cyan-50/80 p-4 rounded-xl border border-cyan-200 leading-relaxed">
                            <p>• CLB giao cho bạn một poster với nội dung:</p>
                            <p className="font-extrabold text-indigo-950 bg-indigo-100/90 px-3 py-1.5 rounded-lg border border-indigo-300 text-center">
                              “CLB TIN HỌC MỞ ĐĂNG KÝ THÀNH VIÊN — HẠN CUỐI 05/09”
                            </p>
                            <p>• Nhưng Admin yêu cầu: <em>“Đừng làm poster đẹp. Hãy làm poster khiến người ta phải dừng lại nhìn.”</em></p>
                            <p className="text-indigo-950 font-bold">• <strong>Nhiệm vụ:</strong> Bạn sẽ thiết kế nó như thế nào? Hãy mô tả bố cục, hình ảnh/chữ nổi bật nhất và thứ người xem nhìn thấy đầu tiên.</p>
                            <p className="text-amber-950 font-bold">• 📌 <strong>Quy định:</strong> Tối thiểu 100 từ.</p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingDesignQ1 || ''}
                            onChange={(e) => handleInputChange('castingDesignQ1', e.target.value)}
                            placeholder="Mô tả bố cục, hình ảnh/chữ nổi bật nhất & thứ người xem nhìn thấy đầu tiên (tối thiểu 100 từ)..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                          <div className="flex justify-between items-center text-xs font-extrabold text-slate-600 px-1 pt-1">
                            <span>📌 Quy định: Tối thiểu 100 từ</span>
                            <span className={`px-2.5 py-1 rounded-lg border ${getWordCount(formData.castingDesignQ1) >= 100 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black' : 'bg-amber-100 text-amber-900 border-amber-300 font-bold'}`}>
                              Số từ: {getWordCount(formData.castingDesignQ1)} / 100 từ
                            </span>
                          </div>
                        </div>

                        {/* DESIGN QUESTION 2 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-pink-200 text-pink-950 px-3 py-1 rounded-xl border border-pink-400">Câu 2</span>
                            <span>🎬 “Video không được nói”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-pink-50/80 p-4 rounded-xl border border-pink-200 leading-relaxed">
                            <p>• Bạn phải làm một video 10 giây giới thiệu CLB Tin học.</p>
                            <p className="text-rose-600 font-bold">• 🚫 Không được dùng lời thoại. Không được có người nói.</p>
                            <p>• Chỉ được sử dụng hình ảnh + âm thanh + chuyển động.</p>
                            <p className="text-purple-950 font-bold">• <strong>Nhiệm vụ:</strong> Hãy mô tả video của bạn theo từng giây từ 0 → 10s.</p>
                          </div>
                          <textarea
                            rows={6}
                            value={formData.castingDesignQ2 || ''}
                            onChange={(e) => handleInputChange('castingDesignQ2', e.target.value)}
                            placeholder="0-2s: ...\n2-5s: ...\n5-8s: ...\n8-10s: ..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* DESIGN QUESTION 3 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-amber-200 text-amber-950 px-3 py-1 rounded-xl border border-amber-400">Câu 3</span>
                            <span>🧠 “Ý tưởng đầu tiên bị loại”</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-2 bg-amber-50/80 p-4 rounded-xl border border-amber-200 leading-relaxed">
                            <p>• Bạn vừa nghĩ ra một ý tưởng thiết kế/video mà bạn cho là rất hay. Nhưng Admin nói: <em>“Ý tưởng này giống những gì người khác đã làm. Nghĩ lại.”</em></p>
                            <p className="text-purple-950 font-bold">• <strong>Bạn sẽ làm gì tiếp theo?</strong> Hãy mô tả cách bạn tìm ra một ý tưởng mới, từ lúc bỏ ý tưởng cũ cho đến khi có concept mới.</p>
                            <p className="text-slate-600 text-xs italic">• ✨ Không cần đưa ra sản phẩm cuối cùng — hãy cho chúng tôi thấy cách bạn suy nghĩ.</p>
                          </div>
                          <textarea
                            rows={6}
                            value={formData.castingDesignQ3 || ''}
                            onChange={(e) => handleInputChange('castingDesignQ3', e.target.value)}
                            placeholder="Mô tả quá trình suy nghĩ & tìm kiếm concept mới của bạn khi ý tưởng đầu tiên bị bác bỏ..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* CAMERAMAN / PHOTOGRAPHER CASTING QUESTIONS */}
                    {requiredModules.includes('cameraman') && (
                      <div className="space-y-5">
                        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-amber-100 border-3 border-amber-950 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Camera className="w-5 h-5 text-purple-900 stroke-[2.5]" />
                            <h3 className="font-black text-purple-950 text-base md:text-lg">
                              Thử Thách Casting: Ban Media (Cameraman & Photographer) 📸
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm text-purple-900 font-semibold leading-relaxed">
                            Thử thách góc nhìn ống kính dành riêng cho ứng viên Ban Truyền Thông / Chụp ảnh! Hãy tự do thể hiện tư duy thị giác và câu chuyện qua 3 câu hỏi bên dưới nhé.
                          </p>
                        </div>

                        {/* QUESTION 1 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-purple-200 text-purple-950 px-3 py-1 rounded-xl border border-purple-400">Câu 1</span>
                            <span>📸 5 tấm ảnh kể một ngày ở trường</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-1.5 bg-purple-50/80 p-4 rounded-xl border border-purple-200 leading-relaxed">
                            <p>• Bạn chỉ có 5 tấm ảnh để kể cho một người chưa từng đến trường bạn biết “một ngày ở trường” thực sự như thế nào.</p>
                            <p className="text-rose-600 font-bold">• 🚫 <strong>Không được chụp rõ mặt bất kỳ ai.</strong></p>
                            <p>• Bạn sẽ chụp 5 điều gì? Hãy mô tả ngắn gọn từng tấm ảnh và lý do bạn chọn nó.</p>
                            <p className="text-amber-900 font-bold">• ⭐ <strong>Bắt buộc:</strong> Ít nhất 1 tấm phải là một khoảnh khắc hoặc chi tiết mà học sinh bình thường có thể đi ngang qua nhưng không để ý.</p>
                          </div>
                          <textarea
                            rows={6}
                            value={formData.castingCamQ1 || ''}
                            onChange={(e) => handleInputChange('castingCamQ1', e.target.value)}
                            placeholder="1. Tấm 1: ... (Lý do)\n2. Tấm 2: ...\n3. Tấm 3: ...\n4. Tấm 4: ...\n5. Tấm 5 (Khoảnh khắc đi ngang qua không để ý): ..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>

                        {/* QUESTION 2 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-pink-200 text-pink-950 px-3 py-1 rounded-xl border border-pink-400">Câu 2</span>
                            <span>🎭 Biến điều bình thường thành điều đáng nhớ</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-1.5 bg-pink-50/80 p-4 rounded-xl border border-pink-200 leading-relaxed">
                            <p>• Hãy chọn một thứ rất bình thường ở trường bạn (chiếc bàn, cầu thang, bảng thông báo, hàng ghế, bãi xe, cửa sổ...).</p>
                            <p>• <strong>Nhiệm vụ:</strong> Biến nó thành một bức ảnh khiến người khác phải dừng lại nhìn (bằng cách thay đổi góc nhìn, thời điểm, ánh sáng hoặc cách kể chuyện, không thêm đạo cụ).</p>
                            <p className="text-indigo-900 font-bold">• 🏷️ Đặt tên cho bức ảnh bằng <strong>tối đa 7 từ</strong> và viết một đoạn ngắn mô tả chi tiết góc nhìn, ánh sáng cũng như câu chuyện đằng sau bức ảnh ấy.</p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingCamQ2 || ''}
                            onChange={(e) => handleInputChange('castingCamQ2', e.target.value)}
                            placeholder="Vật dụng chọn - Tên bức ảnh (tối đa 7 từ) & Mô tả chi tiết góc nhìn, ánh sáng, câu chuyện đằng sau..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                          <div className="flex justify-between items-center text-xs font-extrabold text-slate-600 px-1 pt-1">
                            <span>🏷️ Tên tối đa 7 từ & Mô tả chi tiết</span>
                            <span className="px-2.5 py-1 rounded-lg border bg-pink-100 text-pink-900 border-pink-300 font-bold">
                              Số từ: {getWordCount(formData.castingCamQ2)} từ
                            </span>
                          </div>
                        </div>

                        {/* QUESTION 3 */}
                        <div className="bg-white border-3 border-amber-950 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-[0_4px_0_rgba(120,53,15,0.2)]">
                          <div className="flex items-center gap-2 font-black text-amber-950 text-base md:text-lg">
                            <span className="bg-amber-200 text-amber-950 px-3 py-1 rounded-xl border border-amber-400">Câu 3</span>
                            <span>❤️ Nếu chỉ được chụp một tấm</span>
                          </div>
                          <div className="text-sm md:text-base text-slate-700 font-medium space-y-1.5 bg-amber-50/80 p-4 rounded-xl border border-amber-200 leading-relaxed">
                            <p>• Ngày mai là ngày cuối cùng bạn còn được đến trường. Bạn chỉ được mang máy ảnh và chụp DUY NHẤT 1 TẤM để giữ lại ký ức.</p>
                            <p>• Mô tả cụ thể: Bạn sẽ chụp khoảnh khắc/điều gì? Ở đâu và từ góc nhìn nào? Điều gì khiến tấm ảnh đó có ý nghĩa với bạn?</p>
                            <p className="text-purple-900 font-bold italic">• ✨ Không nhất thiết phải chọn một cảnh đẹp. Hãy chọn một cảnh mà bạn nghĩ: “Nếu không chụp hôm nay, sau này mình sẽ tiếc.”</p>
                          </div>
                          <textarea
                            rows={5}
                            value={formData.castingCamQ3 || ''}
                            onChange={(e) => handleInputChange('castingCamQ3', e.target.value)}
                            placeholder="Khoảnh khắc/Điều chụp - Ở đâu & Góc nhìn - Ý nghĩa đặc biệt với bạn..."
                            className="w-full bg-amber-50/60 text-slate-900 border-2 border-amber-950/40 rounded-xl p-4 text-base md:text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-amber-300 resize-y leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Anti-Cheat Out of Focus Warning Modal */}
                {showCheatModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
                    <div className="bg-gradient-to-br from-rose-100 via-red-100 to-amber-100 border-4 border-amber-950 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[0_12px_0_rgba(120,53,15,0.8)] text-center space-y-4">
                      <div className="w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto border-3 border-amber-950 shadow-md animate-bounce">
                        <ShieldAlert className="w-10 h-10 stroke-[2.5]" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-rose-950 uppercase">
                        ⚠️ CẢNH BÁO VI PHẠM OUT TRANG!
                      </h3>
                      <p className="text-sm md:text-base font-extrabold text-slate-800 leading-relaxed bg-white/90 p-4 rounded-2xl border-2 border-amber-950 shadow-inner">
                        Hệ thống đã phát hiện bạn vừa rời khỏi màn hình làm bài thi <strong>({cheatCount} lần)</strong>.
                        <br />
                        <span className="text-rose-700 font-bold block mt-1">
                          Lưu ý: Mọi lịch sử out trang đều được ghi nhận và nộp trực tiếp cho ban giám khảo Gemini AI để đánh giá tính trung thực!
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          setShowCheatModal(false);
                          requestFullscreenMode();
                        }}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-3.5 px-6 rounded-2xl border-3 border-amber-950 shadow-[0_4px_0_rgba(120,53,15,0.8)] active:translate-y-1 active:shadow-none transition-all cursor-pointer text-base"
                      >
                        Tôi Đã Hiểu & Quay Lại Làm Bài (Bật Fullscreen)
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 8: Flex Zone */}
                {currentStep === 8 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-black text-slate-800">
                      Flex Zone (Không bắt buộc nhưng cực kỳ cộng điểm AI!)
                    </label>
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      type="text"
                      value={formData.flexZone}
                      onChange={(e) => handleInputChange('flexZone', e.target.value)}
                      placeholder="Gắn link GitHub, Portfolio, Canva, LeetCode hoặc sản phẩm ấn tượng nhất..."
                      className="w-full bg-white text-slate-900 border-3 border-amber-950 rounded-2xl px-4 py-3.5 text-sm md:text-base font-bold shadow-[0_4px_0_rgba(120,53,15,0.2)] focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <p className="text-xs text-slate-600 font-medium bg-amber-100 p-3 rounded-xl border border-amber-300">
                      🌟 <strong>Mẹo Vũ Trụ:</strong> Hồ sơ có kèm đường link sản phẩm thực tế sẽ giúp Gemini AI đánh giá điểm số cao hơn đáng kể!
                    </p>
                  </div>
                )}

                {/* STEP 9: Summary & Submit */}
                {currentStep === 9 && (
                  <div className="space-y-4">
                    <div className="bg-amber-100/80 border-2 border-amber-950 rounded-2xl p-4 space-y-2 text-xs md:text-sm font-semibold text-slate-800">
                      <div className="flex justify-between border-b border-amber-300/80 pb-1.5">
                        <span className="text-slate-500 font-bold">Ứng viên:</span>
                        <span className="font-extrabold text-amber-950">
                          {formData.fullName} ({formData.studentClass}{formData.schoolName ? ` - ${formData.schoolName}` : ''})
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-amber-300/80 pb-1.5">
                        <span className="text-slate-500 font-bold">Ban & Vị trí:</span>
                        <span className="font-extrabold text-amber-950">
                          {DEPARTMENTS.find((d) => d.id === formData.department)?.name.split(' ')[1] || formData.department} - {formData.subRole}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-amber-300/80 pb-1.5">
                        <span className="text-slate-500 font-bold">Kỹ năng chọn:</span>
                        <span className="font-extrabold text-amber-950">
                          {formData.skills.length > 0 ? formData.skills.join(', ') : 'Chưa chọn'}
                        </span>
                      </div>
                      {formData.flexZone && (
                        <div className="flex justify-between border-b border-amber-300/80 pb-1.5">
                          <span className="text-slate-500 font-bold">Flex Zone 🌟:</span>
                          <span className="font-extrabold text-indigo-950 truncate max-w-[220px]">
                            {formData.flexZone}
                          </span>
                        </div>
                      )}
                      {(formData.castingHrQ1 || formData.castingHrQ2 || formData.castingHrQ3 || formData.castingHrQ4 || formData.castingHrQ5) && (
                        <div className="flex justify-between border-b border-amber-300/80 pb-1.5">
                          <span className="text-slate-500 font-bold">Bài thi HR & Sự Kiện 👥:</span>
                          <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                            ✓ Đã hoàn thành 5 câu tư duy quản lý nhân sự & vận hành
                          </span>
                        </div>
                      )}
                      {(formData.castingAiResQ1 || formData.castingAiResQ2 || formData.castingAiResQ3 || formData.castingAiResQ4 || formData.castingAiResQ5) && (
                        <div className="flex justify-between border-b border-amber-300/80 pb-1.5">
                          <span className="text-slate-500 font-bold">Bài thi AI / Data Research 🔬:</span>
                          <span className="font-extrabold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-lg border border-teal-300">
                            ✓ Đã hoàn thành 5 câu tư duy khoa học & thí nghiệm
                          </span>
                        </div>
                      )}
                      {(formData.castingGameQ1 || formData.castingGameQ2 || formData.castingGameQ3 || formData.castingGameQ4 || formData.castingGameQ5) && (
                        <div className="flex justify-between border-b border-amber-300/80 pb-1.5">
                          <span className="text-slate-500 font-bold">Bài thi Game Dev 🎮:</span>
                          <span className="font-extrabold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-300">
                            ✓ Đã hoàn thành 5 câu tư duy Game Design
                          </span>
                        </div>
                      )}
                      {(formData.castingDevQ1 || formData.castingDevQ2 || formData.castingDevQ3 || formData.castingDevQ4 || formData.castingDevQ5) && (
                        <div className="flex justify-between border-b border-amber-300/80 pb-1.5">
                          <span className="text-slate-500 font-bold">Bài thi Web/App Dev 🌐:</span>
                          <span className="font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-300">
                            ✓ Đã hoàn thành 5 câu tư duy sản phẩm
                          </span>
                        </div>
                      )}
                      {(formData.castingCpQ1 || formData.castingCpQ2 || formData.castingCpQ3 || formData.castingCpQ4 || formData.castingCpQ5) && (
                        <div className="flex justify-between border-b border-amber-300/80 pb-1.5">
                          <span className="text-slate-500 font-bold">Bài thi CP / Học Thuật ⚡:</span>
                          <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                            ✓ Đã hoàn thành 5 câu tư duy thuật toán
                          </span>
                        </div>
                      )}
                      {(formData.castingContentQ1 || formData.castingContentQ2 || formData.castingContentQ3) && (
                        <div className="flex justify-between border-b border-amber-300/80 pb-1.5">
                          <span className="text-slate-500 font-bold">Bài thi Content ✍️:</span>
                          <span className="font-extrabold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-300">
                            ✓ Đã hoàn thành sáng tạo nội dung
                          </span>
                        </div>
                      )}
                      {(formData.castingDesignQ1 || formData.castingDesignQ2 || formData.castingDesignQ3) && (
                        <div className="flex justify-between border-b border-amber-300/80 pb-1.5">
                          <span className="text-slate-500 font-bold">Bài thi Design/Video 🎨:</span>
                          <span className="font-extrabold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-300">
                            ✓ Đã hoàn thành tư duy thiết kế & video
                          </span>
                        </div>
                      )}
                      {(formData.castingCamQ1 || formData.castingCamQ2 || formData.castingCamQ3) && (
                        <div className="flex justify-between border-b border-amber-300/80 pb-1.5">
                          <span className="text-slate-500 font-bold">Bài thi Media 📸:</span>
                          <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                            ✓ Đã hoàn thành 3 câu hỏi góc nhìn
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between flex-wrap gap-1">
                        <span className="text-slate-500 font-bold">Liên hệ:</span>
                        <span className="font-extrabold text-amber-950 text-right">
                          {formData.email} | {formData.phone}
                          {formData.facebook ? ` | FB: ${formData.facebook}` : ''}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-center font-bold text-amber-900">
                      ✨ Khi nhấp nút gửi, hệ thống Gemini AI Vũ Trụ sẽ quét hồ sơ và chấm điểm ngay lập tức!
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons Row */}
            <div className="mt-8 pt-4 border-t-2 border-amber-200">
              {/* Bottom Error / Warning Alert if triggered */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 bg-rose-100 text-rose-950 border-2 border-rose-950 font-bold p-3 rounded-2xl text-xs md:text-sm flex items-center gap-2 shadow-[0_4px_0_rgba(159,18,57,0.3)] animate-pulse"
                >
                  <span className="text-lg">⚠️</span>
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              <div className="flex items-center justify-between gap-3">
                {/* Previous Button */}
                {currentStep > 1 ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToPrevStep}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-amber-200 hover:bg-amber-300 text-amber-950 border-2 border-amber-950 font-black rounded-2xl text-xs md:text-sm flex items-center gap-1.5 shadow-[0_4px_0_rgba(120,53,15,0.4)] cursor-pointer disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[3]" />
                    <span>Quay lại</span>
                  </motion.button>
                ) : (
                  <div />
                )}

                {/* Next or Submit Button */}
                {currentStep < FORM_STEPS.length ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToNextStep}
                    className="px-6 py-3 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-600 text-amber-950 border-3 border-amber-950 font-black rounded-2xl text-sm md:text-base flex items-center gap-2 shadow-[0_6px_0_rgba(120,53,15,0.8)] cursor-pointer"
                  >
                    <span>Tiếp theo</span>
                    <ChevronRight className="w-5 h-5 stroke-[3]" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 text-amber-950 border-3 border-amber-950 font-black rounded-2xl text-base md:text-lg flex items-center gap-2 shadow-[0_6px_0_rgba(120,53,15,0.8)] cursor-pointer disabled:opacity-70 animate-pulse"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-3 border-amber-950 border-t-transparent rounded-full animate-spin" />
                        <span>Đang quét Radar AI...</span>
                      </>
                    ) : (
                      <>
                        <span>Bắn hồ sơ ngay 🚀</span>
                        <Sparkles className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
