const axios = require("axios");

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

const get = async (path, params = {}) => {
  const { data } = await axios.get(BASE + path, {
    params: { api_key: process.env.TMDB_API_KEY, language: "en-US", ...params },
  });
  return data;
};

const shape = (m) => ({
  tmdbId: m.id,
  title: m.title,
  overview: m.overview,
  posterPath: m.poster_path ? IMG + m.poster_path : null,
  releaseDate: m.release_date || "",
  releaseYear: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
  rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : 0,
  genreIds: m.genre_ids || (m.genres ? m.genres.map((g) => g.id) : []),
});

module.exports = { get, shape };