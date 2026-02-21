import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
      if (!err && user.id && UUID_REGEX.test(user.id)) {
        req.user = user;
      }
      // If error or old integer ID token, just proceed as guest
      next();
    },
  );
};

export default optionalAuth;
