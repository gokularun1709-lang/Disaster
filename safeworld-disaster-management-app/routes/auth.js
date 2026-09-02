const express = require("express");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const { readCollection, writeCollection } = require("../db");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are all required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const users = readCollection("users");
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const allowedRoles = ["citizen", "volunteer"]; // admin accounts are seeded, not self-registered
  const finalRole = allowedRoles.includes(role) ? role : "citizen";

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: nanoid(10),
    name,
    email,
    passwordHash,
    role: finalRole,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  writeCollection("users", users);

  const token = signToken(user);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const users = readCollection("users");
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
