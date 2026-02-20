import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { authService } from "@/services/auth.service";
import { SocketContext } from "./SocketContext";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Guard: already have a socket for this same user
    if (socket && socket.userId == user.id) return;

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    newSocket.userId = user.id;

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("register", user.id);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("user_online", (userId) => {
      setOnlineUsers((prev) => {
        if (prev.has(userId)) return prev;
        return new Set([...prev, userId]);
      });
    });

    newSocket.on("user_offline", (userId) => {
      setOnlineUsers((prev) => {
        if (!prev.has(userId)) return prev;
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        console.log("Closing socket...");
        newSocket.close();
        setSocket(null);
      }
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
