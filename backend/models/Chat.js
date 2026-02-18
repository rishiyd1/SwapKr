import pool from "../config/database.js";

const Chat = {
  async create({ buyerId, sellerId, itemId, lastMessageAt }) {
    const result = await pool.query(
      `INSERT INTO chats ("buyerId", "sellerId", "itemId", "lastMessageAt", status, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, 'Active', NOW(), NOW())
             RETURNING *`,
      [buyerId, sellerId, itemId, lastMessageAt || new Date()],
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
                    json_build_object('id', i.id, 'title', i.title, 'price', i.price, 'status', i.status, 'pickupLocation', i."pickupLocation") AS item
             FROM chats c
             LEFT JOIN users b ON c."buyerId" = b.id
             LEFT JOIN users s ON c."sellerId" = s.id
             LEFT JOIN items i ON c."itemId" = i.id
             WHERE c.id = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  async findOne({ buyerId, sellerId, itemId }) {
    const result = await pool.query(
      'SELECT * FROM chats WHERE "buyerId" = $1 AND "sellerId" = $2 AND "itemId" = $3',
      [buyerId, sellerId, itemId],
    );
    return result.rows[0] || null;
  },

  async findAllForUser(userId) {
    const result = await pool.query(
      `SELECT c.*,
                    json_build_object('id', b.id, 'name', b.name) AS buyer,
                    json_build_object('id', s.id, 'name', s.name) AS seller,
                    json_build_object('id', i.id, 'title', i.title, 'price', i.price, 'status', i.status) AS item
             FROM chats c
             LEFT JOIN users b ON c."buyerId" = b.id
             LEFT JOIN users s ON c."sellerId" = s.id
             LEFT JOIN items i ON c."itemId" = i.id
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
};

export default Chat;
