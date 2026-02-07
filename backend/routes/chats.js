const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, chatController.sendMessage);
router.get('/', authenticateToken, chatController.getChats);
router.get('/:userId', authenticateToken, chatController.getChatWithUser);

module.exports = router;
