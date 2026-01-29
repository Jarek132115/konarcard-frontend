// frontend/src/services/api.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Normalize base URL so it never ends with /api
function normalizeBaseURL(url) {
  const raw = (url || '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  return raw.replace(/\/api$/i, '');
}

const api = axios.create({
  baseURL: normalizeBaseURL(import.meta.env.VITE_API_URL),
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    // ✅ Allow explicit "no-auth" per request (for claim availability step)
    const noAuth = config?.headers?.['X-No-Auth'] === '1';

    if (!noAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    } else {
      // ensure no Authorization header is sent
      delete config.headers.Authorization;
    }

    // Cache-buster for profile/orders
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

    // Clear auth only when profile check explicitly returns 401/403
    if (
      (status === 401 || status === 403) &&
      config?.url &&
      config.url.includes('/profile')
    ) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
      } catch { }
      toast.error('Session expired. Please log in again.');
    }

    return Promise.reject(error);
  }
);

// Keep this export because MyProfile.jsx imports it
export const startTrial = () => api.post('/trial/start', {});

export default api;
