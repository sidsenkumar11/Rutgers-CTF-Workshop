const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());

const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;
const FLAG = process.env.FLAG;
const PORT = parseInt(process.env.PORT, 10)

app.get("/public-key", (req, res) => {
  res.send(publicKey);
});

app.post("/login", (req, res) => {
  const { username } = req.body;
  if (username === undefined) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ username: username, role: "user" }, privateKey, {
    algorithm: "RS256",
  });
  res.json({ token });
});

app.get("/admin", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256", "HS256"],
    });
    if (decoded.role === "admin") {
      res.json({
        message: `Welcome admin! Here's your flag: ${FLAG}`,
      });
    } else {
      res.json({ message: "Access denied. Admin role required." });
    }
  } catch (err) {
    res.status(401).json({ error: "Invalid token", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
