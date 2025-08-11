# 🎬 CineMatch – AI-Powered Movie Recommendation Platform

CineMatch is an intelligent movie recommendation system that blends traditional filtering techniques with advanced AI capabilities like Prompt Engineering, Function Calling, and Retrieval-Augmented Generation (RAG). Users can get personalized movie suggestions based on mood, preferences, or natural language prompts.

## 🚀 Features

- 🎯 **Personalized Recommendations** based on genre, actors, and watch history
- 😊 **Mood-Based Suggestions** using sentiment analysis + LLM (GPT-4)
- 🧠 **AI Chat Interface** that accepts natural queries like:
  - *"Suggest a time-travel movie like Interstellar"*
  - *"I'm feeling nostalgic, give me something emotional."*
- 📖 **Plot Similarity Search** using NLP and cosine similarity
- 🔎 **RAG-Powered Movie Q&A** — Ask questions like:
  - *"Why is Inception confusing?"*
  - *"Top sci-fi thrillers from the last 10 years?"*
- 📊 **Watchlist & History Tracking**
- 🧪 OpenAI **Function Calling** for smart filtering via LLM
- 🔐 **JWT Authentication** for user login and personalization

## 🛠️ Tech Stack

| Layer | Tech Used |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Axios, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| AI Layer | OpenAI GPT-4 API, Function Calling, Sentiment Analysis |
| RAG System | Python + FAISS (vector DB), Sentence Transformers (HuggingFace) |
| Auth | JSON Web Tokens (JWT) |
| Deployment | Render (backend), Vercel (frontend), Railway (optional) |

## 📁 Project Structure

```
CineMatch/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # UI Components
│       ├── pages/          # Home, Login, Recommendations
│       ├── contexts/       # Authentication context
│       └── utils/          # API helpers
├── server/                 # Express backend
│   ├── routes/            # Auth, Movies, AI Routes
│   ├── controllers/       # Logic for handling routes
│   ├── models/            # Mongoose schemas
│   ├── middleware/        # Authentication middleware
│   └── ai/                # AI logic and OpenAI integration
├── rag_service/           # Python FastAPI microservice for RAG
│   └── faiss_index/       # Pre-computed movie plot embeddings
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API key
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cinematch
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/cinematch
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `CLIENT_URL`: Frontend URL for CORS

#### Frontend
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)

### Database Setup

1. **Local MongoDB**
   ```bash
   # Install MongoDB locally
   # Start MongoDB service
   mongod
   ```

2. **MongoDB Atlas**
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Get your connection string
   - Update `MONGODB_URI` in your `.env` file

## 🎯 Key Features Explained

### AI Chat Interface

The AI chat interface uses OpenAI's GPT-4 with function calling to provide intelligent movie recommendations:

```javascript
// Example AI chat request
const response = await axios.post('/api/ai/chat', {
  message: "I want a feel-good comedy like The Grand Budapest Hotel",
  context: previousMessages
});
```

### Mood-Based Recommendations

Mood-based recommendations map user emotions to movie genres and keywords:

```javascript
const moodMappings = {
  'happy': { genres: ['Comedy', 'Adventure', 'Family'], keywords: ['uplifting', 'funny', 'feel-good'] },
  'sad': { genres: ['Drama', 'Romance'], keywords: ['emotional', 'touching', 'heartfelt'] },
  // ... more moods
};
```

### Function Calling

The AI uses OpenAI's function calling to search for movies based on user queries:

```javascript
const functions = [
  {
    name: 'search_movies',
    description: 'Search for movies based on various criteria',
    parameters: {
      type: 'object',
      properties: {
        genres: { type: 'array', items: { type: 'string' } },
        actors: { type: 'array', items: { type: 'string' } },
        // ... more properties
      }
    }
  }
];
```

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## 🚀 Deployment

### Backend Deployment (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- MongoDB for the database
- React and Express.js communities
- All contributors and users




🎯 Zero-Shot Prompting Movie Recommender
This project demonstrates Zero-Shot Prompting, where an AI model is given a single natural language prompt without prior examples. The model uses its pre-trained knowledge to understand the context and generate relevant recommendations.

📌 How It Works
User provides a movie name in the prompt.

The model predicts and recommends similar movies without any prior training examples.

💡 Example
Prompt: "Recommend movies similar to Inception"
Output: Interstellar, The Prestige, Shutter Island...

🚀 Use Case
Useful for quick recommendations, brainstorming, and tasks where no labeled training data is available.




## 2. One-Shot Prompting in CineMatch
In CineMatch, one-shot prompting is the technique where I give the AI one clear example of the task before asking it to perform a new request. This single example helps the AI understand not only the type of content it should produce, but also the style, structure, and level of detail expected in the response.

Why this matters in a movie recommendation system: Without examples, the AI might return recommendations in inconsistent formats — sometimes full sentences, sometimes bullet points, or with missing release years. By providing one example first, I’m setting a “standard” for how all recommendations should be returned, regardless of the genre or request.

Example in CineMatch:

vbnet
Copy
Edit
Example:
User Request: "Suggest action movies with strong female leads."
Response:
1. Mad Max: Fury Road (2015) – In a post-apocalyptic desert, Imperator Furiosa rebels against a tyrant.
2. Wonder Woman (2017) – An Amazonian warrior princess fights in World War I to stop a god.

Now, respond to:
User Request: "Suggest mystery thrillers with unexpected plot twists."
Because the AI has seen the example first, it understands:

Output must be numbered

Include movie title + release year

Provide a concise one-line description

So the response comes back in the exact same style:

Gone Girl (2014) – A man becomes the prime suspect when his wife mysteriously disappears.

Shutter Island (2010) – A U.S. marshal investigates a disappearance in a mental hospital.

Why it works in CineMatch:

Consistency: Every recommendation looks clean and uniform, which is important for UI display.

Clarity: Users quickly understand the format, making it easier to scan through suggestions.

Scalability: Works across genres — action, horror, rom-com, documentary — without retraining.

For example, if the prompt changes to:

“Suggest lighthearted rom-coms from the 90s”
The AI will still return results in the same neat format established in the one-shot example.

In short, one-shot prompting in CineMatch acts as a format training wheel — one example is enough to guide the AI into producing hundreds of clean, structured, and user-friendly recommendations.


