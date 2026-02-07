/**
 * Message Controller
 * Handles message operations
 */

const Message = require('../models/Message');
const Chat = require('../models/Chat');

/**
 * Get messages for a chat
 * GET /api/messages/:chatId
 */
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    const userId = req.userId;

    // Verify user is part of chat
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    if (!chat.users.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this chat',
      });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username email profilePic')
      .populate('readBy.user', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Message.countDocuments({ chat: chatId });

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      total,
      hasMore: skip + parseInt(limit) < total,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

/**
 * Send a message
 * POST /api/messages
 */
const sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { chatId, content } = req.body;

    if (!chatId || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and message content are required',
      });
    }

    // Verify chat exists
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    // Verify user is part of chat
    if (!chat.users.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this chat',
      });
    }

    // Create message
    const message = await Message.create({
      sender: userId,
      chat: chatId,
      content: content.trim(),
      readBy: [{ user: userId }],
    });

    // Populate sender info
    await message.populate('sender', 'username email profilePic');

    // Update last message in chat
    chat.lastMessage = message._id;
    await chat.save();

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

/**
 * Mark message as read
 * PUT /api/messages/:id/read
 */
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if already read by user
    const alreadyRead = message.readBy.some(
      (item) => item.user.toString() === userId
    );

    if (!alreadyRead) {
      message.readBy.push({ user: userId });
      await message.save();
    }

    await message.populate('readBy.user', 'username email');

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message,
    });
  }
};

/**
 * Delete a message
 * DELETE /api/messages/:id
 */
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user is message sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
    }

    await Message.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message,
    });
  }
};

/**
 * Edit a message
 * PUT /api/messages/:id
 */
const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user is message sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
    }

    message.content = content.trim();
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    await message.populate('sender', 'username email profilePic');

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error editing message',
      error: error.message,
    });
  }
};

/**
 * Mark all messages in chat as read
 * PUT /api/messages/chat/:chatId/read-all
 */
const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    // Verify user is part of chat
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    if (!chat.users.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this chat',
      });
    }

    // Update all messages
    await Message.updateMany(
      { chat: chatId },
      {
        $addToSet: { readBy: { user: userId } },
      }
    );

    res.status(200).json({
      success: true,
      message: 'All messages marked as read',
    });
  } catch (error) {
    console.error('Mark chat as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking chat as read',
      error: error.message,
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  editMessage,
  markChatAsRead,
};
