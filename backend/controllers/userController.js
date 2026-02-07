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
      .select('_id username email profilePic isOnline lastSeen')
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
      .select('_id username email profilePic isOnline lastSeen')
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

module.exports = {
  getAllUsers,
  searchUsers,
};
