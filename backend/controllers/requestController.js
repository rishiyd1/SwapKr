import { Request, User } from '../models/index.js';
import { Op } from 'sequelize';
import { sendBroadcastEmail } from '../utils/broadcast.js';

// Create a Request (Urgent deducts tokens)
export const createRequest = async (req, res) => {
    try {
        const { title, description, type } = req.body;
        const requesterId = req.user.id;

        let tokenCost = 0;
        if (type === 'Urgent') {
            tokenCost = 25;
        }

        const user = await User.findByPk(requesterId);

        if (type === 'Urgent') {
            if (user.tokens < tokenCost) {
                return res.status(400).json({ message: 'Insufficient tokens for Urgent request' });
            }
            // Deduct tokens
            user.tokens -= tokenCost;
            await user.save();
        }

        const newRequest = await Request.create({
            title,
            description,
            type, // Urgent, Normal
            tokenCost,
            requesterId,
            status: 'Open'
        });

        // If Urgent, broadcast to all users
        if (type === 'Urgent') {
            // Find all users except requester
            const allUsers = await User.findAll({
                where: {
                    id: { [Op.ne]: requesterId },
                    email: { [Op.ne]: null } // Ensure email exists
                },
                attributes: ['email', 'name']
            });

            // Trigger broadcast (fire and forget)
            sendBroadcastEmail(allUsers, { title, description });
        }

        res.status(201).json({ message: 'Request posted successfully', request: newRequest, remainingTokens: user.tokens });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating request', error: error.message });
    }
};

export const getRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            where: { status: 'Open' },
            include: [
                { model: User, as: 'requester', attributes: ['id', 'name', 'email'] }
            ],
            order: [['type', 'DESC'], ['createdAt', 'DESC']]
        });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
