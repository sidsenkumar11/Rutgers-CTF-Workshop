const crypto = require("crypto");
const base32 = require("hi-base32");

// Mock database
const users = {
  admin: {
    password: "password123",
    totpSecret: base32.encode(crypto.randomBytes(20)),
  },
};

module.exports = { users };
