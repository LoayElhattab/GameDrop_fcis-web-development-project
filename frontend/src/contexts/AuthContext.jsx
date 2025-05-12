// gamedrop-frontend/src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api'; // Import the configured axios instance
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

// Create the Auth Context
const AuthContext = createContext(null);

/**
 * Provides authentication state and functions to the application.
 * Manages user data, token, and loading state.
 */
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage on component mount
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null;
    } catch (error) {
      console.error("Failed to get token from localStorage:", error);
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // State to hold authentication errors

  // Effect to update localStorage whenever user or token changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }

    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [user, token]);

  /**
   * Handles user login.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @returns {Promise<boolean>} - True if login is successful, false otherwise.
   */
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      // Call the backend login endpoint
      const response = await apiClient.post('/auth/login', { email, password });

      // Assuming backend returns { token: '...', user: {...} } on success (status 200/201)
      if (response.status === 200 || response.status === 201) {
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        // localStorage updates are handled by the useEffect hook
        setIsLoading(false);
        return true; // Indicate success
      } else {
        // Handle unexpected successful status codes if necessary
        setError('An unexpected response was received.');
        setIsLoading(false);
        return false; // Indicate failure
      }
    } catch (err) {
      console.error('Login failed:', err);
      // Handle specific error responses (e.g., 401 Unauthorized, 400 Bad Request)
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Display backend error message
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return false; // Indicate failure
    }
  };

  /**
   * Handles user registration.
   * @param {string} username - Desired username.
   * @param {string} email - User's email.
   * @param {string} password - Desired password.
   * @returns {Promise<boolean>} - True if registration is successful, false otherwise.
   */
  const register = async (username, email, password) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      // Call the backend register endpoint
      const response = await apiClient.post('/auth/register', { username, email, password });

      // Assuming backend returns { token: '...', user: {...} } on success (status 200/201)
      if (response.status === 200 || response.status === 201) {
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        // localStorage updates are handled by the useEffect hook
        setIsLoading(false);
        return true; // Indicate success
      } else {
         setError('Registration failed. An unexpected response was received.');
         setIsLoading(false);
         return false; // Indicate failure
      }
    } catch (err) {
      console.error('Registration failed:', err);
      // Handle specific error responses (e.g., 409 Conflict for existing user, 400 Bad Request)
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Display backend error message
      } else {
        setError('Registration failed. Please try again.');
      }
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return false; // Indicate failure
    }
  };

  /**
   * Handles user logout.
   * Clears state and localStorage.
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    // localStorage updates are handled by the useEffect hook
    // No API call needed for simple client-side token removal
    console.log('User logged out.');
  };

  // The context value includes state and functions
  const contextValue = {
    user,
    token,
    isLoading,
    error, // Provide error state to components
    login,
    register,
    logout,
    isAuthenticated: !!token, // Helper derived state
    isAdmin: user?.role === 'ADMIN', // Helper derived state for admin check
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to easily access the authentication context.
 * @returns {object} - The authentication context value.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context itself (less common to use directly, use useAuth hook)
export default AuthContext;