const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Item = require('./Item');

const ItemImage = sequelize.define('ItemImage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
ItemImage.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
Item.hasMany(ItemImage, { foreignKey: 'itemId', as: 'images' });

module.exports = ItemImage;
