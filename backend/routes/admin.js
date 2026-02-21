import express from "express";
import authenticateToken from "../middleware/auth.js";
import isAdmin from "../middleware/admin.js";
import User from "../models/User.js";
import Item from "../models/Item.js";
import pool from "../config/database.js";

const router = express.Router();

// Get all users (Admin only)
router.get("/users", authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.findAll({}, { exclude: ['password'] });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user role
router.patch("/users/:id/role", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.update(req.params.id, { role });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user
router.delete("/users/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        await User.destroy(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get stats
router.get("/stats", authenticateToken, isAdmin, async (req, res) => {
    try {
        const userCount = await pool.query("SELECT COUNT(*) FROM users");
        const itemCount = await pool.query("SELECT COUNT(*) FROM items");
        const requestCount = await pool.query("SELECT COUNT(*) FROM requests");

        res.json({
            totalUsers: parseInt(userCount.rows[0].count),
            totalItems: parseInt(itemCount.rows[0].count),
            totalRequests: parseInt(requestCount.rows[0].count),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all items with specific status (Admin only)
router.get("/items", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const items = await Item.findAll({ where: { status: status || 'Pending' } });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Approve/Update item status (Admin only)
router.patch("/items/:id/status", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const item = await Item.update(req.params.id, { status });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete item (Admin only)
router.delete("/items/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        await Item.destroy(req.params.id);
        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

