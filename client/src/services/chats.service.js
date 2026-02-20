import { apiRequest } from "../lib/api";

const CHAT_URL = "/api/chats";

export const chatsService = {
  /**
   * Start a new conversation about an item or request
   */
  startConversation: async (dataOrItemId, sellerId) => {
    const body =
      typeof dataOrItemId === "object"
        ? dataOrItemId
        : { itemId: dataOrItemId, sellerId };
    return await apiRequest(`${CHAT_URL}/start`, "POST", body);
  },

  /**
   * Get all conversations for the current user
   */
  getMyConversations: async () => {
    return await apiRequest(CHAT_URL, "GET");
  },

  /**
   * Get messages for a specific conversation
   */
  getMessages: async (chatId) => {
    return await apiRequest(`${CHAT_URL}/${chatId}/messages`, "GET");
  },

  /**
   * Send a message in a conversation (fallback for socket or initial)
   */
  sendMessage: async (chatId, content) => {
    return await apiRequest(`${CHAT_URL}/${chatId}/messages`, "POST", {
      content,
    });
  },

  /**
   * Get unread stats for navbar badge
   */
  getUnreadSummary: async () => {
    return await apiRequest(`${CHAT_URL}/unread-summary`, "GET");
  },

  /**
   * Get single conversation details
   */
  getConversation: async (chatId) => {
    return await apiRequest(`${CHAT_URL}/${chatId}`, "GET");
  },
};
