import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./models/index.js";
import http from "http";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/items.js";
import requestRoutes from "./routes/requests.js";
import orderRoutes from "./routes/orders.js";
import chatRoutes from "./routes/chats.js";
import feedbackRoutes from "./routes/feedback.js";
import notificationRoutes from "./routes/notifications.js";
import "./jobs/tokenReset.js";
import "./jobs/notificationCleanup.js";
import { initSocket } from "./socket/socket.js";

const server = http.createServer(app);
const io = initSocket(server);

app.set("io", io);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
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
