import axios from 'axios';
import { store } from '../store'; // To access the token from Redux state

// Determine the base URL from environment variables, defaulting for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add the JWT token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token; // Access token from Redux store
    // Alternatively, could use localStorage: const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor for handling global errors (e.g., 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle 401 errors globally, e.g., redirect to login, clear auth state
      // This can be more complex if refresh tokens are involved.
      // For now, we might just let individual service calls handle errors.
      // store.dispatch(clearAuth()); // Example: clear auth state on 401
      console.error('Axios interceptor: Unauthorized request (401)', error.response);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
