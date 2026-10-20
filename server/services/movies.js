const express = require("express");
const auth = require("../middleware/auth");
const { get, shape } = require("../services/tmdb");

const router = express.Router();
router.use(auth); // saare movie routes login ke baad hi

const SORTS = {
  rating: "vote_average.desc",
  year: "primary_release_date.desc",
  popularity: "popularity.desc",
};

const tmdbError = (res, err) => {
  console.error("TMDB error:", err.message);
  res.status(502).json({ message: "Could not get data from TMDB" });
};

// GET /api/movies/genres
router.get("/genres", async (req, res) => {
  try {
    const data = await get("/genre/movie/list");
    res.json(data.genres);
  } catch (err) {
    tmdbError(res, err);
  }
});

// GET /api/movies/random  (Surprise Me)
router.get("/random", async (req, res) => {
  try {
    const page = Math.floor(Math.random() * 20) + 1;
    const data = await get("/discover/movie", {
      sort_by: "popularity.desc",
      "vote_count.gte": 500,
      page,
    });
    if (!data.results.length) {
      return res.status(404).json({ message: "No movie found" });
    }
    const pick = data.results[Math.floor(Math.random() * data.results.length)];
    res.json(shape(pick));
  } catch (err) {
    tmdbError(res, err);
  }
});

// GET /api/movies?q=&genre=&year=&rating=&sort=&page=
router.get("/", async (req, res) => {
  try {
    const { q, genre, year, rating, sort, page = 1 } = req.query;
    let results;
    let totalPages;

    if (q) {
      // title search, filters/sorting server pe lagte hain
      const data = await get("/search/movie", {
        query: q,
        page,
        year: year || undefined,
        include_adult: false,
      });
      results = data.results.map(shape);
      if (genre) results = results.filter((m) => m.genreIds.includes(Number(genre)));
      if (rating) results = results.filter((m) => m.rating >= Number(rating));
      if (sort === "rating") results.sort((a, b) => b.rating - a.rating);
      if (sort === "year") results.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
      totalPages = data.total_pages;
    } else {
      // bina title ke: TMDB discover filters ke saath
      const params = {
        page,
        sort_by: SORTS[sort] || SORTS.popularity,
        include_adult: false,
        "vote_count.gte": 50,
      };
      if (genre) params.with_genres = genre;
      if (year) params.primary_release_year = year;
      if (rating) params["vote_average.gte"] = rating;
      const data = await get("/discover/movie", params);
      results = data.results.map(shape);
      totalPages = data.total_pages;
    }

    res.json({ page: Number(page), totalPages, results });
  } catch (err) {
    tmdbError(res, err);
  }
});

// GET /api/movies/:id  (movie details)
router.get("/:id", async (req, res) => {
  try {
    const m = await get(`/movie/${req.params.id}`);
    res.json({
      ...shape(m),
      genres: (m.genres || []).map((g) => g.name),
      runtime: m.runtime,
      tagline: m.tagline,
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: "Movie not found" });
    }
    tmdbError(res, err);
  }
});

module.exports = router;