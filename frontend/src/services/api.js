/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add token to all requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle token expiration
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== Authentication API ====================

export const authAPI = {
  /**
   * Register a new user
   */
  register: (userData) => api.post('/auth/register', userData),

  /**
   * Login user
   */
  login: (credentials) => api.post('/auth/login', credentials),

  /**
   * Logout user
   */
  logout: () => api.post('/auth/logout'),

  /**
   * Get current user
   */
  getCurrentUser: () => api.get('/auth/me'),
};

// ==================== Chat API ====================

export const chatAPI = {
  /**
   * Get all chats for the user
   */
  getAllChats: () => api.get('/chats'),

  /**
   * Get or create a one-to-one chat
   */
  getOrCreateChat: (targetUserId) =>
    api.post('/chats/access', { targetUserId }),

  /**
   * Create a group chat
   */
  createGroupChat: (chatData) => api.post('/chats/group', chatData),

  /**
   * Get chat by ID
   */
  getChatById: (chatId) => api.get(`/chats/${chatId}`),

  /**
   * Add user to group chat
   */
  addUserToGroup: (chatId, userId) =>
    api.put(`/chats/${chatId}/add-user`, { userId }),

  /**
   * Remove user from group chat
   */
  removeUserFromGroup: (chatId, userId) =>
    api.put(`/chats/${chatId}/remove-user`, { userId }),
};

// ==================== Message API ====================

export const messageAPI = {
  /**
   * Get messages from a chat
   */
  getMessages: (chatId, limit = 50, skip = 0) =>
    api.get(`/messages/${chatId}`, { params: { limit, skip } }),

  /**
   * Send a message
   */
  sendMessage: (messageData) => api.post('/messages', messageData),

  /**
   * Mark message as read
   */
  markMessageAsRead: (messageId) =>
    api.put(`/messages/${messageId}/read`),

  /**
   * Mark all messages in chat as read
   */
  markChatAsRead: (chatId) =>
    api.put(`/messages/chat/${chatId}/read-all`),

  /**
   * Edit a message
   */
  editMessage: (messageId, content) =>
    api.put(`/messages/${messageId}`, { content }),

  /**
   * Delete a message
   */
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
};

export default api;
