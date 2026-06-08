import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach Supabase JWT to every request — refresh session first if needed
api.interceptors.request.use(async (config) => {
  // refreshSession() ensures we have a valid, non-expired token
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  } else {
    // Try refreshing the session
    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed?.session?.access_token) {
      config.headers.Authorization = `Bearer ${refreshed.session.access_token}`;
    }
  }
  return config;
});

// Handle 401 by refreshing and retrying once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await supabase.auth.refreshSession();
        if (data?.session?.access_token) {
          originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed — user needs to log in again
        await supabase.auth.signOut();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Vehicle API
export const vehicleAPI = {
  getAll: () => api.get('/api/vehicles'),
  add: (data) => api.post('/api/vehicles', data),
  updateKm: (id, current_km) => api.put(`/api/vehicles/${id}`, { current_km }),
  delete: (id) => api.delete(`/api/vehicles/${id}`),
  getLogs: (id) => api.get(`/api/vehicles/${id}/logs`),
  addLog: (id, data) => api.post(`/api/vehicles/${id}/logs`, data),
  deleteLog: (vehicleId, logId) => api.delete(`/api/vehicles/${vehicleId}/logs/${logId}`),
};

// AI Chat API
export const aiAPI = {
  chat: (message, history) => api.post('/api/ai/chat', { message, history }),
};

export default api;
