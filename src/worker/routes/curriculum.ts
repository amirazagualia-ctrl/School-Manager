import { Hono } from 'hono';
import type { Bindings } from '../types';

export const curriculumRoutes = new Hono<{ Bindings: Bindings }>();

// ---------- NIVEAUX SCOLAIRES ----------
curriculumRoutes.get('/grade-levels', async (c) => {
  const cycle = c.req.query('cycle');
  let query = 'SELECT * FROM grade_levels';
  const params: any[] = [];
  if (cycle) {
    query += ' WHERE cycle = ?';
    params.push(cycle);
  }
  query += ' ORDER BY year_order';
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results });
});

// ---------- SECTIONS ----------
curriculumRoutes.get('/sections', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM sections ORDER BY id').all();
  return c.json({ success: true, data: results });
});

// ---------- MATIÈRES ----------
curriculumRoutes.get('/subjects', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM subjects ORDER BY name_fr').all();
  return c.json({ success: true, data: results });
});

// ---------- CURRICULUM (matières par niveau) ----------
curriculumRoutes.get('/by-level/:gradeId', async (c) => {
  const gradeId = parseInt(c.req.param('gradeId'));
  const sectionId = c.req.query('section_id');
  let query = `
    SELECT s.*, c.weekly_hours, c.coefficient, sec.name_fr as section_name
    FROM curriculum c
    JOIN subjects s ON s.id = c.subject_id
    LEFT JOIN sections sec ON sec.id = c.section_id
    WHERE c.grade_level_id = ?`;
  const params: any[] = [gradeId];
  if (sectionId) {
    query += ' AND (c.section_id = ? OR c.section_id IS NULL)';
    params.push(sectionId);
  } else {
    query += ' AND c.section_id IS NULL';
  }
  query += ' ORDER BY c.coefficient DESC, s.name_fr';
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, data: results });
});

// ---------- VUE D'ENSEMBLE COMPLÈTE DU SYSTÈME ----------
curriculumRoutes.get('/overview', async (c) => {
  const cycles = ['primaire', 'college', 'lycee'] as const;
  const overview: Record<string, any> = {};

  for (const cycle of cycles) {
    const { results: levels } = await c.env.DB.prepare(
      'SELECT * FROM grade_levels WHERE cycle = ? ORDER BY year_order'
    )
      .bind(cycle)
      .all();
    overview[cycle] = levels;
  }

  const { results: sections } = await c.env.DB.prepare('SELECT * FROM sections').all();
  const { results: subjects } = await c.env.DB.prepare(
    'SELECT * FROM subjects ORDER BY name_fr'
  ).all();

  return c.json({
    success: true,
    data: { cycles: overview, sections, subjects }
  });
});
