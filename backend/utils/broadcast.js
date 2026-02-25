import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { ADMIN_EMAILS } from "../middleware/adminAuth.js";
dotenv.config();

// Reusing the transporter configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a notification email to all admins when a new submission needs approval.
 * @param {'item' | 'request' | 'urgent-request'} type
 * @param {Object} details - { title, description, submitterName, submitterEmail }
 */
export const sendAdminNotificationEmail = async (type, details) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(
      `[MOCK ADMIN EMAIL] ${type}: "${details.title}" by ${details.submitterName}`,
    );
    return;
  }

  const typeLabels = {
    item: "📦 New Item Listing",
    request: "📝 New Request",
    "urgent-request": "🔥 URGENT Request",
  };

  const label = typeLabels[type] || "New Submission";
  const adminUrl = `${process.env.CLIENT_URL3 || process.env.CLIENT_URL1 || "http://localhost:5173"}/admin`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: ADMIN_EMAILS.join(", "),
    subject: `[SwapKr Admin] ${label}: ${details.title}`,
    text: `Hi Admin,

A new submission is waiting for your approval on SwapKr.

Type: ${label}
Title: ${details.title}
Description: ${details.description || "N/A"}
Submitted by: ${details.submitterName} (${details.submitterEmail})

Review it here: ${adminUrl}

— SwapKr System`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `📧 Admin notification email sent for ${type}: "${details.title}"`,
    );
  } catch (err) {
    console.error(`Failed to send admin notification email:`, err.message);
    // Don't throw — admin email failure should never block the user's action
  }
};

export const sendBroadcastEmail = async (users, requestDetails) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Skipping broadcast (no credentials).");
    console.log(
      `[MOCK BROADCAST] To ${users.length} users: New Request "${requestDetails.title}"`,
    );
    return;
  }

  console.log(`Starting broadcast to ${users.length} users...`);

  const emailPromises = users.map((user) => {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: `📢 Urgent Request: ${requestDetails.title}`,
      text: `Hello ${user.name},\n\nA new URGENT request has been posted on CampusXchange!\n\nTitle: ${requestDetails.title}\nDescription: ${requestDetails.description}\n\nCan you help? Log in to CampusXchange to respond!\n\n- The CampusXchange Team`,
    };

    return transporter.sendMail(mailOptions).catch((err) => {
      console.error(`Failed to send to ${user.email}:`, err.message);
    });
  });

  try {
    await Promise.all(emailPromises);
    console.log("Broadcast completed.");
  } catch (error) {
    console.error("Error in broadcast:", error);
  }
};
