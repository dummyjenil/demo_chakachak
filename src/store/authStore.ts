import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: localStorage.getItem('auth_token') === 'mock-token',
  login: async (password: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('auth_token', data.token);
        set({ isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth error:', error);
      return false;
    }
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ isAuthenticated: false });
  },
}));
