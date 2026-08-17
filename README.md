# 🎬 MovieHub

An AI-powered movie and TV show discovery platform built with React, TypeScript, and Google Gemini AI.

## Features

- 🔥 Trending, Popular, Anime, K-Drama, and Top Rated movie rails
- 🎥 Official YouTube trailer modal
- 🔍 Search with genre, year, and rating filters
- 🧭 Discover page with advanced filtering
- 🤖 Gemini AI smart recommendations
- 📺 Cast, crew, and streaming provider info
- 📱 Fully responsive (mobile + desktop)

## Tech Stack

- **Frontend** — React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend** — Node.js, Express
- **APIs** — TMDB (movies), Google Gemini (AI)
- **Build Tool** — Vite

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Add your API keys to `.env.local`**

```env
GEMINI_API_KEY=your_gemini_key      # https://aistudio.google.com
VITE_TMDB_API_KEY=your_tmdb_key     # https://themoviedb.org/settings/api
TMDB_API_KEY=your_tmdb_key
```

> Both keys are free. The app works without them using built-in fallback data.

**3. Run the app**

```bash
npm run dev
```

**4. Open in browser**

```
http://localhost:3000
```

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Run production build     |
| `npm run lint`  | TypeScript type check    |

## Project Structure

```
moviehub/
├── server.ts              # Express backend (Gemini AI + TMDB proxy)
├── src/
│   ├── pages/             # Home, Discover, Search, MovieDetails
│   ├── components/        # Hero, MovieCard, MovieRail, TrailerModal, Nav
│   ├── services/          # TMDB API + Gemini AI clients
│   ├── data/              # Fallback movie data (works offline)
│   └── types/             # TypeScript interfaces
└── .env.local             # Your API keys (never commit this)
```

## Notes

- No API keys? The app still works with built-in fallback movie data
- Gemini key is only needed for the AI recommendation feature
- TMDB key unlocks live, real-time movie data
