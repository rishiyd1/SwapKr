import pool from "../config/database.js";

const Notification = {
  async create({ userId, type, content, relatedId }) {
    const result = await pool.query(
      `INSERT INTO notifications ("userId", type, content, "relatedId", "isRead", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, false, NOW(), NOW())
       RETURNING *`,
      [userId, type, content, relatedId],
    );
    return result.rows[0];
  },

  async findAllForUser(userId) {
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE "userId" = $1 
       ORDER BY "createdAt" DESC 
       LIMIT 50`,
      [userId],
    );
    return result.rows;
  },

  async getUnreadCount(userId) {
    const result = await pool.query(
      'SELECT COUNT(*)::int as count FROM notifications WHERE "userId" = $1 AND "isRead" = false',
      [userId],
    );
    return result.rows[0].count;
  },

  async markAsRead(id, userId) {
    const result = await pool.query(
      'UPDATE notifications SET "isRead" = true, "updatedAt" = NOW() WHERE id = $1 AND "userId" = $2 RETURNING *',
      [id, userId],
    );
    return result.rows[0] || null;
  },

  async markAllAsRead(userId) {
    await pool.query(
      'UPDATE notifications SET "isRead" = true, "updatedAt" = NOW() WHERE "userId" = $1 AND "isRead" = false',
      [userId],
    );
  },

  async delete(id, userId) {
    await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND "userId" = $2',
      [id, userId],
    );
  },

  async createBatchForRequest({ type, content, relatedId, excludedUserId }) {
    await pool.query(
      `INSERT INTO notifications ("userId", type, content, "relatedId", "isRead", "createdAt", "updatedAt")
       SELECT id, $1, $2, $3, false, NOW(), NOW()
       FROM users
       WHERE id != $4 AND "isVerified" = true`,
      [type, content, relatedId, excludedUserId],
    );
  },

  async deleteOldNotifications() {
    const result = await pool.query(
      `DELETE FROM notifications 
       WHERE "createdAt" < NOW() - INTERVAL '7 days'
       RETURNING id`,
    );
    return result.rowCount;
  },
};

export default Notification;
