// ============================================================
// Client API - Wrapper fetch avec gestion d'auth
// ============================================================
import type { ApiResponse } from '@shared/types';

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('madrasa_token');
}

export function setToken(token: string) {
  localStorage.setItem('madrasa_token', token);
}

export function clearToken() {
  localStorage.removeItem('madrasa_token');
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = (await res.json()) as ApiResponse<T>;
    if (!res.ok && !data.error) {
      data.error = `Erreur HTTP ${res.status}`;
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur réseau' };
  }
}

export const api = {
  get: <T = any>(endpoint: string) => apiCall<T>(endpoint),
  post: <T = any>(endpoint: string, body?: any) =>
    apiCall<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(endpoint: string, body?: any) =>
    apiCall<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(endpoint: string) => apiCall<T>(endpoint, { method: 'DELETE' })
};
