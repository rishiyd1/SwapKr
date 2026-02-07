const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize
// For now using local development credentials. 
// Use environment variables for production.
const sequelize = new Sequelize(
    process.env.DB_NAME || 'swapkr',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'password', // Replace with actual password or env var
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false, // Set to console.log to see SQL queries
    }
);

module.exports = sequelize;
