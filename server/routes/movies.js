const express = require('express');
const Movie = require('../models/Movie');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all movies with pagination and filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      genre,
      year,
      director,
      actor,
      search,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Apply filters
    if (genre) {
      query.genres = { $in: Array.isArray(genre) ? genre : [genre] };
    }
    if (year) {
      query.year = parseInt(year);
    }
    if (director) {
      query.director = { $regex: director, $options: 'i' };
    }
    if (actor) {
      query.cast = { $regex: actor, $options: 'i' };
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const movies = await Movie.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-plotEmbedding');

    const total = await Movie.countDocuments(query);

    res.json({
      movies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalMovies: total,
        hasNext: skip + movies.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Movies fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Get movie by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // If user is authenticated, check if movie is in watchlist/history
    let userData = {};
    if (req.user) {
      const user = await User.findById(req.user._id)
        .populate('watchlist.movieId')
        .populate('watchHistory.movieId');
      
      const inWatchlist = user.watchlist.some(item => 
        item.movieId._id.toString() === req.params.id
      );
      const watchHistoryItem = user.watchHistory.find(item => 
        item.movieId._id.toString() === req.params.id
      );

      userData = {
        inWatchlist,
        watched: !!watchHistoryItem,
        userRating: watchHistoryItem?.rating || null
      };
    }

    res.json({ movie, userData });
  } catch (error) {
    console.error('Movie fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// Get similar movies
router.get('/:id/similar', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const similarMovies = await Movie.findSimilar(req.params.id, parseInt(limit));
    res.json({ movies: similarMovies });
  } catch (error) {
    console.error('Similar movies error:', error);
    res.status(500).json({ error: 'Failed to fetch similar movies' });
  }
});

// Add movie to watchlist
router.post('/:id/watchlist', auth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const user = await User.findById(req.user._id);
    const alreadyInWatchlist = user.watchlist.some(item => 
      item.movieId.toString() === req.params.id
    );

    if (alreadyInWatchlist) {
      return res.status(400).json({ error: 'Movie already in watchlist' });
    }

    user.watchlist.push({ movieId: req.params.id });
    await user.save();

    res.json({ message: 'Movie added to watchlist' });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Remove movie from watchlist
router.delete('/:id/watchlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.watchlist = user.watchlist.filter(item => 
      item.movieId.toString() !== req.params.id
    );
    await user.save();

    res.json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

// Mark movie as watched
router.post('/:id/watched', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const user = await User.findById(req.user._id);
    const existingHistory = user.watchHistory.find(item => 
      item.movieId.toString() === req.params.id
    );

    if (existingHistory) {
      // Update existing history
      existingHistory.watchedAt = new Date();
      if (rating) existingHistory.rating = rating;
    } else {
      // Add new history
      user.watchHistory.push({
        movieId: req.params.id,
        rating: rating || null
      });
    }

    // Remove from watchlist if present
    user.watchlist = user.watchlist.filter(item => 
      item.movieId.toString() !== req.params.id
    );

    await user.save();

    res.json({ message: 'Movie marked as watched' });
  } catch (error) {
    console.error('Mark watched error:', error);
    res.status(500).json({ error: 'Failed to mark as watched' });
  }
});

// Get user's watchlist
router.get('/user/watchlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchlist.movieId')
      .select('watchlist');

    res.json({ watchlist: user.watchlist });
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Get user's watch history
router.get('/user/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchHistory.movieId')
      .select('watchHistory');

    res.json({ history: user.watchHistory });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router; 