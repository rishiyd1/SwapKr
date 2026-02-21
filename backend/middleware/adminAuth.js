import dotenv from "dotenv";
dotenv.config();

// Hardcoded admin emails
export const ADMIN_EMAILS = [
  "kushagars.ic.23@nitj.ac.in",
  "rishi.ic.23@nitj.ac.in",
  "vedanshm.ee.23@nitj.ac.in",
  "ashishg.ic.23@nitj.ac.in",
];

export const isAdmin = (email) => ADMIN_EMAILS.includes(email?.toLowerCase());

// Middleware: must be used AFTER authenticateToken
const adminAuth = (req, res, next) => {
  if (!req.user || !isAdmin(req.user.email)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export default adminAuth;
