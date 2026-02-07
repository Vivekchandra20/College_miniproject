/**
 * Chat Routes
 * /api/chats
 */

const express = require('express');
const router = express.Router();
const {
  getAllChats,
  getOrCreateChat,
  createGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  getChatById,
} = require('../controllers/chatController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All chat routes require authentication
router.use(authMiddleware);

router.get('/', getAllChats);
router.post('/access', getOrCreateChat);
router.post('/group', createGroupChat);
router.get('/:id', getChatById);
router.put('/:id/add-user', addUserToGroup);
router.put('/:id/remove-user', removeUserFromGroup);

module.exports = router;
