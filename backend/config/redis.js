import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

// ─── Build Redis config ────────────────────────────────────────────────
// Supports REDIS_URL (for production/cloud Redis) or REDIS_HOST + REDIS_PORT
let redisWarned = false;

const buildRedisOptions = () => {
    const base = {
        maxRetriesPerRequest: null, // Required by BullMQ
        retryStrategy(times) {
            if (times > 3) {
                if (!redisWarned) {
                    redisWarned = true;
                    console.warn("⚠ Redis not available — email queue disabled. Install Redis or set REDIS_URL to enable.");
                }
                return null; // Stop retrying
            }
            const delay = Math.min(times * 50, 30_000);
            return delay;
        },
        reconnectOnError(err) {
            return err.message.includes("READONLY");
        },
    };

    if (process.env.REDIS_URL) {
        return { url: process.env.REDIS_URL, ...base };
    }

    return {
        ...base,
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        lazyConnect: true,
    };
};

const opts = buildRedisOptions();
const redisConnection = opts.url
    ? new IORedis(opts.url, opts)
    : new IORedis(opts);

redisConnection.on("connect", () => {
    console.log("✅ Redis connected successfully");
});

redisConnection.on("error", () => {
    // Silenced — retryStrategy handles logging
});

export default redisConnection;

