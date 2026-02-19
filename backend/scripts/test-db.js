import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

console.log(
  "Testing connection to:",
  process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ":****@"),
);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.query("SELECT 1 + 1 AS result", (err, res) => {
  if (err) {
    console.error("Connection failed:", err);
  } else {
    console.log("Connection successful:", res.rows[0]);
  }
  pool.end();
});
