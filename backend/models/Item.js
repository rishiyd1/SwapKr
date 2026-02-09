const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

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
    category: {
        type: DataTypes.ENUM('Equipments', 'Daily Use', 'Academics', 'Sports', 'Others'),
        defaultValue: 'Others'
    },
    pickupLocation: {
        type: DataTypes.STRING,
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
