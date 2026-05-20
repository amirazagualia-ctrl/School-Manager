import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth } from '../utils/auth';

export const dashboardRoutes = new Hono<{ Bindings: Bindings }>();

// Statistiques selon le rôle
dashboardRoutes.get('/stats', async (c) => {
  const user = await requireAuth(c);
  if (!user) return c.json({ success: false, error: 'Non authentifié' }, 401);

  if (user.role === 'ministere') {
    // Stats nationales
    const stats = await c.env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM schools) as schools_count,
        (SELECT COUNT(*) FROM users WHERE role = 'eleve') as students_count,
        (SELECT COUNT(*) FROM users WHERE role = 'enseignant') as teachers_count,
        (SELECT COUNT(*) FROM users WHERE role = 'parent') as parents_count,
        (SELECT COUNT(*) FROM courses WHERE is_published = 1) as courses_count,
        (SELECT COUNT(*) FROM assessments WHERE is_published = 1) as assessments_count,
        (SELECT COUNT(*) FROM assessment_attempts) as attempts_count`
    ).first();

    const { results: byGov } = await c.env.DB.prepare(
      `SELECT governorate, COUNT(*) as count FROM schools GROUP BY governorate`
    ).all();

    const { results: bySubject } = await c.env.DB.prepare(
      `SELECT s.name_fr, s.color, COUNT(c.id) as count
       FROM subjects s
       LEFT JOIN courses c ON c.subject_id = s.id AND c.is_published = 1
       GROUP BY s.id
       ORDER BY count DESC LIMIT 8`
    ).all();

    return c.json({ success: true, data: { stats, byGov, bySubject } });
  }

  if (user.role === 'admin_ecole') {
    const stats = await c.env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'eleve') as students_count,
        (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'enseignant') as teachers_count,
        (SELECT COUNT(*) FROM classes WHERE school_id = ?) as classes_count,
        (SELECT COUNT(*) FROM courses c JOIN users u ON u.id = c.author_id WHERE u.school_id = ?) as courses_count`
    )
      .bind(user.school_id, user.school_id, user.school_id, user.school_id)
      .first();
    return c.json({ success: true, data: { stats } });
  }

  if (user.role === 'enseignant') {
    const stats = await c.env.DB.prepare(
      `SELECT
        (SELECT COUNT(DISTINCT ta.class_id) FROM teacher_assignments ta WHERE ta.teacher_id = ?) as classes_count,
        (SELECT COUNT(*) FROM courses WHERE author_id = ?) as courses_count,
        (SELECT COUNT(*) FROM assessments WHERE created_by = ?) as assessments_count`
    )
      .bind(user.id, user.id, user.id)
      .first();
    return c.json({ success: true, data: { stats } });
  }

  if (user.role === 'eleve') {
    const stats = await c.env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM student_progress WHERE student_id = ?) as courses_started,
        (SELECT COUNT(*) FROM student_progress WHERE student_id = ? AND status = 'termine') as courses_completed,
        (SELECT COUNT(*) FROM assessment_attempts WHERE student_id = ?) as attempts_count,
        (SELECT AVG(score * 20.0 / max_score) FROM assessment_attempts WHERE student_id = ? AND score IS NOT NULL) as avg_score`
    )
      .bind(user.id, user.id, user.id, user.id)
      .first();

    const { results: subjectAvgs } = await c.env.DB.prepare(
      `SELECT s.name_fr, s.color, AVG(g.score) as average
       FROM grades g
       JOIN subjects s ON s.id = g.subject_id
       WHERE g.student_id = ?
       GROUP BY s.id`
    )
      .bind(user.id)
      .all();

    return c.json({ success: true, data: { stats, subjectAvgs } });
  }

  if (user.role === 'parent') {
    const { results: children } = await c.env.DB.prepare(
      `SELECT u.id, u.first_name, u.last_name, u.avatar_url,
              AVG(g.score) as avg_score
       FROM parent_student_links l
       JOIN users u ON u.id = l.student_id
       LEFT JOIN grades g ON g.student_id = u.id
       WHERE l.parent_id = ?
       GROUP BY u.id`
    )
      .bind(user.id)
      .all();
    return c.json({ success: true, data: { children } });
  }

  return c.json({ success: true, data: {} });
});
