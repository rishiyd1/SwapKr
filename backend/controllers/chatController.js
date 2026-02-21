import { Chat, Message, User, Item, Request } from "../models/index.js";
import pool from "../config/database.js";

// POST /api/chat/start - Start a conversation about an item
// POST /api/chat/start - Start a conversation about an item or request
export const startConversation = async (req, res) => {
  try {
    const { itemId, sellerId, requestId } = req.body;
    const currentUserId = req.user.id;

    let targetBuyerId, targetSellerId, targetItemId;

    if (requestId) {
      // Flow: Seller responding to a General Item Request ("I can provide this")
      // In this case, the Current User is the SELLER, and the Requester is the BUYER.
      const request = await Request.findByIdWithDetails(requestId);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      targetBuyerId = request.requesterId;
      targetSellerId = currentUserId;
      targetItemId = null; // No specific item listing yet
    } else {
      // Flow: Buyer interested in an Item Listing
      // Current User is BUYER, Listing Owner is SELLER
      targetBuyerId = currentUserId;
      targetSellerId = sellerId;
      targetItemId = itemId;
    }

    if (!targetBuyerId || !targetSellerId || (!targetItemId && !requestId)) {
      return res.status(400).json({ message: "Missing required chat details" });
    }

    // Can't chat with yourself
    if (targetBuyerId === targetSellerId) {
      return res
        .status(400)
        .json({ message: "Cannot start chat with yourself" });
    }

    // Check if chat already exists
    // Check if chat already exists
    let query = {
      buyerId: targetBuyerId,
      sellerId: targetSellerId,
    };

    if (requestId) {
      query.requestId = requestId;
    } else {
      query.itemId = targetItemId;
    }

    let chat = await Chat.findOne(query);

    if (chat) {
      return res.status(200).json({
        message: "Chat already exists",
        chat,
        isNew: false,
      });
    }

    // Create new chat
    chat = await Chat.create({
      buyerId: targetBuyerId,
      sellerId: targetSellerId,
      itemId: targetItemId, // Will be null if requestId is present
      requestId: requestId || null,
      lastMessageAt: new Date(),
    });

    // Fetch with associations
    const fullChat = await Chat.findByIdWithDetails(chat.id);

    res.status(201).json({
      message: "Chat started",
      chat: fullChat,
      isNew: true,
    });
  } catch (error) {
    console.error("Start Chat Error:", error);
    res
      .status(500)
      .json({ message: "Error starting chat", error: error.message });
  }
};

// GET /api/chat - Get all my conversations
export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.findAllForUser(userId);
    res.status(200).json(chats);
  } catch (error) {
    console.error("Get Chats Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching chats", error: error.message });
  }
};

// GET /api/chat/:chatId/messages - Get messages in a conversation
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Verify user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (chat.buyerId !== userId && chat.sellerId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this chat" });
    }

    const messages = await Message.findAllByChat(chatId);

    // Mark messages as read
    await Message.markAsRead(chatId, userId);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
};

// POST /api/chat/:chatId/messages - Send a message
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Verify user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (chat.buyerId !== senderId && chat.sellerId !== senderId) {
      return res
        .status(403)
        .json({ message: "Not authorized to send messages here" });
    }

    // Create message
    const message = await Message.create({
      chatId: chatId,
      itemId: chat.itemId,
      senderId,
      content,
    });

    // Update chat's lastMessageAt
    await Chat.update(chatId, { lastMessageAt: new Date() });

    // Fetch with sender info
    const fullMessage = await Message.findByIdWithSender(message.id);

    res.status(201).json(fullMessage);
  } catch (error) {
    console.error("Send Message Error:", error);
    res
      .status(500)
      .json({ message: "Error sending message", error: error.message });
  }
};

// GET /api/chat/:chatId - Get single conversation details
export const getConversation = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findByIdWithDetails(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (chat.buyerId !== userId && chat.sellerId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Get Chat Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching chat", error: error.message });
  }
};

// GET /api/chats/unread-summary - Get counts for navbar badge
export const getUnreadSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Count unread messages
    const messageResult = await pool.query(
      `SELECT COUNT(*)::integer FROM messages 
       WHERE "senderId" != $1::integer AND "isRead" = false
       AND "chatId" IN (SELECT id FROM chats WHERE "buyerId" = $1::integer OR "sellerId" = $1::integer)`,
      [userId],
    );

    // 2. Count pending buy requests (for me as seller)
    const requestResult = await pool.query(
      `SELECT COUNT(*)::integer FROM buy_requests 
       WHERE "sellerId" = $1::integer AND status = 'Pending'`,
      [userId],
    );

    const unreadMessages = messageResult.rows[0].count;
    const pendingRequests = requestResult.rows[0].count;
    const totalUnread = unreadMessages + pendingRequests;

    res.status(200).json({
      totalUnread,
      unreadMessages,
      pendingRequests,
    });
  } catch (error) {
    console.error("Get Unread Summary Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching unread summary", error: error.message });
  }
};
