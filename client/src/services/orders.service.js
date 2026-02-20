import { apiRequest } from "../lib/api";

const ORDERS_URL = "/api/orders";

export const ordersService = {
  /**
   * Send a buy request for an item
   * @param {number|string} itemId
   * @param {string} message
   */
  sendBuyRequest: async (itemId, message) => {
    return await apiRequest(`${ORDERS_URL}/buy-request`, "POST", {
      itemId,
      message,
    });
  },

  /**
   * Get incoming buy requests (for sellers)
   */
  getIncomingRequests: async () => {
    return await apiRequest(`${ORDERS_URL}/incoming`, "GET");
  },

  /**
   * Get sent buy requests (for buyers)
   */
  getMyRequests: async () => {
    return await apiRequest(`${ORDERS_URL}/my-requests`, "GET");
  },

  /**
   * Accept a buy request
   * @param {number|string} requestId
   */
  acceptRequest: async (requestId) => {
    return await apiRequest(`${ORDERS_URL}/${requestId}/accept`, "PUT");
  },

  /**
   * Reject a buy request
   * @param {number|string} requestId
   */
  rejectRequest: async (requestId) => {
    return await apiRequest(`${ORDERS_URL}/${requestId}/reject`, "PUT");
  },

  /**
   * Mark item as sold through a request
   * @param {number|string} requestId
   */
  markAsSold: async (requestId) => {
    return await apiRequest(`${ORDERS_URL}/${requestId}/mark-sold`, "PUT");
  },
};
