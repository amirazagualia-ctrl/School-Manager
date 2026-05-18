-- ============================================================
-- SEED DATA — Système éducatif tunisien
-- ============================================================

-- ---------- NIVEAUX SCOLAIRES ----------
INSERT INTO grade_levels (code, name_fr, name_ar, name_en, cycle, year_order) VALUES
  ('P1', '1ère année primaire', 'السنة الأولى ابتدائي', '1st Year Primary', 'primaire', 1),
  ('P2', '2ème année primaire', 'السنة الثانية ابتدائي', '2nd Year Primary', 'primaire', 2),
  ('P3', '3ème année primaire', 'السنة الثالثة ابتدائي', '3rd Year Primary', 'primaire', 3),
  ('P4', '4ème année primaire', 'السنة الرابعة ابتدائي', '4th Year Primary', 'primaire', 4),
  ('P5', '5ème année primaire', 'السنة الخامسة ابتدائي', '5th Year Primary', 'primaire', 5),
  ('P6', '6ème année primaire', 'السنة السادسة ابتدائي', '6th Year Primary', 'primaire', 6),
  ('C7', '7ème année de base', 'السنة السابعة أساسي', '7th Year Basic', 'college', 7),
  ('C8', '8ème année de base', 'السنة الثامنة أساسي', '8th Year Basic', 'college', 8),
  ('C9', '9ème année de base', 'السنة التاسعة أساسي', '9th Year Basic', 'college', 9),
  ('L1', '1ère année secondaire', 'السنة الأولى ثانوي', '1st Year Secondary', 'lycee', 10),
  ('L2', '2ème année secondaire', 'السنة الثانية ثانوي', '2nd Year Secondary', 'lycee', 11),
  ('L3', '3ème année secondaire', 'السنة الثالثة ثانوي', '3rd Year Secondary', 'lycee', 12),
  ('L4', 'Baccalauréat', 'البكالوريا', 'Baccalaureate', 'lycee', 13);

-- ---------- SECTIONS DU LYCÉE ----------
INSERT INTO sections (code, name_fr, name_ar, name_en, description) VALUES
  ('TC', 'Tronc Commun', 'جذع مشترك', 'Common Core', 'Première année secondaire'),
  ('MATH', 'Mathématiques', 'رياضيات', 'Mathematics', 'Section scientifique - Maths'),
  ('SC', 'Sciences Expérimentales', 'علوم تجريبية', 'Experimental Sciences', 'Section scientifique - SVT/Physique'),
  ('TECH', 'Sciences Techniques', 'علوم تقنية', 'Technical Sciences', 'Section technique'),
  ('INFO', 'Sciences de l''Informatique', 'علوم الإعلامية', 'Computer Science', 'Section informatique'),
  ('LET', 'Lettres', 'آداب', 'Literature', 'Section littéraire'),
  ('ECO', 'Économie et Gestion', 'اقتصاد وتصرف', 'Economics & Management', 'Section économique'),
  ('SP', 'Sport', 'رياضة', 'Sports', 'Section sportive');

-- ---------- MATIÈRES ----------
INSERT INTO subjects (code, name_fr, name_ar, name_en, icon, color) VALUES
  ('AR', 'Arabe', 'العربية', 'Arabic', 'BookOpen', '#dc2626'),
  ('FR', 'Français', 'الفرنسية', 'French', 'Languages', '#2563eb'),
  ('EN', 'Anglais', 'الإنجليزية', 'English', 'Globe', '#7c3aed'),
  ('MATH', 'Mathématiques', 'الرياضيات', 'Mathematics', 'Calculator', '#0891b2'),
  ('SVT', 'Sciences de la Vie et de la Terre', 'علوم الحياة والأرض', 'Life & Earth Sciences', 'Leaf', '#16a34a'),
  ('PC', 'Physique-Chimie', 'الفيزياء والكيمياء', 'Physics-Chemistry', 'Atom', '#ea580c'),
  ('HIST', 'Histoire', 'التاريخ', 'History', 'Landmark', '#92400e'),
  ('GEO', 'Géographie', 'الجغرافيا', 'Geography', 'Map', '#0d9488'),
  ('EDIS', 'Éducation Islamique', 'التربية الإسلامية', 'Islamic Education', 'Moon', '#15803d'),
  ('EDC', 'Éducation Civique', 'التربية المدنية', 'Civic Education', 'Users', '#6366f1'),
  ('INFO', 'Informatique', 'الإعلامية', 'Computer Science', 'Monitor', '#0f766e'),
  ('PHILO', 'Philosophie', 'الفلسفة', 'Philosophy', 'Brain', '#7c2d12'),
  ('ECO', 'Économie', 'الاقتصاد', 'Economics', 'TrendingUp', '#059669'),
  ('GEST', 'Gestion', 'التصرف', 'Management', 'Briefcase', '#0369a1'),
  ('TECH', 'Technologie', 'التكنولوجيا', 'Technology', 'Cog', '#9333ea'),
  ('EPS', 'Éducation Physique', 'التربية البدنية', 'Physical Education', 'Activity', '#dc2626'),
  ('MUS', 'Musique', 'الموسيقى', 'Music', 'Music', '#db2777'),
  ('ART', 'Arts Plastiques', 'التربية التشكيلية', 'Visual Arts', 'Palette', '#c026d3');

-- ---------- ÉCOLES DE DÉMONSTRATION ----------
INSERT INTO schools (name, name_ar, type, governorate, address, phone, email, director_name) VALUES
  ('École Primaire Ibn Khaldoun', 'مدرسة ابن خلدون الابتدائية', 'primaire', 'Tunis', 'Avenue Habib Bourguiba, Tunis', '71123456', 'ibn.khaldoun@edu.tn', 'M. Ahmed Ben Ali'),
  ('Collège El Manar', 'إعدادية المنار', 'college', 'Tunis', 'El Manar 2, Tunis', '71234567', 'manar@edu.tn', 'Mme Leila Trabelsi'),
  ('Lycée Pilote Bourguiba', 'المعهد النموذجي بورقيبة', 'lycee', 'Tunis', 'Avenue de la Liberté, Tunis', '71345678', 'pilote.bourguiba@edu.tn', 'M. Mohamed Sassi'),
  ('Lycée Pilote Ariana', 'المعهد النموذجي أريانة', 'lycee', 'Ariana', 'Cité Ettadhamen, Ariana', '71456789', 'pilote.ariana@edu.tn', 'Mme Fatma Khelifi'),
  ('École Primaire Carthage', 'مدرسة قرطاج الابتدائية', 'primaire', 'Tunis', 'Carthage', '71567890', 'carthage@edu.tn', 'M. Karim Mejri');

-- ---------- CURRICULUM (associations matière/niveau) — Exemples ----------
-- Primaire (toutes les classes ont les bases)
INSERT INTO curriculum (grade_level_id, subject_id, weekly_hours, coefficient)
SELECT g.id, s.id, 
  CASE s.code WHEN 'AR' THEN 8 WHEN 'FR' THEN 6 WHEN 'MATH' THEN 5 ELSE 2 END,
  CASE s.code WHEN 'AR' THEN 3 WHEN 'FR' THEN 3 WHEN 'MATH' THEN 3 ELSE 1 END
FROM grade_levels g, subjects s
WHERE g.cycle = 'primaire' AND s.code IN ('AR', 'FR', 'MATH', 'EDIS', 'EDC', 'EPS', 'MUS', 'ART');

-- Anglais à partir de la 4ème année primaire
INSERT INTO curriculum (grade_level_id, subject_id, weekly_hours, coefficient)
SELECT g.id, s.id, 2, 1
FROM grade_levels g, subjects s
WHERE g.cycle = 'primaire' AND g.year_order >= 4 AND s.code = 'EN';

-- Collège
INSERT INTO curriculum (grade_level_id, subject_id, weekly_hours, coefficient)
SELECT g.id, s.id,
  CASE s.code WHEN 'AR' THEN 5 WHEN 'FR' THEN 5 WHEN 'EN' THEN 3 WHEN 'MATH' THEN 5 WHEN 'PC' THEN 3 WHEN 'SVT' THEN 2 ELSE 2 END,
  CASE s.code WHEN 'AR' THEN 4 WHEN 'FR' THEN 3 WHEN 'MATH' THEN 4 WHEN 'PC' THEN 2 ELSE 1 END
FROM grade_levels g, subjects s
WHERE g.cycle = 'college' AND s.code IN ('AR', 'FR', 'EN', 'MATH', 'PC', 'SVT', 'HIST', 'GEO', 'EDIS', 'EDC', 'INFO', 'TECH', 'EPS');

-- Lycée Tronc Commun
INSERT INTO curriculum (grade_level_id, subject_id, section_id, weekly_hours, coefficient)
SELECT g.id, s.id, sec.id,
  CASE s.code WHEN 'AR' THEN 4 WHEN 'FR' THEN 4 WHEN 'EN' THEN 3 WHEN 'MATH' THEN 4 WHEN 'PC' THEN 3 ELSE 2 END,
  CASE s.code WHEN 'AR' THEN 3 WHEN 'FR' THEN 3 WHEN 'MATH' THEN 3 ELSE 1 END
FROM grade_levels g, subjects s, sections sec
WHERE g.code = 'L1' AND sec.code = 'TC'
AND s.code IN ('AR', 'FR', 'EN', 'MATH', 'PC', 'SVT', 'HIST', 'GEO', 'EDIS', 'INFO', 'EPS', 'PHILO');

-- Section Mathématiques (Bac Math)
INSERT INTO curriculum (grade_level_id, subject_id, section_id, weekly_hours, coefficient)
SELECT g.id, s.id, sec.id,
  CASE s.code WHEN 'MATH' THEN 8 WHEN 'PC' THEN 6 WHEN 'SVT' THEN 2 WHEN 'PHILO' THEN 3 ELSE 2 END,
  CASE s.code WHEN 'MATH' THEN 4 WHEN 'PC' THEN 4 WHEN 'PHILO' THEN 2 ELSE 1 END
FROM grade_levels g, subjects s, sections sec
WHERE g.code = 'L4' AND sec.code = 'MATH'
AND s.code IN ('AR', 'FR', 'EN', 'MATH', 'PC', 'SVT', 'PHILO', 'INFO', 'EPS');

-- Section Sciences Expérimentales
INSERT INTO curriculum (grade_level_id, subject_id, section_id, weekly_hours, coefficient)
SELECT g.id, s.id, sec.id,
  CASE s.code WHEN 'MATH' THEN 5 WHEN 'PC' THEN 5 WHEN 'SVT' THEN 5 WHEN 'PHILO' THEN 3 ELSE 2 END,
  CASE s.code WHEN 'SVT' THEN 4 WHEN 'PC' THEN 4 WHEN 'MATH' THEN 3 WHEN 'PHILO' THEN 2 ELSE 1 END
FROM grade_levels g, subjects s, sections sec
WHERE g.code = 'L4' AND sec.code = 'SC'
AND s.code IN ('AR', 'FR', 'EN', 'MATH', 'PC', 'SVT', 'PHILO', 'INFO', 'EPS');

-- Section Lettres
INSERT INTO curriculum (grade_level_id, subject_id, section_id, weekly_hours, coefficient)
SELECT g.id, s.id, sec.id,
  CASE s.code WHEN 'AR' THEN 6 WHEN 'FR' THEN 5 WHEN 'EN' THEN 4 WHEN 'PHILO' THEN 5 WHEN 'HIST' THEN 4 WHEN 'GEO' THEN 3 ELSE 2 END,
  CASE s.code WHEN 'AR' THEN 4 WHEN 'PHILO' THEN 4 WHEN 'FR' THEN 3 WHEN 'HIST' THEN 3 ELSE 1 END
FROM grade_levels g, subjects s, sections sec
WHERE g.code = 'L4' AND sec.code = 'LET'
AND s.code IN ('AR', 'FR', 'EN', 'PHILO', 'HIST', 'GEO', 'EDIS', 'EPS');

-- Section Économie
INSERT INTO curriculum (grade_level_id, subject_id, section_id, weekly_hours, coefficient)
SELECT g.id, s.id, sec.id,
  CASE s.code WHEN 'ECO' THEN 5 WHEN 'GEST' THEN 4 WHEN 'MATH' THEN 4 WHEN 'FR' THEN 4 ELSE 2 END,
  CASE s.code WHEN 'ECO' THEN 4 WHEN 'GEST' THEN 3 WHEN 'MATH' THEN 3 ELSE 1 END
FROM grade_levels g, subjects s, sections sec
WHERE g.code = 'L4' AND sec.code = 'ECO'
AND s.code IN ('AR', 'FR', 'EN', 'MATH', 'ECO', 'GEST', 'HIST', 'GEO', 'PHILO');

-- Section Informatique
INSERT INTO curriculum (grade_level_id, subject_id, section_id, weekly_hours, coefficient)
SELECT g.id, s.id, sec.id,
  CASE s.code WHEN 'INFO' THEN 8 WHEN 'MATH' THEN 6 WHEN 'PC' THEN 4 ELSE 2 END,
  CASE s.code WHEN 'INFO' THEN 4 WHEN 'MATH' THEN 4 WHEN 'PC' THEN 2 ELSE 1 END
FROM grade_levels g, subjects s, sections sec
WHERE g.code = 'L4' AND sec.code = 'INFO'
AND s.code IN ('AR', 'FR', 'EN', 'MATH', 'PC', 'INFO', 'PHILO', 'EPS');

-- Section Technique
INSERT INTO curriculum (grade_level_id, subject_id, section_id, weekly_hours, coefficient)
SELECT g.id, s.id, sec.id,
  CASE s.code WHEN 'TECH' THEN 8 WHEN 'MATH' THEN 5 WHEN 'PC' THEN 4 ELSE 2 END,
  CASE s.code WHEN 'TECH' THEN 4 WHEN 'MATH' THEN 3 WHEN 'PC' THEN 3 ELSE 1 END
FROM grade_levels g, subjects s, sections sec
WHERE g.code = 'L4' AND sec.code = 'TECH'
AND s.code IN ('AR', 'FR', 'EN', 'MATH', 'PC', 'TECH', 'INFO', 'EPS');

-- ---------- UTILISATEURS DE DÉMO ----------
-- password = "Demo123!" (hash bcrypt simplifié pour démo: sha256 + sel "madrasa")
-- Hash de "Demo123!" + sel "madrasa" = on utilise SHA-256 dans le backend

INSERT INTO users (email, password_hash, role, first_name, last_name, first_name_ar, last_name_ar, preferred_language, school_id) VALUES
  -- Ministère (super admin)
  ('ministere@edu.tn', 'dff7139d8d4a9cd30fd0e232e080d59031c18cd0b01b7f7c0b4b82a352546c1bbaf539910f81661184f5ca43a6f14a27d2cda67d6f08ea7c1369f562f4d261ab', 'ministere', 'Ministre', 'Éducation', 'وزارة', 'التربية', 'fr', NULL),
  -- Admin école
  ('admin@edu.tn', 'dff7139d8d4a9cd30fd0e232e080d59031c18cd0b01b7f7c0b4b82a352546c1bbaf539910f81661184f5ca43a6f14a27d2cda67d6f08ea7c1369f562f4d261ab', 'admin_ecole', 'Mohamed', 'Sassi', 'محمد', 'الساسي', 'fr', 3),
  -- Enseignants
  ('prof.math@edu.tn', 'dff7139d8d4a9cd30fd0e232e080d59031c18cd0b01b7f7c0b4b82a352546c1bbaf539910f81661184f5ca43a6f14a27d2cda67d6f08ea7c1369f562f4d261ab', 'enseignant', 'Sami', 'Bouazizi', 'سامي', 'البوعزيزي', 'fr', 3),
  ('prof.arabe@edu.tn', 'dff7139d8d4a9cd30fd0e232e080d59031c18cd0b01b7f7c0b4b82a352546c1bbaf539910f81661184f5ca43a6f14a27d2cda67d6f08ea7c1369f562f4d261ab', 'enseignant', 'Amina', 'Khelifi', 'أمينة', 'الخليفي', 'ar', 3),
  ('prof.fr@edu.tn', 'dff7139d8d4a9cd30fd0e232e080d59031c18cd0b01b7f7c0b4b82a352546c1bbaf539910f81661184f5ca43a6f14a27d2cda67d6f08ea7c1369f562f4d261ab', 'enseignant', 'Sonia', 'Mejri', 'سنية', 'المجري', 'fr', 3),
  -- Élèves
  ('eleve@edu.tn', 'dff7139d8d4a9cd30fd0e232e080d59031c18cd0b01b7f7c0b4b82a352546c1bbaf539910f81661184f5ca43a6f14a27d2cda67d6f08ea7c1369f562f4d261ab', 'eleve', 'Yassine', 'Ben Ali', 'ياسين', 'بن علي', 'fr', 3),
  ('eleve2@edu.tn', 'dff7139d8d4a9cd30fd0e232e080d59031c18cd0b01b7f7c0b4b82a352546c1bbaf539910f81661184f5ca43a6f14a27d2cda67d6f08ea7c1369f562f4d261ab', 'eleve', 'Sarra', 'Trabelsi', 'سارة', 'الطرابلسي', 'ar', 3),
  ('eleve3@edu.tn', 'dff7139d8d4a9cd30fd0e232e080d59031c18cd0b01b7f7c0b4b82a352546c1bbaf539910f81661184f5ca43a6f14a27d2cda67d6f08ea7c1369f562f4d261ab', 'eleve', 'Karim', 'Jouini', 'كريم', 'الجويني', 'fr', 2),
  -- Parents
  ('parent@edu.tn', 'dff7139d8d4a9cd30fd0e232e080d59031c18cd0b01b7f7c0b4b82a352546c1bbaf539910f81661184f5ca43a6f14a27d2cda67d6f08ea7c1369f562f4d261ab', 'parent', 'Foued', 'Ben Ali', 'فؤاد', 'بن علي', 'fr', NULL),
  ('parent2@edu.tn', 'dff7139d8d4a9cd30fd0e232e080d59031c18cd0b01b7f7c0b4b82a352546c1bbaf539910f81661184f5ca43a6f14a27d2cda67d6f08ea7c1369f562f4d261ab', 'parent', 'Najet', 'Trabelsi', 'نجاة', 'الطرابلسي', 'ar', NULL);

-- ---------- CLASSES ----------
INSERT INTO classes (school_id, grade_level_id, section_id, name, academic_year, main_teacher_id) VALUES
  (3, 10, 1, '1ère Sec A', '2024-2025', 3),
  (3, 12, 2, '3ème Math 1', '2024-2025', 3),
  (3, 13, 3, 'Bac Sciences 1', '2024-2025', 5),
  (2, 8, NULL, '8ème Base A', '2024-2025', 4);

-- ---------- PROFILS ÉLÈVES ----------
INSERT INTO student_profiles (user_id, class_id, student_number, birth_date) VALUES
  (6, 1, 'STU2024001', '2008-05-15'),
  (7, 2, 'STU2024002', '2007-03-22'),
  (8, 4, 'STU2024003', '2010-09-10');

-- ---------- PROFILS ENSEIGNANTS ----------
INSERT INTO teacher_profiles (user_id, matricule, specialty, hire_date) VALUES
  (3, 'PROF2018001', 'Mathématiques', '2018-09-01'),
  (4, 'PROF2015002', 'Langue Arabe', '2015-09-01'),
  (5, 'PROF2020003', 'Langue Française', '2020-09-01');

-- ---------- LIENS PARENT-ÉLÈVE ----------
INSERT INTO parent_student_links (parent_id, student_id, relationship) VALUES
  (9, 6, 'pere'),
  (10, 7, 'mere');

-- ---------- COURS DE DÉMONSTRATION ----------
INSERT INTO courses (title, title_ar, title_en, description, subject_id, grade_level_id, section_id, author_id, difficulty, duration_minutes, language, is_published) VALUES
  ('Les fonctions du second degré', 'دوال الدرجة الثانية', 'Quadratic Functions', 'Étude complète des fonctions polynomiales du second degré : forme canonique, factorisation, racines et représentation graphique.', 4, 12, 2, 3, 'moyen', 90, 'fr', 1),
  ('Algorithmes et programmation', 'الخوارزميات والبرمجة', 'Algorithms & Programming', 'Introduction aux algorithmes : variables, conditions, boucles. Application en Python.', 11, 11, NULL, 3, 'facile', 60, 'fr', 1),
  ('قواعد النحو العربي', 'قواعد النحو العربي - الدرس الأول', 'Arabic Grammar Basics', 'دروس مبسطة في النحو العربي للسنة الثامنة أساسي.', 1, 8, NULL, 4, 'facile', 45, 'ar', 1),
  ('La conjugaison française', 'تصريف الأفعال الفرنسية', 'French Conjugation', 'Maîtrisez les temps du français : présent, passé composé, imparfait, futur.', 2, 8, NULL, 5, 'moyen', 50, 'fr', 1),
  ('Les forces et le mouvement', 'القوى والحركة', 'Forces and Motion', 'Étude des lois de Newton et application à des situations concrètes.', 6, 12, 3, 3, 'difficile', 120, 'fr', 1),
  ('Introduction à la photosynthèse', 'مدخل إلى التركيب الضوئي', 'Introduction to Photosynthesis', 'Comprendre le processus de photosynthèse chez les plantes.', 5, 9, NULL, 4, 'moyen', 60, 'fr', 1);

-- ---------- LEÇONS ----------
INSERT INTO lessons (course_id, title, order_index, content_type, content, duration_minutes) VALUES
  (1, 'Introduction aux fonctions du second degré', 1, 'text', 'Une fonction du second degré est une fonction polynomiale de la forme f(x) = ax² + bx + c où a ≠ 0...', 15),
  (1, 'La forme canonique', 2, 'text', 'La forme canonique permet d''identifier rapidement le sommet de la parabole : f(x) = a(x - α)² + β...', 20),
  (1, 'Résolution d''équations', 3, 'interactive', '{"type":"exercise","problem":"Résoudre x² - 5x + 6 = 0"}', 25),
  (1, 'Quiz de fin de chapitre', 4, 'quiz', NULL, 15),
  (2, 'Qu''est-ce qu''un algorithme ?', 1, 'text', 'Un algorithme est une suite finie d''instructions...', 10),
  (2, 'Variables et types de données', 2, 'text', 'Les variables permettent de stocker des informations...', 15),
  (2, 'Les structures conditionnelles', 3, 'interactive', '{"type":"code","language":"python"}', 20);

-- ---------- ÉVALUATIONS DE DÉMO ----------
INSERT INTO assessments (title, description, course_id, subject_id, grade_level_id, created_by, type, duration_minutes, total_points, is_published) VALUES
  ('Quiz : Fonctions du second degré', 'Évaluation des connaissances sur les fonctions polynomiales', 1, 4, 12, 3, 'quiz', 30, 20, 1),
  ('Devoir surveillé : Algorithmes', 'Évaluation pratique des structures de contrôle', 2, 11, 11, 3, 'devoir', 60, 20, 1);

-- ---------- QUESTIONS ----------
INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
  (1, 'Quelle est la forme générale d''une fonction du second degré ?', 'qcm', '["f(x) = ax + b","f(x) = ax² + bx + c","f(x) = ax³ + bx² + c","f(x) = a/x + b"]', 'f(x) = ax² + bx + c', 'La forme générale est ax² + bx + c avec a ≠ 0', 4, 1),
  (1, 'Le discriminant d''une équation du second degré est Δ = b² - 4ac', 'vrai_faux', '["Vrai","Faux"]', 'Vrai', 'C''est la formule du discriminant', 3, 2),
  (1, 'Combien de solutions a une équation du second degré si Δ > 0 ?', 'qcm', '["0","1","2","Une infinité"]', '2', 'Si Δ > 0, il y a deux solutions réelles distinctes', 4, 3),
  (1, 'Calculez les racines de x² - 5x + 6 = 0', 'reponse_courte', NULL, '2 et 3', 'Δ = 25 - 24 = 1, donc x = (5±1)/2 = 2 ou 3', 5, 4),
  (1, 'Que représente le coefficient a dans une fonction du second degré ?', 'qcm', '["L''ordonnée à l''origine","La concavité de la parabole","L''abscisse du sommet","La pente"]', 'La concavité de la parabole', 'Si a > 0 la parabole est tournée vers le haut, si a < 0 vers le bas', 4, 5);

-- ---------- NOTES DE DÉMONSTRATION ----------
INSERT INTO grades (student_id, subject_id, class_id, teacher_id, trimester, academic_year, grade_type, score, max_score, comment) VALUES
  (7, 4, 2, 3, 1, '2024-2025', 'controle', 15.5, 20, 'Bon travail'),
  (7, 4, 2, 3, 1, '2024-2025', 'devoir', 14, 20, 'Continue ainsi'),
  (7, 1, 2, 4, 1, '2024-2025', 'controle', 16, 20, 'Excellent'),
  (7, 2, 2, 5, 1, '2024-2025', 'controle', 13, 20, 'À améliorer en grammaire'),
  (6, 4, 1, 3, 1, '2024-2025', 'controle', 12, 20, 'Effort à fournir'),
  (6, 1, 1, 4, 1, '2024-2025', 'controle', 14, 20, 'Bien');
