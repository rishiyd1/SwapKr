import pool from "../config/database.js";

const Message = {
  async create({ chatId, itemId, senderId, content }) {
    const result = await pool.query(
      `INSERT INTO messages ("chatId", "itemId", "senderId", content, "isRead", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, false, NOW(), NOW())
             RETURNING *`,
      [chatId, itemId || null, senderId, content],
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM messages WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  },

  async findByIdWithSender(id) {
    const result = await pool.query(
      `SELECT m.*,
                    json_build_object('id', u.id, 'name', u.name) AS sender
             FROM messages m
             LEFT JOIN users u ON m."senderId" = u.id
             WHERE m.id = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  async findAllByChat(chatId) {
    const result = await pool.query(
      `SELECT m.*,
                    json_build_object('id', u.id, 'name', u.name) AS sender
             FROM messages m
             LEFT JOIN users u ON m."senderId" = u.id
             WHERE m."chatId" = $1
             ORDER BY m."createdAt" ASC`,
      [chatId],
    );
    return result.rows;
  },

  async markAsRead(chatId, excludeSenderId) {
    await pool.query(
      `UPDATE messages SET "isRead" = true, "updatedAt" = NOW()
             WHERE "chatId" = $1 AND "senderId" != $2 AND "isRead" = false`,
      [chatId, excludeSenderId],
    );
  },

  async deleteByChatIds(chatIds) {
    if (!chatIds || chatIds.length === 0) return;
    const placeholders = chatIds.map((_, i) => `$${i + 1}`).join(", ");
    await pool.query(
      `DELETE FROM messages WHERE "chatId" IN (${placeholders})`,
      chatIds,
    );
  },
};

export default Message;
