// frontend/src/services/api.js
import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL;

// If you don't set VITE_API_URL, default to your Cloud Run backend.
// Change this to your backend if you ever redeploy with a new URL.
const FALLBACK_BASE = 'https://konarcard-backend-331608269918.europe-west1.run.app';

const api = axios.create({
  baseURL: (rawBase && rawBase.trim()) ? rawBase.trim() : FALLBACK_BASE,
  withCredentials: false, // using Bearer token, not cookies
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  // cache-buster on sensitive reads only
  if (config.url?.includes('/profile') || config.url?.includes('/me/orders')) {
    const sep = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${sep}ts=${Date.now()}`;
  }

  return config;
});

export default api;
