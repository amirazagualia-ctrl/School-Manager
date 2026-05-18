import { Hono } from 'hono';
import type { Bindings } from '../types';
import { hashPassword, verifyPassword, createSession, requireAuth } from '../utils/auth';

export const authRoutes = new Hono<{ Bindings: Bindings }>();

// ---------- LOGIN ----------
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>();
    if (!email || !password) {
      return c.json({ success: false, error: 'Email et mot de passe requis' }, 400);
    }

    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND is_active = 1'
    )
      .bind(email.toLowerCase().trim())
      .first<any>();

    if (!user) {
      return c.json({ success: false, error: 'Identifiants invalides' }, 401);
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return c.json({ success: false, error: 'Identifiants invalides' }, 401);
    }

    const token = await createSession(c.env.DB, user.id);
    await c.env.DB.prepare(
      "UPDATE users SET last_login_at = datetime('now') WHERE id = ?"
    )
      .bind(user.id)
      .run();

    delete user.password_hash;
    return c.json({ success: true, data: { user, token } });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ---------- REGISTER ----------
authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json<any>();
    const { email, password, first_name, last_name, role, preferred_language, school_id } = body;

    if (!email || !password || !first_name || !last_name || !role) {
      return c.json({ success: false, error: 'Champs requis manquants' }, 400);
    }

    if (password.length < 6) {
      return c.json({ success: false, error: 'Mot de passe trop court (min 6 caractères)' }, 400);
    }

    const validRoles = ['eleve', 'enseignant', 'admin_ecole', 'parent', 'ministere'];
    if (!validRoles.includes(role)) {
      return c.json({ success: false, error: 'Rôle invalide' }, 400);
    }

    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email.toLowerCase().trim())
      .first();
    if (existing) {
      return c.json({ success: false, error: 'Cet email est déjà utilisé' }, 409);
    }

    const hash = await hashPassword(password);
    const result = await c.env.DB.prepare(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, preferred_language, school_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        email.toLowerCase().trim(),
        hash,
        role,
        first_name,
        last_name,
        preferred_language || 'fr',
        school_id || null
      )
      .run();

    const userId = result.meta.last_row_id as number;
    const token = await createSession(c.env.DB, userId);

    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(userId)
      .first<any>();
    delete user.password_hash;

    return c.json({ success: true, data: { user, token } });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ---------- ME ----------
authRoutes.get('/me', async (c) => {
  const sessionUser = await requireAuth(c);
  if (!sessionUser) {
    return c.json({ success: false, error: 'Non authentifié' }, 401);
  }
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(sessionUser.id)
    .first<any>();
  if (user) delete user.password_hash;
  return c.json({ success: true, data: user });
});

// ---------- LOGOUT ----------
authRoutes.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (token) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
  }
  return c.json({ success: true });
});
