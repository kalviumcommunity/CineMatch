import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, Play } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import MovieCard from '../components/MovieCard';

const Watchlist = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get('/api/movies/user/watchlist');
      setWatchlist(response.data.watchlist.map(item => item.movieId));
    } catch (error) {
      toast.error('Failed to fetch watchlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      await axios.delete(`/api/movies/${movieId}/watchlist`);
      setWatchlist(prev => prev.filter(movie => movie._id !== movieId));
      toast.success('Removed from watchlist');
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  const markAsWatched = async (movieId) => {
    try {
      await axios.post(`/api/movies/${movieId}/watched`);
      setWatchlist(prev => prev.filter(movie => movie._id !== movieId));
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-purple-900/50 to-pink-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              My Watchlist
            </h1>
            <p className="text-xl text-gray-300">
              {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} in your watchlist
            </p>
          </motion.div>
        </div>
      </section>

      {/* Watchlist Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {watchlist.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex justify-between items-center mb-8"
              >
                <h2 className="text-2xl font-bold text-white">
                  Saved Movies
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400">{watchlist.length} movies</span>
                </div>
              </motion.div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {watchlist.map((movie, index) => (
                  <motion.div
                    key={movie._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="relative group"
                  >
                    <MovieCard movie={movie} />
                    
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => markAsWatched(movie._id)}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                        title="Mark as watched"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromWatchlist(movie._id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h3>
              <p className="text-gray-400 mb-8">
                Start adding movies to your watchlist to see them here
              </p>
              <a
                href="/recommendations"
                className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <span>Browse Movies</span>
              </a>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Watchlist; 