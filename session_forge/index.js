const express = require("express");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const { users } = require("./db");

const app = express();
const PORT = parseInt(process.env.PORT, 10);
const SERVER_SECRET = process.env.SERVER_SECRET || "super_secret_key_123";

app.use(express.json());
app.use(cookieParser());

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function createSessionToken(username) {
  const sessionId = Buffer.from(username).toString("base64");

  // Create signature
  const hmac = crypto.createHmac("sha256", SERVER_SECRET);
  hmac.update(sessionId);
  const signature = hmac.digest("hex");
  return `${sessionId}.${signature}`;
}

function verifySessionToken(token) {
  if (!token) return null;

  const [sessionId, signature] = token.split(".");

  // Verify signature
  const hmac = crypto.createHmac("sha256", SERVER_SECRET);
  hmac.update(sessionId);
  const expectedSignature = hmac.digest("hex");

  if (signature !== expectedSignature) return null;

  // Decode userId from sessionId
  const username = Buffer.from(sessionId, "base64").toString();
  return users[username];
}

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!users[username]) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Hash the provided password and compare with stored hash
  const hashedPassword = hashPassword(password);
  if (hashedPassword !== users[username].passwordHash) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const sessionToken = createSessionToken(username);
  res.cookie("session", sessionToken, { httpOnly: false });
  res.json({ message: "Logged in successfully" });
});

app.get("/profile", (req, res) => {
  const user = verifySessionToken(req.cookies.session);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({
    message: `Welcome ${user.name}!`,
    role: user.role,
    userData: {
      id: user.id,
      name: user.name,
      role: user.role,
      secretPhrase: user.secretPhrase,
    },
  });
});

app.get("/", (req, res) => {
  const htmlPath = path.join(__dirname, "index.html");
  fs.readFile(htmlPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading index.html:", err);
      return res.status(500).send("Error loading page");
    }
    res.send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
