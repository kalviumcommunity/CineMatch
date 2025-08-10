const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  originalTitle: String,
  year: {
    type: Number,
    required: true,
    index: true
  },
  genres: [{
    type: String,
    enum: ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'],
    index: true
  }],
  director: {
    type: String,
    index: true
  },
  directors: [String],
  cast: [String],
  plot: {
    type: String,
    required: true,
    index: 'text'
  },
  plotEmbedding: [Number], // For RAG similarity search
  runtime: {
    type: Number,
    min: 1
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  imdbRating: {
    type: Number,
    min: 0,
    max: 10
  },
  posterUrl: String,
  backdropUrl: String,
  trailerUrl: String,
  language: {
    type: String,
    default: 'English'
  },
  country: String,
  awards: [String],
  boxOffice: {
    budget: Number,
    revenue: Number
  },
  keywords: [String], // For better search and recommendations
  mood: [String], // e.g., ['uplifting', 'dark', 'romantic', 'thrilling']
  tags: [String], // User-generated tags
  popularity: {
    type: Number,
    default: 0
  },
  watchCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Text index for search functionality
movieSchema.index({
  title: 'text',
  plot: 'text',
  cast: 'text',
  director: 'text',
  keywords: 'text'
});

// Compound indexes for common queries
movieSchema.index({ year: -1, rating: -1 });
movieSchema.index({ genres: 1, year: -1 });
movieSchema.index({ popularity: -1, year: -1 });

// Virtual for formatted runtime
movieSchema.virtual('formattedRuntime').get(function() {
  if (!this.runtime) return null;
  const hours = Math.floor(this.runtime / 60);
  const minutes = this.runtime % 60;
  return `${hours}h ${minutes}m`;
});

// Method to get movie summary
movieSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    year: this.year,
    genres: this.genres,
    director: this.director,
    plot: this.plot,
    rating: this.rating,
    imdbRating: this.imdbRating,
    posterUrl: this.posterUrl,
    runtime: this.formattedRuntime,
    popularity: this.popularity
  };
};

// Static method to find similar movies
movieSchema.statics.findSimilar = async function(movieId, limit = 5) {
  const movie = await this.findById(movieId);
  if (!movie) return [];
  
  return this.find({
    _id: { $ne: movieId },
    genres: { $in: movie.genres },
    year: { $gte: movie.year - 5, $lte: movie.year + 5 }
  })
  .sort({ rating: -1, popularity: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Movie', movieSchema); 