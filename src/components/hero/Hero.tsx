import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Info, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MediaItem } from '../../types';
import { getBackdropUrl } from '../../services/tmdb';

interface HeroProps {
  featuredItems: MediaItem[];
  onWatchTrailer: (media: MediaItem, customTrailerKey?: string | null) => void;
}

export const Hero: React.FC<HeroProps> = ({ featuredItems, onWatchTrailer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Preload upcoming backdrop images for instant background transitions
  useEffect(() => {
    if (!featuredItems || featuredItems.length <= 1) return;
    featuredItems.forEach((item) => {
      if (item.backdrop_path) {
        const img = new Image();
        img.src = getBackdropUrl(item.backdrop_path, 'w1280');
      }
    });
  }, [featuredItems]);

  // Auto-rotate hero spotlight automatically every 5 seconds
  useEffect(() => {
    if (!featuredItems || featuredItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredItems]);

  if (!featuredItems || featuredItems.length === 0) return null;

  const current = featuredItems[currentIndex] || featuredItems[0];
  const title = current.title || current.name || 'Featured Title';
  const releaseYear = (current.release_date || current.first_air_date || '').slice(0, 4);
  const mediaType = current.media_type || 'movie';

  return (
    <div className="relative w-full min-h-[85vh] md:min-h-[90vh] flex items-end justify-start overflow-hidden bg-neutral-950 pt-20 group/hero">
      {/* Background Backdrop Art with Motion Fade & Scale */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`hero-bg-${current.id || 0}-${currentIndex}`}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <img
            src={getBackdropUrl(current.backdrop_path, 'w1280')}
            alt={title}
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1280&auto=format&fit=crop';
            }}
          />
          {/* Multi-stage Dark Gradient Overlays for optimal readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-transparent w-full md:w-4/5" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content Container - Full Width Left-Aligned */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 pb-12 pt-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        {/* Main Heading & Dynamic Content Block */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`hero-content-${current.id || 0}-${currentIndex}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-2xl text-left flex flex-col items-start"
          >
            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-3 text-xs">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold tracking-wider uppercase shadow-lg shadow-red-950/50 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Featured Spotlight
              </span>

              {current.vote_average > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900/90 text-amber-400 border border-neutral-700/80 font-bold flex items-center gap-1 backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {current.vote_average.toFixed(1)} Rating
                </span>
              )}

              {releaseYear && (
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900/90 text-neutral-300 border border-neutral-800 font-mono backdrop-blur-md">
                  {releaseYear}
                </span>
              )}

              <span className="px-2.5 py-1 rounded-lg bg-neutral-900/90 text-neutral-300 border border-neutral-800 uppercase font-semibold backdrop-blur-md">
                {mediaType === 'tv' ? 'TV Series' : 'Movie'}
              </span>
            </div>

            {/* Hero Title Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 font-display drop-shadow-2xl text-left">
              {title}
            </h1>

            {/* Overview Description */}
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed line-clamp-3 mb-6 max-w-xl font-body font-normal drop-shadow text-left">
              {current.overview}
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                id="hero-watch-trailer-btn"
                onClick={() => onWatchTrailer(current)}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-2xl shadow-red-950/80 ring-2 ring-red-500/30 hover:ring-red-400 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </div>
                <span>Watch Trailer</span>
              </button>

              <Link
                to={`/${mediaType}/${current.id}`}
                className="px-7 py-3.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700/80 hover:border-neutral-500 font-extrabold text-sm sm:text-base flex items-center gap-2 backdrop-blur-xl shadow-xl hover:scale-[1.03] active:scale-95 transition-all group"
              >
                <Info className="w-5 h-5 text-neutral-400 group-hover:text-red-400 transition-colors" />
                <span>More Details</span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
