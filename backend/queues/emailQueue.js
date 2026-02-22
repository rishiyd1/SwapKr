import { Queue } from "bullmq";
import redisConnection from "../config/redis.js";

const emailQueue = new Queue("email-notifications", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000, // 2s → 4s → 8s
    },
    timeout: 600_000, // 10 minutes max per job
    removeOnComplete: {
      count: 100,
    },
    removeOnFail: {
      count: 200,
    },
  },
});

// ─── Payload Validation ────────────────────────────────────────────────
const REQUIRED_FIELDS = [
  "title",
  "description",
  "requesterName",
  "requesterId",
  "requestId",
];

const validateJobData = (jobData) => {
  const missing = REQUIRED_FIELDS.filter(
    (f) => jobData[f] === undefined || jobData[f] === null,
  );
  if (missing.length > 0) {
    throw new Error(`Email job missing required fields: ${missing.join(", ")}`);
  }
  if (
    typeof jobData.requestId !== "string" ||
    jobData.requestId.trim() === ""
  ) {
    throw new Error(`Invalid requestId: ${jobData.requestId}`);
  }
  if (
    typeof jobData.requesterId !== "string" ||
    jobData.requesterId.trim() === ""
  ) {
    throw new Error(`Invalid requesterId: ${jobData.requesterId}`);
  }
};

/**
 * Add an email broadcast job to the queue.
 * Uses a DETERMINISTIC jobId based on requestId to prevent duplicate enqueues
 * (e.g. if the controller is retried due to a network glitch).
 *
 * @param {Object} jobData
 * @param {string} jobData.title - Urgent request title
 * @param {string} jobData.description - Urgent request description
 * @param {string} jobData.requesterName - Name of the user who created the request
 * @param {string} jobData.requesterId - ID of the requester (excluded from recipients)
 * @param {string} jobData.requestId - ID of the saved request record
 */
export const addEmailJob = async (jobData) => {
  // Validate before enqueuing
  validateJobData(jobData);

  // Deterministic ID — same requestId always produces the same jobId
  // BullMQ silently ignores duplicate jobIds, preventing double-enqueue
  const jobId = `urgent-broadcast-req-${jobData.requestId}`;

  const job = await emailQueue.add("broadcast-urgent-request", jobData, {
    jobId,
  });

  console.log(
    `📧 Email job queued: ${job.id} for request #${jobData.requestId} "${jobData.title}"`,
  );

  return job;
};

export default emailQueue;
