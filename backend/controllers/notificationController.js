import { Notification } from "../models/index.js";

// GET /api/notifications — Get current user's notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAllForUser(userId);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: error.message });
  }
};

// PUT /api/notifications/:id/read — Mark a specific notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.markAsRead(id, userId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    res
      .status(500)
      .json({ message: "Error updating notification", error: error.message });
  }
};

// PUT /api/notifications/mark-all-read — Mark all unread notifications as read
export const markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.markAllAsRead(userId);

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark All Read Error:", error);
    res
      .status(500)
      .json({ message: "Error updating notifications", error: error.message });
  }
};

// DELETE /api/notifications/:id — Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await Notification.delete(id, userId);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    res
      .status(500)
      .json({ message: "Error deleting notification", error: error.message });
  }
};
