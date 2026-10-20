import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('popularity');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/movies/genres').then((res) => setGenres(res.data)).catch(() => {});
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = { page, sort };
      if (q) params.q = q;
      if (genre) params.genre = genre;
      if (year) params.year = year;
      if (rating) params.rating = rating;

      const { data } = await api.get('/movies', { params });
      setMovies(data.results || []);
      setTotalPages(data.totalPages || 1);

      if (q) {
        api.post('/history/search', { query: q }).catch(() => {});
      }
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMovies();
  };

  const surpriseMe = async () => {
    try {
      const { data } = await api.get('/movies/random');
      navigate(`/movie/${data.tmdbId}`);
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search movies..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
        />
        <select value={genre} onChange={(e) => setGenre(e.target.value)} className="px-3 py-2 rounded-lg border dark:bg-gray-800">
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-24 px-3 py-2 rounded-lg border dark:bg-gray-800"
        />
        <select value={rating} onChange={(e) => setRating(e.target.value)} className="px-3 py-2 rounded-lg border dark:bg-gray-800">
          <option value="">Min Rating</option>
          {[9, 8, 7, 6, 5].map((r) => (
            <option key={r} value={r}>{r}+</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 rounded-lg border dark:bg-gray-800">
          <option value="popularity">Popularity</option>
          <option value="rating">Rating</option>
          <option value="year">Year</option>
        </select>
        <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Search
        </button>
        <button type="button" onClick={surpriseMe} className="px-5 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
          🎲 Surprise Me
        </button>
      </form>

      {loading ? (
        <Loader />
      ) : movies.length === 0 ? (
        <EmptyState message="No movies found" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((m) => (
              <MovieCard key={m.tmdbId} movie={m} />
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="py-2">Page {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}