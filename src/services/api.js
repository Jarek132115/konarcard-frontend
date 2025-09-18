// frontend/src/services/api.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false, // using Bearer token, not cookies
});

// Attach token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
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

    // Only clear token for 401s from the profile endpoint
    if (
      status === 401 &&
      config?.url &&
      (config.url.endsWith('/profile') || config.url.includes('/profile?'))
    ) {
      localStorage.removeItem('token');
      toast.error('Session expired. Please log in again.');
    }

    // Otherwise, don’t nuke the token — just reject
    return Promise.reject(error);
  }
);

// Example: feature helper
export const startTrial = () => api.post('/trial/start', {});

export default api;
