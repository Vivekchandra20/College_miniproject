/**
 * User Routes
 * API endpoints for user operations
 */

const express = require('express');
const router = express.Router();
const { getAllUsers, searchUsers } = require('../controllers/userController');
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

module.exports = router;
