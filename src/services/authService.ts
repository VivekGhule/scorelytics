import { UserProfile } from '../types';
import apiClient from './apiClient';

const TOKEN_KEY = 'scorelytics_token';

export const AuthService = {
  async login(email: string, password: string): Promise<UserProfile> {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, profile } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    return profile as UserProfile;
  },

  async register(name: string, email: string, password: string): Promise<UserProfile> {
    const response = await apiClient.post('/auth/register', { name, email, password });
    const { token, profile } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    return profile as UserProfile;
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const response = await apiClient.get('/auth/me');
      return response.data as UserProfile;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get(`/users/${uid}`);
      return response.data as UserProfile;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export { apiClient };
