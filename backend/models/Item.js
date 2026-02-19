import pool from "../config/database.js";

const Item = {
  async create({
    title,
    description,
    price,
    category,
    pickupLocation,
    sellerId,
    status,
  }) {
    const result = await pool.query(
      `INSERT INTO items (title, description, price, category, "pickupLocation", "sellerId", status, "createdAt", "updatedAt")
             VALUES ($1, $2, $3::numeric, $4, $5, $6::integer, $7, NOW(), NOW())
             RETURNING *`,
      [
        title,
        description,
        price,
        category || "Others",
        pickupLocation || null,
        sellerId,
        status || "Available",
      ],
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM items WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async findByIdWithDetails(id) {
    const result = await pool.query(
      `SELECT i.*,
                    json_build_object('id', s.id, 'name', s.name, 'email', s.email, 'hostel', s.hostel, 'department', s.department, 'phoneNumber', s."phoneNumber") AS seller,
                    COALESCE(json_agg(json_build_object('id', img.id, 'itemId', img."itemId", 'imageUrl', img."imageUrl", 'createdAt', img."createdAt", 'updatedAt', img."updatedAt")) FILTER (WHERE img.id IS NOT NULL), '[]') AS images
             FROM items i
             LEFT JOIN users s ON i."sellerId" = s.id
             LEFT JOIN item_images img ON img."itemId" = i.id
             WHERE i.id = $1
             GROUP BY i.id, s.id, s.name, s.email, s.hostel, s.department, s."phoneNumber"`,
      [id],
    );
    return result.rows[0] || null;
  },

  async findByIdWithImages(id) {
    const result = await pool.query(
      `SELECT i.*,
                    COALESCE(json_agg(json_build_object('id', img.id, 'itemId', img."itemId", 'imageUrl', img."imageUrl", 'createdAt', img."createdAt", 'updatedAt', img."updatedAt")) FILTER (WHERE img.id IS NOT NULL), '[]') AS images
             FROM items i
             LEFT JOIN item_images img ON img."itemId" = i.id
             WHERE i.id = $1
             GROUP BY i.id`,
      [id],
    );
    return result.rows[0] || null;
  },

  async findAll({ where = {}, search, minPrice, maxPrice } = {}) {
    let query = `
            SELECT i.*,
                   json_build_object('id', s.id, 'name', s.name, 'email', s.email, 'hostel', s.hostel, 'phoneNumber', s."phoneNumber") AS seller,
                   COALESCE(json_agg(json_build_object('id', img.id, 'itemId', img."itemId", 'imageUrl', img."imageUrl", 'createdAt', img."createdAt", 'updatedAt', img."updatedAt")) FILTER (WHERE img.id IS NOT NULL), '[]') AS images
            FROM items i
            LEFT JOIN users s ON i."sellerId" = s.id
            LEFT JOIN item_images img ON img."itemId" = i.id
        `;

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Status filter
    const status = where.status || "Available";
    conditions.push(`i.status = $${paramIndex}`);
    values.push(status);
    paramIndex++;

    // Search by title
    if (search) {
      conditions.push(`i.title ILIKE $${paramIndex}`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Category filter
    if (where.category) {
      conditions.push(`i.category = $${paramIndex}`);
      values.push(where.category);
      paramIndex++;
    }

    // Price range
    if (minPrice) {
      conditions.push(`i.price >= $${paramIndex}`);
      values.push(minPrice);
      paramIndex++;
    }
    if (maxPrice) {
      conditions.push(`i.price <= $${paramIndex}`);
      values.push(maxPrice);
      paramIndex++;
    }

    // Seller filter
    if (where.sellerId) {
      conditions.push(`i."sellerId" = $${paramIndex}`);
      values.push(where.sellerId);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query +=
      ' GROUP BY i.id, s.id, s.name, s.email, s.hostel, s."phoneNumber" ORDER BY i."createdAt" DESC';

    const result = await pool.query(query, values);
    return result.rows;
  },

  async findMyListings(sellerId) {
    const result = await pool.query(
      `SELECT i.*,
                    COALESCE(json_agg(json_build_object('id', img.id, 'itemId', img."itemId", 'imageUrl', img."imageUrl", 'createdAt', img."createdAt", 'updatedAt', img."updatedAt")) FILTER (WHERE img.id IS NOT NULL), '[]') AS images
             FROM items i
             LEFT JOIN item_images img ON img."itemId" = i.id
             WHERE i."sellerId" = $1
             GROUP BY i.id
             ORDER BY i."createdAt" DESC`,
      [sellerId],
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
      `UPDATE items SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  },

  async destroy(id) {
    await pool.query("DELETE FROM items WHERE id = $1", [id]);
  },
};

export default Item;
