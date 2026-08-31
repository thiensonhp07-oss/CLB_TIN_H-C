export type DepartmentType = 'chuyen-mon' | 'truyen-thong' | 'nhan-su';

export interface DepartmentInfo {
  id: DepartmentType;
  name: string;
  tagline: string;
  description: string;
  subRoles: string[];
  skillsList: string[];
  color: string;
  accentGlow: string;
  iconName: string;
}

export interface ApplicationFormData {
  fullName: string;
  studentClass: string;
  schoolName: string;
  email: string;
  phone: string;
  facebook: string;
  department: DepartmentType;
  subRole: string;
  skills: string[];
  flexZone: string;
  motivation: string;
  // Anti-Cheat tracking
  cheatCount?: number;
  cheatLogs?: string;
  // Cameraman / Photographer Casting Challenge
  castingCamQ1?: string;
  castingCamQ2?: string;
  castingCamQ3?: string;
  // Content Creator / Writer Casting Challenge
  castingContentQ1?: string;
  castingContentQ2?: string;
  castingContentQ3?: string;
  // Designer & Video Editor Casting Challenge
  castingDesignQ1?: string;
  castingDesignQ2?: string;
  castingDesignQ3?: string;
  // Competitive Programming / Academic Casting Challenge
  castingCpQ1?: string;
  castingCpQ2?: string;
  castingCpQ3?: string;
  castingCpQ4?: string;
  castingCpQ5?: string;
  // Web/App Developer Casting Challenge
  castingDevQ1?: string;
  castingDevQ2?: string;
  castingDevQ3?: string;
  castingDevQ4?: string;
  castingDevQ5?: string;
  // Game Developer Casting Challenge
  castingGameQ1?: string;
  castingGameQ2?: string;
  castingGameQ3?: string;
  castingGameQ4?: string;
  castingGameQ5?: string;
  // AI & Data Science Researcher Casting Challenge
  castingAiResQ1?: string;
  castingAiResQ2?: string;
  castingAiResQ3?: string;
  castingAiResQ4?: string;
  castingAiResQ5?: string;
  // HR & Operations Casting Challenge
  castingHrQ1?: string;
  castingHrQ2?: string;
  castingHrQ3?: string;
  castingHrQ4?: string;
  castingHrQ5?: string;
}

export interface AIReviewResult {
  score: number;
  vibe: string;
  review: string;
}

export interface ApplicationRecord extends ApplicationFormData {
  id?: string;
  scoreByAI: number;
  aiVibe: string;
  aiReview: string;
  createdAt: string;
}
