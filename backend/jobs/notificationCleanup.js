import cron from "node-cron";
import { Notification } from "../models/index.js";

// Run every day at midnight (00:00)
const job = cron.schedule("0 0 * * *", async () => {
  console.log("Running Daily Notification Cleanup Job...");
  try {
    const deletedCount = await Notification.deleteOldNotifications();
    console.log(
      `Successfully deleted ${deletedCount} notifications older than 1 week.`,
    );
  } catch (error) {
    console.error("Error during notification cleanup:", error);
  }
});

export default job;
