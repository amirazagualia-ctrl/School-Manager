import { Hono } from 'hono';
import type { Bindings } from '../types';
import { requireAuth, hasRole } from '../utils/auth';

export const schoolsRoutes = new Hono<{ Bindings: Bindings }>();

schoolsRoutes.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM schools ORDER BY name').all();
  return c.json({ success: true, data: results });
});

schoolsRoutes.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const school = await c.env.DB.prepare('SELECT * FROM schools WHERE id = ?').bind(id).first();
  if (!school) return c.json({ success: false, error: 'École introuvable' }, 404);

  // Compteurs
  const counts = await c.env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'eleve') as students_count,
       (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'enseignant') as teachers_count,
       (SELECT COUNT(*) FROM classes WHERE school_id = ?) as classes_count`
  )
    .bind(id, id, id)
    .first();

  return c.json({ success: true, data: { ...school, ...counts } });
});

schoolsRoutes.post('/', async (c) => {
  const user = await requireAuth(c);
  if (!hasRole(user, 'ministere')) return c.json({ success: false, error: 'Accès refusé' }, 403);
  const body = await c.req.json<any>();
  const result = await c.env.DB.prepare(
    `INSERT INTO schools (name, name_ar, type, governorate, address, phone, email, director_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      body.name,
      body.name_ar || null,
      body.type,
      body.governorate,
      body.address || null,
      body.phone || null,
      body.email || null,
      body.director_name || null
    )
    .run();
  return c.json({ success: true, data: { id: result.meta.last_row_id } });
});

// Classes d'une école
schoolsRoutes.get('/:id/classes', async (c) => {
  const id = parseInt(c.req.param('id'));
  const { results } = await c.env.DB.prepare(
    `SELECT cl.*, g.name_fr as grade_name, g.cycle, sec.name_fr as section_name,
            u.first_name || ' ' || u.last_name as main_teacher_name,
            (SELECT COUNT(*) FROM student_profiles WHERE class_id = cl.id) as students_count
     FROM classes cl
     LEFT JOIN grade_levels g ON g.id = cl.grade_level_id
     LEFT JOIN sections sec ON sec.id = cl.section_id
     LEFT JOIN users u ON u.id = cl.main_teacher_id
     WHERE cl.school_id = ?
     ORDER BY g.year_order, cl.name`
  )
    .bind(id)
    .all();
  return c.json({ success: true, data: results });
});
