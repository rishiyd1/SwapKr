import express from "express";
import * as chatController from "../controllers/chatController.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// All chat routes require authentication
router.use(authenticateToken);

// Start a new conversation
router.post("/start", chatController.startConversation);

// Get all my conversations
router.get("/", chatController.getMyConversations);

// Get unread counts for navbar
router.get("/unread-summary", chatController.getUnreadSummary);

// Get single conversation details
router.get("/:chatId", chatController.getConversation);

// Get messages in a conversation
router.get("/:chatId/messages", chatController.getMessages);

// Send a message
router.post("/:chatId/messages", chatController.sendMessage);

export default router;
