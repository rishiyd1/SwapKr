const cron = require('node-cron');
const { User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Run on the 1st of every month at midnight
const job = cron.schedule('0 0 1 * *', async () => {
    console.log('Running Monthly Token Reset Job...');
    try {
        // Reset all users tokens to 50
        await User.update({ tokens: 50 }, { where: {} });
        console.log('Tokens reset successfully for all users.');
    } catch (error) {
        console.error('Error resetting tokens:', error);
    }
});

module.exports = job;
