/**
 * API Service
 * Handles all HTTP requests to the backend with JWT authentication
 * 
 * All requests automatically include JWT token from localStorage
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with default config
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Adds JWT token to Authorization header for all requests
 * 
 * Expected token storage: localStorage.getItem('authToken')
 * Expected token format: JWT token string (without 'Bearer' prefix)
 * 
 * Header sent: Authorization: Bearer <JWT_TOKEN>
 */
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Add Bearer token to Authorization header
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[API Request] ${config.method.toUpperCase()} ${config.url} | Token present: ${token.length > 20 ? 'Yes' : 'No'}`);
      } else {
        console.warn(`[API Request] ${config.method.toUpperCase()} ${config.url} | WARNING: No token found in localStorage`);
      }
      
      return config;
    } catch (error) {
      console.error('[API Request] Interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('[API Request] Request setup error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles token expiration and error responses
 */
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || 'Unknown';
    const method = error.config?.method?.toUpperCase() || 'Unknown';
    
    console.error(`[API Error] ${status} ${method} ${url}`);
    console.error('[API Error] Response:', error.response?.data);
    
    // Handle 401 Unauthorized - token invalid or expired
    if (status === 401) {
      console.warn('[API] Token expired or invalid. Redirecting to login...');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden - user not authorized for this resource
    if (status === 403) {
      console.error('[API] Access forbidden. User may not have permission for this resource.');
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

  /**
   * Clear all messages in a chat
   */
  clearChat: (chatId) => api.delete(`/messages/chat/${chatId}/clear`),
};

// ==================== User API ====================

export const userAPI = {
  /**
   * Get all users except current user
   */
  getAllUsers: () => api.get('/users'),

  /**
   * Search users by username
   */
  searchUsers: (query) => api.get('/users/search', { params: { query } }),

  /**
   * Update current user's public key
   */
  updatePublicKey: (publicKey) => api.put('/users/public-key', { publicKey }),

  /**
   * Update user profile
   */
  updateProfile: (profilePic) => api.put('/users/profile', { profilePic }),
};

export default api;
