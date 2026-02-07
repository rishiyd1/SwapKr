const { Sequelize } = require('sequelize');
require('dotenv').config();

// SQLite Configuration
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // File location
    logging: false
});

module.exports = sequelize;
