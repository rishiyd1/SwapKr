const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Request = sequelize.define('Request', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('Urgent', 'Normal'),
        allowNull: false,
        defaultValue: 'Normal',
    },
    tokenCost: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('Open', 'Closed'),
        defaultValue: 'Open',
    },
}, {
    tableName: 'requests',
    timestamps: true
});

// Associations
Request.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
User.hasMany(Request, { foreignKey: 'requesterId', as: 'requests' });

module.exports = Request;
