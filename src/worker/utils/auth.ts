// ============================================================
// Authentification - Hash + Sessions
// ============================================================
import type { Context } from 'hono';
import type { Bindings, SessionUser } from '../types';

const SALT = 'madrasa';

/** Hash mot de passe en SHA-512 + sel */
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/** Génère un token de session aléatoire */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Crée une session en base */
export async function createSession(db: D1Database, userId: number): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await db
    .prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, userId, expiresAt)
    .run();
  return token;
}

/** Récupère un user à partir d'un token */
export async function getUserFromToken(
  db: D1Database,
  token: string
): Promise<SessionUser | null> {
  if (!token) return null;
  const result = await db
    .prepare(
      `SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.school_id
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > datetime('now') AND u.is_active = 1`
    )
    .bind(token)
    .first<SessionUser>();
  return result || null;
}

/** Middleware d'authentification */
export async function requireAuth(c: Context<{ Bindings: Bindings }>): Promise<SessionUser | null> {
  const authHeader = c.req.header('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  return await getUserFromToken(c.env.DB, token);
}

/** Vérifie qu'un utilisateur a l'un des rôles autorisés */
export function hasRole(user: SessionUser | null, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
