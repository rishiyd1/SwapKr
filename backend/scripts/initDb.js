import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const dbName = process.env.DB_NAME || "swapkr";

const getClientConfig = (initialDb = null) => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    };
  }
  return {
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "password",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    database: initialDb || "postgres",
  };
};

const createDb = async () => {
  if (process.env.DATABASE_URL) {
    console.log("Using DATABASE_URL, skipping database creation check.");
    return;
  }
  const config = getClientConfig("postgres");
  const client = new pg.Client(config);
  try {
    await client.connect();
    console.log("Connected to PostgreSQL default database.");

    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`,
    );
    if (res.rowCount === 0) {
      console.log(`Database ${dbName} not found. Creating...`);
      try {
        await client.query(`CREATE DATABASE "${dbName}"`);
        console.log(`Database ${dbName} created successfully.`);
      } catch (createErr) {
        if (createErr.code === "42501") {
          console.error(
            `\n⚠️  Permission denied. Please create the database manually:\n`,
          );
          console.error(`   Run as postgres superuser:`);
          console.error(`   CREATE DATABASE ${dbName};`);
          console.error(
            `   GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${config.user};\n`,
          );
          process.exit(1);
        }
        throw createErr;
      }
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } catch (err) {
    console.error("Error creating database:", err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
};

const createTables = async () => {
  const config = getClientConfig(dbName);
  const client = new pg.Client(config);
  try {
    await client.connect();
    console.log(`Connected to database. Creating tables...`);

    // Ensure pgcrypto extension exists for UUID generation
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // Create ENUM types (safe: IF NOT EXISTS via DO block)
    await client.query(`
            DO $$ BEGIN
                CREATE TYPE item_category AS ENUM ('Hardware', 'Daily Use', 'Academics', 'Sports', 'Others');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);
    await client.query(`
            DO $$ BEGIN
                CREATE TYPE item_status AS ENUM ('Available', 'Sold', 'processing');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);
    await client.query(`
            DO $$ BEGIN
                CREATE TYPE request_type AS ENUM ('Urgent', 'Normal');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);
    await client.query(`
            DO $$ BEGIN
                CREATE TYPE request_status AS ENUM ('Open', 'Closed');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);
    await client.query(`
            DO $$ BEGIN
                CREATE TYPE chat_status AS ENUM ('Active', 'Inactive', 'Closed');
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

    // Users table
    await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255),
                "phoneNumber" VARCHAR(255) NOT NULL UNIQUE,
                department VARCHAR(255),
                year INTEGER,
                hostel VARCHAR(255),
                tokens INTEGER NOT NULL DEFAULT 2,
                otp VARCHAR(255),
                "otpExpiresAt" TIMESTAMPTZ,
                "resetOtp" VARCHAR(255),
                "resetOtpExpiresAt" TIMESTAMPTZ,
                "isVerified" BOOLEAN DEFAULT false,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    // Items table
    await client.query(`
            CREATE TABLE IF NOT EXISTS items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "sellerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                category item_category DEFAULT 'Others',
                condition VARCHAR(50) DEFAULT 'Used',
                "pickupLocation" VARCHAR(255),
                status item_status DEFAULT 'Available',
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    // Item images table
    await client.query(`
            CREATE TABLE IF NOT EXISTS item_images (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "itemId" UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
                "imageUrl" VARCHAR(255) NOT NULL,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    // Requests table
    await client.query(`
            CREATE TABLE IF NOT EXISTS requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "requesterId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                type request_type NOT NULL DEFAULT 'Normal',
                "tokenCost" INTEGER DEFAULT 0,
                status request_status DEFAULT 'Open',
                budget DECIMAL(10, 2),
                category item_category DEFAULT 'Others',
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    // Chats table
    await client.query(`
            CREATE TABLE IF NOT EXISTS chats (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "buyerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "sellerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "itemId" UUID REFERENCES items(id) ON DELETE CASCADE,
                "requestId" UUID REFERENCES requests(id) ON DELETE CASCADE,
                "lastMessageAt" TIMESTAMPTZ DEFAULT NOW(),
                status chat_status DEFAULT 'Active',
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    // Messages table
    await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "chatId" UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                "itemId" UUID REFERENCES items(id) ON DELETE CASCADE,
                "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                "isRead" BOOLEAN DEFAULT false,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    // Buy Requests table
    await client.query(`
            CREATE TABLE IF NOT EXISTS buy_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "buyerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "sellerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "itemId" UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);

    // Indices for Buy Requests
    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_buy_requests_seller ON buy_requests("sellerId");
            CREATE INDEX IF NOT EXISTS idx_buy_requests_buyer ON buy_requests("buyerId");
            CREATE INDEX IF NOT EXISTS idx_buy_requests_buyer_item ON buy_requests("buyerId", "itemId");
        `);

    // Notifications table
    await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                "relatedId" UUID,
                "isRead" BOOLEAN DEFAULT false,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);

    // Indices for Notifications
    await client.query(`
            CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
            CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications("userId") WHERE "isRead" = false;
        `);

    // Rename ENUM value from 'Equipments' to 'Hardware' if it exists
    try {
      await client.query(
        `ALTER TYPE item_category RENAME VALUE 'Equipments' TO 'Hardware';`,
      );
    } catch (enumErr) {
      if (enumErr.code !== "42704" && enumErr.code !== "22P04") {
        // Ignore if type doesn't exist or value doesn't exist/already renamed
        console.log(
          "Minor non-fatal error during ENUM rename operations:",
          enumErr.message,
        );
      }
    }

    console.log("All tables created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
};

const init = async () => {
  await createDb();
  await createTables();
  console.log("Database initialization complete.");
};

init();
