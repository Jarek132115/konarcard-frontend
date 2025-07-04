import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("api.js Interceptor: Request config before sending:", config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("api.js Interceptor: Response received:", response);
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("API Response Error (Interceptor): Unauthorized or Forbidden. Clearing token from localStorage.");
      localStorage.removeItem('token');
      toast.error("Session expired or unauthorized. Please log in again.");
    }
    return Promise.reject(error);
  }
);

export default api;