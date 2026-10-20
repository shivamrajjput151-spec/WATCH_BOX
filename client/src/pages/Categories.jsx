import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/categories')
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post('/categories', { name });
    setName('');
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Categories</h1>

      <form onSubmit={create} className="flex gap-2 mb-8">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 px-4 py-2 rounded-lg border dark:bg-gray-800"
        />
        <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg">
          Add
        </button>
      </form>

      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c._id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-gray-500">{c.movieCount} movies</p>
            </div>
            <button onClick={() => remove(c._id)} className="text-red-500 text-sm">
              Delete
            </button>
          </div>
        ))}
        {categories.length === 0 && <p className="text-gray-500">No categories yet</p>}
      </div>
    </div>
  );
}