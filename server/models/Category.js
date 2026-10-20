const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { timestamps: true }
);

// Case-insensitive unique name per user
categorySchema.index(
  { user: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("Category", categorySchema);