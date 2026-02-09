const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Item = sequelize.define('Item', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    category: {
        type: DataTypes.ENUM('Equipments', 'Daily Use', 'Academics', 'Sports', 'Others'),
        defaultValue: 'Others'
    },
    pickupLocation: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.ENUM('Available', 'Sold', 'processing'),
        defaultValue: 'Available',
    },
}, {
    tableName: 'items',
    timestamps: true
});

// Associations
// Defined in index.js to avoid circular dependencies

module.exports = Item;
