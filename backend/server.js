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
import chatRoutes from "./routes/chats.js";
import "./jobs/tokenReset.js";
import { initSocket } from "./socket/socket.js";

const server = http.createServer(app);
const io = initSocket(server);

app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/chats", chatRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("SwapKr Backend is running!");
});

// Database Connection and Server Start
const startServer = async () => {
  try {
    // Test the PostgreSQL connection
    await pool.query("SELECT 1");
    console.log("Database connected successfully.");

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

startServer();

export default app;
