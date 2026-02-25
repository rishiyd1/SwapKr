import { Request, User, Notification, pool } from "../models/index.js";
import { addEmailJob } from "../queues/emailQueue.js";
import { sendAdminNotificationEmail } from "../utils/broadcast.js";

// ─── HTML Sanitization ─────────────────────────────────────────────────
// Strips HTML/script tags to prevent XSS in email templates
const sanitize = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ─── Input Validation ──────────────────────────────────────────────────
const validateRequestInput = (title, description, type) => {
  const errors = [];
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("Title is required");
  }
  if (title && title.length > 60) {
    errors.push("Title must be less than 60 characters");
  }
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    errors.push("Description is required");
  }
  if (description && description.length > 300) {
    errors.push("Description must be less than 300 characters");
  }
  if (type && !["Urgent", "Normal"].includes(type)) {
    errors.push("Type must be 'Urgent' or 'Normal'");
  }
  return errors;
};

// ─── Create Request (with DB Transaction for Urgent) ───────────────────
export const createRequest = async (req, res) => {
  const client = await pool.connect(); // Grab a client for transaction

  try {
    const { title, description, type, category } = req.body;
    const requesterId = req.user.id;

    // Validate input
    const validationErrors = validateRequestInput(title, description, type);
    if (validationErrors.length > 0) {
      client.release();
      return res
        .status(400)
        .json({ message: "Validation failed", errors: validationErrors });
    }

    // Sanitize for email safety
    const safeTitle = sanitize(title.trim());
    const safeDescription = sanitize(description.trim());

    let tokenCost = 0;
    if (type === "Urgent") {
      tokenCost = 1;
    }

    // ── BEGIN TRANSACTION ──
    // Token deduction + request creation are atomic — if either fails, both roll back
    await client.query("BEGIN");

    // Fetch user with row lock (FOR UPDATE prevents race conditions on tokens)
    const userResult = await client.query(
      "SELECT * FROM users WHERE id = $1 FOR UPDATE",
      [requesterId],
    );
    const user = userResult.rows[0];

    if (!user) {
      await client.query("ROLLBACK");
      client.release();
      return res.status(404).json({ message: "User not found" });
    }

    if (type === "Urgent") {
      if (user.tokens < tokenCost) {
        await client.query("ROLLBACK");
        client.release();
        return res
          .status(400)
          .json({ message: "Insufficient tokens for Urgent request" });
      }
      // Deduct tokens within the transaction
      await client.query(
        'UPDATE users SET tokens = tokens - $1, "updatedAt" = NOW() WHERE id = $2',
        [tokenCost, requesterId],
      );
    }

    // Create the request within the same transaction
    // Both Urgent and Normal requests now require admin approval
    const requestStatus = "PendingApproval";
    const requestResult = await client.query(
      `INSERT INTO requests (title, description, type, "tokenCost", "requesterId", status, category, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        safeTitle,
        safeDescription,
        type || "Normal",
        tokenCost,
        requesterId,
        requestStatus,
        category || "Others",
      ],
    );
    const newRequest = requestResult.rows[0];

    // ── COMMIT TRANSACTION ──
    await client.query("COMMIT");
    client.release();

    // ── ADMIN NOTIFICATION EMAIL ──
    // Notify admins that a new request is pending approval
    try {
      await sendAdminNotificationEmail(
        type === "Urgent" ? "urgent-request" : "request",
        {
          title: safeTitle,
          description: safeDescription,
          submitterName: user.name,
          submitterEmail: user.email,
        },
      );
    } catch (emailError) {
      console.error(
        "[createRequest] Failed to send admin notification email:",
        emailError.message,
      );
      // Don't fail the request if admin email fails
    }

    // Fetch updated token count
    const updatedUser = await User.findById(requesterId, {
      attributes: ["tokens"],
    });

    res.status(201).json({
      message: "Request posted successfully",
      request: newRequest,
      remainingTokens: updatedUser.tokens,
    });
  } catch (error) {
    // Rollback on any error
    await client.query("ROLLBACK").catch(() => {});
    client.release();
    console.error("[createRequest] Error:", error.message);
    res
      .status(500)
      .json({ message: "Error creating request", error: error.message });
  }
};

export const getRequests = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const { category } = req.query;
    const requests = await Request.findAllOpen(currentUserId, category);

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.findByRequesterId(req.user.id);
    res.status(200).json(requests);
  } catch (error) {
    console.error("[getMyRequests] Error:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching your requests", error: error.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findByIdWithDetails(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    console.error("[getRequestById] Error:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching request", error: error.message });
  }
};

export const updateRequest = async (req, res) => {
  try {
    const { title, description, type, status } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.requesterId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this request" });
    }

    const fields = {};
    if (title) fields.title = sanitize(title.trim());
    if (description) fields.description = sanitize(description.trim());
    // if (type) fields.type = type; // Prevent changing type after creation
    if (status) fields.status = status;

    const updatedRequest = await Request.update(req.params.id, fields);

    res.status(200).json({
      message: "Request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("[updateRequest] Error:", error.message);
    res
      .status(500)
      .json({ message: "Error updating request", error: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.requesterId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this request" });
    }

    // Delete associated chats (and their messages via helper)
    // Note: We need to import Chat model if not already imported
    // Since we are using index.js export, verify Chat is available
    await import("../models/index.js").then(({ Chat }) =>
      Chat.deleteByRequestId(request.id),
    );

    await Request.destroy(request.id);

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("[deleteRequest] Error:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting request", error: error.message });
  }
};
