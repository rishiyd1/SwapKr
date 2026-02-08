const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authenticateToken = require('../middleware/auth');

// Public routes (Viewing items)
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);

// Protected routes (Require login)
router.post('/', authenticateToken, itemController.createItem);
router.put('/:id', authenticateToken, itemController.updateItem);
router.delete('/:id', authenticateToken, itemController.deleteItem);
router.get('/user/my-listings', authenticateToken, itemController.getMyListings);

module.exports = router;
