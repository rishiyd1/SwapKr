const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    },

    department: {
        type: DataTypes.STRING,
    },
    year: {
        type: DataTypes.INTEGER,
    },
    hostel: {
        type: DataTypes.STRING, // Hostel/Block
    },
    tokens: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
        allowNull: false,
    },

    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'users',
    timestamps: true // Adds createdAt & updatedAt
});

module.exports = User;
