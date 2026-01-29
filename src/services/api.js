// frontend/src/services/api.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Normalize base URL so it never ends with /api (your Cloud Run routes do NOT use /api)
function normalizeBaseURL(url) {
  const raw = (url || '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  // if someone set VITE_API_URL to ".../api", strip it
  return raw.replace(/\/api$/i, '');
}

const api = axios.create({
  baseURL: normalizeBaseURL(import.meta.env.VITE_API_URL),
  withCredentials: false, // using Bearer token, not cookies
});

// Attach token + add cache-buster on sensitive routes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    else delete config.headers.Authorization;

    // Cache-buster for profile/orders
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

export default api;
