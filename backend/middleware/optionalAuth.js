import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

/**
 * Middleware to attach user to req if token exists, but DOES NOT block if missing.
 * Useful for public routes that want to customize results for logged-in users (like excluding own items).
 */
const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "secret_key_change_me",
    (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    },
  );
};

export default optionalAuthenticateToken;
