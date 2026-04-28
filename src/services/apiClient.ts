import axios from 'axios';

// Get base URL from environment variable, default to localhost:8080 for development
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to every request if present
apiClient.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData && config.headers) {
    const headers = config.headers as any;
    if (typeof headers.setContentType === 'function') {
      headers.setContentType(undefined);
    } else {
      delete headers['Content-Type'];
    }
  }

  const token = localStorage.getItem('scorelytics_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const cfg = error?.config || {};
      const baseURL = cfg.baseURL || '';
      const url = cfg.url || '';
      const method = (cfg.method || 'GET').toUpperCase();
      const status = error?.response?.status;
      // Helpful during local debugging to see the exact failing endpoint.
      // eslint-disable-next-line no-console
      console.error('[apiClient] Request failed', { method, url: `${baseURL}${url}`, status });
    } catch {
      // ignore logging failures
    }
    // If 401, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('scorelytics_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;