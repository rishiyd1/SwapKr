import express from "express";
import * as requestController from "../controllers/requestController.js";
import authenticateToken from "../middleware/auth.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = express.Router();

router.get("/", optionalAuth, requestController.getRequests);
router.get("/my-requests", authenticateToken, requestController.getMyRequests);
router.get("/:id", requestController.getRequestById);
router.post("/", authenticateToken, requestController.createRequest);
router.put("/:id", authenticateToken, requestController.updateRequest);
router.delete("/:id", authenticateToken, requestController.deleteRequest);

export default router;
