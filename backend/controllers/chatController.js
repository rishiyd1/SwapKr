const { Conversation, Message, User, Item } = require('../models');
const { Op } = require('sequelize');

// POST /api/chat/start - Start a conversation about an item
exports.startConversation = async (req, res) => {
    try {
        const { itemId, sellerId } = req.body;
        const buyerId = req.user.id;

        // Can't chat with yourself
        if (buyerId === sellerId) {
            return res.status(400).json({ message: "Cannot start chat with yourself" });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            where: { buyerId, sellerId, itemId }
        });

        if (conversation) {
            return res.status(200).json({
                message: 'Conversation already exists',
                conversation,
                isNew: false
            });
        }

        // Create new conversation
        conversation = await Conversation.create({
            buyerId,
            sellerId,
            itemId,
            lastMessageAt: new Date()
        });

        // Fetch with associations
        const fullConversation = await Conversation.findByPk(conversation.id, {
            include: [
                { model: User, as: 'buyer', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'seller', attributes: ['id', 'name', 'email'] },
                { model: Item, as: 'item', attributes: ['id', 'title', 'price'] }
            ]
        });

        res.status(201).json({
            message: 'Conversation started',
            conversation: fullConversation,
            isNew: true
        });
    } catch (error) {
        console.error('Start Conversation Error:', error);
        res.status(500).json({ message: 'Error starting conversation', error: error.message });
    }
};

// GET /api/chat - Get all my conversations
exports.getMyConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { buyerId: userId },
                    { sellerId: userId }
                ]
            },
            include: [
                { model: User, as: 'buyer', attributes: ['id', 'name'] },
                { model: User, as: 'seller', attributes: ['id', 'name'] },
                { model: Item, as: 'item', attributes: ['id', 'title', 'price', 'status'] }
            ],
            order: [['lastMessageAt', 'DESC']]
        });

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({ message: 'Error fetching conversations', error: error.message });
    }
};

// GET /api/chat/:conversationId/messages - Get messages in a conversation
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Verify user is part of this conversation
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
            return res.status(403).json({ message: 'Not authorized to view this conversation' });
        }

        const messages = await Message.findAll({
            where: { conversationId },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        // Mark messages as read
        await Message.update(
            { isRead: true },
            { where: { conversationId, senderId: { [Op.ne]: userId }, isRead: false } }
        );

        res.status(200).json(messages);
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

// POST /api/chat/:conversationId/messages - Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Verify user is part of this conversation
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (conversation.buyerId !== senderId && conversation.sellerId !== senderId) {
            return res.status(403).json({ message: 'Not authorized to send messages here' });
        }

        // Create message
        const message = await Message.create({
            conversationId,
            buyerId: conversation.buyerId,
            sellerId: conversation.sellerId,
            itemId: conversation.itemId,
            senderId,
            content
        });

        // Update conversation's lastMessageAt
        conversation.lastMessageAt = new Date();
        await conversation.save();

        // Fetch with sender info
        const fullMessage = await Message.findByPk(message.id, {
            include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }]
        });

        res.status(201).json(fullMessage);
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
};

// GET /api/chat/:conversationId - Get single conversation details
exports.getConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const conversation = await Conversation.findByPk(conversationId, {
            include: [
                { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'hostel'] },
                { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'hostel'] },
                { model: Item, as: 'item', attributes: ['id', 'title', 'price', 'status', 'pickupLocation'] }
            ]
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.status(200).json(conversation);
    } catch (error) {
        console.error('Get Conversation Error:', error);
        res.status(500).json({ message: 'Error fetching conversation', error: error.message });
    }
};
