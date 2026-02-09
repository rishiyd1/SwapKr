const nodemailer = require('nodemailer');
require('dotenv').config();

// Reusing the transporter configuration from otp.js logic
// In a real app, exact config should be shared via a config file
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendBroadcastEmail = async (users, requestDetails) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Skipping broadcast (no credentials).');
        console.log(`[MOCK BROADCAST] To ${users.length} users: New Request "${requestDetails.title}"`);
        return;
    }

    console.log(`Starting broadcast to ${users.length} users...`);

    // In production, use a queue (BullMQ/Redis).
    // Here we just loop.

    const emailPromises = users.map(user => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `📢 Urgent Request: ${requestDetails.title}`,
            text: `Hello ${user.name},\n\nA new URGENT request has been posted on SwapKr!\n\nTitle: ${requestDetails.title}\nDescription: ${requestDetails.description}\n\nCan you help? Log in to SwapKr to respond!\n\n- The SwapKr Team`
        };

        return transporter.sendMail(mailOptions).catch(err => {
            console.error(`Failed to send to ${user.email}:`, err.message);
        });
    });

    try {
        await Promise.all(emailPromises);
        console.log('Broadcast completed.');
    } catch (error) {
        console.error('Error in broadcast:', error);
    }
};

module.exports = { sendBroadcastEmail };
