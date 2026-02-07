const sequelize = require('../config/database');
const User = require('./User');
const Item = require('./Item');
const Request = require('./Request');
const Chat = require('./Chat');
const ItemImage = require('./ItemImage');

// Export all models and sequelize instance
module.exports = {
    sequelize,
    User,
    Item,
    Request,
    Chat,
    ItemImage
};
