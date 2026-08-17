import 'dotenv/config';
import dotenv from 'dotenv';
// Load .env.local first (takes priority), then .env as fallback
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize Gemini AI Client lazily/safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.warn('⚠️  GEMINI_API_KEY is not set — using fallback recommendations.');
      return null;
    }
    return new GoogleGenAI({ apiKey });
  };

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'MovieHub API',
      gemini: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
      tmdb: !!(process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY),
    });
  });

  // API Route: Gemini Smart Recommendations
  app.post('/api/recommendations', async (req, res) => {
    const { prompt, mediaType = 'all', mood, genreId } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'A valid prompt string is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return graceful fallback response if API key is not configured
      res.json({
        summary: `Here are curated recommendations for "${prompt}" based on cinematic quality and genre relevance:`,
        items: [
          {
            title: 'Interstellar',
            year: '2014',
            mediaType: 'movie',
            reasoning: 'Matches atmospheric science fiction, deep narrative, and emotional scale.',
            categoryTag: 'Popular Pick',
          },
          {
            title: 'Parasite',
            year: '2019',
            mediaType: 'movie',
            reasoning: 'Masterful pacing, psychological tension, and universal critical acclaim.',
            categoryTag: 'International',
          },
          {
            title: 'Ex Machina',
            year: '2014',
            mediaType: 'movie',
            reasoning: 'A tight, thought-provoking sci-fi thriller with intense character study.',
            categoryTag: 'Underrated',
          },
          {
            title: 'Your Name.',
            year: '2016',
            mediaType: 'movie',
            reasoning: 'Visually stunning animation with deep emotional resonance.',
            categoryTag: 'Hidden Gem',
          },
        ],
      });
      return;
    }

    try {
      const systemInstruction = `You are MovieHub AI, an elite film and television curator.
Given a user query describing what they want to watch (mood, themes, specific movie comparisons, runtime preference, genres, era, etc.), output a curated set of 4 to 6 real, existing movie or TV show recommendations.

CRITICAL RULES:
1. DO NOT invent or hallucinate fake titles. Every single item must be a real, verifiable movie or TV show present on TMDB.
2. DIVERSITY REQUIREMENT: Never return only mainstream blockbusters. Include a balanced mix:
   - 1 Popular / Familiar Choice
   - 1 Underrated Title
   - 1 International / Asian / K-Drama / Anime choice
   - 1 Hidden Gem or Unexpected Choice
3. Write concise, compelling reasons tailored specifically to the user's prompt (1 sentence per item).
4. Do NOT repeat generic choices if the user asked for something specific.
`;

      const userContent = `User query: "${prompt}"
Context filters: ${mediaType !== 'all' ? `Media Type: ${mediaType}` : ''} ${mood ? `Mood: ${mood}` : ''} ${genreId ? `Genre ID: ${genreId}` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: userContent,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'A brief 1-2 sentence overview introducing why these titles fit the query.',
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'Exact title of the movie or TV show.' },
                    originalTitle: { type: Type.STRING, description: 'Original language title if applicable.' },
                    year: { type: Type.STRING, description: 'Four-digit release year, e.g. 2014.' },
                    mediaType: { type: Type.STRING, description: '"movie" or "tv"' },
                    reasoning: { type: Type.STRING, description: 'Specific 1-sentence reason why this matches user intent.' },
                    categoryTag: { type: Type.STRING, description: 'Category such as "Popular Pick", "Underrated", "Hidden Gem", "International", or "Unexpected Choice"' },
                  },
                  required: ['title', 'mediaType', 'reasoning'],
                },
              },
            },
            required: ['summary', 'items'],
          },
        },
      });

      const responseText = response.text || '';
      const parsedData = JSON.parse(responseText);
      res.json(parsedData);
    } catch (error) {
      console.error('Error executing Gemini AI recommendation:', error);
      res.status(500).json({
        error: 'Failed to generate recommendations from Gemini AI.',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Optional Proxy for TMDB API to avoid exposing keys or CORS
  app.get('/api/tmdb/*', async (req, res) => {
    const tmdbEndpoint = req.params[0];
    const apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || '';

    const queryParams = new URLSearchParams(req.query as Record<string, string>);
    if (apiKey) {
      queryParams.set('api_key', apiKey);
    }

    const targetUrl = `https://api.themoviedb.org/3/${tmdbEndpoint}?${queryParams.toString()}`;

    try {
      const tmdbRes = await fetch(targetUrl);
      const data = await tmdbRes.json();
      res.status(tmdbRes.status).json(data);
    } catch (err) {
      res.status(502).json({ error: 'Failed to connect to TMDB service', details: String(err) });
    }
  });

  // Vite development vs production static file serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🎬  MovieHub is running!');
    console.log(`➜   Local:   http://localhost:${PORT}`);
    console.log(`➜   Network: http://0.0.0.0:${PORT}`);
    console.log('');
    console.log('🔑  API Status:');
    const geminiKey = process.env.GEMINI_API_KEY;
    const tmdbKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;
    console.log(`    GEMINI_API_KEY   : ${geminiKey && geminiKey !== 'MY_GEMINI_API_KEY' ? '✅ Set' : '❌ Not set (AI uses fallback)'}`);
    console.log(`    TMDB_API_KEY     : ${tmdbKey ? '✅ Set' : '❌ Not set (using proxy/fallback)'}`);
    console.log('');
  });
}

startServer();
