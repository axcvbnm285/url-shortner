const express = require("express");
const router = express.Router();
const validUrl = require("valid-url");
const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");
const Url = require("../models/Url");
const auth = require("../middleware/auth");

function detectDevice(ua = "") {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return "mobile";
  return "desktop";
}

// POST /api/shorten
router.post("/shorten", auth, async (req, res) => {
  const { originalUrl, alias, expiryDays, password, tags } = req.body;

  if (!validUrl.isUri(originalUrl))
    return res.status(400).json({ error: "Please enter a valid URL." });

  try {
    if (alias) {
      const taken = await Url.findOne({ shortCode: alias });
      if (taken) return res.status(409).json({ error: "That alias is already taken. Try another one." });
    }

    const shortCode = alias || nanoid(6);
    const expiresAt = expiryDays ? new Date(Date.now() + expiryDays * 86400000) : null;
    const hashed = password ? await bcrypt.hash(password, 10) : null;

    const url = await Url.create({
      user: req.user.id,
      originalUrl,
      shortCode,
      alias: alias || null,
      expiresAt,
      password: hashed,
      tags: tags || [],
    });
    res.status(201).json(url);
  } catch {
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// POST /api/bulk-shorten
router.post("/bulk-shorten", auth, async (req, res) => {
  const { urls } = req.body; // array of strings
  if (!Array.isArray(urls) || urls.length === 0)
    return res.status(400).json({ error: "Provide an array of URLs." });
  if (urls.length > 20)
    return res.status(400).json({ error: "Max 20 URLs at a time." });

  const results = await Promise.all(
    urls.map(async (originalUrl) => {
      if (!validUrl.isUri(originalUrl)) return { originalUrl, error: "Invalid URL" };
      try {
        const shortCode = nanoid(6);
        const doc = await Url.create({ user: req.user.id, originalUrl, shortCode });
        return { originalUrl, shortCode, _id: doc._id };
      } catch {
        return { originalUrl, error: "Failed" };
      }
    })
  );
  res.status(201).json(results);
});

// GET /api/urls
router.get("/urls", auth, async (req, res) => {
  try {
    const { tag, search } = req.query;
    const filter = { user: req.user.id };
    if (tag) filter.tags = tag;
    if (search) filter.$or = [
      { originalUrl: { $regex: search, $options: "i" } },
      { shortCode: { $regex: search, $options: "i" } },
    ];
    const urls = await Url.find(filter).sort({ createdAt: -1 }).select("-clickHistory");
    res.json(urls);
  } catch {
    res.status(500).json({ error: "Could not fetch URLs." });
  }
});

// GET /api/urls/:id/stats
router.get("/urls/:id/stats", auth, async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user.id });
    if (!url) return res.status(404).json({ error: "URL not found." });
    res.json(url);
  } catch {
    res.status(500).json({ error: "Could not fetch stats." });
  }
});

// DELETE /api/urls/:id
router.delete("/urls/:id", auth, async (req, res) => {
  try {
    await Url.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: "Deleted successfully." });
  } catch {
    res.status(500).json({ error: "Could not delete URL." });
  }
});

// POST /api/urls/:id/verify-password (for password-protected links)
router.post("/urls/:id/verify-password", async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ error: "Not found." });
    const match = await bcrypt.compare(req.body.password || "", url.password);
    if (!match) return res.status(401).json({ error: "Wrong password." });
    res.json({ originalUrl: url.originalUrl });
  } catch {
    res.status(500).json({ error: "Verification failed." });
  }
});

module.exports = router;
module.exports.detectDevice = detectDevice;
