import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { MediaItem } from '../../types';
import { MovieCard } from './MovieCard';

interface MovieRailProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  icon?: LucideIcon;
  onWatchTrailer?: (media: MediaItem, customTrailerKey?: string | null, queueList?: MediaItem[]) => void;
  badge?: string;
}

export const MovieRail: React.FC<MovieRailProps> = ({
  title,
  subtitle,
  items,
  icon: Icon,
  onWatchTrailer,
  badge,
}) => {
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (railRef.current) {
      const scrollAmount = railRef.current.clientWidth * 0.75;
      railRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (railRef.current && Math.abs(e.deltaX) < Math.abs(e.deltaY) && e.deltaY !== 0) {
      // Optional side scroll if shift held or smooth horizontal feel
      if (e.shiftKey) {
        railRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="py-6 relative group/rail">
      {/* Header aligned to the left corner */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mb-3 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-red-500 shrink-0" />}
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-red-400 border border-red-500/30 uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Scroll Control Arrows (Right Side) */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Rail with clean padding so cards are never covered */}
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div
          ref={railRef}
          onWheel={handleWheel}
          className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((media, index) => (
            <div key={`${title}-${media.id}-${index}`} className="w-[150px] sm:w-[180px] md:w-[210px] shrink-0">
              <MovieCard
                media={media}
                onWatchTrailer={(m) => onWatchTrailer && onWatchTrailer(m, null, items)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
