import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, Film, AlertCircle } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { MediaItem, Genre } from '../types';
import { MovieCard } from '../components/movie/MovieCard';

interface SearchPageProps {
  onWatchTrailer: (media: MediaItem, customTrailerKey?: string | null, queueList?: MediaItem[]) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onWatchTrailer }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [minRating, setMinRating] = useState<string>('');

  const [genres, setGenres] = useState<Genre[]>([]);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce input search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.trim()) {
        setSearchParams({ q: query.trim() });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  // Sync state if URL query changes
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
      setDebouncedQuery(urlQuery);
    }
  }, [searchParams]);

  // Load genres
  useEffect(() => {
    tmdbService.getGenres('movie').then(setGenres);
  }, []);

  // Perform search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    async function executeSearch() {
      try {
        const searchRes = await tmdbService.search(debouncedQuery, {
          genre: selectedGenre,
          year: selectedYear,
          minRating: minRating ? Number(minRating) : undefined,
          mediaType,
        });

        if (isMounted) {
          setResults(searchRes);
          setLoading(false);
        }
      } catch (err) {
        console.error('Search failed:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    executeSearch();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, selectedGenre, selectedYear, mediaType, minRating]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-10 w-full">
      {/* Search Header Bar */}
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 text-center">
          Search MovieHub
        </h1>
        <div className="relative flex items-center shadow-2xl">
          <Search className="w-5 h-5 absolute left-4 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by movie name, TV series, franchise, or actor..."
            className="w-full bg-neutral-900 text-white placeholder-neutral-500 text-sm sm:text-base rounded-2xl pl-12 pr-4 py-4 border border-neutral-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
            autoFocus
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl mb-8 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Media Type */}
          <div className="flex items-center p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            <button
              onClick={() => setMediaType('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                mediaType === 'all' ? 'bg-red-600 text-white' : 'text-neutral-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setMediaType('movie')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                mediaType === 'movie' ? 'bg-red-600 text-white' : 'text-neutral-400'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setMediaType('tv')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                mediaType === 'tv' ? 'bg-red-600 text-white' : 'text-neutral-400'
              }`}
            >
              TV
            </button>
          </div>

          {/* Genre */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-neutral-950 text-white text-xs rounded-xl px-3 py-2 border border-neutral-800 focus:outline-none"
          >
            <option value="">All Genres</option>
            {genres.map((g, idx) => (
              <option key={`search-genre-${g.id}-${idx}`} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Rating */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="bg-neutral-950 text-white text-xs rounded-xl px-3 py-2 border border-neutral-800 focus:outline-none"
          >
            <option value="">Any Rating</option>
            <option value="8.0">★ 8.0+</option>
            <option value="7.0">★ 7.0+</option>
          </select>
        </div>

        {debouncedQuery && (
          <span className="text-neutral-400 font-medium">
            Found {results.length} results for "{debouncedQuery}"
          </span>
        )}
      </div>

      {/* Results View */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-neutral-400">Searching TMDB library...</p>
        </div>
      ) : !debouncedQuery.trim() ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <Film className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Start Discovering</h3>
          <p className="text-xs text-neutral-400">
            Type any title or keyword above to find verified TMDB movies, TV shows, and watch official trailers.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="py-16 text-center max-w-md mx-auto p-8 bg-neutral-900/40 border border-neutral-800 rounded-2xl">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Matching Titles Found</h3>
          <p className="text-xs text-neutral-400">
            We couldn't find any results matching "{debouncedQuery}". Try checking for spelling errors or clearing filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {results.map((item, index) => (
            <MovieCard
              key={`search-${item.id}-${index}`}
              media={item}
              onWatchTrailer={(m, key, queue) => onWatchTrailer(m, key ?? null, queue ?? results)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
