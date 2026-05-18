-- ============================================================
-- MADRASA TN — Schema initial
-- Système éducatif tunisien : Primaire, Collège, Lycée
-- ============================================================

-- ---------- ÉCOLES ----------
CREATE TABLE IF NOT EXISTS schools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_ar TEXT,
  type TEXT NOT NULL CHECK (type IN ('primaire', 'college', 'lycee')),
  governorate TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  director_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------- UTILISATEURS (5 rôles) ----------
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('eleve', 'enseignant', 'admin_ecole', 'parent', 'ministere')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name_ar TEXT,
  last_name_ar TEXT,
  phone TEXT,
  avatar_url TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'fr' CHECK (preferred_language IN ('ar', 'fr', 'en')),
  school_id INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_school ON users(school_id);

-- ---------- NIVEAUX SCOLAIRES TUNISIENS ----------
CREATE TABLE IF NOT EXISTS grade_levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  cycle TEXT NOT NULL CHECK (cycle IN ('primaire', 'college', 'lycee')),
  year_order INTEGER NOT NULL,
  description TEXT
);

-- ---------- SECTIONS DU LYCÉE ----------
CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT
);

-- ---------- MATIÈRES ----------
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT,
  color TEXT DEFAULT '#0f766e',
  description TEXT
);

-- ---------- ASSOCIATION MATIÈRE ↔ NIVEAU ----------
CREATE TABLE IF NOT EXISTS curriculum (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grade_level_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  section_id INTEGER,
  weekly_hours REAL DEFAULT 0,
  coefficient REAL DEFAULT 1,
  FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  UNIQUE(grade_level_id, subject_id, section_id)
);

-- ---------- CLASSES ----------
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL,
  grade_level_id INTEGER NOT NULL,
  section_id INTEGER,
  name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  main_teacher_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id),
  FOREIGN KEY (section_id) REFERENCES sections(id),
  FOREIGN KEY (main_teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ---------- PROFIL ÉLÈVE ----------
CREATE TABLE IF NOT EXISTS student_profiles (
  user_id INTEGER PRIMARY KEY,
  class_id INTEGER,
  student_number TEXT UNIQUE,
  birth_date TEXT,
  birth_place TEXT,
  enrollment_date TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- ---------- PROFIL ENSEIGNANT ----------
CREATE TABLE IF NOT EXISTS teacher_profiles (
  user_id INTEGER PRIMARY KEY,
  matricule TEXT UNIQUE,
  specialty TEXT,
  hire_date TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- ASSOCIATION ENSEIGNANT ↔ MATIÈRE ↔ CLASSE ----------
CREATE TABLE IF NOT EXISTS teacher_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(teacher_id, class_id, subject_id, academic_year)
);

-- ---------- LIEN PARENT ↔ ÉLÈVE ----------
CREATE TABLE IF NOT EXISTS parent_student_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  relationship TEXT CHECK (relationship IN ('pere', 'mere', 'tuteur')),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(parent_id, student_id)
);

-- ---------- COURS INTERACTIFS ----------
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  description TEXT,
  subject_id INTEGER NOT NULL,
  grade_level_id INTEGER NOT NULL,
  section_id INTEGER,
  author_id INTEGER NOT NULL,
  cover_image TEXT,
  difficulty TEXT DEFAULT 'moyen' CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
  duration_minutes INTEGER DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'fr' CHECK (language IN ('ar', 'fr', 'en')),
  is_published INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id),
  FOREIGN KEY (section_id) REFERENCES sections(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX idx_courses_subject ON courses(subject_id);
CREATE INDEX idx_courses_grade ON courses(grade_level_id);
CREATE INDEX idx_courses_published ON courses(is_published);

-- ---------- CHAPITRES ET LEÇONS ----------
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'video', 'pdf', 'interactive', 'quiz')),
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX idx_lessons_course ON lessons(course_id);

-- ---------- PROGRESSION ÉLÈVE ----------
CREATE TABLE IF NOT EXISTS student_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  lesson_id INTEGER,
  status TEXT NOT NULL DEFAULT 'en_cours' CHECK (status IN ('non_commence', 'en_cours', 'termine')),
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE(student_id, course_id, lesson_id)
);

-- ---------- ÉVALUATIONS / QUIZ ----------
CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  course_id INTEGER,
  subject_id INTEGER NOT NULL,
  grade_level_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'devoir', 'examen', 'controle')),
  duration_minutes INTEGER DEFAULT 30,
  total_points REAL DEFAULT 20,
  is_ai_generated INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ---------- QUESTIONS ----------
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('qcm', 'vrai_faux', 'reponse_courte', 'redaction')),
  options TEXT, -- JSON array pour QCM
  correct_answer TEXT,
  explanation TEXT,
  points REAL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- ---------- TENTATIVES D'ÉVALUATION ----------
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  submitted_at TEXT,
  score REAL,
  max_score REAL,
  ai_feedback TEXT,
  status TEXT NOT NULL DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'soumis', 'corrige')),
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- RÉPONSES ----------
CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  student_answer TEXT,
  is_correct INTEGER,
  score_obtained REAL DEFAULT 0,
  ai_feedback TEXT,
  FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- ---------- INTERACTIONS IA (Chatbot tuteur) ----------
CREATE TABLE IF NOT EXISTS ai_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subject_id INTEGER,
  title TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
);

-- ---------- NOTES / BULLETIN ----------
CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  subject_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  trimester INTEGER NOT NULL CHECK (trimester IN (1, 2, 3)),
  academic_year TEXT NOT NULL,
  grade_type TEXT NOT NULL CHECK (grade_type IN ('controle', 'devoir', 'examen', 'oral')),
  score REAL NOT NULL,
  max_score REAL NOT NULL DEFAULT 20,
  comment TEXT,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- ---------- SESSIONS ----------
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);

-- ---------- NOTIFICATIONS ----------
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read INTEGER NOT NULL DEFAULT 0,
  link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
