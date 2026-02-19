import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) {
    // No token, proceed as guest
    return next();
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "secret_key_change_me",
    (err, user) => {
      if (!err) {
        req.user = user;
      }
      // If error (invalid token), we just proceed as guest (or could choose to fail, but optional implies lenient)
      // Usually better to just ignore invalid tokens for "optional" auth
      next();
    },
  );
};

export default optionalAuth;
