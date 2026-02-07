const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Item = require('./Item');
const Request = require('./Request');

const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'chats',
    timestamps: true
});

// Associations
// Sender and Receiver
Chat.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Chat.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Context of chat (Item or Request)
Chat.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
Chat.belongsTo(Request, { foreignKey: 'requestId', as: 'request' }); // Can be null if it's item based

module.exports = Chat;
