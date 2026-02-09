const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Item = require('./Item');

// Message = Individual message in a conversation
const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Who sent this message (either buyerId or sellerId)
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
    // timestamps: true adds createdAt (message timestamp) and updatedAt automatically
}, {
    tableName: 'messages',
    timestamps: true
});

// Associations
// Defined in index.js to avoid circular dependencies

module.exports = Message;
