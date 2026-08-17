import {
  MediaItem,
  MediaDetail,
  Video,
  CastMember,
  CrewMember,
  WatchProvidersResult,
  SearchFilters,
  Genre,
} from '../types';
import { FALLBACK_MEDIA, FALLBACK_GENRES } from '../data/fallbackData';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/';

export const getPosterUrl = (path: string | null | undefined, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342'): string => {
  if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${TMDB_IMAGE_BASE}${size}/${cleanPath}`;
};

export const getBackdropUrl = (path: string | null | undefined, size: 'w780' | 'w1280' | 'original' = 'w1280'): string => {
  if (!path) return 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=1280&auto=format&fit=crop';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${TMDB_IMAGE_BASE}${size}/${cleanPath}`;
};

// Check env vars for TMDB API key
const getApiKey = (): string | null => {
  const envKey =
    (typeof process !== 'undefined' && (process.env?.TMDB_API_KEY || process.env?.VITE_TMDB_API_KEY)) ||
    ((import.meta as any).env?.VITE_TMDB_API_KEY as string) ||
    '';
  return envKey ? envKey.trim() : null;
};

// Common TMDB fetch wrapper
async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  const apiKey = getApiKey();
  const searchParams = new URLSearchParams(params);

  if (apiKey) {
    searchParams.set('api_key', apiKey);
  }

  const queryString = searchParams.toString();
  const url = apiKey
    ? `https://api.themoviedb.org/3${endpoint}?${queryString}`
    : `/api/tmdb${endpoint}?${queryString}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`TMDB API request failed (${response.status}) for ${endpoint}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Network error requesting TMDB ${endpoint}:`, error);
    return null;
  }
}

// Service functions
export const tmdbService = {
  // Fetch Trending
  async getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<MediaItem[]> {
    const data = await fetchTMDB<{ results: MediaItem[] }>(`/trending/${mediaType}/${timeWindow}`);
    if (data && data.results && data.results.length > 0) {
      return data.results.map((item) => ({
        ...item,
        media_type: item.media_type || (mediaType === 'all' ? 'movie' : mediaType),
        title: item.title || item.name || 'Untitled',
      }));
    }
    // Fallback
    return FALLBACK_MEDIA.trending;
  },

  // Popular
  async getPopular(mediaType: 'movie' | 'tv' = 'movie', page = 1): Promise<MediaItem[]> {
    const data = await fetchTMDB<{ results: MediaItem[] }>(`/${mediaType}/popular`, { page: page.toString() });
    if (data && data.results && data.results.length > 0) {
      return data.results.map((item) => ({
        ...item,
        media_type: mediaType,
        title: item.title || item.name || 'Untitled',
      }));
    }
    return mediaType === 'movie' ? FALLBACK_MEDIA.popularMovies : FALLBACK_MEDIA.popularTV;
  },

  // Top Rated
  async getTopRated(mediaType: 'movie' | 'tv' = 'movie', page = 1): Promise<MediaItem[]> {
    const data = await fetchTMDB<{ results: MediaItem[] }>(`/${mediaType}/top_rated`, { page: page.toString() });
    if (data && data.results && data.results.length > 0) {
      return data.results.map((item) => ({
        ...item,
        media_type: mediaType,
        title: item.title || item.name || 'Untitled',
      }));
    }
    return FALLBACK_MEDIA.topRated;
  },

  // Upcoming
  async getUpcoming(page = 1): Promise<MediaItem[]> {
    const data = await fetchTMDB<{ results: MediaItem[] }>('/movie/upcoming', { page: page.toString() });
    if (data && data.results && data.results.length > 0) {
      return data.results.map((item) => ({
        ...item,
        media_type: 'movie',
        title: item.title || item.name || 'Upcoming Release',
      }));
    }
    return FALLBACK_MEDIA.upcoming;
  },

  // Now Playing
  async getNowPlaying(page = 1): Promise<MediaItem[]> {
    const data = await fetchTMDB<{ results: MediaItem[] }>('/movie/now_playing', { page: page.toString() });
    if (data && data.results && data.results.length > 0) {
      return data.results.map((item) => ({
        ...item,
        media_type: 'movie',
        title: item.title || item.name || 'In Theaters',
      }));
    }
    return FALLBACK_MEDIA.nowPlaying;
  },

  // Discover with Filters (Anime, K-Drama, Genres, Language, Country)
  async discover(params: {
    mediaType?: 'movie' | 'tv';
    with_genres?: string;
    with_keywords?: string;
    with_origin_country?: string;
    with_original_language?: string;
    sort_by?: string;
    year?: string;
    'vote_average.gte'?: string;
    page?: number;
  }): Promise<MediaItem[]> {
    const mediaType = params.mediaType || 'movie';
    const queryParams: Record<string, string> = {
      page: (params.page || 1).toString(),
      sort_by: params.sort_by || 'popularity.desc',
    };

    if (params.with_genres) queryParams.with_genres = params.with_genres;
    if (params.with_keywords) queryParams.with_keywords = params.with_keywords;
    if (params.with_origin_country) queryParams.with_origin_country = params.with_origin_country;
    if (params.with_original_language) queryParams.with_original_language = params.with_original_language;
    if (params.year) {
      if (mediaType === 'movie') queryParams.primary_release_year = params.year;
      else queryParams.first_air_date_year = params.year;
    }
    if (params['vote_average.gte']) queryParams['vote_average.gte'] = params['vote_average.gte'];

    const data = await fetchTMDB<{ results: MediaItem[] }>(`/discover/${mediaType}`, queryParams);
    if (data && data.results && data.results.length > 0) {
      return data.results.map((item) => ({
        ...item,
        media_type: mediaType,
        title: item.title || item.name || 'Untitled',
      }));
    }

    // Specialized fallbacks if discover fails or no API key
    if (params.with_original_language === 'ja' || params.with_origin_country === 'JP') {
      return FALLBACK_MEDIA.anime;
    }
    if (params.with_original_language === 'ko' || params.with_origin_country === 'KR') {
      return FALLBACK_MEDIA.kdrama;
    }
    return FALLBACK_MEDIA.hiddenGems;
  },

  // Specialized collections
  async getAnime(): Promise<MediaItem[]> {
    return this.discover({
      mediaType: 'tv',
      with_genres: '16', // Animation
      with_original_language: 'ja',
      sort_by: 'popularity.desc',
    });
  },

  async getKDramas(): Promise<MediaItem[]> {
    return this.discover({
      mediaType: 'tv',
      with_origin_country: 'KR',
      with_original_language: 'ko',
      sort_by: 'popularity.desc',
    });
  },

  async getHiddenGems(): Promise<MediaItem[]> {
    const movies = await this.discover({
      mediaType: 'movie',
      'vote_average.gte': '7.5',
      sort_by: 'vote_count.desc',
      page: 2,
    });
    return movies.length > 0 ? movies : FALLBACK_MEDIA.hiddenGems;
  },

  async getInternationalCinema(): Promise<MediaItem[]> {
    const movies = await this.discover({
      mediaType: 'movie',
      'vote_average.gte': '7.0',
      sort_by: 'popularity.desc',
    });
    return movies.length > 0 ? movies : FALLBACK_MEDIA.international;
  },

  // Media Details
  async getDetails(id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<MediaDetail> {
    const data = await fetchTMDB<MediaItem>(`/${mediaType}/${id}`);
    const videosRes = await fetchTMDB<{ results: Video[] }>(`/${mediaType}/${id}/videos`);
    const creditsRes = await fetchTMDB<{ cast: CastMember[]; crew: CrewMember[] }>(`/${mediaType}/${id}/credits`);
    const providersRes = await fetchTMDB<{ results: Record<string, WatchProvidersResult> }>(
      `/${mediaType}/${id}/watch/providers`
    );
    const similarRes = await fetchTMDB<{ results: MediaItem[] }>(`/${mediaType}/${id}/similar`);
    const recsRes = await fetchTMDB<{ results: MediaItem[] }>(`/${mediaType}/${id}/recommendations`);

    if (data) {
      const videos = videosRes?.results || [];
      const cast = creditsRes?.cast?.slice(0, 15) || [];
      const crew = creditsRes?.crew?.slice(0, 10) || [];
      const watchProviders = providersRes?.results?.US || providersRes?.results?.GB || Object.values(providersRes?.results || {})[0] || null;
      const rawSimilar = (similarRes?.results || []).map((i) => ({ ...i, media_type: mediaType, title: i.title || i.name || '' }));
      const rawRecs = (recsRes?.results || []).map((i) => ({ ...i, media_type: mediaType, title: i.title || i.name || '' }));

      const similar = rawSimilar.length >= 10
        ? rawSimilar
        : [...rawSimilar, ...rawRecs, ...FALLBACK_MEDIA.popularMovies].filter(
            (item, index, self) => item.id !== id && index === self.findIndex((t) => t.id === item.id)
          ).slice(0, 20);

      const recommendations = rawRecs.length >= 10
        ? rawRecs
        : [...rawRecs, ...FALLBACK_MEDIA.topRated, ...FALLBACK_MEDIA.trending].filter(
            (item, index, self) => item.id !== id && index === self.findIndex((t) => t.id === item.id)
          ).slice(0, 20);

      // Find official trailer key
      const trailer =
        videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official) ||
        videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
        videos.find((v) => v.type === 'Teaser' && v.site === 'YouTube') ||
        videos.find((v) => v.site === 'YouTube');

      return {
        ...data,
        media_type: mediaType,
        title: data.title || data.name || 'Untitled',
        cast,
        crew,
        videos,
        watchProviders,
        similar,
        recommendations,
        trailerKey: trailer?.key || null,
      };
    }

    // Fallback details if TMDB API not available
    const fallbackItem =
      Object.values(FALLBACK_MEDIA)
        .flat()
        .find((m) => m.id === id) || FALLBACK_MEDIA.trending[0];

    return {
      ...fallbackItem,
      media_type: mediaType,
      title: fallbackItem.title || fallbackItem.name || 'Untitled',
      cast: [
        { id: 101, name: 'Lead Performer', character: 'Main Role', profile_path: null },
        { id: 102, name: 'Co-Star', character: 'Supporting Role', profile_path: null },
      ],
      crew: [{ id: 201, name: 'Renowned Director', job: 'Director', department: 'Directing', profile_path: null }],
      videos: fallbackItem.trailerKey
        ? [{ id: '1', key: fallbackItem.trailerKey, name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true, published_at: '', size: 1080 }]
        : [],
      watchProviders: {
        flatrate: [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/pbpMk2v1mmyA8M1s2M1m.jpg' }],
        rent: [{ provider_id: 2, provider_name: 'Apple TV', logo_path: '/peA1aY9G2.jpg' }],
      },
      similar: [...FALLBACK_MEDIA.popularMovies, ...FALLBACK_MEDIA.trending].filter((m) => m.id !== id).slice(0, 18),
      recommendations: [...FALLBACK_MEDIA.topRated, ...FALLBACK_MEDIA.hiddenGems].filter((m) => m.id !== id).slice(0, 18),
      trailerKey: fallbackItem.trailerKey || 'dQw4w9WgXcQ',
    };
  },

  // Get Video Trailers directly
  async getTrailer(id: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<Video | null> {
    const data = await fetchTMDB<{ results: Video[] }>(`/${mediaType}/${id}/videos`);
    if (data && data.results) {
      const trailer =
        data.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official) ||
        data.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
        data.results.find((v) => v.type === 'Teaser' && v.site === 'YouTube') ||
        data.results.find((v) => v.site === 'YouTube');
      return trailer || null;
    }

    const fallback = Object.values(FALLBACK_MEDIA)
      .flat()
      .find((m) => m.id === id);
    if (fallback && fallback.trailerKey) {
      return {
        id: 'fallback-' + id,
        key: fallback.trailerKey,
        name: `${fallback.title || fallback.name} Official Trailer`,
        site: 'YouTube',
        type: 'Trailer',
        official: true,
        published_at: '',
        size: 1080,
      };
    }
    return null;
  },

  // Search Multi
  async search(query: string, filters: SearchFilters = {}): Promise<MediaItem[]> {
    if (!query.trim()) return [];

    const mediaType = filters.mediaType === 'all' ? 'multi' : filters.mediaType || 'multi';
    const endpoint = mediaType === 'multi' ? '/search/multi' : `/search/${mediaType}`;

    const data = await fetchTMDB<{ results: MediaItem[] }>(endpoint, { query });
    if (data && data.results) {
      let results = data.results
        .filter((i) => i.media_type === 'movie' || i.media_type === 'tv' || (!i.media_type && mediaType !== 'multi'))
        .map((i) => ({
          ...i,
          media_type: (i.media_type || (mediaType === 'tv' ? 'tv' : 'movie')) as 'movie' | 'tv',
          title: i.title || i.name || 'Untitled',
        }));

      // Apply client-side filters if requested
      if (filters.genre) {
        const genreId = Number(filters.genre);
        results = results.filter((r) => r.genre_ids?.includes(genreId));
      }
      if (filters.minRating) {
        results = results.filter((r) => r.vote_average >= filters.minRating!);
      }
      if (filters.year) {
        const targetYr = filters.year.toString();
        results = results.filter((r) => (r.release_date || r.first_air_date || '').startsWith(targetYr));
      }

      return results;
    }

    // Fallback search matching query string
    const allFallback = Object.values(FALLBACK_MEDIA).flat();
    const q = query.toLowerCase();
    return allFallback.filter(
      (m) => (m.title || m.name || '').toLowerCase().includes(q) || (m.overview || '').toLowerCase().includes(q)
    );
  },

  // Genres
  async getGenres(mediaType: 'movie' | 'tv' = 'movie'): Promise<Genre[]> {
    const data = await fetchTMDB<{ genres: Genre[] }>(`/genre/${mediaType}/list`);
    if (data && data.genres) return data.genres;
    return FALLBACK_GENRES;
  },
};
