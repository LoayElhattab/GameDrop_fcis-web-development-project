import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      console.log('Parsed user from localStorage:', parsedUser);
      return parsedUser;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      const storedToken = localStorage.getItem('token') || null;
      console.log('Parsed token from localStorage:', storedToken);
      return storedToken;
    } catch (error) {
      console.error('Failed to get token from localStorage:', error);
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User saved to localStorage:', user);
    } else {
      localStorage.removeItem('user');
    }

    if (token) {
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage:', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [user, token]);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.status === 200 || response.status === 201) {
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        console.log('Login successful - User:', user, 'Token:', token);
        setIsLoading(false);
        return true;
      } else {
        setError('An unexpected response was received.');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Login failed:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (username, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register', { username, email, password });
      if (response.status === 200 || response.status === 201) {
        console.log('Registration successful - Response:', response.data);
        setIsLoading(false);
        return true; // Indicate success without setting token or user
      } else {
        setError('Registration failed. An unexpected response was received.');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Registration failed:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    console.log('User logged out.');
  };

  const contextValue = {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;