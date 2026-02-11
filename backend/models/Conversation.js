import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Item from './Item.js';

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

export default Conversation;
