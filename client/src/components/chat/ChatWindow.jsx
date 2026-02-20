import React, { useState, useEffect, useRef } from "react";
import { Send, User, ChevronLeft, Check, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/components/chat/SocketContext";
import { chatsService } from "@/services/chats.service";
import { ordersService } from "@/services/orders.service";
import ChatInput from "./ChatInput";
import { formatTimeAgo } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

const ChatWindow = ({
  chat,
  request,
  onChatStarted,
  onMessagesRead,
  onBack,
}) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);
  const currentUser = authService.getCurrentUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chat && !chat.isDraft && chat.id) {
      setIsLoading(true);
      chatsService.getMessages(chat.id).then((data) => {
        setMessages(data);
        setIsLoading(false);
        setTimeout(scrollToBottom, 100);
        // If there were unread messages, we should notify parent to refetch chat list
        if (onMessagesRead) onMessagesRead();
      });
    } else {
      setMessages([]);
    }
  }, [chat, onMessagesRead]);

  useEffect(() => {
    if (socket && chat) {
      socket.emit("join_chat", { chatId: chat.id });

      const handleNewMessage = (message) => {
        // Ensure message belongs to this chat and isn't a duplicate
        if (message.chatId === parseInt(chat.id)) {
          setMessages((prev) => {
            // Check if message already exists (to prevent duplicates from socket + optimistic/refetch)
            if (prev.find((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
          setTimeout(scrollToBottom, 50);
        }
      };

      socket.on("receive_message", handleNewMessage);
      return () => {
        socket.off("receive_message", handleNewMessage);
        socket.emit("leave_chat", { chatId: chat.id });
      };
    }
  }, [socket, chat]);

  const handleSendMessage = async (content) => {
    if (!chat || !content.trim()) return;

    if (chat.isDraft) {
      try {
        let newChat;
        if (chat.requestId) {
          // Starting chat from a Buy Request ("I can provide this")
          const response = await chatsService.startConversation({
            requestId: chat.requestId,
          });
          newChat = response.chat;
        } else {
          // Starting chat from an Item Listing
          const response = await chatsService.startConversation({
            itemId: item?.id,
            sellerId: otherUser?.id,
          });
          newChat = response.chat;
        }

        socket.emit("send_message", {
          chatId: newChat.id,
          senderId: currentUser.id,
          content,
        });
        onChatStarted(newChat); // Refetch chats to replace draft with real one
      } catch (error) {
        console.error("Failed to start conversation:", error);
        toast.error("Failed to start conversation");
      }
      return;
    }

    // In a real app, you'd emit via socket OR call API.
    // backend's socket.js listens for 'send_message' and handles creation.
    socket.emit("send_message", {
      chatId: chat.id,
      senderId: currentUser.id,
      content,
    });
  };

  const handleAccept = async () => {
    try {
      const { chat: newChat } = await ordersService.acceptRequest(request.id);
      toast.success("Request accepted! Chat started.");
      onChatStarted(newChat);
    } catch (error) {
      toast.error("Failed to accept request");
    }
  };

  const handleReject = async () => {
    try {
      await ordersService.rejectRequest(request.id);
      toast.success("Request rejected");
      if (onBack) {
        onBack();
      } else {
        // Fallback if no onBack provided (e.g. direct URL access)
        window.location.href = "/chats";
      }
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  if (!chat && !request) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-secondary/[0.02]">
        <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6 text-4xl">
          💬
        </div>
        <h2 className="text-xl font-display font-bold mb-2">
          Your Conversations
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Select a chat from the sidebar to view messages or handle pending
          requests for your items.
        </p>
      </div>
    );
  }

  const isBuyer = parseInt(chat?.buyerId) === parseInt(currentUser?.id);
  const otherUser =
    chat?.otherUser || (isBuyer ? chat?.seller : chat?.buyer) || request?.buyer;
  // Determine item to display
  let item = chat?.item;
  if (!item && chat?.request) {
    item = {
      title: chat.request.title,
      price: chat.request.budget ? `₹${chat.request.budget}` : null,
    };
  }
  if (!item && request) {
    // Fallback for draft chats
    item = request.item || {
      title: request.title,
      price: request.budget ? `₹${request.budget}` : null,
    };
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-card/20 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner overflow-hidden">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm leading-tight flex items-center gap-1.5">
              {otherUser?.name}
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            </h3>
            <p className="text-[10px] text-muted-foreground">
              {item?.title}
              {item?.price ? (
                <>
                  {" • "}
                  {item.price.toString().includes("Tokens") ||
                  item.price.toString().startsWith("₹")
                    ? item.price
                    : `₹${item.price}`}
                </>
              ) : null}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground md:hidden"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-secondary/[0.02]">
        {request && request.status === "Pending" && (
          <div className="flex flex-col items-center my-8">
            <div className="w-full max-w-md bg-accent/5 border border-accent/20 rounded-2xl p-6 text-center">
              <h4 className="font-display font-bold mb-2">
                Incoming Buy Request
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                "{request.message}"
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = parseInt(msg.senderId) === parseInt(currentUser?.id);
          return (
            <div
              key={msg.id || idx}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm relative group ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-white/5 border border-white/10 text-foreground rounded-tl-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <div
                  className={`text-[9px] mt-1 opacity-60 ${isMe ? "text-right" : "text-left"}`}
                >
                  {formatTimeAgo(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer (Actions/Input) */}
      <div className="p-4 border-t border-white/5 bg-card/10 backdrop-blur-md">
        {request && request.status === "Pending" ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-11 border-red-500/20 hover:bg-red-500/10 text-red-500 rounded-xl"
              onClick={handleReject}
            >
              <X className="w-4 h-4 mr-2" /> Reject
            </Button>
            <Button
              className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl"
              onClick={handleAccept}
            >
              <Check className="w-4 h-4 mr-2" /> Accept & Start Chat
            </Button>
          </div>
        ) : (
          <ChatInput onSendMessage={handleSendMessage} disabled={!chat} />
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
