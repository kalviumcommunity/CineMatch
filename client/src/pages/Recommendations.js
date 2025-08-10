import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Filter, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import MovieCard from '../components/MovieCard';
import AIChat from '../components/AIChat';

const Recommendations = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    rating: ''
  });

  const moods = [
    { name: 'Happy', emoji: '😊', value: 'happy' },
    { name: 'Sad', emoji: '😢', value: 'sad' },
    { name: 'Excited', emoji: '🤩', value: 'excited' },
    { name: 'Relaxed', emoji: '😌', value: 'relaxed' },
    { name: 'Nostalgic', emoji: '🥺', value: 'nostalgic' },
    { name: 'Mysterious', emoji: '🕵️', value: 'mysterious' },
    { name: 'Romantic', emoji: '💕', value: 'romantic' }
  ];

  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
  ];

  useEffect(() => {
    fetchRecommendations();
  }, [selectedMood, filters]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      let url = '/api/movies?limit=20&sortBy=rating&sortOrder=desc';
      
      if (selectedMood) {
        const response = await axios.post('/api/ai/mood-recommendations', {
          mood: selectedMood,
          limit: 20
        });
        setMovies(response.data.movies);
        setLoading(false);
        return;
      }

      // Apply filters
      if (filters.genre) url += `&genre=${filters.genre}`;
      if (filters.year) url += `&year=${filters.year}`;
      if (filters.rating) url += `&minRating=${filters.rating}`;

      const response = await axios.get(url);
      setMovies(response.data.movies);
    } catch (error) {
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(selectedMood === mood ? '' : mood);
    setFilters({ genre: '', year: '', rating: '' });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSelectedMood('');
  };

  const clearFilters = () => {
    setFilters({ genre: '', year: '', rating: '' });
    setSelectedMood('');
  };

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
              Movie Recommendations
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover your next favorite movie with AI-powered suggestions tailored to your taste and mood
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mood Selection */}
      <section className="py-8 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              How are you feeling today?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMood === mood.value
                      ? 'border-purple-500 bg-purple-600/20 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-purple-500 hover:bg-purple-600/20'
                  }`}
                >
                  <div className="text-2xl mb-2">{mood.emoji}</div>
                  <div className="text-sm font-medium">{mood.name}</div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-white font-medium">Filters:</span>
            </div>

            {/* Genre Filter */}
            <select
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Years</option>
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Ratings</option>
              <option value="7">7+ Rating</option>
              <option value="8">8+ Rating</option>
              <option value="9">9+ Rating</option>
            </select>

            {/* Clear Filters */}
            {(filters.genre || filters.year || filters.rating || selectedMood) && (
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Clear All
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg h-96 animate-pulse"></div>
              ))}
            </div>
          ) : movies.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-between items-center mb-8"
              >
                <h2 className="text-2xl font-bold text-white">
                  {selectedMood ? `${moods.find(m => m.value === selectedMood)?.name} Movies` : 'Recommended Movies'}
                </h2>
                <span className="text-gray-400">{movies.length} movies found</span>
              </motion.div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {movies.map((movie, index) => (
                  <motion.div
                    key={movie._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <MovieCard movie={movie} />
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
              <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
              <p className="text-gray-400">
                Try adjusting your filters or ask our AI for personalized recommendations
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* AI Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* AI Chat Modal */}
      {showChat && (
        <AIChat onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default Recommendations; 