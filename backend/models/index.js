import sequelize from '../config/database.js';
import User from './User.js';
import Item from './Item.js';
import Request from './Request.js';
import ItemImage from './ItemImage.js';
import Conversation from './Conversation.js';
import Message from './Message.js';




// Chat Associations
Chat.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Chat.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Chat.belongsTo(Item, { foreignKey: 'itemId', as: 'item', onDelete: 'CASCADE' });
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages', onDelete: 'CASCADE' });

// Message Associations
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat', onDelete: 'CASCADE' });
Message.belongsTo(Item, { foreignKey: 'itemId', as: 'item', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// User associations for chats
User.hasMany(Chat, { foreignKey: 'buyerId', as: 'buyerChats' });
User.hasMany(Chat, { foreignKey: 'sellerId', as: 'sellerChats' });



// Item associations
Item.hasMany(ItemImage, { foreignKey: 'itemId', as: 'images', onDelete: 'CASCADE' });
ItemImage.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });

// Item <-> Chat/Message Cascade
Item.hasMany(Chat, { foreignKey: 'itemId', onDelete: 'CASCADE' });
Item.hasMany(Message, { foreignKey: 'itemId', onDelete: 'CASCADE' });

// User <-> Item (Seller) association
// "seller" alias on Item side (Item.seller), "items" alias on User side (User.items)
Item.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
User.hasMany(Item, { foreignKey: 'sellerId', as: 'items' });

// Export all models and sequelize instance
export {
    sequelize,
    User,
    Item,
    Request,
    ItemImage,
    Chat,
    Message
};
