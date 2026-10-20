const express = require("express");
const auth = require("../middleware/auth");
const UserMovie = require("../models/UserMovie");

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const userId = req.userId;

    const [totalWatched, totalFavorites, totalWatchlist, ratedMovies] = await Promise.all([
      UserMovie.countDocuments({ user: userId, isWatched: true }),
      UserMovie.countDocuments({ user: userId, isFavorite: true }),
      UserMovie.countDocuments({ user: userId, isWatchlist: true }),
      UserMovie.find({ user: userId, personalRating: { $ne: null } }),
    ]);

    // Average personal rating
    let averagePersonalRating = 0;
    if (ratedMovies.length > 0) {
      const sum = ratedMovies.reduce((acc, m) => acc + m.personalRating, 0);
      averagePersonalRating = Math.round((sum / ratedMovies.length) * 10) / 10;
    }

    // Genre breakdown (only watched)
    const watched = await UserMovie.find({ user: userId, isWatched: true });
    const genreMap = {};
    watched.forEach((m) => {
      (m.genres || []).forEach((g) => {
        genreMap[g] = (genreMap[g] || 0) + 1;
      });
    });
    const genreBreakdown = Object.entries(genreMap)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);

    // Rating distribution (1-5)
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratedMovies.forEach((m) => {
      if (m.personalRating >= 1 && m.personalRating <= 5) {
        ratingDistribution[m.personalRating]++;
      }
    });

    // Top rated (highest personal rating)
    const topRated = await UserMovie.find({
      user: userId,
      personalRating: { $ne: null },
    })
      .sort({ personalRating: -1, updatedAt: -1 })
      .limit(5)
      .select("tmdbId title posterPath personalRating releaseYear");

    // Watched by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentWatched = await UserMovie.find({
      user: userId,
      isWatched: true,
      watchedAt: { $gte: sixMonthsAgo },
    });

    const monthMap = {};
    recentWatched.forEach((m) => {
      if (!m.watchedAt) return;
      const key = `${m.watchedAt.getFullYear()}-${String(m.watchedAt.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const watchedByMonth = Object.entries(monthMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      totalWatched,
      totalFavorites,
      totalWatchlist,
      averagePersonalRating,
      genreBreakdown,
      ratingDistribution,
      topRated,
      watchedByMonth,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;