import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const dbName = process.env.DB_NAME || 'swapkr';
const config = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Connect to default DB to create new one
};

const client = new Client(config);

const createDb = async () => {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL default database.');

        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
        if (res.rowCount === 0) {
            console.log(`Database ${dbName} not found. Creating...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database ${dbName} created successfully.`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
};

createDb();
