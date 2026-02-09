const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticateToken = require('../middleware/auth');

// All chat routes require authentication
router.use(authenticateToken);

// Start a new conversation
router.post('/start', chatController.startConversation);

// Get all my conversations
router.get('/', chatController.getMyConversations);

// Get single conversation details
router.get('/:chatId', chatController.getConversation);

// Get messages in a conversation
router.get('/:chatId/messages', chatController.getMessages);

// Send a message
router.post('/:chatId/messages', chatController.sendMessage);

module.exports = router;
