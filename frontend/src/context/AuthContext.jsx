/**
 * Authentication Context
 * Manages auth state globally
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';
import { initializeSocket, leaveSocket, joinSocket } from '../services/socket';
import { getOrCreateKeypair } from '../utils/e2ee';

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
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      initializeSocket();
      joinSocket(parsedUser.id);

      (async () => {
        try {
          const keypair = await getOrCreateKeypair(parsedUser.id);
          if (parsedUser.publicKey !== keypair.publicKey) {
            await userAPI.updatePublicKey(keypair.publicKey);
            const updatedUser = { ...parsedUser, publicKey: keypair.publicKey };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.warn('[Auth] Failed to initialize E2EE keys');
        }
      })();
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

      try {
        const keypair = await getOrCreateKeypair(user.id);
        if (user.publicKey !== keypair.publicKey) {
          await userAPI.updatePublicKey(keypair.publicKey);
          const updatedUser = { ...user, publicKey: keypair.publicKey };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.warn('[Auth] Failed to initialize E2EE keys');
      }

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

      try {
        const keypair = await getOrCreateKeypair(user.id);
        if (user.publicKey !== keypair.publicKey) {
          await userAPI.updatePublicKey(keypair.publicKey);
          const updatedUser = { ...user, publicKey: keypair.publicKey };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.warn('[Auth] Failed to initialize E2EE keys');
      }

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
