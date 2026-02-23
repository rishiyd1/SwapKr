import {
  BuyRequest,
  Item,
  Chat,
  Message,
  Notification,
  User,
} from "../models/index.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Inline transporter — same pattern as otp.js
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// POST /api/orders/buy-request — Buyer sends a buy request with one message
export const sendBuyRequest = async (req, res) => {
  try {
    const { itemId, message } = req.body;
    const buyerId = req.user.id;

    if (!itemId || !message || message.trim() === "") {
      return res
        .status(400)
        .json({ message: "Item ID and message are required" });
    }

    // Fetch the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Can't buy your own item
    if (item.sellerId === buyerId) {
      return res.status(400).json({ message: "You cannot buy your own item" });
    }

    // Item must be available
    if (item.status !== "Available") {
      return res
        .status(400)
        .json({ message: "This item is no longer available" });
    }

    // Check for ANY existing request (Pending, Accepted, or Rejected)
    const existingRequest = await BuyRequest.findOne({ buyerId, itemId });
    if (existingRequest) {
      const statusMsg =
        existingRequest.status === "Rejected"
          ? "Your previous request for this item was rejected."
          : "You already have a request for this item.";

      return res.status(400).json({ message: statusMsg });
    }

    // Create the buy request
    const buyRequest = await BuyRequest.create({
      buyerId,
      sellerId: item.sellerId,
      itemId,
      message: message.trim(),
    });

    // Create notification for seller
    await Notification.create({
      userId: item.sellerId,
      type: "buy_request",
      content: `New buy request for your item: ${item.title}`,
      relatedId: buyRequest.id,
    });

    // Send email notification to the seller
    try {
      const seller = await User.findById(item.sellerId);
      const buyer = await User.findById(buyerId);
      if (seller?.email && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const clientUrl = process.env.CLIENT_URL || "https://swapkr.vercel.app";
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: seller.email,
          subject: `🛒 New Buy Request for "${item.title}"`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: 'Segoe UI', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4940F 0%, #B8860B 50%, #996F0A 100%); padding: 35px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">🛒 New Buy Request</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 35px 40px;">

              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">Hi ${seller.name || "Seller"},</p>
              <p style="color: #555; font-size: 15px; margin: 0 0 25px 0;">Someone is interested in buying your item! Here are the details:</p>

              <!-- Item Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #fef9ee; border: 1px solid #fce8b2; border-radius: 8px; margin-bottom: 25px;">
                <tr>
                  <td style="border-left: 5px solid #D4940F; padding: 20px 25px; border-radius: 8px 0 0 8px;">
                    <h2 style="color: #2c3e50; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">${item.title}</h2>
                    <p style="color: #D4940F; font-size: 16px; margin: 0 0 12px 0; font-weight: 700;">₹${item.price}</p>
                    <p style="color: #555; font-size: 14px; margin: 0; line-height: 1.6;"><strong>Buyer:</strong> ${buyer?.name || "A user"}</p>
                    <p style="color: #555; font-size: 14px; margin: 6px 0 0 0; line-height: 1.6;"><strong>Message:</strong> ${message.trim()}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0 15px 0;">
                    <a href="${clientUrl}/item/${item.id}"
                       style="display: inline-block; background: linear-gradient(135deg, #D4940F, #B8860B); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">
                      View Item & Respond
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Tip -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                <tr>
                  <td style="background: #fef9ee; border-left: 4px solid #D4940F; padding: 12px 18px; border-radius: 4px;">
                    <p style="color: #B8860B; font-size: 13px; margin: 0; font-weight: 600;">
                      💡 Tip: <span style="font-weight: 400; color: #555;">Respond quickly to close the deal!</span>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #fafafa; padding: 20px 40px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0 0 5px 0;">You received this email because someone sent a buy request for your listing on <strong>SwapKr</strong>.</p>
              <p style="color: #bbb; font-size: 11px; margin: 0;">SwapKr — Your Campus Marketplace</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`📧 Buy request email sent to seller ${seller.email}`);
      } else {
        console.log(
          "Skipping buy request email (no SMTP credentials or seller email).",
        );
      }
    } catch (emailError) {
      console.error(
        "[sendBuyRequest] Email notification failed:",
        emailError.message,
      );
      // Don't fail the buy request if email fails
    }

    // Fetch with full details
    const fullRequest = await BuyRequest.findByIdWithDetails(buyRequest.id);

    // Notify seller via socket
    const io = req.app.get("io");
    if (io) {
      const { onlineUsers } = await import("../utils/socketStore.js");
      const sellerId = item.sellerId;
      const sellerSocketId =
        onlineUsers.get(sellerId.toString()) || onlineUsers.get(sellerId);
      if (sellerSocketId) {
        io.to(sellerSocketId).emit("new_buy_request", {
          buyRequest: fullRequest,
        });
      }
    }

    res.status(201).json({
      message: "Buy request sent successfully",
      buyRequest: fullRequest,
    });
  } catch (error) {
    console.error("Send Buy Request Error:", error);
    res
      .status(500)
      .json({ message: "Error sending buy request", error: error.message });
  }
};

// GET /api/orders/incoming — Seller sees all buy requests for their items
export const getIncomingRequests = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const requests = await BuyRequest.findAllForSeller(sellerId);

    res.status(200).json(requests);
  } catch (error) {
    console.error("Get Incoming Requests Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching requests", error: error.message });
  }
};

// GET /api/orders/my-requests — Buyer sees all their sent buy requests
export const getMyRequests = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const requests = await BuyRequest.findAllForBuyer(buyerId);

    res.status(200).json(requests);
  } catch (error) {
    console.error("Get My Requests Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching your requests", error: error.message });
  }
};

// PUT /api/orders/:requestId/accept — Seller accepts → creates Chat + initial message
export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const sellerId = req.user.id;

    const buyRequest = await BuyRequest.findById(requestId);
    if (!buyRequest) {
      return res.status(404).json({ message: "Buy request not found" });
    }

    // Only the seller can accept
    if (buyRequest.sellerId !== sellerId) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this request" });
    }

    // Must be pending
    if (buyRequest.status !== "Pending") {
      return res
        .status(400)
        .json({ message: `Request is already ${buyRequest.status}` });
    }

    // Update request status to Accepted
    await BuyRequest.update(requestId, { status: "Accepted" });

    // Create a chat between buyer and seller for this item
    let chat = await Chat.findOne({
      buyerId: buyRequest.buyerId,
      sellerId: buyRequest.sellerId,
      itemId: buyRequest.itemId,
    });

    if (!chat) {
      chat = await Chat.create({
        buyerId: buyRequest.buyerId,
        sellerId: buyRequest.sellerId,
        itemId: buyRequest.itemId,
        lastMessageAt: new Date(),
      });
    }

    // Copy the initial buy request message into the chat
    const initialMessage = await Message.create({
      chatId: chat.id,
      itemId: buyRequest.itemId,
      senderId: buyRequest.buyerId,
      content: buyRequest.message,
    });

    // Fetch full chat with details
    const fullChat = await Chat.findByIdWithDetails(chat.id);
    console.log(
      `[acceptRequest] Chat found/created: ${chat.id}, fullChat ID: ${fullChat?.id}`,
    );

    // Notify buyer via socket
    const io = req.app.get("io");
    if (io) {
      const { onlineUsers } = await import("../utils/socketStore.js");
      const buyerId = buyRequest.buyerId;
      const buyerSocketId =
        onlineUsers.get(buyerId.toString()) || onlineUsers.get(buyerId);
      console.log(
        `[acceptRequest] Notifying buyer ${buyerId} at socket ${buyerSocketId}`,
      );
      if (buyerSocketId) {
        io.to(buyerSocketId).emit("buy_request_accepted", {
          requestId: requestId,
          chat: fullChat,
        });
      }
    }

    res.status(200).json({
      message: "Buy request accepted. Chat created!",
      chat: fullChat,
    });
  } catch (error) {
    console.error("Accept Request Error:", error);
    res
      .status(500)
      .json({ message: "Error accepting request", error: error.message });
  }
};

// PUT /api/orders/:requestId/reject — Seller rejects the request
export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const sellerId = req.user.id;

    const buyRequest = await BuyRequest.findById(requestId);
    if (!buyRequest) {
      return res.status(404).json({ message: "Buy request not found" });
    }

    // Only the seller can reject
    if (buyRequest.sellerId !== sellerId) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this request" });
    }

    // Must be pending
    if (buyRequest.status !== "Pending") {
      return res
        .status(400)
        .json({ message: `Request is already ${buyRequest.status}` });
    }

    // Create notification for buyer BEFORE deleting
    await Notification.create({
      userId: buyRequest.buyerId,
      type: "buy_request_rejected",
      // Link to item (preserved)
      content: `Your request for "${buyRequest.item?.title || "an item"}" was rejected.`,
      relatedId: buyRequest.itemId,
    });

    // Update status to Rejected (Soft Delete from Seller view)
    await BuyRequest.update(requestId, { status: "Rejected" });

    // Notify buyer via socket
    const io = req.app.get("io");
    if (io) {
      const { onlineUsers } = await import("../utils/socketStore.js");
      const buyerId = buyRequest.buyerId;
      const buyerSocketId =
        onlineUsers.get(buyerId.toString()) || onlineUsers.get(buyerId);
      if (buyerSocketId) {
        io.to(buyerSocketId).emit("buy_request_rejected", {
          requestId: requestId,
        });
      }
    }

    res.status(200).json({ message: "Buy request rejected" });
  } catch (error) {
    console.error("Reject Request Error:", error);
    res
      .status(500)
      .json({ message: "Error rejecting request", error: error.message });
  }
};

// PUT /api/orders/:requestId/mark-sold — Seller marks item as sold, closes chat
export const markAsSold = async (req, res) => {
  try {
    const { requestId } = req.params;
    const sellerId = req.user.id;

    const buyRequest = await BuyRequest.findByIdWithDetails(requestId);
    if (!buyRequest) {
      return res.status(404).json({ message: "Buy request not found" });
    }

    // Only the seller can mark as sold
    if (buyRequest.sellerId !== sellerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Request must be accepted
    if (buyRequest.status !== "Accepted") {
      return res
        .status(400)
        .json({ message: "Can only mark sold on accepted requests" });
    }

    // Mark item as Sold
    await Item.update(buyRequest.itemId, { status: "Sold" });

    // Find and close the associated chat
    const chat = await Chat.findOne({
      buyerId: buyRequest.buyerId,
      sellerId: buyRequest.sellerId,
      itemId: buyRequest.itemId,
    });

    if (chat) {
      await Chat.update(chat.id, { status: "Closed" });
    }

    // Reject all other pending requests for this item
    const allPendingQuery = await import("../config/database.js");
    await allPendingQuery.default.query(
      `UPDATE buy_requests SET status = 'Rejected', "updatedAt" = NOW()
       WHERE "itemId" = $1 AND status = 'Pending' AND id != $2`,
      [buyRequest.itemId, requestId],
    );

    // Notify buyer via socket
    const io = req.app.get("io");
    if (io) {
      const { onlineUsers } = await import("../utils/socketStore.js");
      const buyerId = buyRequest.buyerId;
      const buyerSocketId =
        onlineUsers.get(buyerId.toString()) || onlineUsers.get(buyerId);
      if (buyerSocketId) {
        io.to(buyerSocketId).emit("item_sold", {
          requestId: requestId,
          itemId: buyRequest.itemId,
          chatId: chat ? chat.id : null,
        });
      }
    }

    res.status(200).json({
      message: "Item marked as sold. Chat preserved in history.",
      itemId: buyRequest.itemId,
    });
  } catch (error) {
    console.error("Mark Sold Error:", error);
    res
      .status(500)
      .json({ message: "Error marking as sold", error: error.message });
  }
};
