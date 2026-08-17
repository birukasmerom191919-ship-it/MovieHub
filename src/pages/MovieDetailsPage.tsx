import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Play,
  Star,
  Clock,
  Calendar,
  Globe,
  Film,
  User,
  Sparkles,
  ArrowLeft,
  Tv,
} from 'lucide-react';
import { tmdbService, getBackdropUrl, getPosterUrl } from '../services/tmdb';
import { MediaDetail, MediaItem } from '../types';
import { WhereToWatch } from '../components/movie/WhereToWatch';
import { MovieRail } from '../components/movie/MovieRail';

interface MovieDetailsPageProps {
  onWatchTrailer: (media: MediaItem, explicitTrailerKey?: string | null, queueList?: MediaItem[]) => void;
}

export const MovieDetailsPage: React.FC<MovieDetailsPageProps> = ({ onWatchTrailer }) => {
  const { type = 'movie', id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    const mediaId = Number(id);
    const mediaType = (type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv';

    tmdbService.getDetails(mediaId, mediaType).then((res) => {
      if (isMounted) {
        setDetail(res);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [id, type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-neutral-400">Loading movie details...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Title Not Found</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold shadow-lg cursor-pointer transition-all"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const title = detail.title || detail.name || 'Untitled';
  const releaseYear = (detail.release_date || detail.first_air_date || '').slice(0, 4);
  const runtimeMin = detail.runtime || (detail.episode_run_time ? detail.episode_run_time[0] : 0);
  const directors = detail.crew?.filter((c) => c.job === 'Director') || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-neutral-950 text-white pb-20"
    >
      {/* Top Navigation Bar with Back Button */}
      <div className="pt-16 lg:pt-6 pb-3 px-4 sm:px-6 lg:px-10 bg-neutral-950/90 border-b border-neutral-800/80 flex items-center justify-between z-20 relative">
        <button
          onClick={handleBack}
          className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-white flex items-center gap-2 text-xs font-bold shadow-lg hover:border-red-500/60 hover:text-red-400 transition-all cursor-pointer group"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4 text-red-500 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-neutral-400">
          <span className="text-neutral-500">Details</span>
          <span>/</span>
          <span className="text-neutral-200 truncate max-w-[200px] sm:max-w-[300px]">{title}</span>
        </div>
      </div>

      {/* Hero Backdrop Banner */}
      <div className="relative w-full min-h-[50vh] sm:min-h-[60vh] lg:min-h-[65vh] flex items-end justify-start bg-neutral-950 pt-8">
        <div className="absolute inset-0 z-0">
          <img
            src={getBackdropUrl(detail.backdrop_path, 'w1280')}
            alt={title}
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-75"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=1280&auto=format&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent" />
        </div>

        {/* Hero Banner Header */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 pb-10 flex flex-col md:flex-row items-center md:items-end gap-8">
          {/* Poster Card */}
          <div className="w-44 sm:w-56 lg:w-64 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-neutral-700/80 shadow-2xl shrink-0 bg-neutral-900">
            <img
              src={getPosterUrl(detail.poster_path, 'w500')}
              alt={title}
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
              }}
            />
          </div>

          {/* Details Column */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-3 text-xs">
              <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black rounded-lg uppercase tracking-wider shadow-md">
                {detail.media_type === 'tv' ? 'TV Series' : 'Movie'}
              </span>
              {detail.vote_average > 0 && (
                <span className="px-3 py-1 bg-amber-500 text-neutral-950 font-extrabold rounded-lg flex items-center gap-1 shadow-md">
                  <Star className="w-3.5 h-3.5 fill-neutral-950" />
                  {detail.vote_average.toFixed(1)} / 10 ({detail.vote_count} votes)
                </span>
              )}
              {releaseYear && (
                <span className="px-2.5 py-1 bg-neutral-900/90 text-neutral-300 border border-neutral-800 rounded-lg font-mono">
                  {releaseYear}
                </span>
              )}
              {runtimeMin > 0 && (
                <span className="px-2.5 py-1 bg-neutral-900/90 text-neutral-300 border border-neutral-800 rounded-lg flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  {runtimeMin} mins
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-2 font-display">
              {title}
            </h1>

            {detail.tagline && (
              <p className="text-amber-200/90 italic text-sm sm:text-base mb-4 font-cinematic">
                "{detail.tagline}"
              </p>
            )}

            {/* Genres */}
            {detail.genres && detail.genres.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                {detail.genres.map((g, idx) => (
                  <span
                    key={`genre-${g.id || idx}-${g.name || idx}`}
                    className="px-3.5 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-200 text-xs font-bold rounded-full shadow-md backdrop-blur-md transition-all"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Watch Trailer CTA */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <button
                id="details-watch-trailer-btn"
                onClick={() =>
                  onWatchTrailer(detail, detail.trailerKey, [detail, ...(detail.similar || [])])
                }
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-2xl shadow-red-950/80 ring-2 ring-red-500/30 hover:ring-red-400 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </div>
                <span>Watch Trailer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Story, Cast, Crew */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <section className="p-6 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
              <Film className="w-5 h-5 text-red-500" />
              Synopsis
            </h3>
            <p className="text-neutral-200 text-sm sm:text-base leading-relaxed font-body">
              {detail.overview || 'No description provided.'}
            </p>
          </section>

          {/* Cast Portrait Cards Section */}
          {detail.cast && detail.cast.length > 0 && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-red-500" />
                  Key Cast & Crew
                </h3>
                <span className="text-xs text-neutral-400 font-mono">
                  {detail.cast.length} Featured Performers
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {detail.cast.slice(0, 10).map((member, index) => (
                  <div
                    key={`cast-${member.id}-${index}`}
                    className="group relative flex flex-col bg-neutral-900/90 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-neutral-700 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative aspect-[3/4] w-full bg-neutral-950 overflow-hidden">
                      {member.profile_path ? (
                        <img
                          src={getPosterUrl(member.profile_path, 'w185')}
                          alt={member.name}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-neutral-500 p-4 text-center">
                          <User className="w-10 h-10 mb-2 opacity-50" />
                          <span className="text-xs font-bold text-neutral-400">{member.name}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    </div>

                    <div className="p-3 bg-neutral-900/95 flex flex-col justify-end">
                      <h4 className="text-xs font-extrabold text-white truncate group-hover:text-red-400 transition-colors">
                        {member.name}
                      </h4>
                      <p className="text-[11px] text-amber-400/90 font-medium truncate mt-0.5">
                        {member.character || 'Role Unspecified'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Col: Where to Watch & Metadata */}
        <div className="space-y-6">
          <WhereToWatch providers={detail.watchProviders} />

          {/* Extra Info Card */}
          <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm border-b border-neutral-800 pb-2">
              Information
            </h4>
            {directors.length > 0 && (
              <div>
                <span className="text-neutral-400 block font-semibold">Director</span>
                <span className="text-neutral-200">{directors.map((d) => d.name).join(', ')}</span>
              </div>
            )}
            {detail.status && (
              <div>
                <span className="text-neutral-400 block font-semibold">Status</span>
                <span className="text-neutral-200">{detail.status}</span>
              </div>
            )}
            {detail.spoken_languages && detail.spoken_languages.length > 0 && (
              <div>
                <span className="text-neutral-400 block font-semibold">Spoken Languages</span>
                <span className="text-neutral-200">
                  {detail.spoken_languages.map((l) => l.english_name).join(', ')}
                </span>
              </div>
            )}
            {detail.production_countries && detail.production_countries.length > 0 && (
              <div>
                <span className="text-neutral-400 block font-semibold">Production Countries</span>
                <span className="text-neutral-200">
                  {detail.production_countries.map((c) => c.name).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations & Similar Sections */}
      <div className="w-full px-4 sm:px-6 lg:px-10 pb-16 space-y-8">
        {detail.recommendations && detail.recommendations.length > 0 && (
          <MovieRail
            title="Recommended For You"
            subtitle="Curated picks based on this title and viewer ratings"
            items={detail.recommendations}
            onWatchTrailer={onWatchTrailer}
          />
        )}

        {detail.similar && detail.similar.length > 0 && (
          <MovieRail
            title="Similar Titles"
            subtitle="More titles with matching tone, theme, and genre"
            items={detail.similar}
            onWatchTrailer={onWatchTrailer}
          />
        )}
      </div>
    </motion.div>
  );
};
