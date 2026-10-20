import { useEffect, useState } from 'react';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function Library() {
  const [tab, setTab] = useState('favorites');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/library', { params: { list: tab } })
      .then((res) => setMovies(res.data))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-4 mb-6">
        {['favorites', 'watchlist', 'watched'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg capitalize ${tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : movies.length === 0 ? (
        <EmptyState message={`No movies in ${tab}`} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((m) => (
            <MovieCard key={m.tmdbId} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
}