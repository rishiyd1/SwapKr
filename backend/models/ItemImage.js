import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ItemImage = sequelize.define('ItemImage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'item_images', 
    timestamps: true
});

// Associations are defined in models/index.js to avoid circular dependencies

export default ItemImage;
