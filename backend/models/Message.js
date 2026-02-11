import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Item from './Item.js';

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

export default Message;
