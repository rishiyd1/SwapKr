import express from 'express';
import * as requestController from '../controllers/requestController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.get('/', requestController.getRequests);
router.post('/', authenticateToken, requestController.createRequest);

export default router;
