import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // Unauthorized

  jwt.verify(
    token,
    process.env.JWT_SECRET || "secret_key_change_me",
    (err, user) => {
      if (err) return res.sendStatus(403); // Forbidden
      // Reject old tokens with integer IDs (pre-UUID migration)
      if (user.id && !UUID_REGEX.test(user.id)) {
        return res
          .status(401)
          .json({ message: "Session expired. Please log in again." });
      }
      req.user = user;
      next();
    },
  );
};

export default authenticateToken;
