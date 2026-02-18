import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

// ─── Build Redis config ────────────────────────────────────────────────
// Supports REDIS_URL (for production/cloud Redis) or REDIS_HOST + REDIS_PORT
const buildRedisOptions = () => {
    const base = {
        maxRetriesPerRequest: null, // Required by BullMQ
        retryStrategy(times) {
            // Exponential backoff: 50ms, 100ms, 200ms … capped at 30s
            const delay = Math.min(times * 50, 30_000);
            console.warn(`⏳ Redis reconnect attempt ${times}, retrying in ${delay}ms`);
            return delay;
        },
        reconnectOnError(err) {
            // Reconnect on READONLY errors (common in Redis failover)
            return err.message.includes("READONLY");
        },
    };

    if (process.env.REDIS_URL) {
        // Pass URL + base options so retryStrategy and maxRetriesPerRequest are applied
        return { url: process.env.REDIS_URL, ...base };
    }

    return {
        ...base,
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    };
};

const opts = buildRedisOptions();
const redisConnection = opts.url
    ? new IORedis(opts.url, opts)
    : new IORedis(opts);

redisConnection.on("connect", () => {
    console.log("✅ Redis connected successfully");
});

redisConnection.on("error", (err) => {
    console.error("❌ Redis connection error:", err.message);
});

redisConnection.on("close", () => {
    console.warn("⚠️  Redis connection closed");
});

export default redisConnection;
