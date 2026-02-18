// Database Model Test — Tests every query-helper method directly
// Run with: node test_models.js

import pool from "../config/database.js";
import User from "../models/User.js";
import Item from "../models/Item.js";
import ItemImage from "../models/ItemImage.js";
import Request from "../models/Request.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

const results = [];

function log(name, pass, detail = "") {
  const icon = pass ? "✅" : "❌";
  console.log(`${icon} ${name}${detail ? " — " + detail : ""}`);
  results.push({ name, pass });
}

async function run() {
  console.log("========================================");
  console.log("  Database Model Tests (pg)");
  console.log("========================================\n");

  let userId1, userId2, itemId, imageId, requestId, chatId, messageId;

  // ── USER MODEL ──────────────────────────
  console.log("── USER ──");

  // User.create
  {
    const user = await User.create({
      name: "Alice",
      email: "alice@nitj.ac.in",
      password: "hashed_pw",
      phoneNumber: "9000000001",
      department: "CSE",
      year: 2023,
      hostel: "GH1",
      isVerified: true,
      tokens: 2,
    });
    userId1 = user.id;
    log(
      "User.create",
      user &&
        user.id &&
        user.name === "Alice" &&
        user.email === "alice@nitj.ac.in",
      `id=${user.id}`,
    );
  }

  // User.create (second user)
  {
    const user = await User.create({
      name: "Bob",
      email: "bob@nitj.ac.in",
      password: "hashed_pw2",
      phoneNumber: "9000000002",
      department: "ECE",
      year: 2024,
      hostel: "BH1",
      isVerified: true,
      tokens: 2,
    });
    userId2 = user.id;
    log(
      "User.create (second)",
      user && user.id && user.name === "Bob",
      `id=${user.id}`,
    );
  }

  // User.findById
  {
    const user = await User.findById(userId1);
    log("User.findById", user && user.id === userId1 && user.name === "Alice");
  }

  // User.findById with exclude
  {
    const user = await User.findById(userId1, { exclude: ["password", "otp"] });
    log(
      "User.findById (exclude)",
      user && !user.password && !user.otp && user.name === "Alice",
    );
  }

  // User.findById with attributes
  {
    const user = await User.findById(userId1, {
      attributes: ["id", "name", "tokens"],
    });
    log(
      "User.findById (attributes)",
      user &&
        user.id === userId1 &&
        user.name === "Alice" &&
        user.tokens === 2 &&
        !user.email,
    );
  }

  // User.findById — not found
  {
    const user = await User.findById(99999);
    log("User.findById (not found)", user === null);
  }

  // User.findByEmail
  {
    const user = await User.findByEmail("alice@nitj.ac.in");
    log("User.findByEmail", user && user.id === userId1);
  }

  // User.findByEmail — not found
  {
    const user = await User.findByEmail("nobody@nitj.ac.in");
    log("User.findByEmail (not found)", user === null);
  }

  // User.findByPhone
  {
    const user = await User.findByPhone("9000000001");
    log("User.findByPhone", user && user.id === userId1);
  }

  // User.update
  {
    const user = await User.update(userId1, {
      name: "Alice Updated",
      hostel: "GH2",
    });
    log(
      "User.update",
      user && user.name === "Alice Updated" && user.hostel === "GH2",
    );
  }

  // User.update — OTP fields (camelCase columns)
  {
    const user = await User.update(userId1, {
      resetOtp: "123456",
      resetOtpExpiresAt: new Date(),
    });
    log("User.update (camelCase fields)", user && user.resetOtp === "123456");
  }

  // User.update — clear OTP
  {
    const user = await User.update(userId1, {
      resetOtp: null,
      resetOtpExpiresAt: null,
    });
    log("User.update (clear OTP)", user && user.resetOtp === null);
  }

  // User.updateAll
  {
    await User.updateAll({ tokens: 5 });
    const u1 = await User.findById(userId1);
    const u2 = await User.findById(userId2);
    log("User.updateAll", u1.tokens === 5 && u2.tokens === 5);
    // Reset tokens back
    await User.updateAll({ tokens: 2 });
  }

  // User.findAll
  {
    const users = await User.findAll();
    log("User.findAll", Array.isArray(users) && users.length >= 2);
  }

  // User.findAll with attributes
  {
    const users = await User.findAll({}, { attributes: ["email", "name"] });
    log(
      "User.findAll (attributes)",
      users.length >= 2 &&
        users[0].email &&
        users[0].name &&
        !users[0].password,
    );
  }

  // User.findAll with where (ne operator)
  {
    const users = await User.findAll({ id: { op: "ne", value: userId1 } });
    log(
      "User.findAll (ne)",
      users.length >= 1 && users.every((u) => u.id !== userId1),
    );
  }

  // ── ITEM MODEL ──────────────────────────
  console.log("\n── ITEM ──");

  // Item.create
  {
    const item = await Item.create({
      title: "Test Laptop",
      description: "A used laptop",
      price: 15000,
      category: "Equipments",
      pickupLocation: "Main Gate",
      sellerId: userId1,
      status: "Available",
    });
    itemId = item.id;
    log(
      "Item.create",
      item && item.id && item.title === "Test Laptop" && item.price == 15000,
      `id=${item.id}`,
    );
  }

  // Item.findById
  {
    const item = await Item.findById(itemId);
    log(
      "Item.findById",
      item && item.id === itemId && item.title === "Test Laptop",
    );
  }

  // Item.findById — not found
  {
    const item = await Item.findById(99999);
    log("Item.findById (not found)", item === null);
  }

  // Item.findByIdWithDetails (JOIN with seller + images)
  {
    const item = await Item.findByIdWithDetails(itemId);
    log(
      "Item.findByIdWithDetails",
      item &&
        item.id === itemId &&
        item.seller &&
        item.seller.id === userId1 &&
        Array.isArray(item.images),
    );
  }

  // Item.findByIdWithImages
  {
    const item = await Item.findByIdWithImages(itemId);
    log(
      "Item.findByIdWithImages",
      item && item.id === itemId && Array.isArray(item.images),
    );
  }

  // Item.findAll (default filter: Available)
  {
    const items = await Item.findAll();
    log(
      "Item.findAll",
      Array.isArray(items) && items.length >= 1 && items[0].seller,
    );
  }

  // Item.findAll with search
  {
    const items = await Item.findAll({ search: "Laptop" });
    log(
      "Item.findAll (search)",
      items.length >= 1 && items[0].title.includes("Laptop"),
    );
  }

  // Item.findAll with category
  {
    const items = await Item.findAll({ where: { category: "Equipments" } });
    log("Item.findAll (category)", items.length >= 1);
  }

  // Item.findAll with price range
  {
    const items = await Item.findAll({ minPrice: 10000, maxPrice: 20000 });
    log("Item.findAll (price range)", items.length >= 1);
  }

  // Item.findAll with seller filter
  {
    const items = await Item.findAll({ where: { sellerId: userId1 } });
    log(
      "Item.findAll (sellerId)",
      items.length >= 1 && items.every((i) => i.sellerId === userId1),
    );
  }

  // Item.findMyListings
  {
    const items = await Item.findMyListings(userId1);
    log(
      "Item.findMyListings",
      Array.isArray(items) &&
        items.length >= 1 &&
        Array.isArray(items[0].images),
    );
  }

  // Item.update
  {
    const item = await Item.update(itemId, {
      title: "Updated Laptop",
      price: 12000,
    });
    log(
      "Item.update",
      item && item.title === "Updated Laptop" && item.price == 12000,
    );
  }

  // ── ITEM IMAGE MODEL ──────────────────────────
  console.log("\n── ITEM IMAGE ──");

  // ItemImage.create
  {
    const img = await ItemImage.create({
      itemId,
      imageUrl: "https://example.com/img1.jpg",
    });
    imageId = img.id;
    log(
      "ItemImage.create",
      img && img.id && img.imageUrl === "https://example.com/img1.jpg",
      `id=${img.id}`,
    );
  }

  // ItemImage.create (second)
  {
    const img = await ItemImage.create({
      itemId,
      imageUrl: "https://example.com/img2.jpg",
    });
    log("ItemImage.create (second)", img && img.id);
  }

  // Verify images appear in Item.findByIdWithImages
  {
    const item = await Item.findByIdWithImages(itemId);
    log("Images in findByIdWithImages", item && item.images.length === 2);
  }

  // ItemImage.destroyByItemId
  {
    await ItemImage.destroyByItemId(itemId);
    const item = await Item.findByIdWithImages(itemId);
    log("ItemImage.destroyByItemId", item && item.images.length === 0);
  }

  // ── REQUEST MODEL ──────────────────────────
  console.log("\n── REQUEST ──");

  // Request.create (Normal)
  {
    const r = await Request.create({
      title: "Need a charger",
      description: "USB-C charger needed urgently",
      type: "Normal",
      tokenCost: 0,
      requesterId: userId1,
      status: "Open",
    });
    requestId = r.id;
    log(
      "Request.create (Normal)",
      r && r.id && r.title === "Need a charger" && r.type === "Normal",
      `id=${r.id}`,
    );
  }

  // Request.create (Urgent)
  {
    const r = await Request.create({
      title: "Need notes",
      description: "DSA notes for exam tomorrow",
      type: "Urgent",
      tokenCost: 1,
      requesterId: userId2,
      status: "Open",
    });
    log(
      "Request.create (Urgent)",
      r && r.type === "Urgent" && r.tokenCost === 1,
    );
  }

  // Request.findAllOpen (should return both, Urgent first)
  {
    const reqs = await Request.findAllOpen();
    const pass =
      reqs.length === 2 &&
      reqs[0].type === "Urgent" &&
      reqs[0].requester &&
      reqs[0].requester.id == userId2;
    if (!pass) {
      console.log(
        "   DEBUG findAllOpen:",
        JSON.stringify(
          reqs.map((r) => ({ type: r.type, requester: r.requester })),
          null,
          2,
        ),
      );
    }
    log("Request.findAllOpen", pass);
  }

  // ── CHAT MODEL ──────────────────────────
  console.log("\n── CHAT ──");

  // Chat.create
  {
    const chat = await Chat.create({
      buyerId: userId2,
      sellerId: userId1,
      itemId,
      lastMessageAt: new Date(),
    });
    chatId = chat.id;
    log(
      "Chat.create",
      chat && chat.id && chat.buyerId === userId2 && chat.sellerId === userId1,
      `id=${chat.id}`,
    );
  }

  // Chat.findById
  {
    const chat = await Chat.findById(chatId);
    log(
      "Chat.findById",
      chat && chat.id === chatId && chat.buyerId === userId2,
    );
  }

  // Chat.findById — not found
  {
    const chat = await Chat.findById(99999);
    log("Chat.findById (not found)", chat === null);
  }

  // Chat.findOne
  {
    const chat = await Chat.findOne({
      buyerId: userId2,
      sellerId: userId1,
      itemId,
    });
    log("Chat.findOne", chat && chat.id === chatId);
  }

  // Chat.findOne — not found
  {
    const chat = await Chat.findOne({
      buyerId: 99999,
      sellerId: 99998,
      itemId: 99997,
    });
    log("Chat.findOne (not found)", chat === null);
  }

  // Chat.findByIdWithDetails (JOIN buyer, seller, item)
  {
    const chat = await Chat.findByIdWithDetails(chatId);
    log(
      "Chat.findByIdWithDetails",
      chat &&
        chat.buyer &&
        chat.buyer.id === userId2 &&
        chat.seller &&
        chat.seller.id === userId1 &&
        chat.item &&
        chat.item.id === itemId,
    );
  }

  // Chat.findAllForUser (buyer)
  {
    const chats = await Chat.findAllForUser(userId2);
    log(
      "Chat.findAllForUser (buyer)",
      chats.length >= 1 && chats[0].buyer && chats[0].seller && chats[0].item,
    );
  }

  // Chat.findAllForUser (seller)
  {
    const chats = await Chat.findAllForUser(userId1);
    log("Chat.findAllForUser (seller)", chats.length >= 1);
  }

  // Chat.update
  {
    const chat = await Chat.update(chatId, {
      lastMessageAt: new Date(),
      status: "Inactive",
    });
    log("Chat.update", chat && chat.status === "Inactive");
    // Reset
    await Chat.update(chatId, { status: "Active" });
  }

  // ── MESSAGE MODEL ──────────────────────────
  console.log("\n── MESSAGE ──");

  // Message.create
  {
    const msg = await Message.create({
      chatId,
      itemId,
      senderId: userId2,
      content: "Hello, is this available?",
    });
    messageId = msg.id;
    log(
      "Message.create",
      msg &&
        msg.id &&
        msg.content === "Hello, is this available?" &&
        msg.isRead === false,
      `id=${msg.id}`,
    );
  }

  // Message.create (reply)
  {
    const msg = await Message.create({
      chatId,
      itemId,
      senderId: userId1,
      content: "Yes it is!",
    });
    log("Message.create (reply)", msg && msg.senderId === userId1);
  }

  // Message.findById
  {
    const msg = await Message.findById(messageId);
    log(
      "Message.findById",
      msg &&
        msg.id === messageId &&
        msg.content === "Hello, is this available?",
    );
  }

  // Message.findById — not found
  {
    const msg = await Message.findById(99999);
    log("Message.findById (not found)", msg === null);
  }

  // Message.findByIdWithSender (JOIN user)
  {
    const msg = await Message.findByIdWithSender(messageId);
    log(
      "Message.findByIdWithSender",
      msg &&
        msg.sender &&
        msg.sender.id === userId2 &&
        msg.sender.name === "Bob",
    );
  }

  // Message.findAllByChat
  {
    const msgs = await Message.findAllByChat(chatId);
    log(
      "Message.findAllByChat",
      msgs.length === 2 &&
        msgs[0].sender &&
        msgs[0].createdAt <= msgs[1].createdAt,
    );
  }

  // Message.markAsRead (mark messages NOT from userId1 as read)
  {
    await Message.markAsRead(chatId, userId1);
    const msg = await Message.findById(messageId);
    log("Message.markAsRead", msg && msg.isRead === true);
  }

  // ── ITEM DESTROY (cascade test) ──────────────────
  console.log("\n── CASCADE / DESTROY ──");

  // Item.destroy
  {
    await Item.destroy(itemId);
    const item = await Item.findById(itemId);
    log("Item.destroy", item === null);
  }

  // ── SUMMARY ──────────────────────────
  console.log("\n========================================");
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(
    `  Results: ${passed} passed, ${failed} failed, ${results.length} total`,
  );
  console.log("========================================\n");

  if (failed > 0) {
    console.log("Failed tests:");
    results
      .filter((r) => !r.pass)
      .forEach((r) => console.log(`  ❌ ${r.name}`));
    console.log("");
  }

  // Cleanup
  await pool.query("DELETE FROM messages");
  await pool.query("DELETE FROM chats");
  await pool.query("DELETE FROM item_images");
  await pool.query("DELETE FROM items");
  await pool.query("DELETE FROM requests");
  await pool.query("DELETE FROM users");
  console.log("🧹 Test data cleaned up.");
  await pool.end();

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test suite error:", err);
  process.exit(1);
});
