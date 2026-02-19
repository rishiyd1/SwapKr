import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account credentials (gracefully handle missing file)
let sheets = null;
const credentialsPath = path.join(__dirname, "../credentials.json");

if (fs.existsSync(credentialsPath)) {
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
  const { client_email, private_key } = credentials;

  const auth = new google.auth.JWT({
    email: client_email,
    key: private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheets = google.sheets({ version: "v4", auth });
  console.log("✓ Google Sheets credentials loaded");
} else {
  console.warn("⚠ credentials.json not found — feedback endpoint disabled");
}

export const sendFeedback = async (req, res) => {
  try {
    if (!sheets) {
      return res.status(503).json({
        success: false,
        message: "Feedback service not configured (missing credentials.json)",
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