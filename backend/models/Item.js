const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Import User for association

const Item = sequelize.define('Item', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
    type: {
        type: DataTypes.ENUM('Sell', 'Borrow', 'Donate'), // Added Donate just in case, sticking to Sell/Borrow mainly
        allowNull: false,
    },
    category: { // Adding category as it's useful
        type: DataTypes.STRING,
        defaultValue: 'General'
    },
    yearOfPurchase: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.ENUM('Available', 'Sold', 'pending'),
        defaultValue: 'Available',
    },
}, {
    tableName: 'items',
    timestamps: true
});

// Associations
Item.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
User.hasMany(Item, { foreignKey: 'sellerId', as: 'items' });

module.exports = Item;
