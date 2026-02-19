import React, { useState } from "react";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const COMMON_EMOJIS = [
  "😊",
  "😂",
  "🥰",
  "😍",
  "😒",
  "😭",
  "👍",
  "🔥",
  "🙌",
  "❤️",
  "✨",
  "🤔",
  "😎",
  "🥺",
  "🎉",
  "👀",
  "🤝",
  "💯",
  "👋",
  "🙏",
  "🤣",
  "😅",
  "😘",
  "😋",
];

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          placeholder={
            disabled ? "Accept request to start chat..." : "Type a message..."
          }
          className="w-full h-12 bg-secondary/30 border border-white/5 rounded-2xl px-5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all pr-12 disabled:cursor-not-allowed disabled:opacity-50 font-body"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-full hover:bg-white/5 disabled:opacity-30"
              >
                <Smile className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="end"
              className="w-64 p-3 bg-card border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl"
            >
              <div className="grid grid-cols-6 gap-1">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="h-9 w-9 flex items-center justify-center text-xl hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!message.trim() || disabled}
        className="h-12 w-12 rounded-full p-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 shrink-0 disabled:opacity-50 transition-all active:scale-95"
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  );
};

export default ChatInput;
