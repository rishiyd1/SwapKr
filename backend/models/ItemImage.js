const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Item = require('./Item');

const ItemImage = sequelize.define('ItemImage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'item_images', 
    timestamps: true
});

// Associations
// Defined in index.js to avoid circular dependencies

module.exports = ItemImage;
