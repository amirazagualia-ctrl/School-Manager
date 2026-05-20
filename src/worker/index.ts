// ============================================================
// HONO BACKEND - Cloudflare Pages Functions
// ============================================================
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { coursesRoutes } from './routes/courses';
import { curriculumRoutes } from './routes/curriculum';
import { assessmentsRoutes } from './routes/assessments';
import { aiRoutes } from './routes/ai';
import { usersRoutes } from './routes/users';
import { dashboardRoutes } from './routes/dashboard';
import { schoolsRoutes } from './routes/schools';
import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', logger());
app.use('/api/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Health
app.get('/api/health', (c) =>
  c.json({ success: true, message: 'Madrasa TN API is running', timestamp: new Date().toISOString() })
);

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/schools', schoolsRoutes);
app.route('/api/curriculum', curriculumRoutes);
app.route('/api/courses', coursesRoutes);
app.route('/api/assessments', assessmentsRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/dashboard', dashboardRoutes);

app.notFound((c) => c.json({ success: false, error: 'Endpoint introuvable' }, 404));

app.onError((err, c) => {
  console.error('[API ERROR]', err);
  return c.json({ success: false, error: err.message || 'Erreur interne du serveur' }, 500);
});

export default app;
