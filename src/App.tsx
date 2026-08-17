import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { SidebarNav } from './components/navigation/SidebarNav';
import { Logo } from './components/navigation/Logo';
import { TrailerModal } from './components/trailer/TrailerModal';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { SearchPage } from './pages/SearchPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { MediaItem } from './types';

// ScrollToTop component ensures navigating to any route resets scroll to top
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);

  return null;
}

export default function App() {
  const [trailerMedia, setTrailerMedia] = useState<MediaItem | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [explicitTrailerKey, setExplicitTrailerKey] = useState<string | null>(null);
  const [trailerQueue, setTrailerQueue] = useState<MediaItem[]>([]);

  const handleOpenTrailer = (
    media: MediaItem,
    customTrailerKey?: string | null,
    queueList?: MediaItem[]
  ) => {
    setTrailerMedia(media);
    setExplicitTrailerKey(customTrailerKey || null);
    if (queueList && queueList.length > 0) {
      setTrailerQueue(queueList);
    } else if (!trailerQueue || trailerQueue.length === 0) {
      setTrailerQueue([media]);
    }
    setIsTrailerOpen(true);
  };

  const handleCloseTrailer = () => {
    setIsTrailerOpen(false);
    setTrailerMedia(null);
    setExplicitTrailerKey(null);
  };

  const handleSelectFromQueue = (media: MediaItem) => {
    setTrailerMedia(media);
    setExplicitTrailerKey(null);
  };

  const handleNavScroll = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
        {/* Floating Glassmorphic Sidebar */}
        <SidebarNav />

        {/* Main Content Area offset for desktop sidebar */}
        <div className="flex-1 lg:pl-24 transition-all duration-300">
          <main className="min-h-[calc(100vh-120px)]">
            <Routes>
              <Route path="/" element={<HomePage onWatchTrailer={handleOpenTrailer} />} />
              <Route path="/discover" element={<DiscoverPage onWatchTrailer={handleOpenTrailer} />} />
              <Route path="/search" element={<SearchPage onWatchTrailer={handleOpenTrailer} />} />
              <Route path="/:type/:id" element={<MovieDetailsPage onWatchTrailer={handleOpenTrailer} />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-neutral-950 border-t border-neutral-800/80 py-10 px-4 sm:px-6 lg:px-10 text-neutral-400 text-xs">
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <Logo size="md" onClick={handleNavScroll} />
                <p className="text-neutral-500 text-xs pl-1">Official TMDB movie & TV show discovery platform.</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-400 font-medium">
                <Link to="/" onClick={handleNavScroll} className="hover:text-white transition-colors cursor-pointer">
                  Home
                </Link>
                <Link to="/discover" onClick={handleNavScroll} className="hover:text-white transition-colors cursor-pointer">
                  Discover
                </Link>
                <Link to="/discover?type=movie" onClick={handleNavScroll} className="hover:text-white transition-colors cursor-pointer">
                  Movies
                </Link>
                <Link to="/discover?type=tv" onClick={handleNavScroll} className="hover:text-white transition-colors cursor-pointer">
                  TV Shows
                </Link>
                <Link to="/discover?filter=asian" onClick={handleNavScroll} className="hover:text-white transition-colors cursor-pointer">
                  Anime & K-Drama
                </Link>
                <Link to="/search" onClick={handleNavScroll} className="hover:text-white transition-colors cursor-pointer">
                  Search
                </Link>
              </div>

              <div className="text-center md:text-right text-neutral-500 text-[11px] leading-relaxed">
                <p>Powered by TMDB Official API</p>
                <p>© {new Date().getFullYear()} MovieHub. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>

        {/* Global Embedded Trailer Modal with Queue Support */}
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={handleCloseTrailer}
          media={trailerMedia}
          explicitTrailerKey={explicitTrailerKey}
          queue={trailerQueue}
          onSelectMedia={handleSelectFromQueue}
        />
      </div>
    </BrowserRouter>
  );
}
