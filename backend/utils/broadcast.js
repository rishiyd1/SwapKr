import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Reusing the transporter configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendBroadcastEmail = async (users, requestDetails) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('Skipping broadcast (no credentials).');
        console.log(`[MOCK BROADCAST] To ${users.length} users: New Request "${requestDetails.title}"`);
        return;
    }

    console.log(`Starting broadcast to ${users.length} users...`);

    const emailPromises = users.map(user => {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: user.email,
            subject: `📢 Urgent Request: ${requestDetails.title}`,
            text: `Hello ${user.name},\n\nA new URGENT request has been posted on CampusXchange!\n\nTitle: ${requestDetails.title}\nDescription: ${requestDetails.description}\n\nCan you help? Log in to CampusXchange to respond!\n\n- The CampusXchange Team`
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
