/**
 * Chat Controller
 * Handles chat operations and management
 */

const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

/**
 * Get all chats for a user
 * GET /api/chats
 */
const getAllChats = async (req, res) => {
  try {
    const userId = req.userId;

    let chats = await Chat.find({ users: userId })
      .populate('users', 'username email profilePic isOnline lastSeen')
      .populate('lastMessage')
      .populate('groupAdmin', 'username email')
      .sort({ updatedAt: -1 });

    // For one-to-one chats, get the other user's name
    chats = chats.map((chat) => {
      if (!chat.isGroupChat && chat.users.length === 2) {
        const otherUser = chat.users.find(
          (user) => user._id.toString() !== userId
        );
        chat.chatName = otherUser?.username;
      }
      return chat;
    });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chats',
      error: error.message,
    });
  }
};

/**
 * Get or create one-to-one chat
 * POST /api/chats/access
 */
const getOrCreateChat = async (req, res) => {
  try {
    const userId = req.userId;
    const { targetUserId } = req.body;

    console.log('getOrCreateChat called, userId:', userId, 'targetUserId:', targetUserId);

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID is required',
      });
    }

    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chat with yourself',
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [userId, targetUserId] },
    })
      .populate('users', 'username email profilePic isOnline lastSeen')
      .populate('lastMessage')
      .populate('groupAdmin');

    if (chat) {
      console.log('Chat already exists:', chat._id);
      return res.status(200).json({
        success: true,
        chat,
      });
    }

    // Create new chat
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    chat = await Chat.create({
      users: [userId, targetUserId],
      isGroupChat: false,
    });

    chat = await chat.populate('users', 'username email profilePic isOnline lastSeen');

    res.status(201).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error('Get or create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accessing chat',
      error: error.message,
    });
  }
};

/**
 * Create a group chat
 * POST /api/chats/group
 */
const createGroupChat = async (req, res) => {
  try {
    const userId = req.userId;
    const { chatName, members } = req.body;

    if (!chatName || !members || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Chat name and members are required',
      });
    }

    // Ensure creator is included
    const allMembers = [userId, ...members];
    const uniqueMembers = [...new Set(allMembers)];

    if (uniqueMembers.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Group must have at least 2 members',
      });
    }

    const chat = await Chat.create({
      chatName,
      users: uniqueMembers,
      isGroupChat: true,
      groupAdmin: userId,
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('users', 'username email profilePic isOnline lastSeen')
      .populate('groupAdmin', 'username email');

    res.status(201).json({
      success: true,
      message: 'Group chat created successfully',
      chat: populatedChat,
    });
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating group chat',
      error: error.message,
    });
  }
};

/**
 * Add user to group chat
 * PUT /api/chats/:id/add-user
 */
const addUserToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { userId: targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({
        success: false,
        message: 'Can only add users to group chats',
      });
    }

    // Check if user is admin
    // chat.groupAdmin is a populated User document
    const adminId = chat.groupAdmin._id ? chat.groupAdmin._id.toString() : chat.groupAdmin.toString();
    
    if (adminId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can add users',
      });
    }

    // Check if user already in group
    // chat.users are populated as User documents
    const userAlreadyInGroup = chat.users.some(u => {
      const userId = u._id ? u._id.toString() : u.toString();
      return userId === targetUserId;
    });
    
    if (userAlreadyInGroup) {
      return res.status(400).json({
        success: false,
        message: 'User already in group',
      });
    }

    chat.users.push(targetUserId);
    await chat.save();

    const updatedChat = await Chat.findById(id)
      .populate('users', 'username email profilePic isOnline lastSeen')
      .populate('groupAdmin', 'username email');

    res.status(200).json({
      success: true,
      message: 'User added to group successfully',
      chat: updatedChat,
    });
  } catch (error) {
    console.error('Add user to group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding user to group',
      error: error.message,
    });
  }
};

/**
 * Remove user from group chat
 * PUT /api/chats/:id/remove-user
 */
const removeUserFromGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { userId: targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({
        success: false,
        message: 'Can only remove users from group chats',
      });
    }

    // Check if user is admin or removing themselves
    // chat.groupAdmin is a populated User document
    const adminId = chat.groupAdmin._id ? chat.groupAdmin._id.toString() : chat.groupAdmin.toString();
    
    if (adminId !== userId && userId !== targetUserId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can remove users',
      });
    }

    // Filter out the target user from the chat
    // chat.users are populated as User documents
    chat.users = chat.users.filter(u => {
      const uId = u._id ? u._id.toString() : u.toString();
      return uId !== targetUserId;
    });
    await chat.save();

    const updatedChat = await Chat.findById(id)
      .populate('users', 'username email profilePic isOnline lastSeen')
      .populate('groupAdmin', 'username email');

    res.status(200).json({
      success: true,
      message: 'User removed from group successfully',
      chat: updatedChat,
    });
  } catch (error) {
    console.error('Remove user from group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing user from group',
      error: error.message,
    });
  }
};

/**
 * Get chat by ID
 * GET /api/chats/:id
 */
const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const chat = await Chat.findById(id)
      .populate('users', 'username email profilePic isOnline lastSeen')
      .populate('lastMessage')
      .populate('groupAdmin', 'username email');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    // Verify user is part of chat
    if (!chat.users.some((user) => user._id.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this chat',
      });
    }

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat',
      error: error.message,
    });
  }
};

module.exports = {
  getAllChats,
  getOrCreateChat,
  createGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  getChatById,
};
