import { Item, ItemImage } from "../models/index.js";

// POST /api/items - Create a new listing
export const createItem = async (req, res) => {
  try {
    const { title, description, price, category, pickupLocation, condition } =
      req.body;
    const sellerId = req.user.id; // From auth middleware

    console.log("Create Item Request:", { body: req.body, sellerId });

    // Validate required fields
    if (!title || !price || !category) {
      return res
        .status(400)
        .json({ message: "Title, price, and category are required" });
    }

    // Validate images constraint
    if (!req.files || req.files.length < 2) {
      return res
        .status(400)
        .json({ message: "Please provide at least 2 images of the item" });
    }

    if (req.files.length > 5) {
      return res
        .status(400)
        .json({ message: "You can only upload a maximum of 5 images" });
    }

    // Validate title and description length
    if (title.length > 60) {
      return res
        .status(400)
        .json({ message: "Title must be less than 60 characters" });
    }

    if (!description || description.length > 300) {
      return res.status(400).json({
        message: "Description must be less than 300 characters",
      });
    }

    const newItem = await Item.create({
      title,
      description,
      price,
      category: category || "Others",
      pickupLocation,
      condition: condition || "Used",
      sellerId,
      status: "Pending",
    });

    // Handle images from Cloudinary (req.files contains array of files with .path as URL)
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file) =>
        ItemImage.create({ itemId: newItem.id, imageUrl: file.path }),
      );
      await Promise.all(imagePromises);
    }

    // Fetch item with images
    const itemWithImages = await Item.findByIdWithImages(newItem.id);

    res
      .status(201)
      .json({ message: "Item listed successfully", item: itemWithImages });
  } catch (error) {
    console.error("Create Item Error:", error);
    res
      .status(500)
      .json({ message: "Error creating item", error: error.message });
  }
};

// GET /api/items - Get all listings (with filters)
export const getItems = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    console.log("Get Items Query:", req.query);
    const where = { status: "Available" };

    if (category) where.category = category;

    // Logic to exclude own items if logged in
    if (req.user && req.user.id) {
      where.excludeSellerId = req.user.id;
    }

    const items = await Item.findAll({ where, search, minPrice, maxPrice });

    res.status(200).json(items);
  } catch (error) {
    console.error("Get Items Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching items", error: error.message });
  }
};

// GET /api/items/:id - Get single listing
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findByIdWithDetails(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Get Item Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching item", error: error.message });
  }
};

// PUT /api/items/:id - Update listing
export const updateItem = async (req, res) => {
  try {
    const { title, description, price, category, pickupLocation, status } =
      req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if user owns this item
    if (item.sellerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this item" });
    }

    // Build update fields
    const fields = {};
    if (title) fields.title = title;
    if (description) fields.description = description;
    if (price) fields.price = price;
    if (category) fields.category = category;
    if (pickupLocation) fields.pickupLocation = pickupLocation;
    if (status) fields.status = status;

    const updatedItem = await Item.update(req.params.id, fields);

    res
      .status(200)
      .json({ message: "Item updated successfully", item: updatedItem });
  } catch (error) {
    console.error("Update Item Error:", error);
    res
      .status(500)
      .json({ message: "Error updating item", error: error.message });
  }
};

// DELETE /api/items/:id - Delete listing
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if user owns this item
    if (item.sellerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this item" });
    }

    // Delete associated images first
    await import("../models/index.js").then(({ ItemImage, Chat }) =>
      Promise.all([
        ItemImage.destroyByItemId(item.id),
        Chat.deleteByItemId(item.id),
      ]),
    );

    await Item.destroy(item.id);

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete Item Error:", error);
    res
      .status(500)
      .json({ message: "Error deleting item", error: error.message });
  }
};

// GET /api/items/my-listings - Get current user's listings
export const getMyListings = async (req, res) => {
  try {
    const items = await Item.findMyListings(req.user.id);

    res.status(200).json(items);
  } catch (error) {
    console.error("Get My Listings Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching listings", error: error.message });
  }
};
