const express = require("express");
const auth = require("../middleware/auth");
const Category = require("../models/Category");
const UserMovie = require("../models/UserMovie");

const router = express.Router();
router.use(auth);

// GET /api/categories (with movie count)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ user: req.userId }).sort({ name: 1 });

    const withCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await UserMovie.countDocuments({
          user: req.userId,
          categories: cat._id,
        });
        return { ...cat.toObject(), movieCount: count };
      })
    );

    res.json(withCount);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/categories
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (name.length > 40) {
      return res.status(400).json({ message: "Name too long (max 40)" });
    }

    const category = await Category.create({
      user: req.userId,
      name: name.trim(),
    });
    res.status(201).json({ ...category.toObject(), movieCount: 0 });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/categories/:id
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Name is required" });
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name: name.trim() },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Movies se bhi hata do
    await UserMovie.updateMany(
      { user: req.userId },
      { $pull: { categories: category._id } }
    );

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;