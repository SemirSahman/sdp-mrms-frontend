import axios from 'axios';

// Vite injects import.meta.env.* at build time; fall back to process.env for tests
const getApiUrl = () => {
  return (
    (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined) ||
    process.env.VITE_API_URL ||
    'http://localhost:4001/api'
  );
};

const API = axios.create({ baseURL: getApiUrl() });
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Handle 401 responses by clearing localStorage and redirecting to login
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export the base URL for use in components
export const getBaseUrl = () => {
  const apiUrl = getApiUrl();
  // Remove /api suffix if present to get base URL
  return apiUrl.replace(/\/api$/, '');
};

export default API;
