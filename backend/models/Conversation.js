const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Item = require('./Item');

// Conversation = A chat thread between two users about an item
const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('Active', 'Completed', 'Closed'),
        defaultValue: 'Active',
    }
}, {
    tableName: 'conversations',
    timestamps: true
});

// Associations
Conversation.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Conversation.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Conversation.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });

module.exports = Conversation;
