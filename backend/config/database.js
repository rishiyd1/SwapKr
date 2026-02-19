import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const isProduction =
  process.env.NODE_ENV === "production" || process.env.DATABASE_URL;

const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 20, // Connection pool size limit for Supabase Transaction mode
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  : {
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASS || "password",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || "swapkr",
    };

const pool = new pg.Pool(connectionConfig);

export default pool;
