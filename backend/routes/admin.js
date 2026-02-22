import express from "express";
import authenticateToken from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

// All routes require authentication + admin access
router.use(authenticateToken);
router.use(adminAuth);

// Item management
router.get("/pending-items", adminController.getPendingItems);
router.post("/items/:id/approve", adminController.approveItem);
router.delete("/items/:id", adminController.deleteItem);

// Request management
router.get("/pending-requests", adminController.getPendingRequests);
router.post("/requests/:id/approve", adminController.approveRequest);
router.delete("/requests/:id", adminController.deleteRequest);

// Urgent request review
router.get("/urgent-requests", adminController.getUrgentRequests);

// User management
router.get("/users", adminController.getAllUsers);
router.delete("/users/:id", adminController.deleteUser);

export default router;
