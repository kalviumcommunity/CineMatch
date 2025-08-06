# 🎬 CineMatch – AI-Powered Movie Recommendation Platform

CineMatch is an intelligent movie recommendation system that blends traditional filtering techniques with advanced AI capabilities like Prompt Engineering, Function Calling, and Retrieval-Augmented Generation (RAG). Users can get personalized movie suggestions based on mood, preferences, or natural language prompts.

---

## 🚀 Features

- 🎯 **Personalized Recommendations** based on genre, actors, and watch history.
- 😊 **Mood-Based Suggestions** using sentiment analysis + LLM (GPT-4).
- 🧠 **AI Chat Interface** that accepts natural queries like:
  - *"Suggest a time-travel movie like Interstellar"*
  - *"I’m feeling nostalgic, give me something emotional."*
- 📖 **Plot Similarity Search** using NLP and cosine similarity.
- 🔎 **RAG-Powered Movie Q&A** — Ask questions like:
  - *"Why is Inception confusing?"*
  - *"Top sci-fi thrillers from the last 10 years?"*
- 📊 **Watchlist & History Tracking**
- 🧪 OpenAI **Function Calling** for smart filtering via LLM.
- 🔐 **JWT Authentication** for user login and personalization.

---

## 🛠️ Tech Stack

| Layer         | Tech Used                                                      |
|---------------|----------------------------------------------------------------|
| Frontend      | React.js, Tailwind CSS, Axios                                  |
| Backend       | Node.js, Express.js                                            |
| Database      | MongoDB (Mongoose)                                             |
| AI Layer      | OpenAI GPT-4 API, Function Calling, Sentiment Analysis         |
| RAG System    | Python + FAISS (vector DB), Sentence Transformers (HuggingFace)|
| Auth          | JSON Web Tokens (JWT)                                          |
| Deployment    | Render (backend), Vercel (frontend), Railway (optional)        |

---

## 📁 Folder Structure

CineMatch/
├── client/ # React frontend
│ └── src/
│ ├── components/ # UI Components
│ ├── pages/ # Home, Login, Recommendations
│ └── utils/ # API helpers
├── server/ # Express backend
│ ├── routes/ # Auth, Movies, AI Routes
│ ├── controllers/ # Logic for handling routes
│ ├── models/ # Mongoose schemas
│ └── ai/ # AI logic and OpenAI integration
├── rag_service/ # Python FastAPI microservice for RAG
│ └── faiss_index/ # Pre-computed movie plot embeddings
└── README.md


