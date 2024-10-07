// Mock user database. Passwords are:
// alice:password123
// bob:password456
// admin:<redacted>
const users = {
  alice: {
    id: 1,
    name: "Alice",
    role: "user",
    passwordHash:
      "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
    secretPhrase: "encyclacious",
  },
  bob: {
    id: 2,
    name: "Bob",
    role: "user",
    passwordHash:
      "c6ba91b90d922e159893f46c387e5dc1b3dc5c101a5a4522f03b987177a24a91",
    secretPhrase: "lazuziasm",
  },
  admin: {
    id: 999,
    name: "Admin",
    role: "admin",
    passwordHash:
      "3d91b58504a6cc3a159005ee7b16c7ae503ca6ac2a6a3c893837083c236b864a",
    secretPhrase: process.env.FLAG,
  },
};

module.exports = { users };
