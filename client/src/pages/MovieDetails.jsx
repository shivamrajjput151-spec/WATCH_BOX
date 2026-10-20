import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [state, setState] = useState(null);
  const [categories, setCategories] = useState([]);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(null);
  const [selectedCats, setSelectedCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, sRes, cRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/library/${id}`),
          api.get('/categories'),
        ]);
        setMovie(mRes.data);
        setState(sRes.data);
        setReview(sRes.data.review || '');
        setRating(sRes.data.personalRating);
        setSelectedCats((sRes.data.categories || []).map((c) => c._id || c));
        setCategories(cRes.data);

        api.post('/history/view', {
          tmdbId: mRes.data.tmdbId,
          title: mRes.data.title,
          posterPath: mRes.data.posterPath,
        }).catch(() => {});
      } catch {
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const toggle = async (field) => {
    const newVal = !state[field];
    setState({ ...state, [field]: newVal });
    try {
      await api.put(`/library/${id}`, {
        [field]: newVal,
        title: movie.title,
        posterPath: movie.posterPath,
        releaseYear: movie.releaseYear,
        genres: movie.genres,
      });
    } catch {}
  };

  const saveReview = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/library/${id}`, {
        personalRating: rating,
        review,
        categories: selectedCats,
        title: movie.title,
        posterPath: movie.posterPath,
        releaseYear: movie.releaseYear,
        genres: movie.genres,
      });
      setState(data);
    } catch {}
    setSaving(false);
  };

  if (loading) return <Loader />;
  if (!movie) return <div className="p-10 text-center">Movie not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src={movie.posterPath || 'https://via.placeholder.com/300x450'}
          alt={movie.title}
          className="w-full md:w-64 rounded-xl shadow"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          <p className="text-gray-500 mt-1">
            {movie.releaseYear} • {movie.runtime} min • ⭐ {movie.rating}
          </p>
          <p className="mt-2 text-sm">{movie.genres?.join(', ')}</p>
          {movie.tagline && <p className="italic text-indigo-500 mt-2">"{movie.tagline}"</p>}
          <p className="mt-4 text-gray-700 dark:text-gray-300">{movie.overview}</p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => toggle('isFavorite')}
              className={`px-4 py-2 rounded-lg ${state?.isFavorite ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              {state?.isFavorite ? '❤️ Favorited' : '🤍 Favorite'}
            </button>
            <button
              onClick={() => toggle('isWatchlist')}
              className={`px-4 py-2 rounded-lg ${state?.isWatchlist ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              {state?.isWatchlist ? '📋 In Watchlist' : '📋 Watchlist'}
            </button>
            <button
              onClick={() => toggle('isWatched')}
              className={`px-4 py-2 rounded-lg ${state?.isWatched ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              {state?.isWatched ? '✅ Watched' : '⬜ Watched'}
            </button>
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">My Rating (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`w-10 h-10 rounded-full ${rating === n ? 'bg-yellow-400 text-black' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">My Review</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                placeholder="Write your thoughts..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <label key={c._id} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedCats.includes(c._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCats([...selectedCats, c._id]);
                        else setSelectedCats(selectedCats.filter((id) => id !== c._id));
                      }}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={saveReview}
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Rating & Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}