import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function History() {
  const [search, setSearch] = useState([]);
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [s, v] = await Promise.all([
        api.get('/history', { params: { type: 'search' } }),
        api.get('/history', { params: { type: 'view' } }),
      ]);
      setSearch(s.data);
      setViews(v.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const clear = async (type) => {
    await api.delete('/history', { params: { type } });
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-10">
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Search History</h2>
          <button onClick={() => clear('search')} className="text-sm text-red-500">Clear</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {search.map((h) => (
            <button
              key={h._id}
              onClick={() => navigate(`/?q=${h.query}`)}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm"
            >
              {h.query}
            </button>
          ))}
          {search.length === 0 && <p className="text-gray-500">No searches yet</p>}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recently Viewed</h2>
          <button onClick={() => clear('view')} className="text-sm text-red-500">Clear</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {views.map((h) => (
            <button
              key={h._id}
              onClick={() => navigate(`/movie/${h.tmdbId}`)}
              className="text-left"
            >
              <img
                src={h.posterPath || 'https://via.placeholder.com/150x225'}
                alt={h.title}
                className="rounded-lg w-full aspect-[2/3] object-cover"
              />
              <p className="text-sm mt-1 line-clamp-2">{h.title}</p>
            </button>
          ))}
          {views.length === 0 && <p className="text-gray-500">No views yet</p>}
        </div>
      </section>
    </div>
  );
}