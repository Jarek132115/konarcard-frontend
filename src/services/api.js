// frontend/src/services/api.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false, // using Bearer token, not cookies
});

// Attach token + add cache-buster on sensitive routes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    // Use only a query cache-buster to avoid CORS-preflight header issues
    if (config.url?.includes('/profile') || config.url?.includes('/me/orders')) {
      const sep = config.url.includes('?') ? '&' : '?';
      config.url = `${config.url}${sep}ts=${Date.now()}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Safer response interceptor
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
      } catch { /* ignore */ }
      toast.error('Session expired. Please log in again.');
    }

    return Promise.reject(error);
  }
);

// Example helper
export const startTrial = () => api.post('/trial/start', {});

export default api;
