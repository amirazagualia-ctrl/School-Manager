import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, hasRole } from '../utils/auth';

export const usersRoutes = new Hono<{ Bindings: Bindings }>();

// LISTE (admin école / ministère)
usersRoutes.get('/', async (c) => {
  const user = await requireAuth(c);
  if (!hasRole(user, 'admin_ecole', 'ministere', 'enseignant')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }
  const role = c.req.query('role');
  const schoolId = c.req.query('school_id');
  const search = c.req.query('search');

  let query = `SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.first_name_ar, u.last_name_ar,
                      u.phone, u.preferred_language, u.school_id, u.is_active, u.created_at,
                      sch.name as school_name
               FROM users u
               LEFT JOIN schools sch ON sch.id = u.school_id
               WHERE 1=1`;
  const params: any[] = [];

  // L'admin école ne voit que ses utilisateurs
  if (user!.role === 'admin_ecole' && user!.school_id) {
    query += ' AND u.school_id = ?';
    params.push(user!.school_id);
  }
  if (role) {
    query += ' AND u.role = ?';
    params.push(role);
  }
  if (schoolId) {
    query += ' AND u.school_id = ?';
    params.push(schoolId);
  }
  if (search) {
    query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY u.created_at DESC LIMIT 200';
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results });
});

// PROFIL ÉLÈVE détaillé (avec notes, progression…)
usersRoutes.get('/students/:id/profile', async (c) => {
  const user = await requireAuth(c);
  if (!user) return c.json({ success: false, error: 'Non authentifié' }, 401);
  const id = parseInt(c.req.param('id'));

  // Sécurité : l'élève peut voir son propre profil, le parent celui de son enfant
  let allowed = user.id === id || hasRole(user, 'admin_ecole', 'ministere', 'enseignant');
  if (!allowed && user.role === 'parent') {
    const link = await c.env.DB.prepare(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?'
    )
      .bind(user.id, id)
      .first();
    allowed = !!link;
  }
  if (!allowed) return c.json({ success: false, error: 'Accès refusé' }, 403);

  const studentInfo = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.first_name_ar, u.last_name_ar,
            u.avatar_url, u.preferred_language,
            sp.student_number, sp.birth_date, sp.class_id,
            cl.name as class_name, cl.academic_year,
            g.name_fr as grade_name, g.cycle,
            sec.name_fr as section_name,
            sch.name as school_name
     FROM users u
     LEFT JOIN student_profiles sp ON sp.user_id = u.id
     LEFT JOIN classes cl ON cl.id = sp.class_id
     LEFT JOIN grade_levels g ON g.id = cl.grade_level_id
     LEFT JOIN sections sec ON sec.id = cl.section_id
     LEFT JOIN schools sch ON sch.id = u.school_id
     WHERE u.id = ? AND u.role = 'eleve'`
  )
    .bind(id)
    .first();

  if (!studentInfo) return c.json({ success: false, error: 'Élève introuvable' }, 404);

  // Notes
  const { results: grades } = await c.env.DB.prepare(
    `SELECT g.*, s.name_fr as subject_name, s.color as subject_color, s.icon as subject_icon
     FROM grades g
     JOIN subjects s ON s.id = g.subject_id
     WHERE g.student_id = ?
     ORDER BY g.recorded_at DESC`
  )
    .bind(id)
    .all();

  // Moyennes par matière
  const { results: averages } = await c.env.DB.prepare(
    `SELECT s.id, s.name_fr, s.color, s.icon,
            AVG(g.score) as average,
            COUNT(g.id) as count
     FROM grades g
     JOIN subjects s ON s.id = g.subject_id
     WHERE g.student_id = ?
     GROUP BY s.id`
  )
    .bind(id)
    .all();

  // Progression cours
  const { results: progress } = await c.env.DB.prepare(
    `SELECT sp.*, c.title as course_title, s.name_fr as subject_name, s.color as subject_color
     FROM student_progress sp
     JOIN courses c ON c.id = sp.course_id
     JOIN subjects s ON s.id = c.subject_id
     WHERE sp.student_id = ?
     ORDER BY sp.last_accessed_at DESC LIMIT 20`
  )
    .bind(id)
    .all();

  return c.json({
    success: true,
    data: { student: studentInfo, grades, averages, progress }
  });
});

// MODIFIER UN UTILISATEUR
usersRoutes.put('/:id', async (c) => {
  const user = await requireAuth(c);
  if (!user) return c.json({ success: false, error: 'Non authentifié' }, 401);
  const id = parseInt(c.req.param('id'));

  // L'utilisateur peut modifier son propre profil
  const isSelf = user.id === id;
  const isAdmin = hasRole(user, 'admin_ecole', 'ministere');
  if (!isSelf && !isAdmin) return c.json({ success: false, error: 'Accès refusé' }, 403);

  const body = await c.req.json<any>();
  const allowedFields = ['first_name', 'last_name', 'first_name_ar', 'last_name_ar', 'phone', 'avatar_url', 'preferred_language'];
  if (isAdmin) allowedFields.push('school_id', 'is_active', 'role');

  const updates: string[] = [];
  const params: any[] = [];
  for (const f of allowedFields) {
    if (f in body) {
      updates.push(`${f} = ?`);
      params.push(body[f]);
    }
  }
  if (!updates.length) return c.json({ success: false, error: 'Aucun champ' }, 400);
  params.push(id);
  await c.env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...params)
    .run();
  return c.json({ success: true });
});

// AJOUTER UNE NOTE
usersRoutes.post('/students/:id/grades', async (c) => {
  const user = await requireAuth(c);
  if (!hasRole(user, 'enseignant', 'admin_ecole')) {
    return c.json({ success: false, error: 'Accès refusé' }, 403);
  }
  const studentId = parseInt(c.req.param('id'));
  const body = await c.req.json<any>();
  const { subject_id, class_id, trimester, academic_year, grade_type, score, max_score, comment } = body;

  if (!subject_id || !class_id || !trimester || !academic_year || !grade_type || score === undefined) {
    return c.json({ success: false, error: 'Champs requis manquants' }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO grades (student_id, subject_id, class_id, teacher_id, trimester, academic_year, grade_type, score, max_score, comment)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(studentId, subject_id, class_id, user!.id, trimester, academic_year, grade_type, score, max_score || 20, comment || null)
    .run();
  return c.json({ success: true, data: { id: result.meta.last_row_id } });
});

// ENFANTS D'UN PARENT
usersRoutes.get('/parent/children', async (c) => {
  const user = await requireAuth(c);
  if (!user || !hasRole(user, 'parent')) return c.json({ success: false, error: 'Accès refusé' }, 403);

  const { results } = await c.env.DB.prepare(
    `SELECT u.id, u.first_name, u.last_name, u.first_name_ar, u.last_name_ar, u.avatar_url,
            l.relationship,
            sp.student_number, sp.class_id,
            cl.name as class_name,
            g.name_fr as grade_name,
            sch.name as school_name
     FROM parent_student_links l
     JOIN users u ON u.id = l.student_id
     LEFT JOIN student_profiles sp ON sp.user_id = u.id
     LEFT JOIN classes cl ON cl.id = sp.class_id
     LEFT JOIN grade_levels g ON g.id = cl.grade_level_id
     LEFT JOIN schools sch ON sch.id = u.school_id
     WHERE l.parent_id = ?`
  )
    .bind(user.id)
    .all();

  return c.json({ success: true, data: results });
});
