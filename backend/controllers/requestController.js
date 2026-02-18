import { Request, User, pool } from "../models/index.js";
import { addEmailJob } from "../queues/emailQueue.js";

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
  if (title && title.length > 200) {
    errors.push("Title must be 200 characters or less");
  }
  if (!description || typeof description !== "string" || description.trim().length === 0) {
    errors.push("Description is required");
  }
  if (description && description.length > 2000) {
    errors.push("Description must be 2000 characters or less");
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
    const { title, description, type } = req.body;
    const requesterId = req.user.id;

    // Validate input
    const validationErrors = validateRequestInput(title, description, type);
    if (validationErrors.length > 0) {
      client.release();
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
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
    const requestResult = await client.query(
      `INSERT INTO requests (title, description, type, "tokenCost", "requesterId", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 'Open', NOW(), NOW())
       RETURNING *`,
      [safeTitle, safeDescription, type || "Normal", tokenCost, requesterId],
    );
    const newRequest = requestResult.rows[0];

    // ── COMMIT TRANSACTION ──
    await client.query("COMMIT");
    client.release();

    // Enqueue email job AFTER commit (outside transaction — fire and forget)
    if (type === "Urgent") {
      await addEmailJob({
        title: safeTitle,
        description: safeDescription,
        requesterName: sanitize(user.name),
        requesterId,
        requestId: newRequest.id,
      });
    }

    // Fetch updated token count
    const updatedUser = await User.findById(requesterId, { attributes: ["tokens"] });

    res.status(201).json({
      message: "Request posted successfully",
      request: newRequest,
      remainingTokens: updatedUser.tokens,
    });
  } catch (error) {
    // Rollback on any error
    await client.query("ROLLBACK").catch(() => { });
    client.release();
    console.error("[createRequest] Error:", error.message);
    res
      .status(500)
      .json({ message: "Error creating request", error: error.message });
  }
};

export const getRequests = async (req, res) => {
  try {
    const requests = await Request.findAllOpen();

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
