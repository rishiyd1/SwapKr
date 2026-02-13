import pool from "../config/database.js";

const ItemImage = {
  async create({ itemId, imageUrl }) {
    const result = await pool.query(
      `INSERT INTO item_images ("itemId", "imageUrl", "createdAt", "updatedAt")
             VALUES ($1, $2, NOW(), NOW())
             RETURNING *`,
      [itemId, imageUrl],
    );
    return result.rows[0];
  },

  async destroyByItemId(itemId) {
    await pool.query('DELETE FROM item_images WHERE "itemId" = $1', [itemId]);
  },
};

export default ItemImage;
