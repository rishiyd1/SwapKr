import cron from "node-cron";
import pool from "../config/database.js";

const job = cron.schedule("0 0 1 8 *", async () => {
  console.log("Running Annual Account Cleanup Job...");
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // First, increment the year for all active students
      const updateResult = await client.query(`
        UPDATE users
        SET year = year + 1
        WHERE year IS NOT NULL
      `);

      // Then, delete anyone whose year is now > 4
      const deleteResult = await client.query(`
        DELETE FROM users
        WHERE year > 4
      `);

      await client.query("COMMIT");
      console.log(
        `Annual cleanup complete. Promoted ${updateResult.rowCount} students to the next year and deleted ${deleteResult.rowCount} graduated accounts.`,
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
