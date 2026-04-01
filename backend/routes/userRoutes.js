/**
 * User Routes
 * API endpoints for user operations
 */

const express = require('express');
const router = express.Router();
const { getAllUsers, searchUsers, updatePublicKey, updateProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * GET /api/users
 * Get all users except current user
 */
router.get('/', protect, getAllUsers);

/**
 * GET /api/users/search
 * Search users by username
 */
router.get('/search', protect, searchUsers);

/**
 * PUT /api/users/public-key
 * Update current user's public key
 */
router.put('/public-key', protect, updatePublicKey);

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile', protect, updateProfile);

module.exports = router;
