const { Item, User, ItemImage } = require('../models');
const { Op } = require('sequelize');

// POST /api/items - Create a new listing
exports.createItem = async (req, res) => {
    try {
        const { title, description, price, category, pickupLocation, images } = req.body;
        const sellerId = req.user.id; // From auth middleware

        // Validate required fields
        if (!title || !price) {
            return res.status(400).json({ message: 'Title and price are required' });
        }

        const newItem = await Item.create({
            title,
            description,
            price,
            category: category || 'Others',
            pickupLocation,
            sellerId,
            status: 'Active'
        });

        // Handle images if any (array of URLs)
        if (images && images.length > 0) {
            const imagePromises = images.map(url => ItemImage.create({ itemId: newItem.id, imageUrl: url }));
            await Promise.all(imagePromises);
        }

        // Fetch item with images
        const itemWithImages = await Item.findByPk(newItem.id, {
            include: [{ model: ItemImage, as: 'images' }]
        });

        res.status(201).json({ message: 'Item listed successfully', item: itemWithImages });
    } catch (error) {
        console.error('Create Item Error:', error);
        res.status(500).json({ message: 'Error creating item', error: error.message });
    }
};

// GET /api/items - Get all listings (with filters)
exports.getItems = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, status } = req.query;
        let where = { status: status || 'Active' };

        // Search by title
        if (search) {
            where.title = { [Op.like]: `%${search}%` };
        }
        // Filter by category
        if (category) {
            where.category = category;
        }
        // Filter by price range
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
        }

        const items = await Item.findAll({
            where,
            include: [
                { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'hostel', 'trustScore'] },
                { model: ItemImage, as: 'images' }
            ],
            order: [['createdAt', 'DESC']] // Most recent first
        });

        res.status(200).json(items);
    } catch (error) {
        console.error('Get Items Error:', error);
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
};

// GET /api/items/:id - Get single listing
exports.getItemById = async (req, res) => {
    try {
        const item = await Item.findByPk(req.params.id, {
            include: [
                { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'hostel', 'college', 'department'] },
                { model: ItemImage, as: 'images' }
            ]
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error('Get Item Error:', error);
        res.status(500).json({ message: 'Error fetching item', error: error.message });
    }
};

// PUT /api/items/:id - Update listing
exports.updateItem = async (req, res) => {
    try {
        const { title, description, price, category, pickupLocation, status } = req.body;
        const item = await Item.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user owns this item
        if (item.sellerId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        // Update fields
        if (title) item.title = title;
        if (description) item.description = description;
        if (price) item.price = price;
        if (category) item.category = category;
        if (pickupLocation) item.pickupLocation = pickupLocation;
        if (status) item.status = status;

        await item.save();

        res.status(200).json({ message: 'Item updated successfully', item });
    } catch (error) {
        console.error('Update Item Error:', error);
        res.status(500).json({ message: 'Error updating item', error: error.message });
    }
};

// DELETE /api/items/:id - Delete listing
exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user owns this item
        if (item.sellerId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this item' });
        }

        // Delete associated images first
        await ItemImage.destroy({ where: { itemId: item.id } });
        await item.destroy();

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Delete Item Error:', error);
        res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
};

// GET /api/items/my-listings - Get current user's listings
exports.getMyListings = async (req, res) => {
    try {
        const items = await Item.findAll({
            where: { sellerId: req.user.id },
            include: [{ model: ItemImage, as: 'images' }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(items);
    } catch (error) {
        console.error('Get My Listings Error:', error);
        res.status(500).json({ message: 'Error fetching listings', error: error.message });
    }
};
