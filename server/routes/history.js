const express = require("express");
const auth = require("../middleware/auth");
const History = require("../models/History");

const router = express.Router();
router.use(auth);

const MAX_HISTORY = 20;

// POST /api/history/search
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ message: "Query is required" });
    }

    // Same query pehle se hai to delete
    await History.deleteMany({
      user: req.userId,
      type: "search",
      query: query.trim(),
    });

    await History.create({
      user: req.userId,
      type: "search",
      query: query.trim(),
    });

    // Max 20 rakho
    const all = await History.find({ user: req.userId, type: "search" })
      .sort({ createdAt: -1 });
    if (all.length > MAX_HISTORY) {
      const toDelete = all.slice(MAX_HISTORY).map((h) => h._id);
      await History.deleteMany({ _id: { $in: toDelete } });
    }

    res.status(201).json({ message: "Search saved" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/history/view
router.post("/view", async (req, res) => {
  try {
    const { tmdbId, title, posterPath } = req.body;
    if (!tmdbId || !title) {
      return res.status(400).json({ message: "tmdbId and title are required" });
    }

    // Same movie pehle se hai to delete
    await History.deleteMany({
      user: req.userId,
      type: "view",
      tmdbId: Number(tmdbId),
    });

    await History.create({
      user: req.userId,
      type: "view",
      tmdbId: Number(tmdbId),
      title,
      posterPath: posterPath || null,
    });

    // Max 20
    const all = await History.find({ user: req.userId, type: "view" })
      .sort({ createdAt: -1 });
    if (all.length > MAX_HISTORY) {
      const toDelete = all.slice(MAX_HISTORY).map((h) => h._id);
      await History.deleteMany({ _id: { $in: toDelete } });
    }

    res.status(201).json({ message: "View saved" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/history?type=search|view&limit=
router.get("/", async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    const filter = { user: req.userId };
    if (type) filter.type = type;

    const history = await History.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/history?type=search|view
router.delete("/", async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { user: req.userId };
    if (type) filter.type = type;

    await History.deleteMany(filter);
    res.json({ message: "History cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;