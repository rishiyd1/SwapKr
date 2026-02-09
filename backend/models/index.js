const sequelize = require('../config/database');
const User = require('./User');
const Item = require('./Item');
const Request = require('./Request');
const ItemImage = require('./ItemImage');
const Conversation = require('./Conversation');
const Message = require('./Message');

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
module.exports = {
    sequelize,
    User,
    Item,
    Request,
    ItemImage,
    Conversation,
    Message
};
