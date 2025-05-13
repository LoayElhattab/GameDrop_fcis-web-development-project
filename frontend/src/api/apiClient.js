// src/api/apiClient.js
import axios from 'axios';

const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api'; // Adjust the default URL as needed

const apiClient = axios.create({
  baseURL: baseURL,
  withCredentials: true, // If you need to send cookies with requests
});

// JWT Interceptor (example - you might handle token storage differently)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Or however you store your token
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