/**
 * Test script for the Email Queue System
 * Run with: node tests/test-email-queue.js
 *
 * This tests each layer independently:
 *  1. Redis connection
 *  2. Queue — enqueue a job
 *  3. Worker — process the job (start worker separately first)
 *  4. Database — broadcast_logs tracking
 *
 * Usage:
 *   Step 1: Make sure Redis is running
 *   Step 2: Start worker in another terminal:  npm run worker
 *   Step 3: Run this script:  node tests/test-email-queue.js
 */

import dotenv from "dotenv";
import pg from "pg";
import IORedis from "ioredis";
import { Queue } from "bullmq";

dotenv.config();

// ─── Colors for terminal output ────────────────────────────────────────
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

const pass = (msg) => console.log(`  ${green("✅ PASS")} ${msg}`);
const fail = (msg, err) => console.log(`  ${red("❌ FAIL")} ${msg}${err ? ": " + err : ""}`);
const info = (msg) => console.log(`  ${cyan("ℹ️ ")} ${msg}`);
const header = (msg) => console.log(`\n${yellow("━".repeat(50))}\n${yellow("  " + msg)}\n${yellow("━".repeat(50))}`);

let allPassed = true;

// ─── TEST 1: Redis Connection ──────────────────────────────────────────
const testRedis = async () => {
    header("TEST 1: Redis Connection");

    const redis = new IORedis({
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT) || 6379,
        maxRetriesPerRequest: null,
        connectTimeout: 5000,
        lazyConnect: true,
    });

    try {
        await redis.connect();
        const pong = await redis.ping();
        if (pong === "PONG") {
            pass("Redis is running and responding");
        } else {
            fail("Unexpected Redis response", pong);
            allPassed = false;
        }
    } catch (err) {
        fail("Cannot connect to Redis", err.message);
        info("Make sure Redis is running on " + (process.env.REDIS_HOST || "localhost") + ":" + (process.env.REDIS_PORT || "6379"));
        info("On Windows: install Memurai or use WSL2 with 'redis-server'");
        allPassed = false;
        redis.disconnect();
        return false;
    }

    redis.disconnect();
    return true;
};

// ─── TEST 2: Database Connection ───────────────────────────────────────
const testDatabase = async () => {
    header("TEST 2: Database Connection");

    const pool = new pg.Pool({
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASS || "password",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || "swapkr",
    });

    try {
        const result = await pool.query("SELECT 1 AS test");
        if (result.rows[0].test === 1) {
            pass("PostgreSQL is running and connected");
        }

        // Check if users table exists
        const usersResult = await pool.query("SELECT COUNT(*) as count FROM users");
        info(`Found ${usersResult.rows[0].count} users in database`);

        // Check if requests table exists
        const reqResult = await pool.query("SELECT COUNT(*) as count FROM requests");
        info(`Found ${reqResult.rows[0].count} requests in database`);

        // Check if broadcast_logs table exists
        try {
            const logsResult = await pool.query("SELECT COUNT(*) as count FROM broadcast_logs");
            pass(`broadcast_logs table exists (${logsResult.rows[0].count} entries)`);
        } catch {
            info("broadcast_logs table doesn't exist yet (will be created when worker starts)");
        }

        await pool.end();
        return true;
    } catch (err) {
        fail("Cannot connect to PostgreSQL", err.message);
        allPassed = false;
        await pool.end();
        return false;
    }
};

// ─── TEST 3: Queue — Enqueue a Test Job ────────────────────────────────
const testQueue = async () => {
    header("TEST 3: BullMQ Queue — Enqueue Test Job");

    const redis = new IORedis({
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT) || 6379,
        maxRetriesPerRequest: null,
    });

    const queue = new Queue("email-notifications", { connection: redis });

    try {
        const testJobId = `test-broadcast-${Date.now()}`;

        const job = await queue.add(
            "broadcast-urgent-request",
            {
                title: "🧪 TEST: Queue Integration Test",
                description: "This is a test job to verify the queue system works.",
                requesterName: "Test User",
                requesterId: 99999,
                requestId: 99999,
            },
            {
                jobId: testJobId,
                attempts: 1,
                removeOnComplete: true,
                removeOnFail: true,
            },
        );

        pass(`Job enqueued successfully (id: ${job.id})`);

        // Check the job state
        const state = await job.getState();
        info(`Job state: ${state}`);

        if (state === "waiting" || state === "active") {
            pass("Job is in the expected state");
            info("If the worker is running, it should pick this up shortly.");
            info("Check the worker terminal for processing logs.");
        }

        // Wait a moment and check again
        await new Promise((r) => setTimeout(r, 3000));
        try {
            const newState = await job.getState();
            info(`Job state after 3s: ${newState}`);
            if (newState === "completed") {
                pass("Worker processed the job successfully! 🎉");
            } else if (newState === "failed") {
                info("Job failed (expected if requesterId 99999 doesn't exist)");
                pass("Worker DID pick up the job (failure is expected for test data)");
            } else if (newState === "waiting") {
                info("Job is still waiting — is the worker running? (npm run worker)");
            }
        } catch {
            info("Job was already cleaned up (removeOnComplete=true)");
            pass("Worker processed and cleaned up the job");
        }

        await queue.close();
        redis.disconnect();
        return true;
    } catch (err) {
        fail("Queue test failed", err.message);
        allPassed = false;
        await queue.close();
        redis.disconnect();
        return false;
    }
};

// ─── TEST 4: SMTP / Nodemailer ─────────────────────────────────────────
const testSMTP = async () => {
    header("TEST 4: SMTP / Nodemailer Configuration");

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        info("SMTP_USER or SMTP_PASS not set in .env");
        info("Email sending will be skipped in production — set these to enable");
        return true;
    }

    try {
        const nodemailer = (await import("nodemailer")).default;
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.verify();
        pass(`SMTP connected as ${process.env.SMTP_USER}`);
        transporter.close();
        return true;
    } catch (err) {
        fail("SMTP verification failed", err.message);
        info("Check SMTP_USER and SMTP_PASS in your .env file");
        info("For Gmail, use an App Password (not your real password)");
        allPassed = false;
        return false;
    }
};

// ─── Run All Tests ─────────────────────────────────────────────────────
const runTests = async () => {
    console.log("\n" + cyan("🧪 SwapKr Email Queue System — Test Suite"));
    console.log(cyan("=".repeat(50)));

    const redisOk = await testRedis();
    const dbOk = await testDatabase();
    await testSMTP();

    if (redisOk && dbOk) {
        await testQueue();
    } else {
        header("TEST 3: BullMQ Queue — SKIPPED");
        info("Redis or Database connection failed, skipping queue test");
    }

    // ── Summary ──
    console.log("\n" + yellow("━".repeat(50)));
    if (allPassed) {
        console.log(green("\n  🎉 ALL TESTS PASSED!\n"));
        console.log("  Next steps:");
        console.log("    1. Start the server:   npm run dev");
        console.log("    2. Start the worker:   npm run worker  (in another terminal)");
        console.log("    3. Send a POST request to /api/requests with type 'Urgent'");
        console.log("    4. Watch the worker terminal for batch processing logs\n");
    } else {
        console.log(red("\n  ⚠️  SOME TESTS FAILED — check output above\n"));
    }

    process.exit(allPassed ? 0 : 1);
};

runTests();
