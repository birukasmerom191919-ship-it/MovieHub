import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Filter, Compass, RefreshCw, Sparkles } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { MediaItem, Genre } from '../types';
import { MovieCard } from '../components/movie/MovieCard';

interface DiscoverPageProps {
  onWatchTrailer: (media: MediaItem, customTrailerKey?: string | null, queueList?: MediaItem[]) => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({ onWatchTrailer }) => {
  const [searchParams] = useSearchParams();

  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('popularity.desc');
  const [minRating, setMinRating] = useState<string>('');
  const [specialCategory, setSpecialCategory] = useState<string>('');

  const [genres, setGenres] = useState<Genre[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Synchronize state when URL query parameters change (e.g., from sidebar navigation)
  useEffect(() => {
    const filterTypeParam = searchParams.get('filter') || '';
    const mediaTypeParam = searchParams.get('type') || '';

    if (filterTypeParam) {
      setSpecialCategory(filterTypeParam);
    } else {
      setSpecialCategory('');
      if (mediaTypeParam === 'tv') {
        setMediaType('tv');
      } else if (mediaTypeParam === 'movie') {
        setMediaType('movie');
      }
    }
  }, [searchParams]);

  // Load available genres
  useEffect(() => {
    tmdbService.getGenres(mediaType).then(setGenres);
  }, [mediaType]);

  // Load items when filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadDiscover() {
      try {
        let results: MediaItem[] = [];

        if (specialCategory === 'asian') {
          const animeData = await tmdbService.getAnime();
          const kdramaData = await tmdbService.getKDramas();
          results = [...animeData, ...kdramaData];
        } else if (specialCategory === 'hidden') {
          results = await tmdbService.getHiddenGems();
        } else {
          results = await tmdbService.discover({
            mediaType,
            with_genres: selectedGenre,
            year: selectedYear,
            sort_by: selectedSort,
            'vote_average.gte': minRating,
          });
        }

        if (isMounted) {
          setItems(results);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching discover data:', err);
        if (isMounted) {
          const fallback = await tmdbService.getTrending('all');
          setItems(fallback);
          setLoading(false);
        }
      }
    }

    loadDiscover();

    return () => {
      isMounted = false;
    };
  }, [mediaType, selectedGenre, selectedYear, selectedSort, minRating, specialCategory]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen bg-neutral-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-10 w-full"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4" />
          <span>Curated Discovery Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          Discover Movies & TV
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl">
          Filter by media type, genres, release year, ratings, and international categories with official TMDB poster key art.
        </p>
      </div>

      {/* Filter Control Panel */}
      <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl mb-8 space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          {/* Media Type Toggle */}
          <div className="flex items-center p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            <button
              onClick={() => {
                setMediaType('movie');
                setSpecialCategory('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mediaType === 'movie' && !specialCategory
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => {
                setMediaType('tv');
                setSpecialCategory('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mediaType === 'tv' && !specialCategory
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              TV Series
            </button>
            <button
              onClick={() => setSpecialCategory('asian')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                specialCategory === 'asian'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Anime & K-Drama
            </button>
          </div>

          {/* Special Category Badges */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedSort('vote_average.desc');
                setMinRating('7.5');
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-amber-300 border border-amber-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Rated Only</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Genre */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setSpecialCategory('');
              }}
              className="w-full bg-neutral-950 text-white text-xs rounded-xl px-3 py-2.5 border border-neutral-800 focus:border-red-500 focus:outline-none"
            >
              <option value="">All Genres</option>
              {genres.map((g, idx) => (
                <option key={`disc-genre-${g.id}-${idx}`} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Release Year */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Release Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-neutral-950 text-white text-xs rounded-xl px-3 py-2.5 border border-neutral-800 focus:border-red-500 focus:outline-none"
            >
              <option value="">All Years</option>
              {Array.from({ length: 30 }, (_, i) => 2026 - i).map((y) => (
                <option key={`disc-year-${y}`} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full bg-neutral-950 text-white text-xs rounded-xl px-3 py-2.5 border border-neutral-800 focus:border-red-500 focus:outline-none"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="primary_release_date.desc">Newest Release</option>
              <option value="vote_count.desc">Most Reviewed</option>
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Min Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full bg-neutral-950 text-white text-xs rounded-xl px-3 py-2.5 border border-neutral-800 focus:border-red-500 focus:outline-none"
            >
              <option value="">Any Rating</option>
              <option value="8.0">★ 8.0+ Exceptional</option>
              <option value="7.0">★ 7.0+ High Quality</option>
              <option value="6.0">★ 6.0+ Good</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-neutral-400">Filtering titles through TMDB...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center p-8 bg-neutral-900/40 border border-neutral-800 rounded-2xl max-w-lg mx-auto">
          <Compass className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Titles Found</h3>
          <p className="text-xs text-neutral-400 mb-4">
            Try adjusting your filter criteria or choosing a different genre/year.
          </p>
          <button
            onClick={() => {
              setSelectedGenre('');
              setSelectedYear('');
              setMinRating('');
              setSpecialCategory('');
            }}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-xl text-neutral-200"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
        >
          {items.map((item, index) => (
            <MovieCard
              key={`disc-${item.id}-${index}`}
              media={item}
              onWatchTrailer={(m, key, queue) => onWatchTrailer(m, key ?? null, queue ?? items)}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
