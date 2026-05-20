import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, hasRole } from '../utils/auth';

export const coursesRoutes = new Hono<{ Bindings: Bindings }>();

// ---------- LISTE DES COURS ----------
coursesRoutes.get('/', async (c) => {
  const subjectId = c.req.query('subject_id');
  const gradeId = c.req.query('grade_level_id');
  const sectionId = c.req.query('section_id');
  const search = c.req.query('search');
  const published = c.req.query('published') !== 'false';

  let query = `
    SELECT c.*, s.name_fr as subject_name, s.name_ar as subject_name_ar, s.color as subject_color, s.icon as subject_icon,
           g.name_fr as grade_name, g.name_ar as grade_name_ar,
           u.first_name || ' ' || u.last_name as author_name,
           (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessons_count
    FROM courses c
    LEFT JOIN subjects s ON s.id = c.subject_id
    LEFT JOIN grade_levels g ON g.id = c.grade_level_id
    LEFT JOIN users u ON u.id = c.author_id
    WHERE 1=1`;
  const params: any[] = [];

  if (published) {
    query += ' AND c.is_published = 1';
  }
  if (subjectId) {
    query += ' AND c.subject_id = ?';
    params.push(subjectId);
  }
  if (gradeId) {
    query += ' AND c.grade_level_id = ?';
    params.push(gradeId);
  }
  if (sectionId) {
    query += ' AND (c.section_id = ? OR c.section_id IS NULL)';
    params.push(sectionId);
  }
  if (search) {
    query += ' AND (c.title LIKE ? OR c.description LIKE ? OR c.title_ar LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY c.created_at DESC LIMIT 100';

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results });
});

// ---------- DÉTAIL D'UN COURS ----------
coursesRoutes.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const course = await c.env.DB.prepare(
    `SELECT c.*, s.name_fr as subject_name, s.color as subject_color, s.icon as subject_icon,
            g.name_fr as grade_name,
            u.first_name || ' ' || u.last_name as author_name
     FROM courses c
     LEFT JOIN subjects s ON s.id = c.subject_id
     LEFT JOIN grade_levels g ON g.id = c.grade_level_id
     LEFT JOIN users u ON u.id = c.author_id
     WHERE c.id = ?`
  )
    .bind(id)
    .first();
  if (!course) {
    return c.json({ success: false, error: 'Cours introuvable' }, 404);
  }
  const { results: lessons } = await c.env.DB.prepare(
    'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index'
  )
    .bind(id)
    .all();

  // Incrémente le compteur de vues
  await c.env.DB.prepare('UPDATE courses SET views_count = views_count + 1 WHERE id = ?')
    .bind(id)
    .run();

  return c.json({ success: true, data: { ...course, lessons } });
});

// ---------- CRÉER UN COURS ----------
coursesRoutes.post('/', async (c) => {
  const user = await requireAuth(c);
  if (!hasRole(user, 'enseignant', 'admin_ecole', 'ministere')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }

  const body = await c.req.json<any>();
  const {
    title,
    title_ar,
    title_en,
    description,
    subject_id,
    grade_level_id,
    section_id,
    cover_image,
    difficulty,
    duration_minutes,
    language,
    is_published
  } = body;

  if (!title || !subject_id || !grade_level_id) {
    return c.json({ success: false, error: 'Champs requis manquants' }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO courses (title, title_ar, title_en, description, subject_id, grade_level_id, section_id, author_id, cover_image, difficulty, duration_minutes, language, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      title,
      title_ar || null,
      title_en || null,
      description || null,
      subject_id,
      grade_level_id,
      section_id || null,
      user!.id,
      cover_image || null,
      difficulty || 'moyen',
      duration_minutes || 0,
      language || 'fr',
      is_published ? 1 : 0
    )
    .run();

  const courseId = result.meta.last_row_id;
  const course = await c.env.DB.prepare('SELECT * FROM courses WHERE id = ?')
    .bind(courseId)
    .first();
  return c.json({ success: true, data: course });
});

// ---------- CRÉER UN COURS COMPLET (avec leçons en une seule opération) ----------
coursesRoutes.post('/full', async (c) => {
  const user = await requireAuth(c);
  if (!user || !hasRole(user, 'enseignant', 'admin_ecole', 'ministere')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }

  const body = await c.req.json<any>();
  const {
    title, title_ar, title_en, description,
    subject_id, grade_level_id, section_id,
    cover_image, difficulty, duration_minutes, language,
    is_published, lessons = []
  } = body;

  if (!title || !subject_id || !grade_level_id) {
    return c.json({ success: false, error: 'Champs requis manquants' }, 400);
  }

  // 1. Créer le cours
  const courseResult = await c.env.DB.prepare(
    `INSERT INTO courses (title, title_ar, title_en, description, subject_id, grade_level_id, section_id, author_id, cover_image, difficulty, duration_minutes, language, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      title, title_ar || null, title_en || null, description || null,
      subject_id, grade_level_id, section_id || null, user.id,
      cover_image || null, difficulty || 'moyen', duration_minutes || 0,
      language || 'fr', is_published ? 1 : 0
    )
    .run();

  const courseId = courseResult.meta.last_row_id as number;

  // 2. Créer les leçons (si fournies)
  let createdLessons = 0;
  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    if (!l.title || !l.content_type) continue;
    await c.env.DB.prepare(
      `INSERT INTO lessons (course_id, title, content_type, content, video_url, duration_minutes, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        courseId,
        l.title,
        l.content_type,
        l.content || null,
        l.video_url || null,
        l.duration_minutes || 10,
        l.order_index ?? i + 1
      )
      .run();
    createdLessons++;
  }

  const course = await c.env.DB.prepare('SELECT * FROM courses WHERE id = ?').bind(courseId).first();
  return c.json({ success: true, data: { ...course, lessons_created: createdLessons } });
});

// ---------- METTRE À JOUR UN COURS ----------
coursesRoutes.put('/:id', async (c) => {
  const user = await requireAuth(c);
  if (!hasRole(user, 'enseignant', 'admin_ecole', 'ministere')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json<any>();

  const allowedFields = [
    'title', 'title_ar', 'title_en', 'description', 'subject_id', 'grade_level_id',
    'section_id', 'cover_image', 'difficulty', 'duration_minutes', 'language', 'is_published'
  ];
  const updates: string[] = [];
  const params: any[] = [];
  for (const f of allowedFields) {
    if (f in body) {
      updates.push(`${f} = ?`);
      params.push(body[f]);
    }
  }
  if (!updates.length) {
    return c.json({ success: false, error: 'Aucun champ à mettre à jour' }, 400);
  }
  updates.push("updated_at = datetime('now')");
  params.push(id);

  await c.env.DB.prepare(`UPDATE courses SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...params)
    .run();

  const course = await c.env.DB.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first();
  return c.json({ success: true, data: course });
});

// ---------- SUPPRIMER UN COURS ----------
coursesRoutes.delete('/:id', async (c) => {
  const user = await requireAuth(c);
  if (!hasRole(user, 'enseignant', 'admin_ecole', 'ministere')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }
  const id = parseInt(c.req.param('id'));
  await c.env.DB.prepare('DELETE FROM courses WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// ---------- LEÇONS : créer ----------
coursesRoutes.post('/:id/lessons', async (c) => {
  const user = await requireAuth(c);
  if (!hasRole(user, 'enseignant', 'admin_ecole', 'ministere')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }
  const courseId = parseInt(c.req.param('id'));
  const body = await c.req.json<any>();
  const { title, content_type, content, video_url, duration_minutes, order_index } = body;
  if (!title || !content_type) {
    return c.json({ success: false, error: 'Champs requis manquants' }, 400);
  }
  const result = await c.env.DB.prepare(
    `INSERT INTO lessons (course_id, title, content_type, content, video_url, duration_minutes, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      courseId,
      title,
      content_type,
      content || null,
      video_url || null,
      duration_minutes || 0,
      order_index || 0
    )
    .run();
  const lesson = await c.env.DB.prepare('SELECT * FROM lessons WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first();
  return c.json({ success: true, data: lesson });
});

// ---------- LEÇONS : modifier ----------
coursesRoutes.put('/lessons/:lessonId', async (c) => {
  const user = await requireAuth(c);
  if (!hasRole(user, 'enseignant', 'admin_ecole', 'ministere')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }
  const lessonId = parseInt(c.req.param('lessonId'));
  const body = await c.req.json<any>();
  const allowed = ['title', 'content_type', 'content', 'video_url', 'duration_minutes', 'order_index'];
  const updates: string[] = [];
  const params: any[] = [];
  for (const f of allowed) {
    if (f in body) {
      updates.push(`${f} = ?`);
      params.push(body[f]);
    }
  }
  if (!updates.length) return c.json({ success: false, error: 'Aucun champ' }, 400);
  params.push(lessonId);
  await c.env.DB.prepare(`UPDATE lessons SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...params)
    .run();
  const lesson = await c.env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(lessonId).first();
  return c.json({ success: true, data: lesson });
});

// ---------- LEÇONS : supprimer ----------
coursesRoutes.delete('/lessons/:lessonId', async (c) => {
  const user = await requireAuth(c);
  if (!hasRole(user, 'enseignant', 'admin_ecole', 'ministere')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }
  const lessonId = parseInt(c.req.param('lessonId'));
  await c.env.DB.prepare('DELETE FROM lessons WHERE id = ?').bind(lessonId).run();
  return c.json({ success: true });
});

// ---------- PROGRESSION ÉLÈVE ----------
coursesRoutes.post('/:id/progress', async (c) => {
  const user = await requireAuth(c);
  if (!user) return c.json({ success: false, error: 'Non authentifié' }, 401);
  const courseId = parseInt(c.req.param('id'));
  const body = await c.req.json<any>();
  const { lesson_id, progress_percentage, status, time_spent_seconds } = body;

  // Upsert
  await c.env.DB.prepare(
    `INSERT INTO student_progress (student_id, course_id, lesson_id, status, progress_percentage, time_spent_seconds, last_accessed_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'), CASE WHEN ? = 'termine' THEN datetime('now') ELSE NULL END)
     ON CONFLICT(student_id, course_id, lesson_id) DO UPDATE SET
       status = excluded.status,
       progress_percentage = excluded.progress_percentage,
       time_spent_seconds = student_progress.time_spent_seconds + excluded.time_spent_seconds,
       last_accessed_at = datetime('now'),
       completed_at = CASE WHEN excluded.status = 'termine' THEN datetime('now') ELSE student_progress.completed_at END`
  )
    .bind(
      user.id,
      courseId,
      lesson_id || null,
      status || 'en_cours',
      progress_percentage || 0,
      time_spent_seconds || 0,
      status
    )
    .run();

  return c.json({ success: true });
});
