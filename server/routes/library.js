const express = require("express");
const auth = require("../middleware/auth");
const UserMovie = require("../models/UserMovie");
const Category = require("../models/Category");

const router = express.Router();
router.use(auth);

// Helper: default state
const defaultState = {
  isFavorite: false,
  isWatchlist: false,
  isWatched: false,
  personalRating: null,
  review: "",
  categories: [],
};

// GET /api/library?list=favorites|watchlist|watched&category=&sort=
router.get("/", async (req, res) => {
  try {
    const { list, category, sort = "recent" } = req.query;
    const filter = { user: req.userId };

    if (list === "favorites") filter.isFavorite = true;
    else if (list === "watchlist") filter.isWatchlist = true;
    else if (list === "watched") filter.isWatched = true;

    if (category) filter.categories = category;

    let sortObj = { updatedAt: -1 };
    if (sort === "rating") sortObj = { personalRating: -1 };
    if (sort === "year") sortObj = { releaseYear: -1 };

    const movies = await UserMovie.find(filter)
      .populate("categories", "name")
      .sort(sortObj);

    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/library/:tmdbId
router.get("/:tmdbId", async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId);
    if (isNaN(tmdbId)) return res.status(400).json({ message: "Invalid tmdbId" });

    const movie = await UserMovie.findOne({ user: req.userId, tmdbId })
      .populate("categories", "name");

    if (!movie) return res.json({ tmdbId, ...defaultState });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/library/:tmdbId  (upsert)
router.put("/:tmdbId", async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId);
    if (isNaN(tmdbId)) return res.status(400).json({ message: "Invalid tmdbId" });

    const {
      isFavorite, isWatchlist, isWatched,
      personalRating, review, categories,
      title, posterPath, releaseYear, genres
    } = req.body;

    // Validation
    if (personalRating !== undefined && personalRating !== null) {
      if (personalRating < 1 || personalRating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
    }
    if (review && review.length > 2000) {
      return res.status(400).json({ message: "Review too long (max 2000)" });
    }

    // Categories ownership check
    if (categories && categories.length > 0) {
      const valid = await Category.find({
        _id: { $in: categories },
        user: req.userId,
      });
      if (valid.length !== categories.length) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    let movie = await UserMovie.findOne({ user: req.userId, tmdbId });

    if (!movie) {
      // Pehli baar save → snapshot zaroori
      if (!title) {
        return res.status(400).json({ message: "title is required for first save" });
      }
      movie = new UserMovie({
        user: req.userId,
        tmdbId,
        title,
        posterPath: posterPath || null,
        releaseYear: releaseYear || null,
        genres: genres || [],
      });
    }

    // Update only provided fields
    if (isFavorite !== undefined) movie.isFavorite = isFavorite;
    if (isWatchlist !== undefined) movie.isWatchlist = isWatchlist;
    if (isWatched !== undefined) {
      movie.isWatched = isWatched;
      movie.watchedAt = isWatched ? new Date() : null;
    }
    if (personalRating !== undefined) movie.personalRating = personalRating;
    if (review !== undefined) movie.review = review;
    if (categories !== undefined) movie.categories = categories;

    // Snapshot update (optional)
    if (title) movie.title = title;
    if (posterPath !== undefined) movie.posterPath = posterPath;
    if (releaseYear !== undefined) movie.releaseYear = releaseYear;
    if (genres) movie.genres = genres;

    await movie.save();
    await movie.populate("categories", "name");
    res.json(movie);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Already exists" });
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/library/:tmdbId
router.delete("/:tmdbId", async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId);
    if (isNaN(tmdbId)) return res.status(400).json({ message: "Invalid tmdbId" });

    await UserMovie.findOneAndDelete({ user: req.userId, tmdbId });
    res.json({ message: "Removed from your library" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;