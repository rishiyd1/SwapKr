import pool from "../config/database.js";

const BuyRequest = {
  async create({ buyerId, sellerId, itemId, message }) {
    const result = await pool.query(
      `INSERT INTO buy_requests ("buyerId", "sellerId", "itemId", message, status, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, 'Pending', NOW(), NOW())
             RETURNING *`,
      [buyerId, sellerId, itemId, message],
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM buy_requests WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  },

  async findByIdWithDetails(id) {
    const result = await pool.query(
      `SELECT br.*,
              json_build_object('id', b.id, 'name', b.name, 'email', b.email, 'hostel', b.hostel, 'phoneNumber', b."phoneNumber") AS buyer,
              json_build_object('id', s.id, 'name', s.name, 'email', s.email, 'hostel', s.hostel, 'phoneNumber', s."phoneNumber") AS seller,
              json_build_object('id', i.id, 'title', i.title, 'price', i.price, 'status', i.status, 'category', i.category, 'pickupLocation', i."pickupLocation") AS item
       FROM buy_requests br
       LEFT JOIN users b ON br."buyerId" = b.id
       LEFT JOIN users s ON br."sellerId" = s.id
       LEFT JOIN items i ON br."itemId" = i.id
       WHERE br.id = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  async findOne({ buyerId, itemId }) {
    const result = await pool.query(
      'SELECT * FROM buy_requests WHERE "buyerId" = $1 AND "itemId" = $2 AND status = \'Pending\'',
      [buyerId, itemId],
    );
    return result.rows[0] || null;
  },

  async findAllForSeller(sellerId) {
    const result = await pool.query(
      `SELECT br.*,
              json_build_object('id', b.id, 'name', b.name, 'email', b.email, 'hostel', b.hostel) AS buyer,
              json_build_object('id', i.id, 'title', i.title, 'price', i.price, 'status', i.status, 'category', i.category) AS item
       FROM buy_requests br
       LEFT JOIN users b ON br."buyerId" = b.id
       LEFT JOIN items i ON br."itemId" = i.id
       WHERE br."sellerId" = $1
       ORDER BY CASE br.status WHEN 'Pending' THEN 0 WHEN 'Accepted' THEN 1 ELSE 2 END, br."createdAt" DESC`,
      [sellerId],
    );
    return result.rows;
  },

  async findAllForBuyer(buyerId) {
    const result = await pool.query(
      `SELECT br.*,
              json_build_object('id', s.id, 'name', s.name, 'email', s.email, 'hostel', s.hostel) AS seller,
              json_build_object('id', i.id, 'title', i.title, 'price', i.price, 'status', i.status, 'category', i.category) AS item
       FROM buy_requests br
       LEFT JOIN users s ON br."sellerId" = s.id
       LEFT JOIN items i ON br."itemId" = i.id
       WHERE br."buyerId" = $1
       ORDER BY br."createdAt" DESC`,
      [buyerId],
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
      `UPDATE buy_requests SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    await pool.query("DELETE FROM buy_requests WHERE id = $1", [id]);
  },
};

export default BuyRequest;
