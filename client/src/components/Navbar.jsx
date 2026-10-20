import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          WatchBox
        </Link>

        {user && (
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="hover:text-indigo-500">Home</Link>
            <Link to="/library" className="hover:text-indigo-500">Library</Link>
            <Link to="/categories" className="hover:text-indigo-500">Categories</Link>
            <Link to="/history" className="hover:text-indigo-500">History</Link>
            <Link to="/stats" className="hover:text-indigo-500">Stats</Link>
            <button onClick={toggleTheme} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogout} className="text-red-500 hover:underline">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}