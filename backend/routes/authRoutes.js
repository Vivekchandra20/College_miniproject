/**
 * Authentication Routes
 * /api/auth
 */

const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.post('/logout', authMiddleware, logoutUser);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
