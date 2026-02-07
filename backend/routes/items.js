const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authenticateToken = require('../middleware/auth');

// Public routes (Viewing items)
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);

// Protected routes (Creating items)
router.post('/', authenticateToken, itemController.createItem);

module.exports = router;
