const { Item, User, ItemImage } = require('../models');
const { Op } = require('sequelize');

exports.createItem = async (req, res) => {
    try {
        const { title, description, price, type, category, yearOfPurchase, images } = req.body;
        const sellerId = req.user.id; // From auth middleware

        const newItem = await Item.create({
            title,
            description,
            price,
            type,
            category,
            yearOfPurchase,
            sellerId,
            status: 'Available'
        });

        // Handle images if any (assuming array of URLs passed)
        if (images && images.length > 0) {
            const imagePromises = images.map(url => ItemImage.create({ itemId: newItem.id, imageUrl: url }));
            await Promise.all(imagePromises);
        }

        res.status(201).json({ message: 'Item listed successfully', item: newItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating item', error: error.message });
    }
};

exports.getItems = async (req, res) => {
    try {
        const { search, category, type } = req.query;
        let where = { status: 'Available' };

        if (search) {
            where.title = { [Op.iLike]: `%${search}%` };
        }
        if (category) {
            where.category = category;
        }
        if (type) {
            where.type = type;
        }

        const items = await Item.findAll({
            where,
            include: [
                { model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: ItemImage, as: 'images' }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const item = await Item.findByPk(req.params.id, {
            include: [
                { model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'hostel'] },
                { model: ItemImage, as: 'images' }
            ]
        });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
