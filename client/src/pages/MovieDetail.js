import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Heart, Play, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import MovieCard from '../components/MovieCard';

const MovieDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      const [movieResponse, similarResponse] = await Promise.all([
        axios.get(`/api/movies/${id}`),
        axios.get(`/api/movies/${id}/similar`)
      ]);

      setMovie(movieResponse.data.movie);
      setSimilarMovies(similarResponse.data.movies);
      
      if (movieResponse.data.userData) {
        setIsInWatchlist(movieResponse.data.userData.inWatchlist);
        setUserRating(movieResponse.data.userData.userRating);
      }
    } catch (error) {
      toast.error('Failed to fetch movie details');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add movies to your watchlist');
      return;
    }

    try {
      if (isInWatchlist) {
        await axios.delete(`/api/movies/${id}/watchlist`);
        setIsInWatchlist(false);
        toast.success('Removed from watchlist');
      } else {
        await axios.post(`/api/movies/${id}/watchlist`);
        setIsInWatchlist(true);
        toast.success('Added to watchlist');
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  const handleMarkWatched = async (rating = null) => {
    if (!user) {
      toast.error('Please login to mark movies as watched');
      return;
    }

    try {
      await axios.post(`/api/movies/${id}/watched`, { rating });
      setUserRating(rating);
      setIsInWatchlist(false);
      toast.success('Marked as watched');
    } catch (error) {
      toast.error('Failed to mark as watched');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Movie not found</h2>
          <Link to="/" className="text-purple-400 hover:text-purple-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Movie Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        {movie.backdropUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${movie.backdropUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-16">
          <div className="grid md:grid-cols-3 gap-8 items-end">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-1"
            >
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full max-w-sm rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-full max-w-sm h-96 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">{movie.title}</span>
                </div>
              )}
            </motion.div>

            {/* Movie Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-2 text-white"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-300">
                <span>{movie.year}</span>
                {movie.runtime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                  </div>
                )}
                {movie.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                )}
                {movie.imdbRating && (
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">IMDb</span>
                    <span>{movie.imdbRating}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Plot */}
              {movie.plot && (
                <p className="text-gray-300 text-lg mb-6 max-w-2xl">
                  {movie.plot}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {user && (
                  <>
                    <button
                      onClick={handleWatchlistToggle}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                        isInWatchlist 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isInWatchlist ? 'fill-current' : ''}`} />
                      <span>{isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
                    </button>
                    
                    <button
                      onClick={() => handleMarkWatched(userRating || 5)}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Play className="h-5 w-5" />
                      <span>Mark as Watched</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Additional Details */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Cast & Crew */}
            {movie.cast && movie.cast.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-4">Cast</h3>
                <div className="grid grid-cols-2 gap-2">
                  {movie.cast.slice(0, 6).map((actor, index) => (
                    <span key={index} className="text-gray-300">
                      {actor}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Director */}
            {movie.director && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-2xl font-bold text-white mb-4">Director</h3>
                <p className="text-gray-300">{movie.director}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Similar Movies */}
      {similarMovies.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-3xl font-bold text-white mb-8"
            >
              Similar Movies
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarMovies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MovieDetail; 