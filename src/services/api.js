// frontend/src/services/api.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

// Attach token + cache-buster
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // NEVER send custom headers like x-no-auth (causes CORS preflight failures)
    if (config.headers) {
      delete config.headers['x-no-auth'];
      delete config.headers['X-No-Auth'];
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers) {
      delete config.headers.Authorization;
    }

    // cache buster for profile/order endpoints
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

// ✅ keep named export to fix your Vercel build error
export const startTrial = () => api.post('/trial/start', {});

export default api;
