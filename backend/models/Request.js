import pool from "../config/database.js";

const Request = {
  async create({
    title,
    description,
    type,
    tokenCost,
    requesterId,
    status,
    budget,
    category,
  }) {
    const result = await pool.query(
      `INSERT INTO requests (title, description, type, "tokenCost", "requesterId", status, budget, category, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
             RETURNING *`,
      [
        title,
        description,
        type || "Normal",
        tokenCost || 0,
        requesterId,
        status || "Open",
        budget || null,
        category || "Others",
      ],
    );
    return result.rows[0];
  },

  async findAllOpen(excludeRequesterId = null, category = null) {
    let query = `SELECT r.*,
                  json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS requester
           FROM requests r
           LEFT JOIN users u ON r."requesterId" = u.id
           WHERE r.status = 'Open'`;

    const params = [];

    if (excludeRequesterId) {
      params.push(excludeRequesterId);
      query += ` AND r."requesterId" != $${params.length}`;
    }

    if (category && category !== "All") {
      params.push(category);
      query += ` AND r."category" = $${params.length}`;
    }

    query += ` ORDER BY r."createdAt" DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  async findByRequesterId(requesterId) {
    const result = await pool.query(
      `SELECT * FROM requests 
             WHERE "requesterId" = $1 
             ORDER BY "createdAt" DESC`,
      [requesterId],
    );
    return result.rows;
  },

  async findByIdWithDetails(id) {
    const result = await pool.query(
      `SELECT r.*,
                    json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'hostel', u.hostel, 'department', u.department, 'phoneNumber', u."phoneNumber") AS requester
             FROM requests r
             LEFT JOIN users u ON r."requesterId" = u.id
             WHERE r.id = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM requests WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
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
      `UPDATE requests SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  },

  async destroy(id) {
    await pool.query("DELETE FROM requests WHERE id = $1", [id]);
  },

  async findAllPendingApproval() {
    const result = await pool.query(
      `SELECT r.*,
              json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS requester
       FROM requests r
       LEFT JOIN users u ON r."requesterId" = u.id
       WHERE r.status = 'PendingApproval'
       ORDER BY r."createdAt" DESC`,
    );
    return result.rows;
  },

  async findAllUrgentOpen() {
    const result = await pool.query(
      `SELECT r.*,
              json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'hostel', u.hostel) AS requester
       FROM requests r
       LEFT JOIN users u ON r."requesterId" = u.id
       WHERE r.type = 'Urgent' AND r.status = 'Open'
       ORDER BY r."createdAt" DESC`,
    );
    return result.rows;
  },
};

export default Request;
