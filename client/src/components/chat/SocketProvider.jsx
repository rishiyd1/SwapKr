import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { authService } from "@/services/auth.service";
import { SocketContext } from "./SocketContext";
import { toast } from "sonner";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

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
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.userId = user.id;
    let wasConnected = false;

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("register", user.id);
      if (wasConnected) {
        toast.success("Back online! 🟢", { duration: 2000 });
      }
      wasConnected = true;
    });

    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      if (reason !== "io client disconnect") {
        toast.error("Connection lost. Reconnecting...", {
          duration: 3000,
          id: "socket-disconnect",
        });
      }
    });

    newSocket.on("reconnect_attempt", (attempt) => {
      if (attempt % 5 === 0) {
        toast.loading(`Reconnecting... (attempt ${attempt})`, {
          id: "socket-reconnect",
          duration: 3000,
        });
      }
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
