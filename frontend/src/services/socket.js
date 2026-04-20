/**
 * Socket.IO Service
 * Manages WebSocket connections and real-time events
 */

import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Initialize Socket.IO connection
 */
export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✓ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('✗ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

/**
 * Get socket instance
 */
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

/**
 * Join user to socket with userId
 */
export const joinSocket = (userId) => {
  const socket = getSocket();
  socket.emit('join', userId);
};

/**
 * Leave socket connection
 */
export const leaveSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// ==================== Message Events ====================

export const messageEvents = {
  /**
   * Send a message through WebSocket
   */
  sendMessage: (chatId, message, recipientIds) => {
    const socket = getSocket();
    socket.emit('send-message', {
      chatId,
      message,
      recipientIds,
    });
  },

  /**
   * Listen for incoming messages
   */
  onMessageReceived: (callback) => {
    const socket = getSocket();
    socket.on('receive-message', callback);
    return () => socket.off('receive-message', callback);
  },

  /**
   * Mark message as read (send notification)
   */
  markMessageAsRead: (messageId, chatId, senderIds) => {
    const socket = getSocket();
    socket.emit('message-read', {
      messageId,
      chatId,
      senderIds,
    });
  },

  /**
   * Listen for read receipts
   */
  onReadReceipt: (callback) => {
    const socket = getSocket();
    socket.on('message-read-receipt', callback);
    return () => socket.off('message-read-receipt', callback);
  },
};

// ==================== Typing Indicator Events ====================

export const typingEvents = {
  /**
   * Emit typing indicator
   */
  startTyping: (chatId, recipientIds, username) => {
    const socket = getSocket();
    socket.emit('typing', {
      chatId,
      recipientIds,
      username,
    });
  },

  /**
   * Listen for user typing
   */
  onUserTyping: (callback) => {
    const socket = getSocket();
    socket.on('user-typing', callback);
    return () => socket.off('user-typing', callback);
  },

  /**
   * Stop typing indicator
   */
  stopTyping: (chatId, recipientIds) => {
    const socket = getSocket();
    socket.emit('stop-typing', {
      chatId,
      recipientIds,
    });
  },

  /**
   * Listen for user stopped typing
   */
  onUserStoppedTyping: (callback) => {
    const socket = getSocket();
    socket.on('user-stopped-typing', callback);
    return () => socket.off('user-stopped-typing', callback);
  },
};

// ==================== User Status Events ====================

export const userStatusEvents = {
  /**
   * Listen for user coming online
   */
  onUserOnline: (callback) => {
    const socket = getSocket();
    socket.on('user-online', callback);
    return () => socket.off('user-online', callback);
  },

  /**
   * Listen for user going offline
   */
  onUserOffline: (callback) => {
    const socket = getSocket();
    socket.on('user-offline', callback);
    return () => socket.off('user-offline', callback);
  },
};

// ==================== Video Call Events ====================

export const callEvents = {
  /**
   * Initiate a call
   */
  initiateCall: (targetUserId, callData) => {
    const socket = getSocket();
    socket.emit('initiate-call', {
      targetUserId,
      callData,
    });
  },

  /**
   * Listen for incoming call
   */
  onIncomingCall: (callback) => {
    const socket = getSocket();
    socket.on('incoming-call', callback);
    return () => socket.off('incoming-call', callback);
  },

  /**
   * Accept call
   */
  acceptCall: (callData, targetUserId) => {
    const socket = getSocket();
    socket.emit('accept-call', {
      callData,
      targetUserId,
    });
  },

  /**
   * Listen for call accepted
   */
  onCallAccepted: (callback) => {
    const socket = getSocket();
    socket.on('call-accepted', callback);
    return () => socket.off('call-accepted', callback);
  },

  /**
   * Reject call
   */
  rejectCall: (targetUserId) => {
    const socket = getSocket();
    socket.emit('reject-call', { targetUserId });
  },

  /**
   * Listen for call rejected
   */
  onCallRejected: (callback) => {
    const socket = getSocket();
    socket.on('call-rejected', callback);
    return () => socket.off('call-rejected', callback);
  },
};

// ==================== WebRTC Events ====================

export const webRTCEvents = {
  /**
   * Send ICE candidate
   */
  sendIceCandidate: (targetUserId, candidate) => {
    const socket = getSocket();
    socket.emit('ice-candidate', {
      targetUserId,
      candidate,
    });
  },

  /**
   * Listen for ICE candidate
   */
  onIceCandidate: (callback) => {
    const socket = getSocket();
    socket.on('ice-candidate', callback);
    return () => socket.off('ice-candidate', callback);
  },

  /**
   * Send WebRTC offer
   */
  sendOffer: (targetUserId, offer) => {
    const socket = getSocket();
    socket.emit('offer', {
      targetUserId,
      offer,
    });
  },

  /**
   * Listen for WebRTC offer
   */
  onOffer: (callback) => {
    const socket = getSocket();
    socket.on('offer', callback);
    return () => socket.off('offer', callback);
  },

  /**
   * Send WebRTC answer
   */
  sendAnswer: (targetUserId, answer) => {
    const socket = getSocket();
    socket.emit('answer', {
      targetUserId,
      answer,
    });
  },

  /**
   * Listen for WebRTC answer
   */
  onAnswer: (callback) => {
    const socket = getSocket();
    socket.on('answer', callback);
    return () => socket.off('answer', callback);
  },
};
