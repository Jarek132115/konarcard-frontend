import axios from 'axios';

// Create an Axios instance with base URL and credentials
// This 'api' variable will be the actual Axios instance.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Use the environment variable for your backend URL
  withCredentials: true, // This is crucial for sending cookies/auth headers across domains
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debugging what goes out
    console.log("api.js Interceptor: Request config before sending:", config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    // Debugging what comes back
    console.log("api.js Interceptor: Response received:", response);
    return response;
  },
  (error) => {
    // Check if the error is due to authentication failure
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("API Response Error (Interceptor): Unauthorized or Forbidden. Clearing token from localStorage.");
      localStorage.removeItem('token');
      // Optionally redirect to login page or handle re-authentication flow
      // window.location.href = '/login'; // Use with caution, might cause refresh loops depending on AuthContext
      toast.error("Session expired or unauthorized. Please log in again.");
    }
    // Re-throw the error so it can be caught by the calling component (e.g., in MyProfile.jsx)
    return Promise.reject(error);
  }
);

// Export the configured Axios instance as the default export.
// This means when you 'import api from ...', 'api' will be this Axios instance.
export default api;