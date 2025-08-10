const express = require('express');
const OpenAI = require('openai');
const { auth, optionalAuth } = require('../middleware/auth');
const Movie = require('../models/Movie');
const User = require('../models/User');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// AI Chat Interface
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, context = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build system prompt based on user context
    let systemPrompt = `You are CineMatch, an AI-powered movie recommendation assistant. You help users find movies based on their preferences, mood, and natural language queries.

Key capabilities:
- Recommend movies based on genre, mood, actors, directors, or plot similarities
- Suggest movies similar to specific films
- Provide movie information and explanations
- Answer questions about movies, plots, and film history

Always respond in a helpful, conversational tone. When recommending movies, provide brief explanations for your suggestions.`;

    // Add user preferences if authenticated
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user.preferences.genres.length > 0) {
        systemPrompt += `\n\nUser preferences: Genres: ${user.preferences.genres.join(', ')}`;
      }
    }

    // Function definitions for OpenAI function calling
    const functions = [
      {
        name: 'search_movies',
        description: 'Search for movies based on various criteria',
        parameters: {
          type: 'object',
          properties: {
            genres: {
              type: 'array',
              items: { type: 'string' },
              description: 'Movie genres to search for'
            },
            actors: {
              type: 'array',
              items: { type: 'string' },
              description: 'Actors to search for'
            },
            directors: {
              type: 'array',
              items: { type: 'string' },
              description: 'Directors to search for'
            },
            year_from: {
              type: 'number',
              description: 'Start year for movie search'
            },
            year_to: {
              type: 'number',
              description: 'End year for movie search'
            },
            min_rating: {
              type: 'number',
              description: 'Minimum rating (0-10)'
            },
            limit: {
              type: 'number',
              description: 'Number of movies to return (max 10)',
              default: 5
            }
          }
        }
      },
      {
        name: 'get_movie_info',
        description: 'Get detailed information about a specific movie',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Movie title to search for'
            }
          },
          required: ['title']
        }
      }
    ];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...context,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      functions,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0];
    
    // Handle function calls
    if (response.message.function_call) {
      const functionCall = response.message.function_call;
      
      if (functionCall.name === 'search_movies') {
        const args = JSON.parse(functionCall.arguments);
        const movies = await searchMovies(args);
        
        // Continue conversation with function results
        const functionMessages = [
          ...messages,
          response.message,
          {
            role: 'function',
            name: 'search_movies',
            content: JSON.stringify(movies)
          }
        ];

        const finalCompletion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: functionMessages,
          temperature: 0.7,
          max_tokens: 1000
        });

        res.json({
          response: finalCompletion.choices[0].message.content,
          movies: movies
        });
      } else if (functionCall.name === 'get_movie_info') {
        const args = JSON.parse(functionCall.arguments);
        const movieInfo = await getMovieInfo(args.title);
        
        const functionMessages = [
          ...messages,
          response.message,
          {
            role: 'function',
            name: 'get_movie_info',
            content: JSON.stringify(movieInfo)
          }
        ];

        const finalCompletion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: functionMessages,
          temperature: 0.7,
          max_tokens: 1000
        });

        res.json({
          response: finalCompletion.choices[0].message.content,
          movieInfo: movieInfo
        });
      }
    } else {
      res.json({
        response: response.message.content
      });
    }
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// Mood-based recommendations
router.post('/mood-recommendations', optionalAuth, async (req, res) => {
  try {
    const { mood, limit = 5 } = req.body;

    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    // Map moods to genres and keywords
    const moodMappings = {
      'happy': { genres: ['Comedy', 'Adventure', 'Family'], keywords: ['uplifting', 'funny', 'feel-good'] },
      'sad': { genres: ['Drama', 'Romance'], keywords: ['emotional', 'touching', 'heartfelt'] },
      'excited': { genres: ['Action', 'Adventure', 'Sci-Fi'], keywords: ['thrilling', 'adventure', 'exciting'] },
      'relaxed': { genres: ['Comedy', 'Drama', 'Documentary'], keywords: ['calm', 'peaceful', 'easy-going'] },
      'nostalgic': { genres: ['Drama', 'Romance', 'Comedy'], keywords: ['retro', 'vintage', 'classic'] },
      'mysterious': { genres: ['Mystery', 'Thriller', 'Crime'], keywords: ['suspense', 'mystery', 'intriguing'] },
      'romantic': { genres: ['Romance', 'Drama', 'Comedy'], keywords: ['romantic', 'love', 'relationship'] }
    };

    const mapping = moodMappings[mood.toLowerCase()] || moodMappings['happy'];
    
    const query = {
      $or: [
        { genres: { $in: mapping.genres } },
        { keywords: { $in: mapping.keywords } },
        { mood: { $in: mapping.keywords } }
      ]
    };

    const movies = await Movie.find(query)
      .sort({ rating: -1, popularity: -1 })
      .limit(parseInt(limit))
      .select('-plotEmbedding');

    res.json({ movies, mood });
  } catch (error) {
    console.error('Mood recommendations error:', error);
    res.status(500).json({ error: 'Failed to get mood-based recommendations' });
  }
});

// RAG-powered Q&A
router.post('/qa', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // For now, we'll use a simple approach. In production, this would integrate with the RAG service
    const systemPrompt = `You are a movie expert assistant. Answer questions about movies, plots, actors, directors, and film history. 
    Be informative and engaging. If you don't know something, say so rather than making things up.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    res.json({
      answer: completion.choices[0].message.content,
      question
    });
  } catch (error) {
    console.error('Q&A error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

// Helper function to search movies
async function searchMovies(criteria) {
  const query = {};
  
  if (criteria.genres) {
    query.genres = { $in: criteria.genres };
  }
  if (criteria.actors) {
    query.cast = { $regex: criteria.actors.join('|'), $options: 'i' };
  }
  if (criteria.directors) {
    query.director = { $regex: criteria.directors.join('|'), $options: 'i' };
  }
  if (criteria.year_from || criteria.year_to) {
    query.year = {};
    if (criteria.year_from) query.year.$gte = criteria.year_from;
    if (criteria.year_to) query.year.$lte = criteria.year_to;
  }
  if (criteria.min_rating) {
    query.rating = { $gte: criteria.min_rating };
  }

  const movies = await Movie.find(query)
    .sort({ rating: -1, popularity: -1 })
    .limit(criteria.limit || 5)
    .select('-plotEmbedding');

  return movies.map(movie => movie.getSummary());
}

// Helper function to get movie info
async function getMovieInfo(title) {
  const movie = await Movie.findOne({
    title: { $regex: title, $options: 'i' }
  });

  if (!movie) {
    return { error: 'Movie not found' };
  }

  return movie.getSummary();
}

module.exports = router; 