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
    buyerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    itemId: {
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
Message.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Message.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });

module.exports = Message;
