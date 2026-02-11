import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendOTP = async (email, otp) => {
    try {
        console.log(`DEBUG: Generated OTP for ${email} is ${otp}`);

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'CampusXchange Verification OTP',
            text: `Your OTP for CampusXchange verification is: ${otp}. Do not share this with anyone.`
        };

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            await transporter.sendMail(mailOptions);
            console.log(`OTP sent to ${email}`);
        } else {
            console.log('Skipping email send (no credentials). Use console OTP.');
        }

        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return true; // Fallback to true for testing
    }
};

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
