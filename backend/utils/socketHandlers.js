/**
 * Socket.IO Event Handlers
 * Handles real-time communication
 */

const User = require('../models/User');

// Store active socket connections: userId -> socketId
const userSocketMap = new Map();

/**
 * Initialize Socket.IO handlers
 * @param {SocketIO.Server} io - Socket.IO server instance
 */
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`✓ User connected: ${socket.id}`);

    /**
     * User joins with their userId
     */
    socket.on('join', async (userId) => {
      try {
        userSocketMap.set(userId, socket.id);
        socket.userId = userId;
        socket.join(`user_${userId}`);

        // Update user online status
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        // Notify others that user is online
        io.emit('user-online', {
          userId,
          status: 'online',
        });

        console.log(`✓ User ${userId} joined with socket ${socket.id}`);
      } catch (error) {
        console.error('Join error:', error);
      }
    });

    /**
     * User sends a message
     */
    socket.on('send-message', async (data) => {
      try {
        const { chatId, message, recipientIds } = data;

        // Emit to all recipients in the chat
        if (recipientIds && Array.isArray(recipientIds)) {
          recipientIds.forEach((recipientId) => {
            const recipientSocketId = userSocketMap.get(recipientId);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit('receive-message', {
                chatId,
                message,
                senderSocket: socket.id,
              });
            }
          });
        }
      } catch (error) {
        console.error('Send message error:', error);
      }
    });

    /**
     * User is typing
     */
    socket.on('typing', (data) => {
      try {
        const { chatId, recipientIds, username } = data;

        if (recipientIds && Array.isArray(recipientIds)) {
          recipientIds.forEach((recipientId) => {
            const recipientSocketId = userSocketMap.get(recipientId);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit('user-typing', {
                chatId,
                username,
                userId: socket.userId,
              });
            }
          });
        }
      } catch (error) {
        console.error('Typing error:', error);
      }
    });

    /**
     * User stopped typing
     */
    socket.on('stop-typing', (data) => {
      try {
        const { chatId, recipientIds } = data;

        if (recipientIds && Array.isArray(recipientIds)) {
          recipientIds.forEach((recipientId) => {
            const recipientSocketId = userSocketMap.get(recipientId);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit('user-stopped-typing', {
                chatId,
                userId: socket.userId,
              });
            }
          });
        }
      } catch (error) {
        console.error('Stop typing error:', error);
      }
    });

    /**
     * Message read receipt
     */
    socket.on('message-read', (data) => {
      try {
        const { messageId, chatId, senderIds } = data;

        if (senderIds && Array.isArray(senderIds)) {
          senderIds.forEach((senderId) => {
            const senderSocketId = userSocketMap.get(senderId);
            if (senderSocketId) {
              io.to(senderSocketId).emit('message-read-receipt', {
                messageId,
                chatId,
                readBy: socket.userId,
              });
            }
          });
        }
      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    /**
     * User calls another user
     */
    socket.on('initiate-call', (data) => {
      try {
        const { targetUserId, callData } = data;
        const targetSocketId = userSocketMap.get(targetUserId);

        if (targetSocketId) {
          io.to(targetSocketId).emit('incoming-call', {
            from: socket.userId,
            callData,
          });
        }
      } catch (error) {
        console.error('Call initiate error:', error);
      }
    });

    /**
     * User accepts call
     */
    socket.on('accept-call', (data) => {
      try {
        const { callData, targetUserId } = data;
        const targetSocketId = userSocketMap.get(targetUserId);

        if (targetSocketId) {
          io.to(targetSocketId).emit('call-accepted', {
            from: socket.userId,
            callData,
          });
        }
      } catch (error) {
        console.error('Call accept error:', error);
      }
    });

    /**
     * User rejects call
     */
    socket.on('reject-call', (data) => {
      try {
        const { targetUserId } = data;
        const targetSocketId = userSocketMap.get(targetUserId);

        if (targetSocketId) {
          io.to(targetSocketId).emit('call-rejected', {
            from: socket.userId,
          });
        }
      } catch (error) {
        console.error('Call reject error:', error);
      }
    });

    /**
     * Handle WebRTC ICE candidates
     */
    socket.on('ice-candidate', (data) => {
      try {
        const { targetUserId, candidate } = data;
        const targetSocketId = userSocketMap.get(targetUserId);

        if (targetSocketId) {
          io.to(targetSocketId).emit('ice-candidate', {
            from: socket.userId,
            candidate,
          });
        }
      } catch (error) {
        console.error('ICE candidate error:', error);
      }
    });

    /**
     * Handle offer in WebRTC
     */
    socket.on('offer', (data) => {
      try {
        const { targetUserId, offer } = data;
        const targetSocketId = userSocketMap.get(targetUserId);

        if (targetSocketId) {
          io.to(targetSocketId).emit('offer', {
            from: socket.userId,
            offer,
          });
        }
      } catch (error) {
        console.error('Offer error:', error);
      }
    });

    /**
     * Handle answer in WebRTC
     */
    socket.on('answer', (data) => {
      try {
        const { targetUserId, answer } = data;
        const targetSocketId = userSocketMap.get(targetUserId);

        if (targetSocketId) {
          io.to(targetSocketId).emit('answer', {
            from: socket.userId,
            answer,
          });
        }
      } catch (error) {
        console.error('Answer error:', error);
      }
    });

    /**
     * User disconnects
     */
    socket.on('disconnect', async () => {
      try {
        if (socket.userId) {
          userSocketMap.delete(socket.userId);

          // Update user offline status
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          // Notify others that user is offline
          io.emit('user-offline', {
            userId: socket.userId,
            status: 'offline',
          });

          console.log(`✓ User ${socket.userId} disconnected`);
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

/**
 * Get all active users
 * @returns {Object} - Map of userId to socketId
 */
const getActiveUsers = () => {
  return Object.fromEntries(userSocketMap);
};

/**
 * Check if user is online
 * @param {string} userId - User ID
 * @returns {boolean}
 */
const isUserOnline = (userId) => {
  return userSocketMap.has(userId);
};

module.exports = {
  initializeSocket,
  getActiveUsers,
  isUserOnline,
  userSocketMap,
};
