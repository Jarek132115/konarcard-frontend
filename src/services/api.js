// frontend/src/services/api.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

function normalizeBaseURL(raw) {
  const base = (raw || '').trim().replace(/\/+$/, '');
  if (!base) return '';
  // If user already set .../api, keep it. Otherwise append /api.
  return base.endsWith('/api') ? base : `${base}/api`;
}

const api = axios.create({
  baseURL: normalizeBaseURL(import.meta.env.VITE_API_URL),
  withCredentials: false, // Bearer token, not cookies
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    else delete config.headers.Authorization;

    // cache-buster (query only)
    if (config.url?.includes('/profile') || config.url?.includes('/me/orders')) {
      const sep = config.url.includes('?') ? '&' : '?';
      config.url = `${config.url}${sep}ts=${Date.now()}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error || {};
    const status = response?.status;

    if ((status === 401 || status === 403) && config?.url?.includes('/profile')) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
      } catch { }
      toast.error('Session expired. Please log in again.');
    }

    return Promise.reject(error);
  }
);

export const startTrial = () => api.post('/trial/start', {});
export default api;
