import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@shared/types';
import { api, setToken, clearToken } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        const res = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
        set({ isLoading: false });
        if (res.success && res.data) {
          setToken(res.data.token);
          set({ user: res.data.user, token: res.data.token });
          return { success: true };
        }
        return { success: false, error: res.error };
      },

      register: async (data) => {
        set({ isLoading: true });
        const res = await api.post<{ user: User; token: string }>('/auth/register', data);
        set({ isLoading: false });
        if (res.success && res.data) {
          setToken(res.data.token);
          set({ user: res.data.user, token: res.data.token });
          return { success: true };
        }
        return { success: false, error: res.error };
      },

      logout: async () => {
        await api.post('/auth/logout');
        clearToken();
        set({ user: null, token: null });
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return;
        setToken(token);
        const res = await api.get<User>('/auth/me');
        if (res.success && res.data) {
          set({ user: res.data });
        } else {
          clearToken();
          set({ user: null, token: null });
        }
      },

      updateUser: (updates) => {
        const user = get().user;
        if (user) set({ user: { ...user, ...updates } });
      }
    }),
    {
      name: 'madrasa_auth',
      partialize: (state) => ({ token: state.token, user: state.user })
    }
  )
);
