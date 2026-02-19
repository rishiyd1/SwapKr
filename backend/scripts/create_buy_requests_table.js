import pool from "../config/database.js";

const createBuyRequestsTable = async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS buy_requests (
        id SERIAL PRIMARY KEY,
        "buyerId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "sellerId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "itemId" INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

        // Index for faster seller queries
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_buy_requests_seller ON buy_requests("sellerId");
    `);

        // Index for faster buyer queries
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_buy_requests_buyer ON buy_requests("buyerId");
    `);

        // Index for checking duplicate requests
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_buy_requests_buyer_item ON buy_requests("buyerId", "itemId");
    `);

        console.log("✅ buy_requests table created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating buy_requests table:", error);
        process.exit(1);
    }
};

createBuyRequestsTable();
