import { apiFetch, setToken } from './api';
import type { User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: User;
  token?: string;
}

export const authService = {
  async register(payload: RegisterPayload) {
    const res = await apiFetch<AuthResponseData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    // Do not set token: registration requires manual login & verification
    return res;
  },

  async validateCredentials(payload: LoginPayload) {
    const res = await apiFetch<{ email: string; name?: string }>('/auth/validate-credentials', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },

  async login(payload: LoginPayload) {
    const res = await apiFetch<AuthResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data?.token) {
      setToken(res.data.token);
    }
    return res;
  },

  async sendVerificationCode(email: string) {
    const res = await apiFetch<{ message: string }>('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return res;
  },

  async verifyCodeLogin(email: string, code: string) {
    const res = await apiFetch<AuthResponseData>('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });

    if (res.success && res.data?.token) {
      setToken(res.data.token);
    }
    return res;
  },

  async logout() {
    const res = await apiFetch('/auth/logout', {
      method: 'POST',
    });
    setToken(null);
    return res;
  },

  async getCurrentUser() {
    const res = await apiFetch<AuthResponseData>('/auth/me', {
      method: 'GET',
    });
    return res;
  },
};
