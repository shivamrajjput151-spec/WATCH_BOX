const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["search", "view"], required: true },
    query: { type: String, default: null },          // search ke liye
    tmdbId: { type: Number, default: null },         // view ke liye
    title: { type: String, default: null },
    posterPath: { type: String, default: null },
  },
  { timestamps: true }
);

historySchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model("History", historySchema);