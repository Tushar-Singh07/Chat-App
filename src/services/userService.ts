import { apiFetch } from './api';
import type { User } from '../types';

export const userService = {
  async getAllUsers() {
    const res = await apiFetch<any>('/users');
    if (res.success && res.data) {
      const list = res.data.users || (Array.isArray(res.data) ? res.data : []);
      return { success: true, data: list };
    }
    return { success: false, data: [] };
  },

  async searchUsers(query: string) {
    const res = await apiFetch<any>(`/users/search?q=${encodeURIComponent(query)}`);
    if (res.success && res.data) {
      const list = res.data.users || (Array.isArray(res.data) ? res.data : []);
      return { success: true, data: list };
    }
    return { success: false, data: [] };
  },

  async updateProfile(data: { name?: string; about?: string; profilePicture?: string; phone?: string }) {
    return await apiFetch<{ user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
