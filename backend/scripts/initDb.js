import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const dbName = process.env.DB_NAME || "swapkr";
const config = {
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "password",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  database: "postgres", // Connect to default DB to create new one
};

const createDb = async () => {
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
  const appConfig = { ...config, database: dbName };
  const client = new pg.Client(appConfig);
  try {
    await client.connect();
    console.log(`Connected to ${dbName}. Creating tables...`);

    // Create ENUM types (safe: IF NOT EXISTS via DO block)
    await client.query(`
            DO $$ BEGIN
                CREATE TYPE item_category AS ENUM ('Equipments', 'Daily Use', 'Academics', 'Sports', 'Others');
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
                id SERIAL PRIMARY KEY,
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
                id SERIAL PRIMARY KEY,
                "sellerId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
                id SERIAL PRIMARY KEY,
                "itemId" INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
                "imageUrl" VARCHAR(255) NOT NULL,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    // Requests table
    await client.query(`
            CREATE TABLE IF NOT EXISTS requests (
                id SERIAL PRIMARY KEY,
                "requesterId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                type request_type NOT NULL DEFAULT 'Normal',
                "tokenCost" INTEGER DEFAULT 0,
                status request_status DEFAULT 'Open',
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    // Chats table
    await client.query(`
            CREATE TABLE IF NOT EXISTS chats (
                id SERIAL PRIMARY KEY,
                "buyerId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "sellerId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "itemId" INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
                "lastMessageAt" TIMESTAMPTZ DEFAULT NOW(),
                status chat_status DEFAULT 'Active',
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    // Messages table
    await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                "chatId" INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                "itemId" INTEGER REFERENCES items(id) ON DELETE CASCADE,
                "senderId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                "isRead" BOOLEAN DEFAULT false,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    // Buy Requests table
    await client.query(`
            CREATE TABLE IF NOT EXISTS buy_requests (
                id SERIAL PRIMARY KEY,
                "buyerId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "sellerId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "itemId" INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
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
                id SERIAL PRIMARY KEY,
                "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                "relatedId" INTEGER,
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
