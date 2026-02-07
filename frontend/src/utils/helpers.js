/**
 * Helper Utilities
 * Common utility functions
 */

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '';

  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now - messageDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return messageDate.toLocaleDateString();
};

/**
 * Format time to HH:MM format
 */
export const formatTime = (date) => {
  if (!date) return '';

  const messageDate = new Date(date);
  return messageDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format datetime to readable string
 */
export const formatDateTime = (date) => {
  if (!date) return '';

  const messageDate = new Date(date);
  return messageDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get user avatar initials
 */
export const getAvatarInitials = (username) => {
  if (!username) return '';
  return username
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Generate random color for avatar
 */
export const getAvatarColor = (username) => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#6C5CE7',
    '#A29BFE',
    '#FD79A8',
    '#FDCB6E',
    '#6C5CE7',
  ];

  if (!username) return colors[0];

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Check if user is online
 */
export const isUserOnline = (user) => {
  return user && user.isOnline;
};

/**
 * Get last seen text
 */
export const getLastSeenText = (user) => {
  if (!user) return '';
  if (user.isOnline) return 'Online';
  if (!user.lastSeen) return 'Never';

  return `Last seen ${formatDate(user.lastSeen)}`;
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Sanitize text (prevent XSS)
 */
export const sanitizeText = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Copy failed:', error);
    return false;
  }
};

/**
 * Debounce function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Get other user in one-to-one chat
 */
export const getOtherUser = (chat, currentUserId) => {
  if (!chat || !chat.users) return null;
  return chat.users.find((user) => user._id !== currentUserId);
};

/**
 * Check if message is read by all users
 */
export const isMessageReadByAll = (message, chatUsers, currentUserId) => {
  if (!message || !chatUsers) return false;

  const otherUsers = chatUsers.filter((user) => user._id !== currentUserId);
  return otherUsers.every((user) =>
    message.readBy.some((read) => read.user._id === user._id)
  );
};
