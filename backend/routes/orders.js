import express from 'express';
import * as orderController from '../controllers/orderController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

// Buyer sends a buy request
router.post('/buy-request', orderController.sendBuyRequest);

// Seller views incoming buy requests
router.get('/incoming', orderController.getIncomingRequests);

// Buyer views their sent requests
router.get('/my-requests', orderController.getMyRequests);

// Seller accepts a buy request
router.put('/:requestId/accept', orderController.acceptRequest);

// Seller rejects a buy request
router.put('/:requestId/reject', orderController.rejectRequest);

// Seller marks item as sold
router.put('/:requestId/mark-sold', orderController.markAsSold);

export default router;
