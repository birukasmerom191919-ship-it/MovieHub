import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Film, Loader2, Play, ExternalLink } from 'lucide-react';
import { MediaItem } from '../../types';
import { tmdbService } from '../../services/tmdb';
import { FALLBACK_MEDIA, FallbackMediaItem } from '../../data/fallbackData';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem | null;
  explicitTrailerKey?: string | null;
  queue?: MediaItem[];
  onSelectMedia?: (media: MediaItem) => void;
}

const WEB_VIDEO_SOURCES = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
];

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  media,
  explicitTrailerKey,
}) => {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [useNativeFallback, setUseNativeFallback] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !media) {
      setTrailerKey(null);
      setLoading(false);
      setUseNativeFallback(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setUseNativeFallback(false);
    setTrailerKey(null);

    async function loadTrailer() {
      if (explicitTrailerKey) {
        if (isMounted) {
          setTrailerKey(explicitTrailerKey);
          setLoading(false);
        }
        return;
      }

      if ((media as any).trailerKey) {
        if (isMounted) {
          setTrailerKey((media as any).trailerKey);
          setLoading(false);
        }
        return;
      }

      try {
        const mediaType = media?.media_type || 'movie';
        const videoData = await tmdbService.getTrailer(media!.id, mediaType);
        if (isMounted) {
          if (videoData && videoData.key) {
            setTrailerKey(videoData.key);
          } else {
            const mediaTitle = media!.title || media!.name || '';
            const allFallbacks = Object.values(FALLBACK_MEDIA).flat() as FallbackMediaItem[];
            const fallbackObj = allFallbacks.find(
              (f) => f.id === media!.id || (f.title || f.name) === mediaTitle
            );

            if (fallbackObj && fallbackObj.trailerKey) {
              setTrailerKey(fallbackObj.trailerKey);
            } else {
              setTrailerKey(`search:${mediaTitle}`);
            }
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const mediaTitle = media!.title || media!.name || 'Movie';
          setTrailerKey(`search:${mediaTitle}`);
          setLoading(false);
        }
      }
    }

    loadTrailer();

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, media, explicitTrailerKey, onClose]);

  if (!isOpen || !media) return null;

  const title = media.title || media.name || 'Trailer';
  const releaseYear = (media.release_date || media.first_air_date || '').slice(0, 4);

  const youtubeSearchOrWatchUrl = trailerKey?.startsWith('search:')
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent((trailerKey.replace('search:', '') || title) + ' official trailer')}`
    : `https://www.youtube.com/watch?v=${trailerKey || ''}`;

  const youtubeEmbedSrc = trailerKey?.startsWith('search:')
    ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent((trailerKey.replace('search:', '') || title) + ' official trailer')}&autoplay=1`
    : `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&playsinline=1`;

  const streamIdx = Math.abs(media.id || 0) % WEB_VIDEO_SOURCES.length;
  const mp4Stream = WEB_VIDEO_SOURCES[streamIdx];

  return (
    <AnimatePresence>
      {/* Dark Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md cursor-pointer transition-opacity"
      />

      {/* Simple Clean Trailer Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Simple Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800 text-white select-none">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <Film className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-sm font-bold text-white truncate">{title}</span>
            {releaseYear && (
              <span className="text-xs font-mono px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-md shrink-0">
                {releaseYear}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={youtubeSearchOrWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open on YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">YouTube</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="Close Trailer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Screen */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-2 text-neutral-400 py-16">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              <span className="text-xs font-medium">Loading Trailer...</span>
            </div>
          )}

          {!loading && !useNativeFallback && trailerKey && (
            <iframe
              title={`${title} Trailer`}
              src={youtubeEmbedSrc}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}

          {!loading && (useNativeFallback || !trailerKey) && (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                src={mp4Stream}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
