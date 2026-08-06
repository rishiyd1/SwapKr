import cron from "node-cron";
import pool from "../config/database.js";

const job = cron.schedule("0 0 1 8 *", async () => {
  console.log("Running Annual Account Cleanup Job...");
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Increment the year for all active students
      const updateResult = await client.query(`
        UPDATE users
        SET year = year + 1
        WHERE year IS NOT NULL
      `);

      await client.query("COMMIT");
      console.log(
        `Annual cleanup complete. Promoted ${updateResult.rowCount} students to the next year.`,
      );
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error during annual account cleanup:", error);
  }
});

export default job;
