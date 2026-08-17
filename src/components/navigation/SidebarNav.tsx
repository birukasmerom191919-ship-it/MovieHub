import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Film,
  Compass,
  Globe,
  Clapperboard,
  Tv,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { Logo } from './Logo';

export const SidebarNav: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
      setSearchQuery('');
    }
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Film, badge: null },
    { label: 'Discover', path: '/discover', icon: Compass, badge: 'All' },
    { label: 'Movies', path: '/discover?type=movie', icon: Clapperboard, badge: null },
    { label: 'TV Shows', path: '/discover?type=tv', icon: Tv, badge: null },
    { label: 'Anime & K-Drama', path: '/discover?filter=asian', icon: Globe, badge: 'Asia' },
    { label: 'Search', path: '/search', icon: Search, badge: null },
  ];

  const checkIsActive = (path: string) => {
    const currentUrl = location.pathname + location.search;
    if (path === '/') return location.pathname === '/';
    if (path === '/discover') return location.pathname === '/discover' && !location.search;
    return currentUrl === path;
  };

  return (
    <>
      {/* Mobile Top Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-2xl border-b border-neutral-800/80 py-3 px-4 flex items-center justify-between">
        <Logo size="sm" />

        <div className="flex items-center gap-2">
          <Link
            to="/search"
            className="p-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 cursor-pointer"
            aria-label="Toggle Mobile Menu"
          >
            {mobileOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5 text-neutral-200" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden fixed inset-x-0 top-[57px] bottom-0 z-40 bg-neutral-950/98 backdrop-blur-2xl p-6 flex flex-col justify-between overflow-y-auto border-b border-neutral-800"
          >
            <div className="space-y-6">
              {/* Mobile Quick Search */}
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search movies, TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 text-white placeholder-neutral-500 text-sm rounded-2xl pl-10 pr-4 py-3 border border-neutral-800 focus:border-red-500 focus:outline-none"
                />
              </form>

              {/* Navigation Links */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-3 mb-2">
                  Navigation Menu
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = checkIsActive(item.path);

                  return (
                    <Link
                      key={`mobile-nav-${item.path}-${item.label}`}
                      to={item.path}
                      onClick={() => {
                        setMobileOpen(false);
                        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                      }}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-950/50 font-bold'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800/80 text-xs text-neutral-500 text-center">
              MovieHub Cinema Platform
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Floating Sidebar Menu */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden lg:flex fixed top-0 left-0 bottom-0 z-50 flex-col justify-between py-6 px-3 transition-all duration-300 ease-out ${
          isHovered
            ? 'w-64 bg-neutral-950/98 backdrop-blur-2xl border-r border-neutral-800/80 shadow-2xl'
            : 'w-20 bg-neutral-950/40 backdrop-blur-md border-r border-neutral-900/40'
        }`}
      >
        {/* Top Header & Links */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 h-10">
            {isHovered ? (
              <Logo size="md" />
            ) : (
              <span className="text-sm font-black text-white tracking-tighter">
                M<span className="text-red-500">H</span>
              </span>
            )}
          </div>

          {/* Quick Search in Sidebar when Expanded */}
          {isHovered && (
            <motion.form
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSearchSubmit}
              className="relative px-1"
            >
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 text-white placeholder-neutral-500 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-neutral-800 focus:border-red-500 focus:outline-none transition-all shadow-inner"
              />
            </motion.form>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = checkIsActive(item.path);

              return (
                <Link
                  key={`desktop-nav-${item.path}-${item.label}`}
                  to={item.path}
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
                  className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all group/item ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 shadow-lg shadow-red-950/60 font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
                  }`}
                  title={!isHovered ? item.label : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover/item:scale-110 ${
                      isActive ? 'text-white' : 'text-neutral-400 group-hover/item:text-white'
                    }`}
                  />

                  {isHovered ? (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center justify-between w-full overflow-hidden"
                    >
                      <span className="whitespace-nowrap">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
