import pool from "../config/database.js";

const Request = {
  async create({ title, description, type, tokenCost, requesterId, status }) {
    const result = await pool.query(
      `INSERT INTO requests (title, description, type, "tokenCost", "requesterId", status, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             RETURNING *`,
      [
        title,
        description,
        type || "Normal",
        tokenCost || 0,
        requesterId,
        status || "Open",
      ],
    );
    return result.rows[0];
  },

  async findAllOpen() {
    const result = await pool.query(
      `SELECT r.*,
                    json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS requester
             FROM requests r
             LEFT JOIN users u ON r."requesterId" = u.id
             WHERE r.status = 'Open'
             ORDER BY CASE r.type WHEN 'Urgent' THEN 0 ELSE 1 END, r."createdAt" DESC`,
    );
    return result.rows;
  },
};

export default Request;
