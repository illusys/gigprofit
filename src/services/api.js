import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// On web production (Vercel), the API lives on the same domain at /api.
// On native or local dev, fall back to the configured URL or localhost.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
  || (Platform.OS === 'web' ? '/api' : 'http://10.0.2.2:4000/api');
const TOKEN_KEY = '@gigprofit_access_token';
const REFRESH_KEY = '@gigprofit_refresh_token';

async function getAccessToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

async function setTokens({ accessToken, refreshToken }) {
  if (accessToken) await AsyncStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
}

async function clearTokens() {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
}

async function request(path, options = {}) {
  const token = await getAccessToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || 'API request failed');
  return data;
}

export const api = {
  baseUrl: API_BASE_URL,
  getAccessToken,
  setTokens,
  clearTokens,
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: async (body) => {
    const data = await request('/auth/login', { method: 'POST', body });
    await setTokens(data);
    return data;
  },
  googleAuth: async (idToken) => {
    const data = await request('/auth/google', { method: 'POST', body: { idToken } });
    await setTokens(data);
    return data;
  },
  logout: async () => {
    const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
    try { await request('/auth/logout', { method: 'POST', body: { refreshToken } }); } finally { await clearTokens(); }
  },
  me: () => request('/auth/me'),
  changePassword: (body) => request('/auth/change-password', { method: 'POST', body }),
  trips: (params = '') => request(`/trips${params}`),
  createTrip: (body) => request('/trips', { method: 'POST', body }),
  updateTrip: (id, body) => request(`/trips/${id}`, { method: 'PUT', body }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  updateProfile: (body) => request('/profile', { method: 'PUT', body }),
  updateProfileSettings: (body) => request('/profile/settings', { method: 'PUT', body }),
  reports: () => request('/reports'),
  generateReport: (reportType) => request('/reports/generate', { method: 'POST', body: { reportType } }),
  aiCoach: (prompt) => request('/ai/coach', { method: 'POST', body: { prompt } }),
  adminMetrics: () => request('/admin/metrics'),
  adminUsers: (query = '') => request(`/admin/users${query}`),
  adminUpdateUser: (id, body) => request(`/admin/users/${id}`, { method: 'PUT', body }),
  adminDeleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  adminReports: () => request('/admin/reports'),
  adminAuditLogs: () => request('/admin/audit-logs'),
  adminSettings: () => request('/admin/settings'),
  adminUpdateSetting: (key, value) => request(`/admin/settings/${key}`, { method: 'PUT', body: { value } }),
};
