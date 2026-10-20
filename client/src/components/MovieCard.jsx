import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  const poster = movie.posterPath || 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <Link to={`/movie/${movie.tmdbId}`} className="group block rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow hover:shadow-lg transition">
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2">{movie.title}</h3>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{movie.releaseYear || '—'}</span>
          <span>⭐ {movie.rating || movie.personalRating || '—'}</span>
        </div>
      </div>
    </Link>
  );
}