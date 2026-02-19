import {
  BuyRequest,
  Item,
  Chat,
  Message,
  Notification,
} from "../models/index.js";

// POST /api/orders/buy-request — Buyer sends a buy request with one message
export const sendBuyRequest = async (req, res) => {
  try {
    const { itemId, message } = req.body;
    const buyerId = req.user.id;

    if (!itemId || !message || message.trim() === "") {
      return res
        .status(400)
        .json({ message: "Item ID and message are required" });
    }

    // Fetch the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Can't buy your own item
    if (item.sellerId === buyerId) {
      return res.status(400).json({ message: "You cannot buy your own item" });
    }

    // Item must be available
    if (item.status !== "Available") {
      return res
        .status(400)
        .json({ message: "This item is no longer available" });
    }

    // Check for duplicate pending request
    const existingRequest = await BuyRequest.findOne({ buyerId, itemId });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You already have a pending request for this item" });
    }

    // Create the buy request
    const buyRequest = await BuyRequest.create({
      buyerId,
      sellerId: item.sellerId,
      itemId,
      message: message.trim(),
    });

    // Create notification for seller
    await Notification.create({
      userId: item.sellerId,
      type: "buy_request",
      content: `New buy request for your item: ${item.title}`,
      relatedId: buyRequest.id,
    });

    // Fetch with full details
    const fullRequest = await BuyRequest.findByIdWithDetails(buyRequest.id);

    res.status(201).json({
      message: "Buy request sent successfully",
      buyRequest: fullRequest,
    });
  } catch (error) {
    console.error("Send Buy Request Error:", error);
    res
      .status(500)
      .json({ message: "Error sending buy request", error: error.message });
  }
};

// GET /api/orders/incoming — Seller sees all buy requests for their items
export const getIncomingRequests = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const requests = await BuyRequest.findAllForSeller(sellerId);

    res.status(200).json(requests);
  } catch (error) {
    console.error("Get Incoming Requests Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching requests", error: error.message });
  }
};

// GET /api/orders/my-requests — Buyer sees all their sent buy requests
export const getMyRequests = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const requests = await BuyRequest.findAllForBuyer(buyerId);

    res.status(200).json(requests);
  } catch (error) {
    console.error("Get My Requests Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching your requests", error: error.message });
  }
};

// PUT /api/orders/:requestId/accept — Seller accepts → creates Chat + initial message
export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const sellerId = req.user.id;

    const buyRequest = await BuyRequest.findById(requestId);
    if (!buyRequest) {
      return res.status(404).json({ message: "Buy request not found" });
    }

    // Only the seller can accept
    if (buyRequest.sellerId !== sellerId) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this request" });
    }

    // Must be pending
    if (buyRequest.status !== "Pending") {
      return res
        .status(400)
        .json({ message: `Request is already ${buyRequest.status}` });
    }

    // Update request status to Accepted
    await BuyRequest.update(requestId, { status: "Accepted" });

    // Create a chat between buyer and seller for this item
    let chat = await Chat.findOne({
      buyerId: buyRequest.buyerId,
      sellerId: buyRequest.sellerId,
      itemId: buyRequest.itemId,
    });

    if (!chat) {
      chat = await Chat.create({
        buyerId: buyRequest.buyerId,
        sellerId: buyRequest.sellerId,
        itemId: buyRequest.itemId,
        lastMessageAt: new Date(),
      });
    }

    // Copy the initial buy request message into the chat
    const initialMessage = await Message.create({
      chatId: chat.id,
      itemId: buyRequest.itemId,
      senderId: buyRequest.buyerId,
      content: buyRequest.message,
    });

    // Fetch full chat with details
    const fullChat = await Chat.findByIdWithDetails(chat.id);

    // Notify buyer via socket
    const io = req.app.get("io");
    if (io) {
      const { onlineUsers } = await import("../utils/socketStore.js");
      const buyerSocketId = onlineUsers.get(buyRequest.buyerId);
      if (buyerSocketId) {
        io.to(buyerSocketId).emit("buy_request_accepted", {
          requestId: parseInt(requestId),
          chat: fullChat,
        });
      }
    }

    res.status(200).json({
      message: "Buy request accepted. Chat created!",
      chat: fullChat,
    });
  } catch (error) {
    console.error("Accept Request Error:", error);
    res
      .status(500)
      .json({ message: "Error accepting request", error: error.message });
  }
};

// PUT /api/orders/:requestId/reject — Seller rejects the request
export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const sellerId = req.user.id;

    const buyRequest = await BuyRequest.findById(requestId);
    if (!buyRequest) {
      return res.status(404).json({ message: "Buy request not found" });
    }

    // Only the seller can reject
    if (buyRequest.sellerId !== sellerId) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this request" });
    }

    // Must be pending
    if (buyRequest.status !== "Pending") {
      return res
        .status(400)
        .json({ message: `Request is already ${buyRequest.status}` });
    }

    // Update request status to Rejected
    await BuyRequest.update(requestId, { status: "Rejected" });

    // Notify buyer via socket
    const io = req.app.get("io");
    if (io) {
      const { onlineUsers } = await import("../utils/socketStore.js");
      const buyerSocketId = onlineUsers.get(buyRequest.buyerId);
      if (buyerSocketId) {
        io.to(buyerSocketId).emit("buy_request_rejected", {
          requestId: parseInt(requestId),
        });
      }
    }

    res.status(200).json({ message: "Buy request rejected" });
  } catch (error) {
    console.error("Reject Request Error:", error);
    res
      .status(500)
      .json({ message: "Error rejecting request", error: error.message });
  }
};

// PUT /api/orders/:requestId/mark-sold — Seller marks item as sold, closes chat
export const markAsSold = async (req, res) => {
  try {
    const { requestId } = req.params;
    const sellerId = req.user.id;

    const buyRequest = await BuyRequest.findByIdWithDetails(requestId);
    if (!buyRequest) {
      return res.status(404).json({ message: "Buy request not found" });
    }

    // Only the seller can mark as sold
    if (buyRequest.sellerId !== sellerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Request must be accepted
    if (buyRequest.status !== "Accepted") {
      return res
        .status(400)
        .json({ message: "Can only mark sold on accepted requests" });
    }

    // Mark item as Sold
    await Item.update(buyRequest.itemId, { status: "Sold" });

    // Find and close the associated chat
    const chat = await Chat.findOne({
      buyerId: buyRequest.buyerId,
      sellerId: buyRequest.sellerId,
      itemId: buyRequest.itemId,
    });

    if (chat) {
      await Chat.update(chat.id, { status: "Closed" });
    }

    // Reject all other pending requests for this item
    const allPendingQuery = await import("../config/database.js");
    await allPendingQuery.default.query(
      `UPDATE buy_requests SET status = 'Rejected', "updatedAt" = NOW()
       WHERE "itemId" = $1 AND status = 'Pending' AND id != $2`,
      [buyRequest.itemId, requestId],
    );

    // Notify buyer via socket
    const io = req.app.get("io");
    if (io) {
      const { onlineUsers } = await import("../utils/socketStore.js");
      const buyerSocketId = onlineUsers.get(buyRequest.buyerId);
      if (buyerSocketId) {
        io.to(buyerSocketId).emit("item_sold", {
          requestId: parseInt(requestId),
          itemId: buyRequest.itemId,
          chatId: chat ? chat.id : null,
        });
      }
    }

    res.status(200).json({
      message: "Item marked as sold. Chat preserved in history.",
      itemId: buyRequest.itemId,
    });
  } catch (error) {
    console.error("Mark Sold Error:", error);
    res
      .status(500)
      .json({ message: "Error marking as sold", error: error.message });
  }
};
