import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false, // 🔑 turn this off if you only use Bearer tokens
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoggingOut = error?.config?.headers?.isLoggingOut;
    if (
      !isLoggingOut &&
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem('token');
      toast.error('Session expired or unauthorized. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export const startTrial = () => api.post('/trial/start', {});

export default api;
