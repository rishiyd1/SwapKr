import { google } from "googleapis";

// Load service account credentials exclusively from environment variables
let sheets = null;

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;

if (clientEmail && privateKey) {
  // Ensure newlines in private key are correctly parsed from env vars
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: formattedPrivateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheets = google.sheets({ version: "v4", auth });
  console.log("✓ Google Sheets credentials loaded from environment variables");
} else {
  console.warn(
    "⚠ GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY not found in environment — feedback endpoint disabled",
  );
}

export const sendFeedback = async (req, res) => {
  try {
    if (!sheets) {
      return res.status(503).json({
        success: false,
        message:
          "Feedback service not configured (missing environment variables)",
      });
    }

    const { name, email, feedback } = req.body;

    if (!name || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Name & feedback required",
      });
    }

    const SPREADSHEET_ID = "1xQbUXH0D038w1hKwa5GL01Y1NUDdvxcsoft9xotkef0";
    const RANGE = "Sheet1!A:D";

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[new Date().toLocaleString(), name, email || "", feedback]],
      },
    });

    res.json({ success: true, message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("❌ Error sending feedback:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Check console for details.",
    });
  }
};
