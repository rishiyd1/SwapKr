import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// SQLite Configuration
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // File location
    logging: false
});

export default sequelize;
