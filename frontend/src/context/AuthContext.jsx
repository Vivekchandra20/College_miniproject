/**
 * Authentication Context
 * Manages auth state globally
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { initializeSocket, leaveSocket, joinSocket } from '../services/socket';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Initialize auth from localStorage
   */
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      initializeSocket();
      joinSocket(JSON.parse(storedUser).id);
    }

    setLoading(false);
  }, []);

  /**
   * Register user
   */
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);

      initializeSocket();
      joinSocket(user.id);

      return { success: true, user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);

      initializeSocket();
      joinSocket(user.id);

      return { success: true, user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    leaveSocket();
  }, []);

  /**
   * Update user profile
   */
  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  }, [user]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
