const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authenticateToken = require('../middleware/auth');

router.get('/', requestController.getRequests);
router.post('/', authenticateToken, requestController.createRequest);

module.exports = router;
