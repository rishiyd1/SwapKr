import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

router.get("/", notificationController.getNotifications);
router.put("/mark-all-read", notificationController.markAllRead);
router.put("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

export default router;
