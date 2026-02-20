import React from "react";
import { Search, MessageSquare, Clock } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

const ChatSidebar = ({
  chats,
  requests,
  selectedChatId,
  selectedRequestId,
  onSelectChat,
  onSelectRequest,
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-lg font-display font-bold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-white/5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {/* Pending Requests Section */}
        {requests.filter((r) => r.status === "Pending").length > 0 && (
          <div className="mb-4">
            <h3 className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Pending Requests
            </h3>
            {requests
              .filter((r) => r.status === "Pending")
              .map((request) => (
                <button
                  key={`request-${request.id}`}
                  onClick={() => onSelectRequest(request)}
                  className={`w-full p-3 rounded-xl transition-all flex items-start gap-3 text-left ${
                    parseInt(selectedRequestId) === parseInt(request.id)
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-display font-bold text-sm truncate">
                        {request.buyer?.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(request.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate italic">
                      Interested in: {request.item?.title}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        )}

        {/* Active Chats Section */}
        <div>
          <h3 className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            Active conversations
          </h3>
          {chats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm italic">No conversations yet</p>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={`chat-${chat.id}`}
                onClick={() => onSelectChat(chat)}
                className={`w-full p-3 rounded-xl transition-all flex items-start gap-3 text-left ${
                  parseInt(selectedChatId) === parseInt(chat.id)
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                  {chat.item?.category === "Books" ? "📚" : "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span
                      className={`font-display font-bold text-sm truncate ${chat.unreadCount > 0 ? "text-foreground" : "text-foreground/80"}`}
                    >
                      {chat.otherUser?.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {chat.unreadCount > 0 && (
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(chat.lastMessageAt || chat.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p
                    className={`text-xs truncate ${chat.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}
                  >
                    {chat.item?.title || chat.request?.title || "Conversation"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
