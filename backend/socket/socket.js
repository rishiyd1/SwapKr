import { Server } from "socket.io";
import { onlineUsers } from "../utils/socketStore.js";
import { Chat, Message } from "../models/index.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Parse comma-separated extra origins from CLIENT_URLS env var
        const extraOrigins = process.env.CLIENT_URLS
          ? process.env.CLIENT_URLS.split(",")
              .map((u) => u.trim())
              .filter(Boolean)
          : [];

        const allowedOrigins = [
          process.env.CLIENT_URL,
          "http://localhost:8080",
          "http://127.0.0.1:8080",
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "http://localhost:8081",
          "http://127.0.0.1:8081",
          ...extraOrigins,
        ].filter(Boolean);

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // Register user
    socket.on("register", (userId) => {
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit("user_online", userId);
    });

    // Join a chat room (using the actual chatId from the database)
    socket.on("join_chat", ({ chatId }) => {
      const room = `chat_${chatId}`;
      socket.join(room);
      console.log(`User ${socket.userId} joined room ${room}`);
    });

    // Leave a chat room
    socket.on("leave_chat", ({ chatId }) => {
      const room = `chat_${chatId}`;
      socket.leave(room);
    });

    // Send message — uses real Message model fields (chatId, senderId, content)
    socket.on("send_message", async ({ chatId, senderId, content }) => {
      console.log(
        `[socket] send_message from ${senderId} to chat ${chatId}: "${content}"`,
      );
      try {
        // Verify the chat exists and the sender is part of it
        const chat = await Chat.findById(chatId);
        if (!chat) {
          console.log(`[socket] Chat ${chatId} not found`);
          socket.emit("error_message", { message: "Chat not found" });
          return;
        }

        if (chat.buyerId !== senderId && chat.sellerId !== senderId) {
          console.log(
            `[socket] Auth failed for user ${senderId} in chat ${chatId}`,
          );
          socket.emit("error_message", { message: "Not authorized" });
          return;
        }

        // Create the message in the database
        const message = await Message.create({
          chatId: chatId,
          itemId: chat.itemId,
          senderId: senderId,
          content,
        });

        // Update chat's lastMessageAt
        await Chat.update(chatId, { lastMessageAt: new Date() });

        // Fetch message with sender info
        const fullMessage = await Message.findByIdWithSender(message.id);

        // Emit to the chat room
        const room = `chat_${chatId}`;
        console.log(`[socket] Broadcasting to room ${room}`);
        io.to(room).emit("receive_message", fullMessage);

        // Also notify the recipient globally if they're not in the room
        const recipientId =
          chat.buyerId === senderId ? chat.sellerId : chat.buyerId;

        const recipientSocketId =
          onlineUsers.get(recipientId.toString()) ||
          onlineUsers.get(recipientId);
        if (recipientSocketId) {
          console.log(`[socket] Notifying recipient ${recipientId} globally`);
          io.to(recipientSocketId).emit("receive_message", fullMessage);
        }
      } catch (error) {
        console.error("Socket send_message error:", error);
        socket.emit("error_message", {
          message: "Failed to send message",
        });
      }
    });

    // Typing indicators — include senderId so the client knows who is typing
    socket.on("typing", ({ chatId, senderId }) => {
      const room = `chat_${chatId}`;
      socket.to(room).emit("typing", { chatId, senderId });
    });

    socket.on("stop_typing", ({ chatId, senderId }) => {
      const room = `chat_${chatId}`;
      socket.to(room).emit("stop_typing", { chatId, senderId });
    });

    // Online check
    socket.on("check_online", (friendId) => {
      socket.emit("online_status", {
        userId: friendId,
        online: onlineUsers.has(friendId),
      });
    });

    // ============ VIDEO CALL SIGNALING ============

    socket.on("call_user", ({ to, offer }) => {
      const target = onlineUsers.get(to);
      if (target) {
        io.to(target).emit("incoming_call", {
          from: socket.userId,
          offer,
        });
      }
    });

    socket.on("answer_call", ({ to, answer }) => {
      const target = onlineUsers.get(to);
      if (target) {
        io.to(target).emit("call_accepted", {
          from: socket.userId,
          answer,
        });
      }
    });

    socket.on("ice_candidate", ({ to, candidate }) => {
      const target = onlineUsers.get(to);
      if (target) {
        io.to(target).emit("ice_candidate", { candidate });
      }
    });

    socket.on("end_call", ({ to }) => {
      const target = onlineUsers.get(to);
      if (target) {
        io.to(target).emit("call_ended", { from: socket.userId });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        socket.broadcast.emit("user_offline", socket.userId);
      }
      console.log("🔴 User disconnected:", socket.id);
    });
  });

  return io;
};
