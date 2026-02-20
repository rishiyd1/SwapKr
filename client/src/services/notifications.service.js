import { apiRequest } from "../lib/api";

const NOTIFICATIONS_URL = "/api/notifications";

export const notificationsService = {
  /**
   * Get all notifications for the current user
   */
  getNotifications: async () => {
    return await apiRequest(NOTIFICATIONS_URL, "GET");
  },

  /**
   * Mark a notification as read
   * @param {number|string} id
   */
  markAsRead: async (id) => {
    return await apiRequest(`${NOTIFICATIONS_URL}/${id}/read`, "PUT");
  },

  /**
   * Mark all notifications as read
   */
  markAllRead: async () => {
    return await apiRequest(`${NOTIFICATIONS_URL}/mark-all-read`, "PUT");
  },

  /**
   * Delete a notification
   * @param {number|string} id
   */
  deleteNotification: async (id) => {
    return await apiRequest(`${NOTIFICATIONS_URL}/${id}`, "DELETE");
  },
};
