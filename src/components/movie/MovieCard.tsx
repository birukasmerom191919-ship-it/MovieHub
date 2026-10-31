
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Star, Info, Sparkles, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MediaItem } from '../../types';
import { getPosterUrl } from '../../services/tmdb';

interface MovieCardProps {
  media: MediaItem;
  onWatchTrailer?: (
    media: MediaItem,
    customTrailerKey?: string | null,
    queueList?: MediaItem[]
  ) => void;
  categoryTag?: string;
  className?: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  media,
  onWatchTrailer,
  categoryTag,
  className = '',
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const mediaType = media.media_type || 'movie';
  const title = media.title || media.name || 'Untitled';
  const releaseYear = (
    media.release_date || media.first_air_date || ''
  ).slice(0, 4);

  const detailUrl = `/${mediaType}/${media.id}`;

  const posterSrc = media.poster_path
    ? getPosterUrl(media.poster_path, 'w500')
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={`group relative flex flex-col bg-neutral-900/80 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-950/20 hover:border-neutral-700/80 transition-all ${className}`}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full bg-neutral-950 overflow-hidden">

        {/* Loading / Error Placeholder */}
        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center gap-3">
            <Film className="w-10 h-10 text-neutral-700" />
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
              {imageError || !posterSrc ? 'Poster Unavailable' : 'Loading Poster'}
            </span>
          </div>
        )}

        {/* Actual TMDB Poster */}
        {posterSrc && !imageError && (
          <img
            key={posterSrc}
            src={posterSrc}
            alt={`${title} poster`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(false);
            }}
            className={`absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ease-out ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-neutral-950/80 text-neutral-200 border border-white/10 backdrop-blur-md shadow-md">
            {mediaType === 'tv' ? 'TV' : 'Movie'}
          </span>

          {media.vote_average > 0 && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/90 text-neutral-950 border border-amber-400/50 backdrop-blur-md flex items-center gap-1 shadow-md">
              <Star className="w-3 h-3 fill-neutral-950 stroke-none" />
              {media.vote_average.toFixed(1)}
            </span>
          )}
        </div>

        {/* Category Badge */}
        {categoryTag && (
          <div className="absolute top-10 left-2.5 z-10">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              {categoryTag}
            </span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
          <div className="flex flex-col gap-2">

            {onWatchTrailer && (
              <button
                id={`card-watch-trailer-btn-${media.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onWatchTrailer(media);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-red-950/60 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Trailer</span>
              </button>
            )}

            <Link
              to={detailUrl}
              className="w-full py-2.5 px-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-neutral-700/80 backdrop-blur-md"
            >
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              <span>Details</span>
            </Link>

          </div>
        </div>
      </div>

      {/* Movie Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-neutral-900/90">
        <div>
          <Link
            to={detailUrl}
            className="group-hover:text-red-400 transition-colors"
          >
            <h4 className="text-sm font-bold text-white truncate line-clamp-1">
              {title}
            </h4>
          </Link>

          <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
            <span className="font-mono text-[11px] text-neutral-400">
              {releaseYear || 'N/A'}
            </span>

            {media.origin_country && media.origin_country.length > 0 && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-neutral-800/80 rounded border border-neutral-700/50">
                {media.origin_country[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
