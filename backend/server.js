import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./models/index.js";
import http from "http";
import morgan from "morgan";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/items.js";
import requestRoutes from "./routes/requests.js";
import orderRoutes from "./routes/orders.js";
import chatRoutes from "./routes/chats.js";
import feedbackRoutes from "./routes/feedback.js";
import notificationRoutes from "./routes/notifications.js";
import adminRoutes from "./routes/admin.js";

import "./jobs/tokenReset.js";
import "./jobs/notificationCleanup.js";
import "./jobs/annualCleanup.js";
import { initSocket } from "./socket/socket.js";

const server = http.createServer(app);
const io = initSocket(server);

app.set("io", io);
app.use(morgan("dev"));

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:8081",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8081",
        process.env.CLIENT_URL,
      ];

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || !process.env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);


// Basic Route
app.get("/", (req, res) => {
  res.send("SwapKr Backend is running!");
});

// Redirect singular /api/chat to /api/chats for robustness
app.use("/api/chat", (req, res) => {
  res.redirect(301, `/api/chats${req.url}`);
});

// Database Connection and Server Start
const startServer = async () => {
  try {
    // Test the PostgreSQL connection
    await pool.query("SELECT 1");
    console.log("Database connected successfully.");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

startServer();

export default app;
