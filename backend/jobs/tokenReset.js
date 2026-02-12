import cron from 'node-cron';
import { User } from '../models/index.js';

// Run on the 1st of every month at midnight
const job = cron.schedule('0 0 1 * *', async () => {
    console.log('Running Monthly Token Reset Job...');
    try {
        // Reset all users tokens to 2
        await User.update({ tokens: 2 }, { where: {} });
        console.log('Tokens reset successfully for all users.');
    } catch (error) {
        console.error('Error resetting tokens:', error);
    }
});

export default job;
