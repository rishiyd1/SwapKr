import { Server } from "socket.io";
import { onlineUsers } from "../utils/socketStore.js";
import { Chat, Message, User } from "../models/index.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
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
      try {
        // Verify the chat exists and the sender is part of it
        const chat = await Chat.findByPk(chatId);
        if (!chat) {
          socket.emit("error_message", { message: "Chat not found" });
          return;
        }

        if (chat.buyerId !== senderId && chat.sellerId !== senderId) {
          socket.emit("error_message", { message: "Not authorized" });
          return;
        }

        // Create the message in the database
        const message = await Message.create({
          chatId,
          itemId: chat.itemId,
          senderId,
          content,
        });

        // Update chat's lastMessageAt
        chat.lastMessageAt = new Date();
        await chat.save();

        // Fetch message with sender info
        const fullMessage = await Message.findByPk(message.id, {
          include: [{ model: User, as: "sender", attributes: ["id", "name"] }],
        });

        // Emit to the chat room
        const room = `chat_${chatId}`;
        io.to(room).emit("receive_message", fullMessage);

        // Also notify the receiver if they are online but not in the room
        const receiverId =
          chat.buyerId === senderId ? chat.sellerId : chat.buyerId;
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new_message_notification", {
            chatId,
            message: fullMessage,
          });
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