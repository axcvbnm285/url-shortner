const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  alias: { type: String, default: null },
  password: { type: String, default: null }, // hashed
  tags: [{ type: String }],
  clicks: { type: Number, default: 0 },
  clickHistory: [
    {
      timestamp: { type: Date, default: Date.now },
      referrer: { type: String, default: "direct" },
      device: { type: String, default: "desktop" }, // mobile | tablet | desktop
    },
  ],
  expiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Url", urlSchema);
