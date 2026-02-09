const sequelize = require('../config/database');
const User = require('./User');
const Item = require('./Item');
const Request = require('./Request');
const ItemImage = require('./ItemImage');
const Chat = require('./Chat');
const Message = require('./Message');




// Chat Associations
Chat.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Chat.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Chat.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });

// Message Associations
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });
Message.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// User associations for chats
User.hasMany(Chat, { foreignKey: 'buyerId', as: 'buyerChats' });
User.hasMany(Chat, { foreignKey: 'sellerId', as: 'sellerChats' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });


// Export all models and sequelize instance
module.exports = {
    sequelize,
    User,
    Item,
    Request,
    ItemImage,
    Chat,
    Message
};
