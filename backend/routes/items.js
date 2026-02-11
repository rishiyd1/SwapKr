import express from 'express';
import * as itemController from '../controllers/itemController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Public routes (Viewing items)
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);

// Protected routes (Require login)
router.post('/', authenticateToken, itemController.createItem);
router.put('/:id', authenticateToken, itemController.updateItem);
router.delete('/:id', authenticateToken, itemController.deleteItem);
router.get('/user/my-listings', authenticateToken, itemController.getMyListings);

export default router;
