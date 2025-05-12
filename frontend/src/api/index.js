// gamedrop-frontend/src/api/index.js

import axios from 'axios';

// Define the base URL for your backend API
// Use Create React App compatible env variable
const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3001/api';

/**
 * Configured Axios instance for making API calls to the backend.
 * Includes a request interceptor to automatically attach JWT token.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Checks for a JWT token in localStorage before each request
 * and adds it to the Authorization header if found.
 */
apiClient.interceptors.request.use(
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

export default apiClient;
