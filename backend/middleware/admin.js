import User from "../models/User.js";

const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(req.user.id);
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: "Access denied. Admin only." });
        }
    } catch (error) {
        console.error("Admin middleware error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default isAdmin;
