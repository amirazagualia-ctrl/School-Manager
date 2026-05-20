import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, hasRole } from '../utils/auth';

export const assessmentsRoutes = new Hono<{ Bindings: Bindings }>();

// ---------- LISTE ----------
assessmentsRoutes.get('/', async (c) => {
  const subjectId = c.req.query('subject_id');
  const gradeId = c.req.query('grade_level_id');
  const courseId = c.req.query('course_id');

  let query = `
    SELECT a.*, s.name_fr as subject_name, s.color as subject_color,
           g.name_fr as grade_name,
           u.first_name || ' ' || u.last_name as creator_name,
           (SELECT COUNT(*) FROM questions WHERE assessment_id = a.id) as questions_count
    FROM assessments a
    LEFT JOIN subjects s ON s.id = a.subject_id
    LEFT JOIN grade_levels g ON g.id = a.grade_level_id
    LEFT JOIN users u ON u.id = a.created_by
    WHERE a.is_published = 1`;
  const params: any[] = [];

  if (subjectId) { query += ' AND a.subject_id = ?'; params.push(subjectId); }
  if (gradeId) { query += ' AND a.grade_level_id = ?'; params.push(gradeId); }
  if (courseId) { query += ' AND a.course_id = ?'; params.push(courseId); }

  query += ' ORDER BY a.created_at DESC LIMIT 100';
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results });
});

// ---------- DÉTAIL avec questions ----------
assessmentsRoutes.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const assessment = await c.env.DB.prepare(
    `SELECT a.*, s.name_fr as subject_name, g.name_fr as grade_name
     FROM assessments a
     LEFT JOIN subjects s ON s.id = a.subject_id
     LEFT JOIN grade_levels g ON g.id = a.grade_level_id
     WHERE a.id = ?`
  )
    .bind(id)
    .first();
  if (!assessment) {
    return c.json({ success: false, error: 'Évaluation introuvable' }, 404);
  }
  const { results: questions } = await c.env.DB.prepare(
    'SELECT * FROM questions WHERE assessment_id = ? ORDER BY order_index'
  )
    .bind(id)
    .all();
  return c.json({ success: true, data: { ...assessment, questions } });
});

// ---------- CRÉER ÉVALUATION ----------
assessmentsRoutes.post('/', async (c) => {
  const user = await requireAuth(c);
  if (!hasRole(user, 'enseignant', 'admin_ecole', 'ministere')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }
  const body = await c.req.json<any>();
  const { title, description, course_id, subject_id, grade_level_id, type, duration_minutes, total_points, is_published, is_ai_generated } = body;

  if (!title || !subject_id || !grade_level_id || !type) {
    return c.json({ success: false, error: 'Champs requis manquants' }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO assessments (title, description, course_id, subject_id, grade_level_id, created_by, type, duration_minutes, total_points, is_published, is_ai_generated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      title,
      description || null,
      course_id || null,
      subject_id,
      grade_level_id,
      user!.id,
      type,
      duration_minutes || 30,
      total_points || 20,
      is_published ? 1 : 0,
      is_ai_generated ? 1 : 0
    )
    .run();

  const assessment = await c.env.DB.prepare('SELECT * FROM assessments WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first();
  return c.json({ success: true, data: assessment });
});

// ---------- AJOUTER QUESTIONS EN LOT ----------
assessmentsRoutes.post('/:id/questions', async (c) => {
  const user = await requireAuth(c);
  if (!hasRole(user, 'enseignant', 'admin_ecole', 'ministere')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json<any>();
  const questions = Array.isArray(body) ? body : body.questions || [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await c.env.DB.prepare(
      `INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, explanation, points, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        q.question_text,
        q.question_type,
        q.options ? (typeof q.options === 'string' ? q.options : JSON.stringify(q.options)) : null,
        q.correct_answer || null,
        q.explanation || null,
        q.points || 1,
        q.order_index ?? i
      )
      .run();
  }
  return c.json({ success: true, message: `${questions.length} question(s) ajoutée(s)` });
});

// ---------- COMMENCER UNE TENTATIVE ----------
assessmentsRoutes.post('/:id/attempts', async (c) => {
  const user = await requireAuth(c);
  if (!user) return c.json({ success: false, error: 'Non authentifié' }, 401);
  const id = parseInt(c.req.param('id'));

  const result = await c.env.DB.prepare(
    `INSERT INTO assessment_attempts (assessment_id, student_id, status)
     VALUES (?, ?, 'en_cours')`
  )
    .bind(id, user.id)
    .run();

  return c.json({ success: true, data: { attempt_id: result.meta.last_row_id } });
});

// ---------- SOUMETTRE UNE TENTATIVE ----------
assessmentsRoutes.post('/attempts/:attemptId/submit', async (c) => {
  const user = await requireAuth(c);
  if (!user) return c.json({ success: false, error: 'Non authentifié' }, 401);
  const attemptId = parseInt(c.req.param('attemptId'));
  const body = await c.req.json<any>();
  const answers = body.answers || [];

  // Récupérer les questions
  const attempt = await c.env.DB.prepare(
    'SELECT * FROM assessment_attempts WHERE id = ? AND student_id = ?'
  )
    .bind(attemptId, user.id)
    .first<any>();
  if (!attempt) return c.json({ success: false, error: 'Tentative introuvable' }, 404);

  const { results: questions } = await c.env.DB.prepare(
    'SELECT * FROM questions WHERE assessment_id = ?'
  )
    .bind(attempt.assessment_id)
    .all<any>();

  let totalScore = 0;
  let totalMax = 0;

  for (const q of questions) {
    totalMax += q.points;
    const answer = answers.find((a: any) => a.question_id === q.id);
    if (!answer) continue;

    let isCorrect = false;
    let scoreObtained = 0;

    if (q.question_type === 'qcm' || q.question_type === 'vrai_faux') {
      isCorrect = String(answer.student_answer).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();
      scoreObtained = isCorrect ? q.points : 0;
    } else if (q.question_type === 'reponse_courte') {
      // Comparaison simple ; pour mieux on appellerait l'IA
      const expected = String(q.correct_answer || '').trim().toLowerCase();
      const got = String(answer.student_answer || '').trim().toLowerCase();
      isCorrect = expected === got || (expected.length > 0 && got.includes(expected));
      scoreObtained = isCorrect ? q.points : 0;
    } else {
      // Rédaction : à corriger par l'IA / enseignant
      scoreObtained = 0;
    }

    totalScore += scoreObtained;

    await c.env.DB.prepare(
      `INSERT INTO answers (attempt_id, question_id, student_answer, is_correct, score_obtained)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(attemptId, q.id, answer.student_answer, isCorrect ? 1 : 0, scoreObtained)
      .run();
  }

  await c.env.DB.prepare(
    `UPDATE assessment_attempts
     SET submitted_at = datetime('now'), score = ?, max_score = ?, status = 'soumis'
     WHERE id = ?`
  )
    .bind(totalScore, totalMax, attemptId)
    .run();

  return c.json({
    success: true,
    data: { score: totalScore, max_score: totalMax, percentage: Math.round((totalScore / totalMax) * 100) }
  });
});

// ---------- HISTORIQUE TENTATIVES ----------
assessmentsRoutes.get('/attempts/my', async (c) => {
  const user = await requireAuth(c);
  if (!user) return c.json({ success: false, error: 'Non authentifié' }, 401);
  const { results } = await c.env.DB.prepare(
    `SELECT aa.*, a.title as assessment_title, s.name_fr as subject_name
     FROM assessment_attempts aa
     JOIN assessments a ON a.id = aa.assessment_id
     JOIN subjects s ON s.id = a.subject_id
     WHERE aa.student_id = ?
     ORDER BY aa.started_at DESC`
  )
    .bind(user.id)
    .all();
  return c.json({ success: true, data: results });
});
