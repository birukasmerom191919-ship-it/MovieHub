
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Film, Loader2, ExternalLink, Play } from 'lucide-react';
import { MediaItem } from '../../types';
import { tmdbService } from '../../services/tmdb';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem | null;
  explicitTrailerKey?: string | null;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  media,
  explicitTrailerKey,
}) => {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !media) {
      setTrailerKey(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadTrailer = async () => {
      setLoading(true);
      setTrailerKey(null);

      try {
        const existingKey = (media as any).trailerKey;

        if (explicitTrailerKey || existingKey) {
          if (isMounted) {
            setTrailerKey(explicitTrailerKey || existingKey);
          }
          return;
        }

        const mediaType = media.media_type === 'tv' ? 'tv' : 'movie';

        const videoData = await tmdbService.getTrailer(
          media.id,
          mediaType
        );

        if (!isMounted) return;

        // Support both a single video and TMDB's results array.
        const videos = Array.isArray(videoData)
          ? videoData
          : videoData?.results ||
            (videoData?.key ? [videoData] : []);

        const trailer =
          videos.find(
            (video: any) =>
              video.site === 'YouTube' &&
              video.type === 'Trailer' &&
              video.official === true
          ) ||
          videos.find(
            (video: any) =>
              video.site === 'YouTube' &&
              video.type === 'Trailer'
          ) ||
          videos.find(
            (video: any) => video.site === 'YouTube'
          );

        setTrailerKey(trailer?.key || null);

      } catch (error) {
        console.error('Failed to load trailer:', error);

        if (isMounted) {
          setTrailerKey(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTrailer();

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, media, explicitTrailerKey, onClose]);

  if (!isOpen || !media) return null;

  const title = media.title || media.name || 'Trailer';

  const releaseYear = (
    media.release_date || media.first_air_date || ''
  ).slice(0, 4);

  const youtubeEmbedSrc = trailerKey
    ? `https://www.youtube.com/embed/${encodeURIComponent(
        trailerKey
      )}?autoplay=1&rel=0&playsinline=1`
    : '';

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${title} ${releaseYear} official trailer`
  )}`;

  const youtubeWatchUrl = trailerKey
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(trailerKey)}`
    : youtubeSearchUrl;

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800 text-white select-none">
            <div className="flex items-center gap-2.5 min-w-0 pr-4">
              <Film className="w-4 h-4 text-red-500 shrink-0" />

              <span className="text-sm font-bold truncate">
                {title}
              </span>

              {releaseYear && (
                <span className="text-xs font-mono px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-md shrink-0">
                  {releaseYear}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-red-500" />
                <span className="hidden sm:inline">YouTube</span>
              </a>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
            {loading && (
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <span className="text-xs font-medium">
                  Loading Trailer...
                </span>
              </div>
            )}

            {!loading && trailerKey && (
              <iframe
                key={trailerKey}
                title={`${title} Official Trailer`}
                src={youtubeEmbedSrc}
                className="absolute inset-0 w-full h-full border-0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}

            {!loading && !trailerKey && (
              <div className="flex flex-col items-center justify-center text-center gap-4 p-6">
                <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <Film className="w-8 h-8 text-neutral-600" />
                </div>

                <div>
                  <h3 className="text-white font-bold text-base">
                    Trailer Unavailable
                  </h3>

                  <p className="text-neutral-500 text-xs mt-2">
                    No YouTube trailer was found for {title}.
                  </p>
                </div>

                <a
                  href={youtubeSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Search Trailer on YouTube
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
};
