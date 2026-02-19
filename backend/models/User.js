import pool from "../config/database.js";

const User = {
  async findById(id, options = {}) {
    let query = "SELECT * FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);
    const user = result.rows[0] || null;
    if (user && options.exclude) {
      for (const field of options.exclude) {
        delete user[field];
      }
    }
    if (user && options.attributes) {
      const filtered = {};
      for (const attr of options.attributes) {
        if (user[attr] !== undefined) filtered[attr] = user[attr];
      }
      return filtered;
    }
    return user;
  },

  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  },

  async findByPhone(phoneNumber) {
    const result = await pool.query(
      'SELECT * FROM users WHERE "phoneNumber" = $1',
      [phoneNumber],
    );
    return result.rows[0] || null;
  },

  async create({
    name,
    email,
    password,
    phoneNumber,
    department,
    year,
    hostel,
    isVerified,
    tokens,
  }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, "phoneNumber", department, year, hostel, "isVerified", tokens, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
             RETURNING *`,
      [
        name,
        email,
        password || null,
        phoneNumber,
        department || null,
        year || null,
        hostel || null,
        isVerified || false,
        tokens ?? 2,
      ],
    );
    return result.rows[0];
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;

    const setClauses = keys.map((key, i) => {
      // Quote camelCase columns
      const col = /[A-Z]/.test(key) ? `"${key}"` : key;
      return `${col} = $${i + 1}`;
    });
    setClauses.push(`"updatedAt" = NOW()`);

    const values = keys.map((k) => fields[k]);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  },

  async updateAll(fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;

    const setClauses = keys.map((key, i) => {
      const col = /[A-Z]/.test(key) ? `"${key}"` : key;
      return `${col} = $${i + 1}`;
    });
    setClauses.push(`"updatedAt" = NOW()`);

    const values = keys.map((k) => fields[k]);

    await pool.query(`UPDATE users SET ${setClauses.join(", ")}`, values);
  },

  async findAll(where = {}, options = {}) {
    let query = "SELECT";
    if (options.attributes && options.attributes.length > 0) {
      query +=
        " " +
        options.attributes
          .map((a) => (/[A-Z]/.test(a) ? `"${a}"` : a))
          .join(", ");
    } else {
      query += " *";
    }
    query += " FROM users";

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, val] of Object.entries(where)) {
      if (typeof val === "object" && val !== null && val.op) {
        // Handle special operators
        if (val.op === "ne") {
          const col = /[A-Z]/.test(key) ? `"${key}"` : key;
          conditions.push(`${col} != $${paramIndex}`);
          values.push(val.value);
          paramIndex++;
        } else if (val.op === "notNull") {
          const col = /[A-Z]/.test(key) ? `"${key}"` : key;
          conditions.push(`${col} IS NOT NULL`);
        }
      } else {
        const col = /[A-Z]/.test(key) ? `"${key}"` : key;
        conditions.push(`${col} = $${paramIndex}`);
        values.push(val);
        paramIndex++;
      }
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const result = await pool.query(query, values);
    return result.rows;
  },

  async destroy(id) {
    // Delete user from database
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
  },
};

export default User;
