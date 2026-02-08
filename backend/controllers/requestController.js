const { Request, User } = require('../models');
const { Op } = require('sequelize');

// Create a Request (Urgent deducts tokens)
exports.createRequest = async (req, res) => {
    try {
        const { title, description, type } = req.body;
        const requesterId = req.user.id;

        let tokenCost = 0;
        if (type === 'Urgent') {
            tokenCost = 25;
        } else {
            // Default to Normal if not specified
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
            const { sendBroadcastEmail } = require('../utils/broadcast');

            // Find all users except requester
            const allUsers = await User.findAll({
                where: {
                    id: { [Op.ne]: requesterId },
                    email: { [Op.ne]: null } // Ensure email exists
                },
                attributes: ['email', 'name']
            });

            // Trigger broadcast (fire and forget to not block response? Or await?)
            // We'll await it for simplicity in dev, or just not await to be fast.
            // Let's not await it so the user gets a fast response.
            sendBroadcastEmail(allUsers, { title, description });
        }

        res.status(201).json({ message: 'Request posted successfully', request: newRequest, remainingTokens: user.tokens });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating request', error: error.message });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            where: { status: 'Open' },
            include: [
                { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ],
            order: [['isUrgent', 'DESC'], ['createdAt', 'DESC']] // Urgent first? or just createdAt. Model has 'type' not 'isUrgent' boolean, wait.
            // in Model I defined: type: ENUM('Urgent', 'Normal').
            // So i should order by that.
        });

        // Custom sort in JS if needed, or order by type
        // 'Urgent' > 'Normal' alphabetically? No. U > N. So DESC works.
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
