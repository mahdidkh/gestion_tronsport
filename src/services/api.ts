import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

// Get the environment-specific API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD
  ? 'https://tronsport-4.onrender.com/api'
  : 'http://localhost:8083/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Configure retry logic
axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => {
    console.log(`Retry attempt: ${retryCount}`);
    return retryCount * 1000; // time interval between retries (ms)
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           (error.response && error.response.status >= 500);
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log the error for debugging
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }

    // Show user-friendly error message
    if (!error.response) {
      // Network error
      console.error('Network error: Please check your connection');
    } else if (error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Health check function
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    console.log('API Health Check:', response.data);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'DOWN', error: (error as Error).message };
  }
};

export default api;
