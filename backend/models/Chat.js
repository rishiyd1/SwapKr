import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Item from './Item.js';
import Request from './Request.js';

// Chat = A chat thread between two users about an item
const Chat = sequelize.define('Chat', {
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
    lastMessageAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Closed'),
        defaultValue: 'Active',
    }
}, {
    tableName: 'chats',
    timestamps: true
});

// Associations
// Defined in index.js to avoid circular dependencies

export default Chat;
