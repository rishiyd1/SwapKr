import pool from "../config/database.js";

const Chat = {
  async create({ buyerId, sellerId, itemId, requestId, lastMessageAt }) {
    const result = await pool.query(
      `INSERT INTO chats ("buyerId", "sellerId", "itemId", "requestId", "lastMessageAt", status, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, 'Active', NOW(), NOW())
             RETURNING *`,
      [
        buyerId,
        sellerId,
        itemId || null,
        requestId || null,
        lastMessageAt || new Date(),
      ],
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM chats WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async findByIdWithDetails(id) {
    const result = await pool.query(
      `SELECT c.*,
                    json_build_object('id', b.id, 'name', b.name, 'email', b.email, 'hostel', b.hostel) AS buyer,
                    json_build_object('id', s.id, 'name', s.name, 'email', s.email, 'hostel', s.hostel) AS seller,
                    CASE WHEN c."itemId" IS NOT NULL THEN
                      json_build_object('id', i.id, 'title', i.title, 'price', i.price, 'status', i.status, 'pickupLocation', i."pickupLocation")
                    ELSE NULL END AS item,
                    CASE WHEN c."requestId" IS NOT NULL THEN
                      json_build_object('id', r.id, 'title', r.title, 'type', r.type, 'status', r.status, 'tokenCost', r."tokenCost", 'budget', r.budget)
                    ELSE NULL END AS request
             FROM chats c
             LEFT JOIN users b ON c."buyerId" = b.id
             LEFT JOIN users s ON c."sellerId" = s.id
             LEFT JOIN items i ON c."itemId" = i.id
             LEFT JOIN requests r ON c."requestId" = r.id
             WHERE c.id = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  async findOne({ buyerId, sellerId, itemId, requestId }) {
    let query = 'SELECT * FROM chats WHERE "buyerId" = $1 AND "sellerId" = $2';
    const params = [buyerId, sellerId];

    if (itemId) {
      query += ' AND "itemId" = $3';
      params.push(itemId);
    } else if (requestId) {
      query += ' AND "requestId" = $3';
      params.push(requestId);
    } else {
      return null;
    }

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  },

  async findAllForUser(userId) {
    const result = await pool.query(
      `SELECT c.*,
                    json_build_object('id', b.id, 'name', b.name) AS buyer,
                    json_build_object('id', s.id, 'name', s.name) AS seller,
                    CASE WHEN c."itemId" IS NOT NULL THEN
                      json_build_object('id', i.id, 'title', i.title, 'price', i.price, 'status', i.status, 'category', i.category)
                    ELSE NULL END AS item,
                    CASE WHEN c."requestId" IS NOT NULL THEN
                      json_build_object('id', r.id, 'title', r.title, 'type', r.type, 'status', r.status, 'tokenCost', r."tokenCost", 'budget', r.budget)
                    ELSE NULL END AS request,
                    (SELECT COUNT(*)::integer FROM messages m 
                     WHERE m."chatId" = c.id 
                     AND m."senderId" != $1 
                     AND m."isRead" = false) AS "unreadCount"
             FROM chats c
             LEFT JOIN users b ON c."buyerId" = b.id
             LEFT JOIN users s ON c."sellerId" = s.id
             LEFT JOIN items i ON c."itemId" = i.id
             LEFT JOIN requests r ON c."requestId" = r.id
             WHERE c."buyerId" = $1 OR c."sellerId" = $1
             ORDER BY c."lastMessageAt" DESC`,
      [userId],
    );
    return result.rows;
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;

    const setClauses = keys.map((key, i) => {
      const col = /[A-Z]/.test(key) ? `"${key}"` : key;
      return `${col} = $${i + 1}`;
    });
    setClauses.push(`"updatedAt" = NOW()`);

    const values = keys.map((k) => fields[k]);
    values.push(id);

    const result = await pool.query(
      `UPDATE chats SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  },

  async deleteByItemId(itemId) {
    // First delete messages
    const chats = await pool.query('SELECT id FROM chats WHERE "itemId" = $1', [
      itemId,
    ]);
    const chatIds = chats.rows.map((c) => c.id);
    if (chatIds.length > 0) {
      const placeholders = chatIds.map((_, i) => `$${i + 1}`).join(", ");
      await pool.query(
        `DELETE FROM messages WHERE "chatId" IN (${placeholders})`,
        chatIds,
      );
    }
    // Then delete chats
    await pool.query('DELETE FROM chats WHERE "itemId" = $1', [itemId]);
  },

  async deleteByRequestId(requestId) {
    // First delete messages
    const chats = await pool.query(
      'SELECT id FROM chats WHERE "requestId" = $1',
      [requestId],
    );
    const chatIds = chats.rows.map((c) => c.id);
    if (chatIds.length > 0) {
      const placeholders = chatIds.map((_, i) => `$${i + 1}`).join(", ");
      await pool.query(
        `DELETE FROM messages WHERE "chatId" IN (${placeholders})`,
        chatIds,
      );
    }
    // Then delete chats
    await pool.query('DELETE FROM chats WHERE "requestId" = $1', [requestId]);
  },

  async deleteByUserId(userId) {
    // First delete messages for chats where user is buyer or seller
    const chats = await pool.query(
      'SELECT id FROM chats WHERE "buyerId" = $1 OR "sellerId" = $1',
      [userId],
    );
    const chatIds = chats.rows.map((c) => c.id);
    if (chatIds.length > 0) {
      const placeholders = chatIds.map((_, i) => `$${i + 1}`).join(", ");
      await pool.query(
        `DELETE FROM messages WHERE "chatId" IN (${placeholders})`,
        chatIds,
      );
    }
    // Then delete chats
    await pool.query(
      'DELETE FROM chats WHERE "buyerId" = $1 OR "sellerId" = $1',
      [userId],
    );
  },
};

export default Chat;
