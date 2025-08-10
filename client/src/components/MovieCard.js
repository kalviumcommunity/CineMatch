import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const MovieCard = ({ movie }) => {
  const { user } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = React.useState(false);

  React.useEffect(() => {
    if (user && movie.userData) {
      setIsInWatchlist(movie.userData.inWatchlist);
    }
  }, [user, movie]);

  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add movies to your watchlist');
      return;
    }

    try {
      if (isInWatchlist) {
        await axios.delete(`/api/movies/${movie._id}/watchlist`);
        setIsInWatchlist(false);
        toast.success('Removed from watchlist');
      } else {
        await axios.post(`/api/movies/${movie._id}/watchlist`);
        setIsInWatchlist(true);
        toast.success('Added to watchlist');
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all"
    >
      <Link to={`/movie/${movie._id}`}>
        {/* Movie Poster */}
        <div className="relative h-64 overflow-hidden">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">{movie.title}</span>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {movie.rating > 0 && (
                    <div className="flex items-center space-x-1 bg-yellow-500/90 px-2 py-1 rounded">
                      <Star className="h-3 w-3 text-yellow-900 fill-current" />
                      <span className="text-xs font-semibold text-yellow-900">
                        {movie.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {movie.runtime && (
                    <div className="flex items-center space-x-1 bg-gray-800/90 px-2 py-1 rounded">
                      <Clock className="h-3 w-3 text-gray-300" />
                      <span className="text-xs text-gray-300">
                        {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Watchlist Button */}
                {user && (
                  <button
                    onClick={handleWatchlistToggle}
                    className={`p-2 rounded-full transition-colors ${
                      isInWatchlist 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-gray-800/90 hover:bg-gray-700'
                    }`}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        isInWatchlist ? 'text-white fill-current' : 'text-gray-300'
                      }`} 
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Movie Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {movie.title}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{movie.year}</span>
            {movie.imdbRating && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-300">{movie.imdbRating}</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {movie.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded"
                >
                  {genre}
                </span>
              ))}
              {movie.genres.length > 2 && (
                <span className="px-2 py-1 bg-gray-600/20 text-gray-300 text-xs rounded">
                  +{movie.genres.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Plot Preview */}
          {movie.plot && (
            <p className="text-gray-300 text-sm line-clamp-2">
              {movie.plot.length > 100 ? `${movie.plot.substring(0, 100)}...` : movie.plot}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard; 