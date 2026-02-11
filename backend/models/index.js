import sequelize from '../config/database.js';
import User from './User.js';
import Item from './Item.js';
import Request from './Request.js';
import ItemImage from './ItemImage.js';
import Conversation from './Conversation.js';
import Message from './Message.js';

// Additional associations
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

// User associations for conversations
User.hasMany(Conversation, { foreignKey: 'buyerId', as: 'buyerConversations' });
User.hasMany(Conversation, { foreignKey: 'sellerId', as: 'sellerConversations' });

// Item associations
Item.hasMany(ItemImage, { foreignKey: 'itemId', as: 'images' });
ItemImage.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });

// Export all models and sequelize instance
export {
    sequelize,
    User,
    Item,
    Request,
    ItemImage,
    Conversation,
    Message
};
