/**
 * Message Routes
 * /api/messages
 */

const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  editMessage,
  markChatAsRead,
  clearChatMessages,
} = require('../controllers/messageController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All message routes require authentication
router.use(authMiddleware);

router.get('/:chatId', getMessages);
router.post('/', sendMessage);
router.put('/:id', editMessage);
router.put('/:id/read', markMessageAsRead);
router.put('/chat/:chatId/read-all', markChatAsRead);
router.delete('/chat/:chatId/clear', clearChatMessages);
router.delete('/:id', deleteMessage);

module.exports = router;
