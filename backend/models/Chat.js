import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Item from './Item.js';
import Request from './Request.js';

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

export default Chat;
