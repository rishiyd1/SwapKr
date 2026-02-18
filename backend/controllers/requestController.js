import { Request, User } from "../models/index.js";
import { sendBroadcastEmail } from "../utils/broadcast.js";

// Create a Request (Urgent deducts tokens)
export const createRequest = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const requesterId = req.user.id;

    let tokenCost = 0;
    if (type === "Urgent") {
      tokenCost = 1;
    }

    const user = await User.findById(requesterId);

    if (type === "Urgent") {
      if (user.tokens < tokenCost) {
        return res
          .status(400)
          .json({ message: "Insufficient tokens for Urgent request" });
      }
      // Deduct tokens
      await User.update(requesterId, { tokens: user.tokens - tokenCost });
    }

    const newRequest = await Request.create({
      title,
      description,
      type, // Urgent, Normal
      tokenCost,
      requesterId,
      status: "Open",
    });

    // If Urgent, broadcast to all users
    if (type === "Urgent") {
      // Find all users except requester with emails
      const allUsers = await User.findAll(
        { id: { op: "ne", value: requesterId }, email: { op: "notNull" } },
        { attributes: ["email", "name"] },
      );

      // Trigger broadcast (fire and forget)
      sendBroadcastEmail(allUsers, { title, description });
    }

    // Re-fetch user to get updated tokens
    const updatedUser = await User.findById(requesterId);

    res
      .status(201)
      .json({
        message: "Request posted successfully",
        request: newRequest,
        remainingTokens: updatedUser.tokens,
      });
  } catch (error) {
    console.error(error);
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
