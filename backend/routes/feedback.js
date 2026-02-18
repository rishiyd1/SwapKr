import express from "express";
import { sendFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

// POST /api/feedback
router.post("/", sendFeedback);

export default router;
