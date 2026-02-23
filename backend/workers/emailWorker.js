/**
 * Email Worker — Runs as a SEPARATE process from the main server.
 * Start with: node workers/emailWorker.js  (or: npm run worker)
 *
 * Processes "email-notifications" queue jobs:
 *  1. Checks broadcast_logs for idempotency (skip if already completed)
 *  2. Fetches users in cursor-based paginated batches from the DB
 *  3. Sends BCC emails per batch via Nodemailer (SMTP connection pooling)
 *  4. Tracks progress in broadcast_logs (updated on every attempt/retry)
 */

import { Worker } from "bullmq";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import pg from "pg";
import IORedis from "ioredis";

dotenv.config();

// ─── Build Redis connection for BullMQ Worker ──────────────────────────
// BullMQ Worker needs its OWN connection (not a shared IORedis instance)
// so it can create internal subscriber connections via .duplicate()
const buildWorkerRedisConnection = () => {
  if (process.env.REDIS_URL) {
    return new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });
  }
  return new IORedis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
  });
};

const redisConnection = buildWorkerRedisConnection();

// ─── Structured Logger ─────────────────────────────────────────────────
const log = {
  info: (msg, meta = {}) =>
    console.log(
      JSON.stringify({
        level: "info",
        ts: new Date().toISOString(),
        msg,
        ...meta,
      }),
    ),
  warn: (msg, meta = {}) =>
    console.warn(
      JSON.stringify({
        level: "warn",
        ts: new Date().toISOString(),
        msg,
        ...meta,
      }),
    ),
  error: (msg, meta = {}) =>
    console.error(
      JSON.stringify({
        level: "error",
        ts: new Date().toISOString(),
        msg,
        ...meta,
      }),
    ),
};

// ─── Redis Connection ──────────────────────────────────────────────────
// Uses the shared configuration which supports REDIS_URL
// The import 'redisConnection' is already an IORedis instance

// ─── Database Pool ─────────────────────────────────────────────────────
// ─── Database Pool ─────────────────────────────────────────────────────
const isLocal =
  (process.env.DATABASE_URL || "").includes("localhost") ||
  (process.env.DATABASE_URL || "").includes("127.0.0.1");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

// ─── Nodemailer Transporter (with SMTP connection pooling) ─────────────
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  pool: true, // Enable SMTP connection pooling — reuses TCP connections
  maxConnections: 3, // Max simultaneous connections to SMTP
  maxMessages: 100, // Max messages per connection before reconnect
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Configurable Batching ─────────────────────────────────────────────
const BATCH_SIZE = parseInt(process.env.EMAIL_BATCH_SIZE) || 50;
const BATCH_DELAY_MS = parseInt(process.env.EMAIL_BATCH_DELAY_MS) || 1000;

// ─── Ensure broadcast_logs table + indexes ─────────────────────────────
const ensureBroadcastLogsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS broadcast_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id VARCHAR(255) UNIQUE NOT NULL,
      request_id UUID,
      status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
      attempt INTEGER DEFAULT 1,
      total_recipients INTEGER DEFAULT 0,
      emails_sent INTEGER DEFAULT 0,
      error TEXT,
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Indexes for fast lookups
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_broadcast_logs_job_id ON broadcast_logs (job_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_broadcast_logs_status ON broadcast_logs (status)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_broadcast_logs_request_id ON broadcast_logs (request_id)
  `);
};

// ─── Helper: sleep ─────────────────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Job Processor ─────────────────────────────────────────────────────
const processEmailJob = async (job) => {
  const { title, description, requesterName, requesterId, requestId } =
    job.data;
  const jobId = job.id;
  const attempt = job.attemptsMade + 1;

  log.info("Processing email job", { jobId, requestId, title, attempt });

  // ── Idempotency Check ──
  const existing = await pool.query(
    "SELECT status FROM broadcast_logs WHERE job_id = $1",
    [jobId],
  );

  if (existing.rows.length > 0 && existing.rows[0].status === "completed") {
    log.info("Job already completed, skipping", { jobId });
    return { skipped: true, reason: "already_completed" };
  }

  // ── Insert or update log row (tracks EVERY retry attempt) ──
  await pool.query(
    `INSERT INTO broadcast_logs (job_id, request_id, status, attempt, started_at)
     VALUES ($1, $2, 'processing', $3, NOW())
     ON CONFLICT (job_id) DO UPDATE SET
       status = 'retrying',
       attempt = $3,
       started_at = NOW(),
       error = NULL`,
    [jobId, requestId, attempt],
  );

  // ── Count total recipients ──
  const countResult = await pool.query(
    'SELECT COUNT(*) as total FROM users WHERE id != $1 AND email IS NOT NULL AND "isVerified" = true',
    [requesterId],
  );
  const totalRecipients = parseInt(countResult.rows[0].total);

  if (totalRecipients === 0) {
    log.warn("No recipients found", { jobId, requestId });
    await pool.query(
      "UPDATE broadcast_logs SET status = 'completed', total_recipients = 0, completed_at = NOW() WHERE job_id = $1",
      [jobId],
    );
    return { emailsSent: 0, totalRecipients: 0 };
  }

  await pool.query(
    "UPDATE broadcast_logs SET total_recipients = $1, status = 'processing' WHERE job_id = $2",
    [totalRecipients, jobId],
  );

  log.info("Starting batch email send", {
    jobId,
    totalRecipients,
    batchSize: BATCH_SIZE,
    attempt,
  });

  let emailsSent = 0;
  let offset = 0; // OFFSET-based pagination (UUIDs don't support cursor-based id > N)

  // ── Cursor-Based Batch Processing ──
  while (true) {
    // Fetch next batch using OFFSET pagination
    const usersResult = await pool.query(
      'SELECT id, email, name FROM users WHERE id != $1 AND email IS NOT NULL AND "isVerified" = true ORDER BY "createdAt" ASC LIMIT $2 OFFSET $3',
      [requesterId, BATCH_SIZE, offset],
    );

    const users = usersResult.rows;
    if (users.length === 0) break;

    // Advance the offset for the next batch
    offset += users.length;

    // Send individual emails (direct `to:` like OTP — BCC gets filtered by college servers)
    for (const user of users) {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: `Urgent Request: ${title} — SwapKr`,
        text: `Hi ${user.name || "there"},

${requesterName} posted an urgent request on SwapKr:

"${title}"
${description}

View & respond: ${process.env.CLIENT_URL}/request/${requestId}

— SwapKr`,
      };

      try {
        await transporter.sendMail(mailOptions);
        emailsSent++;
      } catch (sendErr) {
        log.warn("Failed to send to individual user", {
          jobId,
          email: user.email,
          error: sendErr.message,
        });
        // Continue sending to other users
      }
    }

    log.info("Batch sent", {
      jobId,
      batchCount: users.length,
      emailsSent,
      totalRecipients,
      offset,
    });

    // Update progress in DB
    await pool.query(
      "UPDATE broadcast_logs SET emails_sent = $1 WHERE job_id = $2",
      [emailsSent, jobId],
    );

    // Report progress to BullMQ
    await job.updateProgress(Math.round((emailsSent / totalRecipients) * 100));

    // Pause between batches to respect SMTP rate limits
    if (users.length === BATCH_SIZE) {
      log.info("Pausing between batches", { delayMs: BATCH_DELAY_MS });
      await sleep(BATCH_DELAY_MS);
    }
  }

  // ── Mark as completed ──
  await pool.query(
    "UPDATE broadcast_logs SET status = 'completed', emails_sent = $1, completed_at = NOW() WHERE job_id = $2",
    [emailsSent, jobId],
  );

  log.info("Job completed successfully", {
    jobId,
    emailsSent,
    totalRecipients,
    attempt,
  });

  return { emailsSent, totalRecipients };
};

// ─── Create Worker ─────────────────────────────────────────────────────
const startWorker = async () => {
  await ensureBroadcastLogsTable();

  const worker = new Worker("email-notifications", processEmailJob, {
    connection: redisConnection,
    concurrency: 1,
    stalledInterval: 60_000, // Check for stalled jobs every 60s
  });

  // ── Event Handlers ──
  worker.on("completed", (job, result) => {
    log.info("Job event: completed", { jobId: job.id, result });
  });

  worker.on("failed", (job, err) => {
    const isFinal = job && job.attemptsMade >= (job.opts?.attempts || 3);

    log.error("Job event: failed", {
      jobId: job?.id,
      attempt: job?.attemptsMade,
      maxAttempts: job?.opts?.attempts,
      isFinalFailure: isFinal,
      error: err.message,
    });

    // Update broadcast_logs on FINAL failure
    if (isFinal && job) {
      pool
        .query(
          "UPDATE broadcast_logs SET status = 'failed', error = $1, completed_at = NOW() WHERE job_id = $2",
          [err.message, job.id],
        )
        .catch((dbErr) =>
          log.error("Failed to update broadcast_log on final failure", {
            error: dbErr.message,
          }),
        );
    }
  });

  worker.on("stalled", (jobId) => {
    log.warn("Job stalled", { jobId });
  });

  worker.on("error", (err) => {
    log.error("Worker error", { error: err.message });
  });

  log.info("Email worker started", {
    batchSize: BATCH_SIZE,
    batchDelayMs: BATCH_DELAY_MS,
    concurrency: 1,
    pagination: "cursor-based",
    smtpPooling: true,
  });

  // ── Graceful Shutdown ──
  const shutdown = async (signal) => {
    log.info("Shutting down worker", { signal });
    await worker.close();
    transporter.close(); // Close SMTP pool
    await pool.end();
    redisConnection.disconnect();
    log.info("Worker shut down gracefully");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startWorker().catch((err) => {
  log.error("Failed to start email worker", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});
