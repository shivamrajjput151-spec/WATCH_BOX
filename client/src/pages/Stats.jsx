import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!stats) return <div className="p-10 text-center">Failed to load stats</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-2xl font-bold">My Movie Stats</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Watched', value: stats.totalWatched },
          { label: 'Favorites', value: stats.totalFavorites },
          { label: 'Watchlist', value: stats.totalWatchlist },
          { label: 'Avg Rating', value: stats.averagePersonalRating },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 p-5 rounded-xl text-center">
            <p className="text-3xl font-bold text-indigo-500">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-semibold mb-3">Rating Distribution</h2>
        <div className="flex gap-2 items-end h-32">
          {[1, 2, 3, 4, 5].map((r) => (
            <div key={r} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-indigo-500 rounded-t"
                style={{ height: `${(stats.ratingDistribution[r] || 0) * 20 + 4}px` }}
              />
              <span className="text-xs mt-1">{r}★</span>
            </div>
          ))}
        </div>
      </div>

      {stats.genreBreakdown?.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Top Genres (Watched)</h2>
          <div className="space-y-2">
            {stats.genreBreakdown.slice(0, 8).map((g) => (
              <div key={g.genre} className="flex items-center gap-3">
                <span className="w-28 text-sm">{g.genre}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-indigo-500 h-3 rounded-full"
                    style={{ width: `${Math.min(100, g.count * 15)}%` }}
                  />
                </div>
                <span className="text-sm w-6">{g.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.topRated?.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Top Rated by Me</h2>
          <div className="space-y-2">
            {stats.topRated.map((m) => (
              <div key={m.tmdbId} className="flex justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <span>{m.title} ({m.releaseYear})</span>
                <span className="text-yellow-500">★ {m.personalRating}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}