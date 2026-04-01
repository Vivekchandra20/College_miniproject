/**
 * User Controller
 * Handles user-related operations
 */

const User = require('../models/User');

/**
 * Get all users except current user
 */
const getAllUsers = async (req, res) => {
  try {
    console.log('getAllUsers called, current user:', req.userId);
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('_id username email profilePic isOnline lastSeen publicKey')
      .limit(50);

    console.log('Found users:', users.length);
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

/**
 * Search users by username
 */
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    console.log('searchUsers called, query:', query, 'current user:', req.userId);

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const users = await User.find({
      _id: { $ne: req.userId },
      username: { $regex: query, $options: 'i' },
    })
      .select('_id username email profilePic isOnline lastSeen publicKey')
      .limit(20);

    console.log('Search found users:', users.length);
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
    });
  }
};

/**
 * Update current user's public key
 * PUT /api/users/public-key
 */
const updatePublicKey = async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey || typeof publicKey !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Public key is required',
      });
    }

    await User.findByIdAndUpdate(req.userId, { publicKey });

    res.status(200).json({
      success: true,
      message: 'Public key updated',
    });
  } catch (error) {
    console.error('Update public key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update public key',
    });
  }
};

/**
 * Update current user's profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (profilePic !== undefined && typeof profilePic !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Profile image must be a string',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePic: profilePic || null },
      { new: true }
    ).select('_id username email profilePic isOnline lastSeen publicKey');

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

module.exports = {
  getAllUsers,
  searchUsers,
  updatePublicKey,
  updateProfile,
};
