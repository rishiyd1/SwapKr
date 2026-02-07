const { Chat, User, Item } = require('../models');
const { Op } = require('sequelize');

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, itemId, message } = req.body;
        const senderId = req.user.id;

        const chat = await Chat.create({
            senderId,
            receiverId,
            itemId,
            message
        });

        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getChats = async (req, res) => {
    try {
        const userId = req.user.id;
        // Get all chats where user is sender OR receiver
        // Group by the other person?
        // Simple list for now.
        const chats = await Chat.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName'] },
                { model: User, as: 'receiver', attributes: ['id', 'firstName', 'lastName'] },
                { model: Item, as: 'item', attributes: ['id', 'title'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getChatWithUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.userId;

        const chats = await Chat.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName'] },
                { model: User, as: 'receiver', attributes: ['id', 'firstName', 'lastName'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
