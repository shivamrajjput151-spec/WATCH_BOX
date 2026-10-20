const mongoose = require("mongoose");

const userMovieSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tmdbId: { type: Number, required: true },
    title: { type: String, required: true },
    posterPath: { type: String, default: null },
    releaseYear: { type: Number, default: null },
    genres: [{ type: String }],
    isFavorite: { type: Boolean, default: false },
    isWatchlist: { type: Boolean, default: false },
    isWatched: { type: Boolean, default: false },
    watchedAt: { type: Date, default: null },
    personalRating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, maxlength: 2000, default: "" },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  },
  { timestamps: true }
);

// Ek user ke liye ek movie ek hi baar
userMovieSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model("UserMovie", userMovieSchema);