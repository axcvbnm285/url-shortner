const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password are required." });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });

  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ error: "Username already taken." });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed });
    res.status(201).json({ token: signToken(user), username: user.username });
  } catch {
    res.status(500).json({ error: "Registration failed." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password are required." });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid username or password." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid username or password." });

    res.json({ token: signToken(user), username: user.username });
  } catch {
    res.status(500).json({ error: "Login failed." });
  }
});

module.exports = router;
