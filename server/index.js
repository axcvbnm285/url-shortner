require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Url = require("./models/Url");
const urlRoutes = require("./routes/url");
const { detectDevice } = require("./routes/url");
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use("/api", urlRoutes);
app.use("/api/auth", authRoutes);

// Redirect handler
app.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });
    if (!url) return res.status(404).send("Short link not found.");

    if (url.expiresAt && new Date() > url.expiresAt)
      return res.status(410).send("This link has expired.");

    // Password-protected — redirect to unlock page on frontend
    if (url.password) {
      return res.redirect(`${process.env.FRONTEND_URL}/unlock/${url._id}`);
    }

    const device = detectDevice(req.headers["user-agent"]);
    url.clicks += 1;
    url.clickHistory.push({ referrer: req.headers.referer || "direct", device });
    await url.save();

    res.redirect(url.originalUrl);
  } catch {
    res.status(500).send("Redirect failed.");
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
