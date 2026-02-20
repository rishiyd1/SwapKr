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
// import IORedis from "ioredis"; // Removed as we use the shared config
import redisConnection from "../config/redis.js";

dotenv.config();

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
      id SERIAL PRIMARY KEY,
      job_id VARCHAR(255) UNIQUE NOT NULL,
      request_id INTEGER,
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
  let lastId = 0; // Cursor-based pagination — avoids OFFSET performance issues

  // ── Cursor-Based Batch Processing ──
  while (true) {
    // Fetch next batch using cursor (WHERE id > lastId)
    const usersResult = await pool.query(
      'SELECT id, email, name FROM users WHERE id != $1 AND email IS NOT NULL AND "isVerified" = true AND id > $2 ORDER BY id ASC LIMIT $3',
      [requesterId, lastId, BATCH_SIZE],
    );

    const users = usersResult.rows;
    if (users.length === 0) break;

    // Update cursor to last user ID in this batch
    lastId = users[users.length - 1].id;

    const bccEmails = users.map((u) => u.email);

    const mailOptions = {
      from: `"SwapKr" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      bcc: bccEmails,
      subject: `📢 Urgent Request: ${title}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4940F 0%, #B8860B 50%, #996F0A 100%); padding: 35px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">⚡ Urgent Request on SwapKr</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 35px 40px;">
              
              <!-- Greeting -->
              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">Hello,</p>
              <p style="color: #555; font-size: 15px; margin: 0 0 25px 0;">Someone on campus needs help urgently. Here are the details:</p>

              <!-- Request Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #fef9ee; border: 1px solid #fce8b2; border-radius: 8px; margin-bottom: 25px;">
                <tr>
                  <td style="border-left: 5px solid #D4940F; padding: 20px 25px; border-radius: 8px 0 0 8px;">
                    <h2 style="color: #2c3e50; font-size: 18px; margin: 0 0 10px 0; font-weight: 600;">${title}</h2>
                    <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.6;">${description}</p>
                  </td>
                </tr>
              </table>

              <!-- Posted By -->
              <p style="color: #555; font-size: 14px; margin: 0 0 25px 0;">
                Posted by <strong style="color: #2c3e50;">${requesterName}</strong>
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 15px 0;">
                    <a href="${process.env.CLIENT_URL}/request/${requestId}" 
                       style="display: inline-block; background: linear-gradient(135deg, #D4940F, #B8860B); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">
                      View &amp; Respond
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                <tr>
                  <td style="background: #fef9ee; border-left: 4px solid #D4940F; padding: 12px 18px; border-radius: 4px;">
                    <p style="color: #B8860B; font-size: 13px; margin: 0; font-weight: 600;">
                      💡 Tip: <span style="font-weight: 400; color: #555;">Respond quickly to help your fellow student!</span>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #fafafa; padding: 20px 40px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0 0 5px 0;">You received this email because you are registered on <strong>SwapKr</strong>.</p>
              <p style="color: #bbb; font-size: 11px; margin: 0;">SwapKr — Your Campus Marketplace</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      emailsSent += users.length;

      log.info("Batch sent", {
        jobId,
        batchCount: users.length,
        emailsSent,
        totalRecipients,
        cursor: lastId,
      });

      // Update progress in DB
      await pool.query(
        "UPDATE broadcast_logs SET emails_sent = $1 WHERE job_id = $2",
        [emailsSent, jobId],
      );

      // Report progress to BullMQ
      await job.updateProgress(
        Math.round((emailsSent / totalRecipients) * 100),
      );
    } catch (error) {
      log.error("Batch send failed", {
        jobId,
        cursor: lastId,
        attempt,
        error: error.message,
      });

      // Update broadcast_logs with retry error info
      await pool
        .query(
          "UPDATE broadcast_logs SET status = 'retrying', error = $1, emails_sent = $2 WHERE job_id = $3",
          [
            `Batch failed at cursor ${lastId}: ${error.message}`,
            emailsSent,
            jobId,
          ],
        )
        .catch(() => {});

      throw error; // Let BullMQ handle retry with backoff
    }

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
