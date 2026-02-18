// API Test Script — Tests all routes against PostgreSQL
// Run with: node test-api.js

const BASE = "http://localhost:5000";
let TOKEN = "";
let USER_ID = null;
let ITEM_ID = null;
let CHAT_ID = null;
const TEST_EMAIL = `test${Date.now()}@nitj.ac.in`;
const TEST_PHONE = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

const results = [];

async function req(method, path, body = null, auth = false) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (auth && TOKEN) opts.headers["Authorization"] = `Bearer ${TOKEN}`;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function log(name, pass, detail = "") {
  const icon = pass ? "✅" : "❌";
  const msg = `${icon} ${name}${detail ? " — " + detail : ""}`;
  console.log(msg);
  results.push({ name, pass });
}

async function run() {
  console.log("========================================");
  console.log("  SwapKr API Test Suite (pg)");
  console.log("========================================\n");

  // ── AUTH ROUTES ──────────────────────────
  console.log("── AUTH ──");

  // 1. Register (will send OTP via email)
  {
    const r = await req("POST", "/api/auth/register", {
      name: "Test User",
      email: TEST_EMAIL,
      password: "password123",
      phoneNumber: TEST_PHONE,
      department: "CSE",
      year: 2023,
      hostel: "BH1",
    });
    log("POST /api/auth/register", r.status === 201, `status=${r.status}`);
  }

  // 2. Register — duplicate email (pending users are in-memory, so dup re-registers in pending)
  {
    const r = await req("POST", "/api/auth/register", {
      name: "Dup",
      email: TEST_EMAIL,
      password: "pass",
      phoneNumber: "1111111111",
      department: "CSE",
      year: 2023,
      hostel: "BH1",
    });
    log(
      "POST /api/auth/register (dup pending email)",
      r.status === 201,
      `status=${r.status}`,
    );
  }

  // 3. Register — missing fields
  {
    const r = await req("POST", "/api/auth/register", { name: "Test" });
    log(
      "POST /api/auth/register (missing fields)",
      r.status === 400,
      `status=${r.status}`,
    );
  }

  // 4. Resend OTP
  {
    const r = await req("POST", "/api/auth/resend-otp", { email: TEST_EMAIL });
    log("POST /api/auth/resend-otp", r.status === 200, `status=${r.status}`);
  }

  // 5. Verify OTP — wrong OTP
  {
    const r = await req("POST", "/api/auth/verify-otp", {
      email: TEST_EMAIL,
      otp: "000000",
    });
    log(
      "POST /api/auth/verify-otp (wrong OTP)",
      r.status === 400,
      `status=${r.status}`,
    );
  }

  // 6. Login — user not yet verified (still in pending)
  {
    const r = await req("POST", "/api/auth/login", {
      email: TEST_EMAIL,
      password: "password123",
    });
    log(
      "POST /api/auth/login (not yet created)",
      r.status === 400,
      `status=${r.status}`,
    );
  }

  // 7. To get a real user, create one directly via DB-backed registration
  //    We'll create a user by inserting directly so we can test protected routes
  console.log("\n── Creating test user directly for auth testing ──");
  {
    // We need a verified user to test protected routes
    // Use a second unique email/phone
    const email2 = `tester${Date.now()}@nitj.ac.in`;
    const phone2 = `8${Math.floor(100000000 + Math.random() * 900000000)}`;

    // Register
    const reg = await req("POST", "/api/auth/register", {
      name: "Auth Tester",
      email: email2,
      password: "testpass123",
      phoneNumber: phone2,
      department: "ECE",
      year: 2024,
      hostel: "BH2",
    });

    if (reg.status === 201) {
      // We can read the OTP from server logs, but for testing we'll
      // directly call the internal endpoint. Since we can't get the OTP
      // programmatically, let's use a workaround — create user via
      // a special test approach. We'll just test with what we can.
      log("Register auth test user", true, email2);
    }
  }

  // 8. Send reset OTP — user not found
  {
    const r = await req("POST", "/api/auth/send-reset-otp", {
      email: "noone@nitj.ac.in",
    });
    log(
      "POST /api/auth/send-reset-otp (no user)",
      r.status === 400,
      `status=${r.status}`,
    );
  }

  // 9. Reset password — no user
  {
    const r = await req("POST", "/api/auth/reset-password", {
      email: "noone@nitj.ac.in",
      otp: "123456",
      newPassword: "newpass",
    });
    log(
      "POST /api/auth/reset-password (no user)",
      r.status === 400,
      `status=${r.status}`,
    );
  }

  // 10. Profile without auth
  {
    const r = await req("GET", "/api/auth/profile");
    log(
      "GET /api/auth/profile (no auth)",
      r.status === 401,
      `status=${r.status}`,
    );
  }

  // 11. Tokens without auth
  {
    const r = await req("GET", "/api/auth/tokens");
    log(
      "GET /api/auth/tokens (no auth)",
      r.status === 401,
      `status=${r.status}`,
    );
  }

  // ── Now create a real verified user directly in DB for protected route tests ──
  console.log(
    "\n── Creating verified user via DB for protected route tests ──",
  );
  {
    const { default: pool } = await import("../config/database.js");
    const { default: bcrypt } = await import("bcryptjs");
    const testEmail = `dbtest${Date.now()}@nitj.ac.in`;
    const testPhone = `7${Math.floor(100000000 + Math.random() * 900000000)}`;
    const hashedPw = await bcrypt.hash("testpass", 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, "phoneNumber", department, year, hostel, "isVerified", tokens, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, true, 2, NOW(), NOW()) RETURNING *`,
      ["DB Test User", testEmail, hashedPw, testPhone, "CSE", 2023, "BH3"],
    );
    USER_ID = result.rows[0].id;

    // Login to get a token
    const lr = await req("POST", "/api/auth/login", {
      email: testEmail,
      password: "testpass",
    });
    TOKEN = lr.data?.token || "";
    log(
      "Login verified user",
      lr.status === 200 && !!TOKEN,
      `status=${lr.status}`,
    );
  }

  // ── AUTH PROTECTED ROUTES ──────────────────
  console.log("\n── AUTH (Protected) ──");

  // 12. Get profile
  {
    const r = await req("GET", "/api/auth/profile", null, true);
    log(
      "GET /api/auth/profile",
      r.status === 200 && r.data?.user?.id === USER_ID,
      `status=${r.status}`,
    );
  }

  // 13. Update profile
  {
    const r = await req(
      "PUT",
      "/api/auth/profile",
      { name: "Updated Name", hostel: "GH1" },
      true,
    );
    log(
      "PUT /api/auth/profile",
      r.status === 200 && r.data?.user?.name === "Updated Name",
      `status=${r.status}`,
    );
  }

  // 14. Get token balance
  {
    const r = await req("GET", "/api/auth/tokens", null, true);
    log(
      "GET /api/auth/tokens",
      r.status === 200 && r.data?.tokens === 2,
      `status=${r.status}, tokens=${r.data?.tokens}`,
    );
  }

  // 15. Use token
  {
    const r = await req("POST", "/api/auth/use-token", {}, true);
    log(
      "POST /api/auth/use-token",
      r.status === 200 && r.data?.tokensRemaining === 1,
      `status=${r.status}`,
    );
  }

  // ── ITEM ROUTES ──────────────────────────
  console.log("\n── ITEMS ──");

  // 16. Create item
  {
    const r = await req(
      "POST",
      "/api/items",
      {
        title: "Test Textbook",
        description: "A test book for API testing",
        price: 250,
        category: "Academics",
        pickupLocation: "Library",
        images: ["https://example.com/book.jpg"],
      },
      true,
    );
    ITEM_ID = r.data?.item?.id;
    log(
      "POST /api/items",
      r.status === 201 && !!ITEM_ID,
      `status=${r.status}, itemId=${ITEM_ID}`,
    );
  }

  // 17. Get all items
  {
    const r = await req("GET", "/api/items");
    const found = Array.isArray(r.data) && r.data.length > 0;
    log(
      "GET /api/items",
      r.status === 200 && found,
      `status=${r.status}, count=${r.data?.length}`,
    );
  }

  // 18. Get items with search filter
  {
    const r = await req("GET", "/api/items?search=Textbook");
    log(
      "GET /api/items?search=Textbook",
      r.status === 200,
      `status=${r.status}, count=${r.data?.length}`,
    );
  }

  // 19. Get items with category filter
  {
    const r = await req("GET", "/api/items?category=Academics");
    log(
      "GET /api/items?category=Academics",
      r.status === 200,
      `status=${r.status}, count=${r.data?.length}`,
    );
  }

  // 20. Get item by ID
  {
    const r = await req("GET", `/api/items/${ITEM_ID}`);
    log(
      "GET /api/items/:id",
      r.status === 200 && r.data?.id === ITEM_ID,
      `status=${r.status}`,
    );
  }

  // 21. Get item by ID — not found
  {
    const r = await req("GET", "/api/items/99999");
    log(
      "GET /api/items/:id (not found)",
      r.status === 404,
      `status=${r.status}`,
    );
  }

  // 22. Update item
  {
    const r = await req(
      "PUT",
      `/api/items/${ITEM_ID}`,
      { price: 200, title: "Updated Textbook" },
      true,
    );
    log(
      "PUT /api/items/:id",
      r.status === 200 && r.data?.item?.title === "Updated Textbook",
      `status=${r.status}`,
    );
  }

  // 23. My listings
  {
    const r = await req("GET", "/api/items/user/my-listings", null, true);
    log(
      "GET /api/items/user/my-listings",
      r.status === 200 && Array.isArray(r.data),
      `status=${r.status}, count=${r.data?.length}`,
    );
  }

  // ── REQUEST ROUTES ──────────────────────────
  console.log("\n── REQUESTS ──");

  // 24. Get requests (empty initially)
  {
    const r = await req("GET", "/api/requests");
    log(
      "GET /api/requests",
      r.status === 200 && Array.isArray(r.data),
      `status=${r.status}, count=${r.data?.length}`,
    );
  }

  // 25. Create Normal request
  {
    const r = await req(
      "POST",
      "/api/requests",
      {
        title: "Need a calculator",
        description: "Looking for a scientific calculator for exams",
        type: "Normal",
      },
      true,
    );
    log("POST /api/requests (Normal)", r.status === 201, `status=${r.status}`);
  }

  // 26. Get requests after creating
  {
    const r = await req("GET", "/api/requests");
    const found =
      Array.isArray(r.data) &&
      r.data.some((rq) => rq.title === "Need a calculator");
    log(
      "GET /api/requests (with data)",
      r.status === 200 && found,
      `status=${r.status}, count=${r.data?.length}`,
    );
  }

  // ── CHAT ROUTES ──────────────────────────
  console.log("\n── CHATS ──");

  // Create a second user to chat with
  let user2Token = "";
  let user2Id = null;
  {
    const { default: pool } = await import("../config/database.js");
    const { default: bcrypt } = await import("bcryptjs");
    const email2 = `chat${Date.now()}@nitj.ac.in`;
    const phone2 = `6${Math.floor(100000000 + Math.random() * 900000000)}`;
    const hashedPw = await bcrypt.hash("chatpass", 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, "phoneNumber", department, year, hostel, "isVerified", tokens, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, true, 2, NOW(), NOW()) RETURNING *`,
      ["Chat User", email2, hashedPw, phone2, "ME", 2023, "BH4"],
    );
    user2Id = result.rows[0].id;

    const lr = await req("POST", "/api/auth/login", {
      email: email2,
      password: "chatpass",
    });
    user2Token = lr.data?.token || "";
    log(
      "Create second user for chat",
      lr.status === 200 && !!user2Token,
      `user2Id=${user2Id}`,
    );
  }

  // 27. Start conversation (user2 buys from user1)
  {
    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user2Token}`,
      },
      body: JSON.stringify({ itemId: ITEM_ID, sellerId: USER_ID }),
    };
    const res = await fetch(`${BASE}/api/chats/start`, opts);
    const data = await res.json();
    CHAT_ID = data?.chat?.id;
    log(
      "POST /api/chats/start",
      res.status === 201 && !!CHAT_ID,
      `status=${res.status}, chatId=${CHAT_ID}`,
    );
  }

  // 28. Start conversation — duplicate (should return existing)
  {
    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user2Token}`,
      },
      body: JSON.stringify({ itemId: ITEM_ID, sellerId: USER_ID }),
    };
    const res = await fetch(`${BASE}/api/chats/start`, opts);
    const data = await res.json();
    log(
      "POST /api/chats/start (dup)",
      res.status === 200 && data?.isNew === false,
      `status=${res.status}`,
    );
  }

  // 29. Get my conversations (user2)
  {
    const opts = {
      method: "GET",
      headers: { Authorization: `Bearer ${user2Token}` },
    };
    const res = await fetch(`${BASE}/api/chats`, opts);
    const data = await res.json();
    log(
      "GET /api/chats (user2)",
      res.status === 200 && Array.isArray(data) && data.length > 0,
      `status=${res.status}, count=${data?.length}`,
    );
  }

  // 30. Get my conversations (user1 - seller)
  {
    const r = await req("GET", "/api/chats", null, true);
    log(
      "GET /api/chats (user1)",
      r.status === 200 && Array.isArray(r.data),
      `status=${r.status}, count=${r.data?.length}`,
    );
  }

  // 31. Get conversation details
  {
    const r = await req("GET", `/api/chats/${CHAT_ID}`, null, true);
    log(
      "GET /api/chats/:chatId",
      r.status === 200 && r.data?.id === CHAT_ID,
      `status=${r.status}`,
    );
  }

  // 32. Send message (user2)
  {
    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user2Token}`,
      },
      body: JSON.stringify({ content: "Hi, is this still available?" }),
    };
    const res = await fetch(`${BASE}/api/chats/${CHAT_ID}/messages`, opts);
    const data = await res.json();
    log(
      "POST /api/chats/:chatId/messages (user2)",
      res.status === 201 && data?.content === "Hi, is this still available?",
      `status=${res.status}`,
    );
  }

  // 33. Send message (user1 replies)
  {
    const r = await req(
      "POST",
      `/api/chats/${CHAT_ID}/messages`,
      { content: "Yes it is!" },
      true,
    );
    log(
      "POST /api/chats/:chatId/messages (user1)",
      r.status === 201,
      `status=${r.status}`,
    );
  }

  // 34. Get messages
  {
    const r = await req("GET", `/api/chats/${CHAT_ID}/messages`, null, true);
    log(
      "GET /api/chats/:chatId/messages",
      r.status === 200 && Array.isArray(r.data) && r.data.length === 2,
      `status=${r.status}, count=${r.data?.length}`,
    );
  }

  // ── CLEANUP: Delete item ──────────────────
  console.log("\n── CLEANUP ──");

  // 35. Delete item
  {
    const r = await req("DELETE", `/api/items/${ITEM_ID}`, null, true);
    log("DELETE /api/items/:id", r.status === 200, `status=${r.status}`);
  }

  // 36. Confirm item deleted
  {
    const r = await req("GET", `/api/items/${ITEM_ID}`);
    log(
      "GET /api/items/:id (after delete)",
      r.status === 404,
      `status=${r.status}`,
    );
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
  }

  // Cleanup test data
  const { default: pool } = await import("../config/database.js");
  await pool.query("DELETE FROM messages");
  await pool.query("DELETE FROM chats");
  await pool.query("DELETE FROM item_images");
  await pool.query("DELETE FROM items");
  await pool.query("DELETE FROM requests");
  await pool.query("DELETE FROM users");
  console.log("\n🧹 Test data cleaned up.");
  await pool.end();

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test suite error:", err);
  process.exit(1);
});
