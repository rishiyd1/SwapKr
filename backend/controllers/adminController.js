import { Item, Request, User, ItemImage, Chat, pool } from "../models/index.js";
import { addEmailJob } from "../queues/emailQueue.js";

// ─── GET ALL USERS ──────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, "phoneNumber", department, year, hostel, tokens, "createdAt"
       FROM users
       ORDER BY "createdAt" DESC`,
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("[Admin] Get All Users Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// ─── GET PENDING ITEMS ──────────────────────────────────────────────────
export const getPendingItems = async (req, res) => {
  try {
    const items = await Item.findAllPending();
    res.status(200).json(items);
  } catch (error) {
    console.error("[Admin] Get Pending Items Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching pending items", error: error.message });
  }
};

// ─── APPROVE ITEM ───────────────────────────────────────────────────────
export const approveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.status !== "Pending") {
      return res.status(400).json({ message: "Item is not pending approval" });
    }

    const updatedItem = await Item.update(req.params.id, {
      status: "Available",
    });
    res
      .status(200)
      .json({ message: "Item approved successfully", item: updatedItem });
  } catch (error) {
    console.error("[Admin] Approve Item Error:", error);
    res
      .status(500)
      .json({ message: "Error approving item", error: error.message });
  }
};

// ─── DELETE ITEM (Admin) ────────────────────────────────────────────────
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete associated images and chats first
    await Promise.all([
      ItemImage.destroyByItemId(item.id),
      Chat.deleteByItemId(item.id),
    ]);
    await Item.destroy(item.id);

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("[Admin] Delete Item Error:", error);
    res
      .status(500)
      .json({ message: "Error deleting item", error: error.message });
  }
};

// ─── GET PENDING REQUESTS ───────────────────────────────────────────────
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.findAllPendingApproval();
    res.status(200).json(requests);
  } catch (error) {
    console.error("[Admin] Get Pending Requests Error:", error);
    res.status(500).json({
      message: "Error fetching pending requests",
      error: error.message,
    });
  }
};

// ─── APPROVE REQUEST ────────────────────────────────────────────────────
export const approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "PendingApproval") {
      return res
        .status(400)
        .json({ message: "Request is not pending approval" });
    }

    const updatedRequest = await Request.update(req.params.id, {
      status: "Open",
    });

    // ── NOTIFICATIONS ──
    // Send app notification to all users when a request is approved
    try {
      if (updatedRequest) {
        const { Notification } = await import("../models/index.js");
        const isUrgent = updatedRequest.type === "Urgent";
        const prefix = isUrgent ? "Urgent Request" : "New Request";
        await Notification.createBatchForRequest({
          type: "Request",
          content: `${prefix}: ${updatedRequest.title}`,
          relatedId: updatedRequest.id,
          excludedUserId: updatedRequest.requesterId,
        });
      }
    } catch (notifError) {
      console.error(
        "[Admin] Notification error on approveRequest:",
        notifError.message,
      );
    }

    // ── EMAIL BROADCAST (Urgent only) ──
    // Queue broadcast email to all users for urgent requests
    if (updatedRequest && updatedRequest.type === "Urgent") {
      try {
        const requester = await User.findById(updatedRequest.requesterId);
        await addEmailJob({
          title: updatedRequest.title,
          description: updatedRequest.description,
          requesterName: requester?.name || "A user",
          requesterId: updatedRequest.requesterId,
          requestId: updatedRequest.id,
        });
      } catch (emailError) {
        console.error(
          "[Admin] Failed to queue email broadcast on approveRequest:",
          emailError.message,
        );
      }
    }

    res.status(200).json({
      message: "Request approved successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("[Admin] Approve Request Error:", error);
    res
      .status(500)
      .json({ message: "Error approving request", error: error.message });
  }
};

// ─── DELETE REQUEST (Admin) ─────────────────────────────────────────────
export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    await Chat.deleteByRequestId(request.id);
    await Request.destroy(request.id);

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("[Admin] Delete Request Error:", error);
    res
      .status(500)
      .json({ message: "Error deleting request", error: error.message });
  }
};

// ─── GET URGENT REQUESTS (pending approval) ────────────────────────────
export const getUrgentRequests = async (req, res) => {
  try {
    const requests = await Request.findAllUrgentPending();
    res.status(200).json(requests);
  } catch (error) {
    console.error("[Admin] Get Urgent Requests Error:", error);
    res.status(500).json({
      message: "Error fetching urgent requests",
      error: error.message,
    });
  }
};

// ─── DELETE USER (Admin) ────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cascading delete logic (mirrors deleteAccount in authController)
    // 1. Delete all items listed by user
    const items = await Item.findMyListings(userId);
    for (const item of items) {
      await Promise.all([
        ItemImage.destroyByItemId(item.id),
        Chat.deleteByItemId(item.id),
      ]);
      await Item.destroy(item.id);
    }

    // 2. Delete all requests made by user
    const requests = await Request.findByRequesterId(userId);
    for (const request of requests) {
      await Chat.deleteByRequestId(request.id);
      await Request.destroy(request.id);
    }

    // 3. Delete any remaining chats
    await Chat.deleteByUserId(userId);

    // 4. Delete the user
    await User.destroy(userId);

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("[Admin] Delete User Error:", error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};
