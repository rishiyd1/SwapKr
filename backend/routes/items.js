import express from "express";
import * as itemController from "../controllers/itemController.js";
import authenticateToken from "../middleware/auth.js";

import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes (Viewing items)
router.get("/", itemController.getItems);
router.get("/:id", itemController.getItemById);

// Protected routes (Require login)
router.post(
  "/",
  authenticateToken,
  upload.array("images", 5),
  itemController.createItem,
);
router.put("/:id", authenticateToken, itemController.updateItem);
router.delete("/:id", authenticateToken, itemController.deleteItem);
router.get(
  "/user/my-listings",
  authenticateToken,
  itemController.getMyListings,
);

export default router;
