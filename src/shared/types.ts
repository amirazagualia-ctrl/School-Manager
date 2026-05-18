// ============================================================
// TYPES PARTAGÉS - Frontend & Backend
// ============================================================

export type UserRole = 'eleve' | 'enseignant' | 'admin_ecole' | 'parent' | 'ministere';
export type Language = 'ar' | 'fr' | 'en';
export type Cycle = 'primaire' | 'college' | 'lycee';
export type Difficulty = 'facile' | 'moyen' | 'difficile';
export type ContentType = 'text' | 'video' | 'pdf' | 'interactive' | 'quiz';
export type AssessmentType = 'quiz' | 'devoir' | 'examen' | 'controle';
export type QuestionType = 'qcm' | 'vrai_faux' | 'reponse_courte' | 'redaction';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  first_name_ar?: string;
  last_name_ar?: string;
  phone?: string;
  avatar_url?: string;
  preferred_language: Language;
  school_id?: number;
  is_active: number;
  created_at: string;
}

export interface School {
  id: number;
  name: string;
  name_ar?: string;
  type: Cycle;
  governorate: string;
  address?: string;
  phone?: string;
  email?: string;
  director_name?: string;
  created_at: string;
}

export interface GradeLevel {
  id: number;
  code: string;
  name_fr: string;
  name_ar: string;
  name_en: string;
  cycle: Cycle;
  year_order: number;
}

export interface Section {
  id: number;
  code: string;
  name_fr: string;
  name_ar: string;
  name_en: string;
  description?: string;
}

export interface Subject {
  id: number;
  code: string;
  name_fr: string;
  name_ar: string;
  name_en: string;
  icon?: string;
  color?: string;
}

export interface Course {
  id: number;
  title: string;
  title_ar?: string;
  title_en?: string;
  description?: string;
  subject_id: number;
  grade_level_id: number;
  section_id?: number;
  author_id: number;
  cover_image?: string;
  difficulty: Difficulty;
  duration_minutes: number;
  language: Language;
  is_published: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  subject_name?: string;
  subject_color?: string;
  grade_name?: string;
  author_name?: string;
  lessons_count?: number;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  order_index: number;
  content_type: ContentType;
  content?: string;
  video_url?: string;
  duration_minutes: number;
}

export interface Assessment {
  id: number;
  title: string;
  description?: string;
  course_id?: number;
  subject_id: number;
  grade_level_id: number;
  created_by: number;
  type: AssessmentType;
  duration_minutes: number;
  total_points: number;
  is_ai_generated: number;
  is_published: number;
  created_at: string;
  // Joined
  subject_name?: string;
  grade_name?: string;
  questions_count?: number;
}

export interface Question {
  id: number;
  assessment_id: number;
  question_text: string;
  question_type: QuestionType;
  options?: string; // JSON
  correct_answer?: string;
  explanation?: string;
  points: number;
  order_index: number;
}

export interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  class_id: number;
  teacher_id: number;
  trimester: 1 | 2 | 3;
  academic_year: string;
  grade_type: 'controle' | 'devoir' | 'examen' | 'oral';
  score: number;
  max_score: number;
  comment?: string;
  recorded_at: string;
  // joined
  subject_name?: string;
  teacher_name?: string;
}

export interface Class {
  id: number;
  school_id: number;
  grade_level_id: number;
  section_id?: number;
  name: string;
  academic_year: string;
  main_teacher_id?: number;
  // joined
  grade_name?: string;
  section_name?: string;
  school_name?: string;
  students_count?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface AiMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface AiConversation {
  id: number;
  user_id: number;
  subject_id?: number;
  title?: string;
  created_at: string;
  messages?: AiMessage[];
}
