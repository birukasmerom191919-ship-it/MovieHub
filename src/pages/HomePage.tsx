import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  Star,
  Sparkles,
  Clapperboard,
  Tv,
  Globe,
  Film,
  Compass,
  Smile,
  Zap,
  Shield,
} from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { MediaItem } from '../types';
import { Hero } from '../components/hero/Hero';
import { MovieRail } from '../components/movie/MovieRail';
import { FALLBACK_MEDIA } from '../data/fallbackData';

interface HomePageProps {
  onWatchTrailer: (media: MediaItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onWatchTrailer }) => {
  const [heroItems, setHeroItems] = useState<MediaItem[]>([]);
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [anime, setAnime] = useState<MediaItem[]>([]);
  const [kdramas, setKdramas] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [hiddenGems, setHiddenGems] = useState<MediaItem[]>([]);
  const [international, setInternational] = useState<MediaItem[]>([]);
  const [nowPlaying, setNowPlaying] = useState<MediaItem[]>([]);
  const [upcoming, setUpcoming] = useState<MediaItem[]>([]);

  // Genre specific rails
  const [scifi, setScifi] = useState<MediaItem[]>([]);
  const [action, setAction] = useState<MediaItem[]>([]);
  const [comedy, setComedy] = useState<MediaItem[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAllContent() {
      try {
        const [
          trendData,
          popMovData,
          popTvData,
          animeData,
          kdramaData,
          topData,
          gemData,
          intlData,
          nowData,
          upData,
          scifiData,
          actionData,
          comedyData,
        ] = await Promise.all([
          tmdbService.getTrending('all'),
          tmdbService.getPopular('movie'),
          tmdbService.getPopular('tv'),
          tmdbService.getAnime(),
          tmdbService.getKDramas(),
          tmdbService.getTopRated('movie'),
          tmdbService.getHiddenGems(),
          tmdbService.getInternationalCinema(),
          tmdbService.getNowPlaying(),
          tmdbService.getUpcoming(),
          tmdbService.discover({ with_genres: '878' }),
          tmdbService.discover({ with_genres: '28' }),
          tmdbService.discover({ with_genres: '35' }),
        ]);

        if (isMounted) {
          setTrending(trendData);
          // Pass full set of trending + popular items into hero items queue
          const fullQueue = [...trendData, ...popMovData].filter(
            (item, index, self) => self.findIndex((m) => m.id === item.id) === index
          );
          setHeroItems(fullQueue.length > 0 ? fullQueue : trendData);
          setPopularMovies(popMovData);
          setPopularTV(popTvData);
          setAnime(animeData);
          setKdramas(kdramaData);
          setTopRated(topData);
          setHiddenGems(gemData);
          setInternational(intlData);
          setNowPlaying(nowData);
          setUpcoming(upData);
          setScifi(scifiData);
          setAction(actionData);
          setComedy(comedyData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading homepage rails:', err);
        if (isMounted) {
          setHeroItems(FALLBACK_MEDIA.hero);
          setTrending(FALLBACK_MEDIA.trending);
          setPopularMovies(FALLBACK_MEDIA.popularMovies);
          setPopularTV(FALLBACK_MEDIA.popularTV);
          setAnime(FALLBACK_MEDIA.anime);
          setKdramas(FALLBACK_MEDIA.kdrama);
          setTopRated(FALLBACK_MEDIA.topRated);
          setHiddenGems(FALLBACK_MEDIA.hiddenGems);
          setLoading(false);
        }
      }
    }

    loadAllContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-neutral-950 text-white pb-20"
    >
      {/* Featured Hero Section */}
      <Hero
        featuredItems={heroItems.length > 0 ? heroItems : FALLBACK_MEDIA.hero}
        onWatchTrailer={onWatchTrailer}
      />

      {/* Main Content Rails */}
      <div className="relative z-10 space-y-4 -mt-8">
        {/* Trending Rail */}
        <MovieRail
          title="Trending Now"
          subtitle="The most popular titles being watched right now across movies and TV"
          items={trending}
          icon={Flame}
          badge="HOT"
          onWatchTrailer={onWatchTrailer}
        />

        {/* Popular Movies */}
        <MovieRail
          title="Popular Movies"
          subtitle="Top blockbuster movies trending worldwide"
          items={popularMovies}
          icon={Clapperboard}
          onWatchTrailer={onWatchTrailer}
        />

        {/* Popular TV Shows */}
        <MovieRail
          title="Popular TV Shows"
          subtitle="Binge-worthy series and ongoing television hits"
          items={popularTV}
          icon={Tv}
          onWatchTrailer={onWatchTrailer}
        />

        {/* Anime Rail */}
        <MovieRail
          title="Anime & Japanese Cinema"
          subtitle="Masterpiece animation, series, and feature films"
          items={anime}
          icon={Zap}
          badge="JAPAN"
          onWatchTrailer={onWatchTrailer}
        />

        {/* K-Drama Rail */}
        <MovieRail
          title="K-Dramas & Asian Cinema"
          subtitle="High-rated Korean dramas, thrillers, and romance"
          items={kdramas}
          icon={Globe}
          badge="KOREA"
          onWatchTrailer={onWatchTrailer}
        />

        {/* Top Rated */}
        <MovieRail
          title="Top Rated Classics"
          subtitle="Highest critically acclaimed films of all time"
          items={topRated}
          icon={Star}
          onWatchTrailer={onWatchTrailer}
        />

        {/* Hidden Gems */}
        <MovieRail
          title="Hidden Gems & Underrated"
          subtitle="Overlooked masterworks worthy of discovery"
          items={hiddenGems}
          icon={Sparkles}
          badge="MUST SEE"
          onWatchTrailer={onWatchTrailer}
        />

        {/* International Cinema */}
        <MovieRail
          title="International Cinema"
          subtitle="Award-winning global cinema from every corner of the world"
          items={international}
          icon={Globe}
          onWatchTrailer={onWatchTrailer}
        />

        {/* Sci-Fi */}
        <MovieRail
          title="Sci-Fi & Cyberpunk"
          subtitle="Futuristic worlds, space exploration, and time travel"
          items={scifi}
          icon={Zap}
          onWatchTrailer={onWatchTrailer}
        />

        {/* Action & Adventure */}
        <MovieRail
          title="High-Octane Action"
          subtitle="Adrenaline-pumping martial arts, blockbusters, and thrillers"
          items={action}
          icon={Shield}
          onWatchTrailer={onWatchTrailer}
        />

        {/* Comedy */}
        <MovieRail
          title="Comedy & Feel-Good"
          subtitle="Hilarious movies and lighthearted shows for tonight"
          items={comedy}
          icon={Smile}
          onWatchTrailer={onWatchTrailer}
        />

        {/* Now Playing */}
        <MovieRail
          title="Now Playing in Theaters"
          subtitle="Latest releases currently playing on the big screen"
          items={nowPlaying}
          icon={Film}
          onWatchTrailer={onWatchTrailer}
        />

        {/* Upcoming */}
        <MovieRail
          title="Upcoming Releases"
          subtitle="Anticipated titles coming soon to theaters and streaming"
          items={upcoming}
          icon={Compass}
          onWatchTrailer={onWatchTrailer}
        />
      </div>
    </motion.div>
  );
};

