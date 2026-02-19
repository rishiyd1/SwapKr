import { User } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";
import dotenv from "dotenv";
dotenv.config();

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// In-memory store for pending (unverified) registrations
// Users are only saved to DB after OTP verification
const pendingRegistrations = new Map();

// Auto-cleanup expired pending registrations every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [email, data] of pendingRegistrations.entries()) {
      if (now > new Date(data.otpExpiresAt).getTime()) {
        pendingRegistrations.delete(email);
      }
    }
  },
  10 * 60 * 1000,
);

// ------------------ REGISTER USER ------------------
// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, department, year, hostel } =
      req.body;

    // Validate required fields
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and phone number are required",
      });
    }

    // Validate NITJ email
    if (!email.endsWith("@nitj.ac.in")) {
      return res.status(400).json({
        success: false,
        message: "Only @nitj.ac.in emails are allowed",
      });
    }

    // Validate phone number (10 digits)
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    // Check if user already exists in DB (already verified)
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check if phone number already exists in DB
    const existingPhone = await User.findByPhone(phoneNumber);
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store in pending registrations (NOT in DB yet)
    pendingRegistrations.set(email, {
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      department,
      year,
      hostel,
      otp,
      otpExpiresAt: otpExpiry,
    });

    console.log(`\n📧 OTP for ${email}: ${otp} (expires in 5 min)\n`);

    // Send OTP email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your SwapKr Verification Code",
      text: `Hello ${name},

Your one-time verification code (OTP) for SwapKr is:

${otp}

This code is required to complete your registration and will expire in 5 minutes.
Please do not share this code with anyone.

If you did not request this code, please ignore this email.

Thank you,
The SwapKr Team`,
    });

    res.status(201).json({
      success: true,
      message:
        "OTP sent to your email. Please verify to complete registration.",
      email,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------ VERIFY OTP ------------------
// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Check in pending registrations first
    const pendingUser = pendingRegistrations.get(email);
    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: "No pending registration found. Please register first.",
      });
    }

    // Check if OTP matches
    if (
      !pendingUser.otp ||
      pendingUser.otp.toString().trim() !== otp.toString().trim()
    ) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check if OTP expired
    if (Date.now() > new Date(pendingUser.otpExpiresAt).getTime()) {
      pendingRegistrations.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please register again.",
      });
    }

    // OTP is valid — NOW create the user in the database
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      phoneNumber: pendingUser.phoneNumber,
      department: pendingUser.department,
      year: pendingUser.year,
      hostel: pendingUser.hostel,
      isVerified: true,
      tokens: 2,
    });

    // Remove from pending registrations
    pendingRegistrations.delete(email);

    res.json({
      success: true,
      message: "Email verified & account created successfully!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        department: user.department,
        year: user.year,
        hostel: user.hostel,
        tokens: user.tokens,
      },
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------ LOGIN USER ------------------
// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email via OTP before logging in.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secret_key_change_me",
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        department: user.department,
        year: user.year,
        hostel: user.hostel,
        tokens: user.tokens,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ------------------ RESEND OTP ------------------
// POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Check pending registrations (unverified users are only in memory)
    const pendingUser = pendingRegistrations.get(email);
    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: "No pending registration found. Please register first.",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    pendingUser.otp = otp;
    pendingUser.otpExpiresAt = otpExpiry;

    // Send OTP email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your SwapKr Verification Code (Resent)",
      text: `Hello ${pendingUser.name},

Your one-time verification code (OTP) for CampusXchange is:

${otp}

This code is valid for 5 minutes. Please do not share this code with anyone.

Thank you,
The SwapKr Team`,
    });

    res.status(200).json({
      success: true,
      message: "OTP resent successfully!",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------ SEND RESET OTP ------------------
// POST /api/auth/send-reset-otp
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset OTP
    const otp = generateOTP();
    const resetOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await User.update(user.id, { resetOtp: otp, resetOtpExpiresAt });

    // Send reset OTP email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Password Reset OTP - SwapKr",
      text: `Hello ${user.name},

Please use the following one-time code (OTP) to reset your password:

${otp}

This code is valid for 15 minutes. For security, please do not share this code.
If you did not request a password reset, you can safely ignore this email.

Thank you,
Team SwapKr`,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send Reset OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------ RESET PASSWORD ------------------
// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Verify reset OTP
    if (
      user.resetOtp !== otp ||
      Date.now() > new Date(user.resetOtpExpiresAt).getTime()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(user.id, {
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpiresAt: null,
    });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------ GET PROFILE ------------------
// GET /api/auth/profile (protected route)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, {
      exclude: [
        "password",
        "otp",
        "otpExpiresAt",
        "resetOtp",
        "resetOtpExpiresAt",
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------ UPDATE PROFILE ------------------
// PUT /api/auth/profile (protected route)
export const updateProfile = async (req, res) => {
  const { name, department, year, hostel, phoneNumber } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Build update fields
    const fields = {};
    if (name) fields.name = name;
    if (department) fields.department = department;
    if (year) fields.year = year;
    if (hostel) fields.hostel = hostel;
    if (phoneNumber) {
      if (!/^[0-9]{10}$/.test(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be exactly 10 digits",
        });
      }
      fields.phoneNumber = phoneNumber;
    }

    const updatedUser = await User.update(req.user.id, fields);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        department: updatedUser.department,
        year: updatedUser.year,
        hostel: updatedUser.hostel,
        tokens: updatedUser.tokens,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------ USE TOKEN (Urgent Request) ------------------
// POST /api/auth/use-token (protected route)
export const useToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.tokens <= 0) {
      return res.status(400).json({
        success: false,
        message: "No tokens remaining. Tokens reset on the 1st of every month.",
        tokens: user.tokens,
      });
    }

    // Deduct 1 token
    const updatedUser = await User.update(req.user.id, {
      tokens: user.tokens - 1,
    });

    res.status(200).json({
      success: true,
      message: "Token used successfully for urgent request.",
      tokensRemaining: updatedUser.tokens,
    });
  } catch (error) {
    console.error("Use Token Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------ GET TOKEN BALANCE ------------------
// GET /api/auth/tokens (protected route)
export const getTokenBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, {
      attributes: ["id", "name", "tokens"],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      tokens: user.tokens,
      message: `You have ${user.tokens} token(s) remaining. Tokens reset on the 1st of every month.`,
    });
  } catch (error) {
    console.error("Get Token Balance Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------ DELETE ACCOUNT ------------------
// DELETE /api/auth/account (protected route)
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    // Import models here, as they are needed before user lookup
    const { Item, Request, Chat, ItemImage, User } =
      await import("../models/index.js");

    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required to delete account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Cascading delete logic
    // 1. Delete all items listed by user (this will cascade to chats for those items)
    const items = await Item.findMyListings(userId);
    for (const item of items) {
      // Cascading delete for each item
      await Promise.all([
        ItemImage.destroyByItemId(item.id),
        Chat.deleteByItemId(item.id),
      ]);
      await Item.destroy(item.id);
    }

    // 2. Delete all Requests made by user (Requests, Chats)
    const requests = await Request.findByRequesterId(userId);
    for (const request of requests) {
      // Cascading delete for each request
      await Chat.deleteByRequestId(request.id);
      await Request.destroy(request.id);
    }

    // 3. Delete any other chats where user is buyer/seller (Direct chats not linked to items?)
    // This catches any remaining chats
    await Chat.deleteByUserId(userId);

    // 4. Delete the User
    await User.destroy(userId);

    res.status(200).json({
      success: true,
      message: "Account and all associated data deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    });
  }
};
