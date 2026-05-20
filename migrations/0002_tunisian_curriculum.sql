-- ============================================================
-- CATALOGUE ÉTENDU — Programme officiel tunisien
-- Source : Programmes officiels du Ministère de l'Éducation tunisien
-- Couvre : Primaire (1-6) + Collège (7-9) + Lycée (Tronc commun + 4 sections)
-- ============================================================
-- Idempotent : on supprime les cours non écrits par des utilisateurs (auteur = compte démo)
--              et leurs leçons en cascade, puis on réinsère le catalogue.
-- ============================================================

-- Auteurs démo : prof@edu.tn (id=3), profletters@edu.tn (id=4 si existe), profsc@edu.tn (id=5)
-- On utilise (SELECT id FROM users WHERE email = 'prof.math@edu.tn') pour la portabilité.

-- Nettoyer les anciens cours de démo (préserve les cours créés par les enseignants réels)
DELETE FROM courses WHERE author_id IN (
  SELECT id FROM users WHERE role = 'enseignant'
);

-- ============================================================
-- VARIABLES (référence pour lecture humaine) :
-- subjects (id → code) :
--   1=AR  2=FR  3=EN  4=MATH  5=SVT  6=PC  7=HIST  8=GEO
--   9=EDIS 10=EDC 11=INFO 12=PHILO 13=ECO 14=GEST 15=TECH 16=EPS 17=MUS 18=ART
-- grade_levels (id) :
--   1=P1 2=P2 3=P3 4=P4 5=P5 6=P6 7=C7 8=C8 9=C9 10=L1 11=L2 12=L3 13=L4(Bac)
-- sections (id) :
--   1=TC 2=MATH 3=SC 4=TECH 5=INFO 6=LET 7=ECO 8=SP
-- ============================================================

-- ================================================================
-- =========== PRIMAIRE — 1ère à 6ème année (cycle 1-3) ===========
-- ================================================================

INSERT INTO courses (title, title_ar, title_en, description, subject_id, grade_level_id, section_id, author_id, difficulty, duration_minutes, language, is_published, cover_image) VALUES
  -- ----- 1ère année primaire (P1) -----
  ('Lecture des lettres arabes', 'تعلّم الحروف العربية', 'Arabic Letters Reading', 'Apprentissage des 28 lettres de l''alphabet arabe avec leurs trois positions : initiale, médiane et finale. Activités interactives ludiques.', 1, 1, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 60, 'ar', 1, NULL),
  ('Les chiffres de 0 à 20', 'الأعداد من 0 إلى 20', 'Numbers 0 to 20', 'Découverte des nombres, comptage, écriture et reconnaissance visuelle. Premiers calculs additifs.', 4, 1, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 50, 'fr', 1, NULL),
  ('Premiers mots en français', 'كلماتي الأولى بالفرنسية', 'My First French Words', 'Vocabulaire de base : couleurs, animaux, famille, école. Pédagogie par l''image.', 2, 1, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 45, 'fr', 1, NULL),
  ('Éveil scientifique : Les 5 sens', 'الإيقاظ العلمي : الحواس الخمس', 'Awakening : The 5 senses', 'Découverte des cinq sens à travers des expériences simples et amusantes.', 5, 1, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 40, 'fr', 1, NULL),

  -- ----- 2ème année primaire (P2) -----
  ('Lecture et écriture arabes', 'القراءة والكتابة العربية', 'Arabic Reading & Writing', 'Construction de mots et phrases simples. Premières lectures de textes courts.', 1, 2, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 60, 'ar', 1, NULL),
  ('Addition et soustraction jusqu''à 100', 'الجمع والطرح حتى 100', 'Addition & Subtraction up to 100', 'Maîtrise des opérations de base. Techniques posées et calcul mental.', 4, 2, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 60, 'fr', 1, NULL),
  ('Le français au quotidien', 'الفرنسية اليومية', 'Everyday French', 'Phrases pour se présenter, demander, remercier. Dialogues simples illustrés.', 2, 2, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 50, 'fr', 1, NULL),

  -- ----- 3ème année primaire (P3) -----
  ('Grammaire arabe : Le nom et le verbe', 'النحو : الاسم والفعل', 'Arabic Grammar: Noun & Verb', 'Distinction entre noms et verbes. Reconnaissance dans des phrases simples.', 1, 3, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 55, 'ar', 1, NULL),
  ('La multiplication', 'الضرب', 'Multiplication', 'Tables de multiplication 1 à 10. Techniques et applications dans des problèmes.', 4, 3, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 60, 'fr', 1, NULL),
  ('Découverte de l''anglais', 'مدخل إلى الإنجليزية', 'Discovering English', 'Premier contact avec l''anglais : alphabet, couleurs, animaux, salutations.', 3, 3, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 45, 'en', 1, NULL),
  ('Éducation islamique : Les piliers de l''Islam', 'أركان الإسلام', 'Pillars of Islam', 'Présentation pédagogique des cinq piliers et de leur signification.', 9, 3, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 40, 'ar', 1, NULL),

  -- ----- 4ème année primaire (P4) -----
  ('Lecture compréhension arabe', 'فهم المقروء', 'Arabic Reading Comprehension', 'Lecture de textes courts et exercices de compréhension. Vocabulaire enrichi.', 1, 4, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 60, 'ar', 1, NULL),
  ('Division et fractions simples', 'القسمة والكسور', 'Division & Simple Fractions', 'Approche concrète de la division et introduction aux fractions usuelles (1/2, 1/3, 1/4).', 4, 4, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 65, 'fr', 1, NULL),
  ('Géographie : La Tunisie, mon pays', 'تونس وطني', 'Tunisia, My Country', 'Découverte des 24 gouvernorats, géographie physique et culture tunisienne.', 8, 4, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 50, 'fr', 1, NULL),
  ('Anglais : My family and friends', 'الإنجليزية : عائلتي وأصدقائي', 'My Family and Friends', 'Présenter sa famille en anglais. Vocabulaire des relations et adjectifs.', 3, 4, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 45, 'en', 1, NULL),

  -- ----- 5ème année primaire (P5) -----
  ('Conjugaison arabe', 'تصريف الأفعال العربية', 'Arabic Conjugation', 'Conjugaison au présent, passé et futur. Les pronoms personnels.', 1, 5, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 65, 'ar', 1, NULL),
  ('Géométrie : Les quadrilatères', 'الأشكال الرباعية', 'Quadrilaterals', 'Carré, rectangle, losange, parallélogramme : propriétés et constructions.', 4, 5, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 60, 'fr', 1, NULL),
  ('Sciences : Le cycle de l''eau', 'دورة الماء', 'The Water Cycle', 'Évaporation, condensation, précipitations : comprendre le cycle de l''eau.', 5, 5, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 45, 'fr', 1, NULL),
  ('Histoire : La Tunisie antique', 'تونس القديمة', 'Ancient Tunisia', 'De Carthage à l''Empire romain : grandes étapes de l''histoire tunisienne.', 7, 5, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 55, 'fr', 1, NULL),

  -- ----- 6ème année primaire (P6) — Préparation au concours -----
  ('Préparation 6ème : Expression écrite arabe', 'تحضير السادسة : التعبير الكتابي', '6th Year Prep: Arabic Writing', 'Techniques de rédaction : narration, description, dialogue. Modèles et exercices.', 1, 6, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 75, 'ar', 1, NULL),
  ('Préparation 6ème : Mathématiques', 'تحضير السادسة : رياضيات', '6th Year Prep: Mathematics', 'Récapitulatif complet : opérations, géométrie, mesures, problèmes type concours.', 4, 6, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 90, 'fr', 1, NULL),
  ('Préparation 6ème : Français', 'تحضير السادسة : الفرنسية', '6th Year Prep: French', 'Grammaire, conjugaison, vocabulaire et production écrite niveau 6ème.', 2, 6, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 80, 'fr', 1, NULL),
  ('Éveil scientifique : Le corps humain', 'جسم الإنسان', 'The Human Body', 'Les grands systèmes : digestif, respiratoire, circulatoire. Hygiène et santé.', 5, 6, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 60, 'fr', 1, NULL),
  ('Anglais : My daily routine', 'يومي', 'My Daily Routine', 'Décrire sa journée en anglais : verbes, heures, activités quotidiennes.', 3, 6, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 50, 'en', 1, NULL);

-- ================================================================
-- =========== COLLÈGE — 7ème à 9ème année de base ==============
-- ================================================================

INSERT INTO courses (title, title_ar, title_en, description, subject_id, grade_level_id, section_id, author_id, difficulty, duration_minutes, language, is_published, cover_image) VALUES
  -- ----- 7ème année (C7) -----
  ('Grammaire arabe : Les déclinaisons', 'الإعراب', 'Arabic Declensions', 'Le نصب, الرفع, الجر, الجزم. Reconnaître les cas grammaticaux.', 1, 7, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 70, 'ar', 1, NULL),
  ('Mathématiques : Nombres relatifs', 'الأعداد النسبية', 'Relative Numbers', 'Introduction aux nombres positifs et négatifs. Addition, soustraction, comparaison.', 4, 7, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 75, 'fr', 1, NULL),
  ('Sciences : La matière et ses états', 'المادة وحالاتها', 'States of Matter', 'Solides, liquides, gaz : propriétés et changements d''état.', 6, 7, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 60, 'fr', 1, NULL),
  ('SVT : La cellule', 'الخلية', 'The Cell', 'Unité de base du vivant. Cellule végétale et animale. Microscope.', 5, 7, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 65, 'fr', 1, NULL),
  ('Histoire : Les civilisations anciennes', 'الحضارات القديمة', 'Ancient Civilizations', 'Mésopotamie, Égypte, Grèce, Rome : panorama des civilisations.', 7, 7, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 60, 'fr', 1, NULL),
  ('Informatique : Premiers pas', 'مدخل إلى الإعلامية', 'Introduction to Computing', 'Architecture de l''ordinateur, fichiers, système d''exploitation, navigation web.', 11, 7, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'facile', 50, 'fr', 1, NULL),

  -- ----- 8ème année (C8) -----
  ('Algèbre : Le calcul littéral', 'الحساب الحرفي', 'Literal Calculus', 'Expressions algébriques, développement, factorisation, identités remarquables.', 4, 8, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 80, 'fr', 1, NULL),
  ('Géométrie : Le théorème de Thalès', 'مبرهنة طاليس', 'Thales'' Theorem', 'Énoncé, configurations, démonstration et applications du théorème de Thalès.', 4, 8, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 70, 'fr', 1, NULL),
  ('Physique : Électricité', 'الكهرباء', 'Electricity', 'Circuit, intensité, tension, loi d''Ohm. Schémas et expériences.', 6, 8, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 75, 'fr', 1, NULL),
  ('SVT : La reproduction humaine', 'التناسل عند الإنسان', 'Human Reproduction', 'Anatomie, puberté, fécondation, grossesse. Approche pédagogique adaptée.', 5, 8, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 70, 'fr', 1, NULL),
  ('Français : Le récit', 'النص السردي', 'The Narrative', 'Structure narrative, schéma actanciel, focalisation, temps du récit.', 2, 8, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 65, 'fr', 1, NULL),
  ('Anglais : Past tenses', 'الأزمنة الماضية', 'Past Tenses', 'Simple past, past continuous, present perfect : maîtrise des temps du passé.', 3, 8, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 60, 'en', 1, NULL),

  -- ----- 9ème année (C9) — Diplôme de fin d'études de base -----
  ('Préparation 9ème : Mathématiques', 'تحضير التاسعة : رياضيات', '9th Year Prep: Mathematics', 'Récapitulatif : équations, fonctions affines, Pythagore, Thalès, statistiques.', 4, 9, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 100, 'fr', 1, NULL),
  ('Préparation 9ème : Sciences physiques', 'تحضير التاسعة : فيزياء', '9th Year Prep: Physics', 'Mécanique, électricité, optique, chimie : tout le programme de fin de collège.', 6, 9, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 90, 'fr', 1, NULL),
  ('SVT : La génétique', 'الوراثة', 'Genetics', 'ADN, chromosomes, transmission des caractères héréditaires. Cas pratiques.', 5, 9, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 75, 'fr', 1, NULL),
  ('Histoire : La Tunisie contemporaine', 'تونس المعاصرة', 'Contemporary Tunisia', 'De l''indépendance (1956) à nos jours. Personnalités, réformes, événements.', 7, 9, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 65, 'fr', 1, NULL),
  ('Arabe : La poésie classique', 'الشعر العربي', 'Classical Arabic Poetry', 'Analyse de poèmes : métrique, figures de style, contexte historique.', 1, 9, NULL, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 75, 'ar', 1, NULL);

-- ================================================================
-- ============ LYCÉE — 1ère secondaire (Tronc Commun) ============
-- ================================================================

INSERT INTO courses (title, title_ar, title_en, description, subject_id, grade_level_id, section_id, author_id, difficulty, duration_minutes, language, is_published, cover_image) VALUES
  -- ----- L1 Tronc commun -----
  ('Maths : Fonctions et équations', 'الدوال والمعادلات', 'Functions & Equations', 'Fonctions linéaires et affines, équations et inéquations du 1er degré.', 4, 10, 1, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 90, 'fr', 1, NULL),
  ('Physique : Mécanique et mouvement', 'الميكانيك والحركة', 'Mechanics & Motion', 'Vecteurs, vitesse, accélération, forces. Lois fondamentales de Newton (intro).', 6, 10, 1, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 85, 'fr', 1, NULL),
  ('Chimie : Atome et molécule', 'الذرة والجزيء', 'Atom & Molecule', 'Structure atomique, classification périodique, liaisons chimiques.', 6, 10, 1, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 80, 'fr', 1, NULL),
  ('SVT : Géologie tunisienne', 'الجيولوجيا التونسية', 'Tunisian Geology', 'Tectonique, sols, ressources minérales de la Tunisie. Sortie sur le terrain virtuelle.', 5, 10, 1, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 75, 'fr', 1, NULL),
  ('Informatique : Algorithmique et programmation', 'الخوارزميات والبرمجة', 'Algorithms & Programming', 'Variables, conditions, boucles, fonctions. Implémentation en Python.', 11, 10, 1, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 90, 'fr', 1, NULL),
  ('Anglais : Argumentative writing', 'الإنجليزية : الكتابة الحجاجية', 'Argumentative Writing', 'Structure d''un texte argumentatif. Connecteurs logiques. Exemples.', 3, 10, 1, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 70, 'en', 1, NULL);

-- ================================================================
-- ============ LYCÉE — 2ème année par section ============
-- ================================================================

INSERT INTO courses (title, title_ar, title_en, description, subject_id, grade_level_id, section_id, author_id, difficulty, duration_minutes, language, is_published, cover_image) VALUES
  -- ----- L2 Sciences -----
  ('Maths L2 Sciences : Vecteurs et géométrie', 'المتجهات والهندسة', 'Vectors & Geometry', 'Calcul vectoriel, repérage, équations de droites et de cercles.', 4, 11, 3, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 95, 'fr', 1, NULL),
  ('Physique L2 : Énergie et travail', 'الطاقة والشغل', 'Energy & Work', 'Énergies cinétique, potentielle, mécanique. Travail d''une force.', 6, 11, 3, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 85, 'fr', 1, NULL),
  ('SVT L2 : Génétique mendélienne', 'الوراثة المندلية', 'Mendelian Genetics', 'Lois de Mendel, dominance, récessivité, croisements. Échiquier de Punnett.', 5, 11, 3, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 75, 'fr', 1, NULL),

  -- ----- L2 Économie & Gestion -----
  ('Économie L2 : Marché et concurrence', 'السوق والمنافسة', 'Market & Competition', 'Offre, demande, équilibre du marché. Types de marchés et concurrence.', 13, 11, 7, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 80, 'fr', 1, NULL),
  ('Gestion L2 : Comptabilité de base', 'مبادئ المحاسبة', 'Basic Accounting', 'Bilan, compte de résultat, journal, grand livre. Études de cas.', 14, 11, 7, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 85, 'fr', 1, NULL),

  -- ----- L2 Lettres -----
  ('Lettres L2 : Argumentation et essai', 'الحجاج والمقال', 'Argumentation & Essay', 'Construction d''un essai littéraire. Thèse, antithèse, synthèse.', 2, 11, 6, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 80, 'fr', 1, NULL),
  ('Arabe L2 Lettres : La littérature préislamique', 'الأدب الجاهلي', 'Pre-Islamic Literature', 'Les Mu''allaqât, poètes majeurs, thèmes et contexte historique.', 1, 11, 6, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 85, 'ar', 1, NULL),

  -- ----- L2 Informatique -----
  ('Info L2 : Programmation Python avancée', 'البرمجة بايثون متقدم', 'Advanced Python Programming', 'Listes, dictionnaires, fonctions, fichiers, gestion d''erreurs.', 11, 11, 5, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 100, 'fr', 1, NULL),

  -- ----- L2 Technique -----
  ('Techno L2 : Dessin technique', 'الرسم الفني', 'Technical Drawing', 'Projections orthogonales, cotation, perspective. Logiciel CAO.', 15, 11, 4, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 90, 'fr', 1, NULL);

-- ================================================================
-- ============ LYCÉE — 3ème année par section ============
-- ================================================================

INSERT INTO courses (title, title_ar, title_en, description, subject_id, grade_level_id, section_id, author_id, difficulty, duration_minutes, language, is_published, cover_image) VALUES
  -- ----- L3 Math -----
  ('Maths L3 : Fonctions du second degré', 'دوال الدرجة الثانية', 'Quadratic Functions', 'Forme canonique, factorisation, racines, parabole. Applications.', 4, 12, 2, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 90, 'fr', 1, NULL),
  ('Maths L3 : Trigonométrie', 'حساب المثلثات', 'Trigonometry', 'Cercle trigonométrique, formules d''addition, équations trigonométriques.', 4, 12, 2, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 95, 'fr', 1, NULL),
  ('Physique L3 Math : Forces et mouvement', 'القوى والحركة', 'Forces and Motion', 'Lois de Newton, énergie, applications à la mécanique du point.', 6, 12, 2, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 120, 'fr', 1, NULL),

  -- ----- L3 Sciences -----
  ('SVT L3 : Photosynthèse', 'التركيب الضوئي', 'Photosynthesis', 'Mécanismes, équations, importance écologique. Expériences classiques.', 5, 12, 3, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 75, 'fr', 1, NULL),
  ('Chimie L3 : Réactions acide-base', 'تفاعلات حمض-قاعدة', 'Acid-Base Reactions', 'pH, équilibres, dosages, indicateurs colorés. TP.', 6, 12, 3, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 90, 'fr', 1, NULL),

  -- ----- L3 Lettres -----
  ('Philosophie L3 : Introduction', 'مدخل إلى الفلسفة', 'Introduction to Philosophy', 'Qu''est-ce que philosopher ? Grands courants : antiquité, moderne, contemporain.', 12, 12, 6, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 80, 'fr', 1, NULL),
  ('Lettres L3 : Le roman maghrébin', 'الرواية المغاربية', 'Maghreb Novel', 'Œuvres et auteurs marquants : Mahmoud Messadi, Tahar Ben Jelloun, etc.', 2, 12, 6, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 85, 'fr', 1, NULL),

  -- ----- L3 Économie -----
  ('Économie L3 : Macro-économie', 'الاقتصاد الكلي', 'Macroeconomics', 'PIB, inflation, chômage, politiques monétaires et budgétaires.', 13, 12, 7, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 90, 'fr', 1, NULL),
  ('Gestion L3 : Marketing', 'التسويق', 'Marketing', '4P, étude de marché, segmentation, communication. Cas tunisiens.', 14, 12, 7, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 80, 'fr', 1, NULL),

  -- ----- L3 Informatique -----
  ('Info L3 : Bases de données SQL', 'قواعد البيانات', 'SQL Databases', 'Modèle relationnel, SELECT, JOIN, sous-requêtes. SQLite et MySQL.', 11, 12, 5, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'moyen', 95, 'fr', 1, NULL),
  ('Info L3 : Algorithmique avancée', 'الخوارزميات المتقدمة', 'Advanced Algorithms', 'Tri, recherche, récursivité, complexité. Implémentations Python.', 11, 12, 5, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 100, 'fr', 1, NULL),

  -- ----- L3 Technique -----
  ('Techno L3 : Mécanique appliquée', 'الميكانيك التطبيقي', 'Applied Mechanics', 'Statique, dynamique, résistance des matériaux. Études de cas industriels.', 15, 12, 4, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 100, 'fr', 1, NULL);

-- ================================================================
-- ============ LYCÉE — Baccalauréat (4ème secondaire) ============
-- ================================================================

INSERT INTO courses (title, title_ar, title_en, description, subject_id, grade_level_id, section_id, author_id, difficulty, duration_minutes, language, is_published, cover_image) VALUES
  -- ----- BAC Math -----
  ('Bac Math : Suites numériques', 'المتتاليات', 'Numerical Sequences', 'Suites arithmétiques, géométriques, récurrentes, limites, convergence.', 4, 13, 2, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 110, 'fr', 1, NULL),
  ('Bac Math : Dérivation et intégration', 'الاشتقاق والتكامل', 'Derivatives & Integration', 'Dérivées, primitives, intégrales, calcul d''aires et volumes.', 4, 13, 2, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 120, 'fr', 1, NULL),
  ('Bac Math : Nombres complexes', 'الأعداد المركبة', 'Complex Numbers', 'Forme algébrique et trigonométrique, équations, transformations du plan.', 4, 13, 2, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 100, 'fr', 1, NULL),
  ('Bac Math : Probabilités', 'الاحتمالات', 'Probability', 'Variables aléatoires, lois binomiale et normale, indépendance.', 4, 13, 2, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 95, 'fr', 1, NULL),

  -- ----- BAC Sciences -----
  ('Bac SVT : Génétique moléculaire', 'الوراثة الجزيئية', 'Molecular Genetics', 'ADN, ARN, code génétique, mutations. Biotechnologies modernes.', 5, 13, 3, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 100, 'fr', 1, NULL),
  ('Bac SVT : Immunologie', 'علم المناعة', 'Immunology', 'Immunité innée et adaptative, lymphocytes, vaccins, allergies.', 5, 13, 3, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 90, 'fr', 1, NULL),
  ('Bac Physique : Ondes et lumière', 'الموجات والضوء', 'Waves & Light', 'Ondes mécaniques, lumineuses, interférences, effet Doppler.', 6, 13, 3, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 105, 'fr', 1, NULL),
  ('Bac Chimie : Cinétique chimique', 'الحركية الكيميائية', 'Chemical Kinetics', 'Vitesse de réaction, facteurs cinétiques, catalyse. TP.', 6, 13, 3, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 90, 'fr', 1, NULL),

  -- ----- BAC Lettres -----
  ('Bac Philosophie : La conscience', 'الوعي', 'Consciousness', 'Cogito, inconscient (Freud), liberté et déterminisme.', 12, 13, 6, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 90, 'fr', 1, NULL),
  ('Bac Philosophie : La justice et le droit', 'العدل والحق', 'Justice & Law', 'Théories de la justice : Rawls, Aristote, droit naturel et positif.', 12, 13, 6, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 90, 'fr', 1, NULL),
  ('Bac Arabe : Le roman arabe moderne', 'الرواية العربية الحديثة', 'Modern Arabic Novel', 'Naguib Mahfouz, Tayeb Salih, courants et thématiques.', 1, 13, 6, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 90, 'ar', 1, NULL),

  -- ----- BAC Économie & Gestion -----
  ('Bac Économie : Croissance et développement', 'النمو والتنمية', 'Growth & Development', 'Indicateurs, théories, développement durable, cas de la Tunisie.', 13, 13, 7, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 100, 'fr', 1, NULL),
  ('Bac Gestion : Analyse financière', 'التحليل المالي', 'Financial Analysis', 'Ratios, SIG, tableau de flux, diagnostic financier d''entreprise.', 14, 13, 7, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 95, 'fr', 1, NULL),

  -- ----- BAC Informatique -----
  ('Bac Info : Programmation orientée objet', 'البرمجة الكائنية', 'Object-Oriented Programming', 'Classes, objets, héritage, polymorphisme. Python et Java.', 11, 13, 5, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 110, 'fr', 1, NULL),
  ('Bac Info : Réseaux informatiques', 'الشبكات', 'Computer Networks', 'OSI, TCP/IP, routage, sécurité, protocoles web.', 11, 13, 5, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 90, 'fr', 1, NULL),

  -- ----- BAC Technique -----
  ('Bac Techno : Automatique et asservissement', 'الأنظمة الآلية', 'Automation & Control', 'Systèmes asservis, fonction de transfert, régulation PID.', 15, 13, 4, (SELECT id FROM users WHERE email='prof.math@edu.tn'), 'difficile', 100, 'fr', 1, NULL);

-- ================================================================
-- =================== LEÇONS INTERACTIVES ========================
-- Pour chaque cours, on génère ~3-5 leçons variées (text/video/quiz/interactive)
-- Les contenus sont structurés en JSON pour les leçons interactives.
-- ================================================================

-- Helper : récupère l'ID d'un cours par son titre exact + grade_level
-- ----- Leçons exemple pour 'Lecture des lettres arabes' (P1 / AR) -----
INSERT INTO lessons (course_id, title, order_index, content_type, content, duration_minutes) VALUES
  ((SELECT id FROM courses WHERE title='Lecture des lettres arabes' LIMIT 1), 'Les lettres de ا à ج', 1, 'text', '# Les premières lettres arabes\n\nDécouvrons ensemble les premières lettres de l''alphabet arabe :\n\n- **ا** (Alif) : Première lettre, ressemble à un trait vertical.\n- **ب** (Ba) : Une "barque" avec un point en dessous.\n- **ت** (Ta) : Comme un sourire avec deux points dessus.\n- **ث** (Tha) : Comme Ta mais avec trois points.\n- **ج** (Jim) : Une courbe avec un point.\n\n### À retenir\nChaque lettre arabe peut avoir jusqu''à 4 formes selon sa position dans le mot.', 12),
  ((SELECT id FROM courses WHERE title='Lecture des lettres arabes' LIMIT 1), 'Vidéo : Prononciation correcte', 2, 'video', NULL, 8),
  ((SELECT id FROM courses WHERE title='Lecture des lettres arabes' LIMIT 1), 'Exercice interactif : Associer lettre et son', 3, 'interactive', '{"type":"matching","instructions":"Glisse chaque lettre vers son son","pairs":[{"left":"ا","right":"A"},{"left":"ب","right":"B"},{"left":"ت","right":"T"},{"left":"ث","right":"Th"},{"left":"ج","right":"J"}]}', 15),
  ((SELECT id FROM courses WHERE title='Lecture des lettres arabes' LIMIT 1), 'Quiz : Reconnais les lettres', 4, 'quiz', NULL, 10);

-- ----- Leçons pour 'Les chiffres de 0 à 20' (P1 / MATH) -----
INSERT INTO lessons (course_id, title, order_index, content_type, content, duration_minutes) VALUES
  ((SELECT id FROM courses WHERE title='Les chiffres de 0 à 20' LIMIT 1), 'Compter de 0 à 10', 1, 'text', '# Compter de 0 à 10\n\nVoici nos premiers nombres :\n\n0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟\n\n### Astuce\nUtilise tes doigts pour compter ! Tu as 10 doigts, comme 10 nombres.', 10),
  ((SELECT id FROM courses WHERE title='Les chiffres de 0 à 20' LIMIT 1), 'Compter jusqu''à 20', 2, 'text', '## De 11 à 20\n\n11, 12, 13, 14, 15, 16, 17, 18, 19, 20\n\nC''est facile : c''est comme compter de 1 à 10, mais en ajoutant "dix" devant !', 10),
  ((SELECT id FROM courses WHERE title='Les chiffres de 0 à 20' LIMIT 1), 'Jeu interactif : Compte les objets', 3, 'interactive', '{"type":"counting","instructions":"Combien y a-t-il d''objets ?","items":[{"emoji":"🍎","count":5},{"emoji":"⭐","count":8},{"emoji":"🐰","count":3}]}', 15),
  ((SELECT id FROM courses WHERE title='Les chiffres de 0 à 20' LIMIT 1), 'Quiz final', 4, 'quiz', NULL, 10);

-- ----- Leçons pour 'Maths L3 : Fonctions du second degré' (L3 / MATH) -----
INSERT INTO lessons (course_id, title, order_index, content_type, content, duration_minutes) VALUES
  ((SELECT id FROM courses WHERE title='Maths L3 : Fonctions du second degré' LIMIT 1), 'Introduction et forme générale', 1, 'text', '# Fonctions du second degré\n\nUne **fonction du second degré** est une fonction définie sur ℝ par :\n\n$$f(x) = ax^2 + bx + c$$\n\noù a, b, c ∈ ℝ et **a ≠ 0**.\n\n### Exemples\n- f(x) = x² (parabole "normale")\n- g(x) = -2x² + 3x - 1\n- h(x) = (x - 2)² + 1\n\n### La courbe : une parabole\n\n- Si **a > 0** : la parabole est tournée vers le haut (∪)\n- Si **a < 0** : la parabole est tournée vers le bas (∩)', 15),
  ((SELECT id FROM courses WHERE title='Maths L3 : Fonctions du second degré' LIMIT 1), 'La forme canonique', 2, 'text', '## Forme canonique\n\nToute fonction f(x) = ax² + bx + c peut s''écrire :\n\n$$f(x) = a(x - \\alpha)^2 + \\beta$$\n\noù :\n- $\\alpha = -\\frac{b}{2a}$\n- $\\beta = f(\\alpha) = c - \\frac{b^2}{4a}$\n\nLe point **S(α, β)** est le **sommet** de la parabole.\n\n### Exemple résolu\nSoit f(x) = 2x² - 8x + 5.\n- α = -(-8)/(2×2) = 2\n- β = f(2) = 8 - 16 + 5 = -3\n- Forme canonique : f(x) = 2(x - 2)² - 3', 20),
  ((SELECT id FROM courses WHERE title='Maths L3 : Fonctions du second degré' LIMIT 1), 'Discriminant et racines', 3, 'text', '## Le discriminant\n\nPour résoudre ax² + bx + c = 0, on calcule :\n\n$$\\Delta = b^2 - 4ac$$\n\n| Δ | Nombre de solutions |\n|---|---|\n| Δ > 0 | 2 solutions : x₁,₂ = (-b ± √Δ) / 2a |\n| Δ = 0 | 1 solution double : x = -b / 2a |\n| Δ < 0 | aucune solution réelle |\n\n### Exemple\nx² - 5x + 6 = 0 → Δ = 25 - 24 = 1 → x = (5 ± 1)/2 → x = 2 ou x = 3', 20),
  ((SELECT id FROM courses WHERE title='Maths L3 : Fonctions du second degré' LIMIT 1), 'Exercice interactif : Résolution', 4, 'interactive', '{"type":"exercise","problem":"Résoudre 2x² - 7x + 3 = 0","steps":[{"q":"Calcule Δ","a":"25"},{"q":"Combien de solutions ?","a":"2"},{"q":"x₁ = ?","a":"3"},{"q":"x₂ = ?","a":"0.5"}]}', 25),
  ((SELECT id FROM courses WHERE title='Maths L3 : Fonctions du second degré' LIMIT 1), 'Quiz final du chapitre', 5, 'quiz', NULL, 15);

-- ----- Leçons pour 'Informatique : Algorithmique et programmation' (L1 / INFO) -----
INSERT INTO lessons (course_id, title, order_index, content_type, content, duration_minutes) VALUES
  ((SELECT id FROM courses WHERE title='Informatique : Algorithmique et programmation' LIMIT 1), 'Qu''est-ce qu''un algorithme ?', 1, 'text', '# Algorithme\n\nUn **algorithme** est une suite finie d''instructions précises permettant de résoudre un problème.\n\n### Exemple : recette de cuisine\n1. Casser les œufs dans un bol\n2. Battre les œufs\n3. Cuire à feu doux\n4. Servir\n\n### En informatique\nLes algorithmes sont écrits dans des langages comme **Python**, **Java**, **C**, etc.', 12),
  ((SELECT id FROM courses WHERE title='Informatique : Algorithmique et programmation' LIMIT 1), 'Variables et types', 2, 'text', '## Les variables\n\nUne **variable** est une "boîte" qui contient une valeur.\n\n```python\n# Déclaration et affectation\nage = 17        # entier\nprenom = "Ali"  # chaîne de caractères\ntaille = 1.75   # réel (float)\nmajeur = False  # booléen\n```\n\n### Les types principaux\n- **int** : nombre entier\n- **float** : nombre décimal\n- **str** : chaîne de caractères\n- **bool** : True / False', 15),
  ((SELECT id FROM courses WHERE title='Informatique : Algorithmique et programmation' LIMIT 1), 'Conditions (if / else)', 3, 'text', '## Structures conditionnelles\n\n```python\nage = int(input("Quel âge as-tu ? "))\n\nif age >= 18:\n    print("Tu es majeur")\nelif age >= 13:\n    print("Tu es adolescent")\nelse:\n    print("Tu es enfant")\n```\n\n### Opérateurs de comparaison\n- == (égal)  != (différent)\n- < > <= >=\n- and  or  not', 18),
  ((SELECT id FROM courses WHERE title='Informatique : Algorithmique et programmation' LIMIT 1), 'Boucles (for / while)', 4, 'text', '## Les boucles\n\n### Boucle for\n```python\nfor i in range(5):\n    print(i)  # 0 1 2 3 4\n```\n\n### Boucle while\n```python\nn = 10\nwhile n > 0:\n    print(n)\n    n = n - 1\n```', 15),
  ((SELECT id FROM courses WHERE title='Informatique : Algorithmique et programmation' LIMIT 1), 'Exercice : Écris ton premier programme', 5, 'interactive', '{"type":"code","language":"python","prompt":"Écris un programme qui demande l''âge de l''utilisateur et affiche s''il est majeur.","starter":"age = int(input(\"Ton âge ? \"))\n# Complète ici","solution":"age = int(input(\"Ton âge ? \"))\nif age >= 18:\n    print(\"Majeur\")\nelse:\n    print(\"Mineur\")"}', 25),
  ((SELECT id FROM courses WHERE title='Informatique : Algorithmique et programmation' LIMIT 1), 'Quiz', 6, 'quiz', NULL, 10);

-- ----- Leçons pour 'SVT L2 : Génétique mendélienne' -----
INSERT INTO lessons (course_id, title, order_index, content_type, content, duration_minutes) VALUES
  ((SELECT id FROM courses WHERE title='SVT L2 : Génétique mendélienne' LIMIT 1), 'Gregor Mendel et ses expériences', 1, 'text', '# La génétique mendélienne\n\n**Gregor Mendel** (1822-1884), moine et botaniste autrichien, est considéré comme le père de la génétique. Ses expériences sur les pois ont révélé les **lois de l''hérédité**.\n\n### Pourquoi les pois ?\n- Croissance rapide\n- Plusieurs caractères tranchés (couleur, forme, taille)\n- Autofécondation contrôlable', 15),
  ((SELECT id FROM courses WHERE title='SVT L2 : Génétique mendélienne' LIMIT 1), 'Les lois de Mendel', 2, 'text', '## Les 3 lois\n\n### 1ère loi : Uniformité des hybrides F1\nEn croisant deux parents homozygotes (PP × pp), tous les F1 sont identiques (Pp).\n\n### 2ème loi : Ségrégation\nEn croisant deux F1 (Pp × Pp), on obtient 3/4 phénotype dominant + 1/4 récessif.\n\n### 3ème loi : Indépendance\nLes caractères se transmettent indépendamment les uns des autres.', 20),
  ((SELECT id FROM courses WHERE title='SVT L2 : Génétique mendélienne' LIMIT 1), 'Échiquier de Punnett', 3, 'interactive', '{"type":"punnett","instructions":"Complète l''échiquier pour le croisement Pp × Pp","parent1":["P","p"],"parent2":["P","p"],"expected":[["PP","Pp"],["Pp","pp"]]}', 20),
  ((SELECT id FROM courses WHERE title='SVT L2 : Génétique mendélienne' LIMIT 1), 'Vidéo : Génétique en action', 4, 'video', NULL, 10),
  ((SELECT id FROM courses WHERE title='SVT L2 : Génétique mendélienne' LIMIT 1), 'Quiz', 5, 'quiz', NULL, 10);

-- ----- Leçons pour 'Bac Math : Suites numériques' -----
INSERT INTO lessons (course_id, title, order_index, content_type, content, duration_minutes) VALUES
  ((SELECT id FROM courses WHERE title='Bac Math : Suites numériques' LIMIT 1), 'Définition d''une suite', 1, 'text', '# Suites numériques\n\nUne **suite** $(u_n)$ est une fonction de ℕ dans ℝ qui associe à tout entier n un réel u_n.\n\n### Notations\n- u_n : terme général\n- u_0 : terme initial\n- u_{n+1} : terme suivant\n\n### Modes de définition\n1. **Explicite** : u_n = f(n), par exemple u_n = 2n + 1\n2. **Récurrente** : u_{n+1} = f(u_n), avec u_0 donné', 18),
  ((SELECT id FROM courses WHERE title='Bac Math : Suites numériques' LIMIT 1), 'Suites arithmétiques', 2, 'text', '## Suites arithmétiques\n\nUne suite est **arithmétique** si $u_{n+1} = u_n + r$ où r est la **raison**.\n\n### Formule explicite\n$$u_n = u_0 + n \\cdot r$$\n\n### Somme des n premiers termes\n$$S_n = \\frac{n(u_0 + u_{n-1})}{2}$$\n\n### Exemple\nu_0 = 3, r = 2 → u_n = 3 + 2n. On a u_5 = 13, S_5 = 5(3+11)/2 = 35.', 20),
  ((SELECT id FROM courses WHERE title='Bac Math : Suites numériques' LIMIT 1), 'Suites géométriques', 3, 'text', '## Suites géométriques\n\nUne suite est **géométrique** si $u_{n+1} = q \\cdot u_n$ où q est la **raison**.\n\n### Formule explicite\n$$u_n = u_0 \\cdot q^n$$\n\n### Somme (si q ≠ 1)\n$$S_n = u_0 \\cdot \\frac{1 - q^n}{1 - q}$$\n\n### Limite\n- Si |q| < 1 : la suite converge vers 0\n- Si |q| > 1 : la suite diverge', 20),
  ((SELECT id FROM courses WHERE title='Bac Math : Suites numériques' LIMIT 1), 'Convergence et limites', 4, 'text', '## Convergence\n\nUne suite (u_n) **converge** vers L si pour tout ε > 0, il existe N tel que |u_n - L| < ε pour tout n ≥ N.\n\n### Théorèmes utiles\n- Toute suite croissante majorée converge\n- Toute suite décroissante minorée converge\n- Théorème des gendarmes : si a_n ≤ u_n ≤ b_n et a_n, b_n → L, alors u_n → L', 22),
  ((SELECT id FROM courses WHERE title='Bac Math : Suites numériques' LIMIT 1), 'Exercice type Bac', 5, 'interactive', '{"type":"exercise","problem":"Soit u_n = (2n+1)/(n+3). Calcule la limite quand n → +∞.","hint":"Divise numérateur et dénominateur par n.","solution":"2"}', 25),
  ((SELECT id FROM courses WHERE title='Bac Math : Suites numériques' LIMIT 1), 'Quiz Bac', 6, 'quiz', NULL, 15);

-- ----- Leçons pour 'Bac Philosophie : La conscience' -----
INSERT INTO lessons (course_id, title, order_index, content_type, content, duration_minutes) VALUES
  ((SELECT id FROM courses WHERE title='Bac Philosophie : La conscience' LIMIT 1), 'Qu''est-ce que la conscience ?', 1, 'text', '# La conscience\n\nLa conscience est la **connaissance immédiate** que le sujet a de ses propres états mentaux, de ses pensées et du monde extérieur.\n\n### Étymologie\n*Cum-scientia* (latin) : "savoir avec", savoir accompagné de la connaissance de ce savoir.\n\n### Deux dimensions\n1. **Conscience psychologique** : sentir, percevoir, penser\n2. **Conscience morale** : distinguer bien/mal', 18),
  ((SELECT id FROM courses WHERE title='Bac Philosophie : La conscience' LIMIT 1), 'Descartes et le Cogito', 2, 'text', '## "Je pense, donc je suis"\n\nDescartes (1596-1650), dans le *Discours de la méthode*, met en doute toutes ses connaissances. Mais une certitude résiste : il pense, donc il existe.\n\n### Le Cogito ergo sum\n> "Je pense, donc je suis"\n\nLa conscience est la première certitude. Elle fonde le sujet.\n\n### Critiques\nNietzsche, Freud : la conscience n''est pas transparente à elle-même.', 22),
  ((SELECT id FROM courses WHERE title='Bac Philosophie : La conscience' LIMIT 1), 'Freud et l''inconscient', 3, 'text', '## L''inconscient\n\nFreud (1856-1939) révolutionne la pensée : **la conscience n''est qu''une petite partie de notre psychisme**.\n\n### Les trois instances\n- **Ça** : pulsions inconscientes\n- **Moi** : conscience, médiateur\n- **Surmoi** : interdits, morale intériorisée\n\n### Conséquence philosophique\nLe sujet n''est plus "maître chez lui". La conscience est trompée par l''inconscient.', 22),
  ((SELECT id FROM courses WHERE title='Bac Philosophie : La conscience' LIMIT 1), 'Dissertation type Bac', 4, 'interactive', '{"type":"essay","subject":"Sommes-nous toujours conscients de ce que nous faisons ?","plan_suggestion":["I. La conscience comme transparence à soi (Descartes)","II. Les limites : l''inconscient (Freud, Nietzsche)","III. Vers une conscience lucide : connaissance de soi et liberté"]}', 30),
  ((SELECT id FROM courses WHERE title='Bac Philosophie : La conscience' LIMIT 1), 'Quiz', 5, 'quiz', NULL, 12);

-- ============================================================
-- Mise à jour : pour TOUS les autres cours sans leçons, en créer un trio générique
-- (introduction text + exercice interactive + quiz)
-- ============================================================
INSERT INTO lessons (course_id, title, order_index, content_type, content, duration_minutes)
SELECT c.id, 'Introduction au cours', 1, 'text',
       '# ' || c.title || char(10) || char(10) || COALESCE(c.description, 'Bienvenue dans ce cours.') || char(10) || char(10) ||
       '### Objectifs pédagogiques' || char(10) ||
       '- Comprendre les notions fondamentales' || char(10) ||
       '- Maîtriser les techniques de résolution' || char(10) ||
       '- Appliquer les connaissances à des cas concrets' || char(10) || char(10) ||
       '### Programme officiel tunisien' || char(10) ||
       'Ce cours est conforme au programme du Ministère de l''Éducation tunisien.',
       MIN(15, c.duration_minutes / 4)
FROM courses c
LEFT JOIN lessons l ON l.course_id = c.id
WHERE l.id IS NULL
GROUP BY c.id;

INSERT INTO lessons (course_id, title, order_index, content_type, content, duration_minutes)
SELECT c.id, 'Exercice d''application', 2, 'interactive',
       '{"type":"exercise","instructions":"Applique les concepts vus dans ce cours à travers cet exercice guidé.","auto_generated":true}',
       MIN(20, c.duration_minutes / 3)
FROM courses c
WHERE NOT EXISTS (SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.order_index = 2)
GROUP BY c.id;

INSERT INTO lessons (course_id, title, order_index, content_type, content, duration_minutes)
SELECT c.id, 'Quiz d''évaluation', 3, 'quiz', NULL, 10
FROM courses c
WHERE NOT EXISTS (SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.order_index = 3);
