// frontend/src/services/api.js
import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL;

// fallback if you don't set VITE_API_URL
const FALLBACK_BASE = 'https://konarcard-backend-331608269918.europe-west1.run.app';

const api = axios.create({
  baseURL: (rawBase && rawBase.trim()) ? rawBase.trim() : FALLBACK_BASE,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const headers = config.headers || {};

  // ✅ If this request is marked as "no auth", do NOT attach Authorization
  const noAuth =
    headers['x-no-auth'] === '1' ||
    headers['X-No-Auth'] === '1' ||
    headers['x-no-auth'] === 1 ||
    headers['X-No-Auth'] === 1;

  if (!noAuth) {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
    else delete headers.Authorization;
  } else {
    delete headers.Authorization;
  }

  config.headers = headers;

  // cache-buster only on sensitive reads
  if (config.url?.includes('/profile') || config.url?.includes('/me/orders')) {
    const sep = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${sep}ts=${Date.now()}`;
  }

  return config;
});

export default api;
