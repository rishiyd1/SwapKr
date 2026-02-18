import { Chat, Message, User, Item } from "../models/index.js";

// POST /api/chat/start - Start a conversation about an item
export const startConversation = async (req, res) => {
  try {
    const { itemId, sellerId } = req.body;
    const buyerId = req.user.id;

    // Can't chat with yourself
    if (buyerId === sellerId) {
      return res
        .status(400)
        .json({ message: "Cannot start chat with yourself" });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({ buyerId, sellerId, itemId });

    if (chat) {
      return res.status(200).json({
        message: "Chat already exists",
        chat,
        isNew: false,
      });
    }

    // Create new chat
    chat = await Chat.create({
      buyerId,
      sellerId,
      itemId,
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
      chatId: parseInt(chatId),
      itemId: chat.itemId,
      senderId,
      content,
    });

    // Update chat's lastMessageAt
    await Chat.update(parseInt(chatId), { lastMessageAt: new Date() });

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
