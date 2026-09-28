import axios from 'axios';
import { formatErrorMessage } from './handleError';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    // Add token or auth headers if present in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // Standard response format: { success, statusCode, message, data, meta }
    return response.data;
  },
  (error) => {
    const formattedError = new Error(formatErrorMessage(error));
    formattedError.original = error;
    formattedError.response = error.response;
    formattedError.statusCode = error.response?.status;
    return Promise.reject(formattedError);
  }
);

export default api;
