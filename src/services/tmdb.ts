
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

import {
  FALLBACK_MEDIA,
  FALLBACK_GENRES,
} from '../data/fallbackData';

// ============================================
// TMDB CONFIGURATION
// ============================================

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/';

// Get API key from environment variables
const getApiKey = (): string => {
  const processKey =
    typeof process !== 'undefined'
      ? process.env?.REACT_APP_TMDB_API_KEY ||
        process.env?.TMDB_API_KEY ||
        process.env?.VITE_TMDB_API_KEY
      : '';

  const viteKey = (import.meta as any).env?.VITE_TMDB_API_KEY || '';

  return (processKey || viteKey || '').trim();
};

// ============================================
// IMAGE URL HELPERS
// ============================================

export const getPosterUrl = (
  path: string | null | undefined,
  size: 'w185' | 'w342' | 'w500' | 'original' = 'w342'
): string => {
  if (!path) return '';

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const cleanPath = path.startsWith('/')
    ? path
    : `/${path}`;

  return `${TMDB_IMAGE_BASE}${size}${cleanPath}`;
};

export const getBackdropUrl = (
  path: string | null | undefined,
  size: 'w780' | 'w1280' | 'original' = 'w1280'
): string => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=1280&auto=format&fit=crop';
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const cleanPath = path.startsWith('/')
    ? path
    : `/${path}`;

  return `${TMDB_IMAGE_BASE}${size}${cleanPath}`;
};

// ============================================
// TMDB API FETCH HELPER
// ============================================

async function fetchTMDB<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error(
      'TMDB API key is missing. Check your .env.local file.'
    );
    return null;
  }

  const searchParams = new URLSearchParams({
    ...params,
    api_key: apiKey,
    language: 'en-US',
  });

  const url = `${TMDB_API_BASE}${endpoint}?${searchParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `TMDB API Error: ${response.status} - ${endpoint}`
      );
      return null;
    }

    return await response.json() as T;

  } catch (error) {
    console.error('TMDB Network Error:', error);
    return null;
  }
}

// ============================================
// VIDEO / TRAILER HELPER
// ============================================

const findTrailer = (videos: Video[]): Video | null => {
  return (
    videos.find(
      (video) =>
        video.site === 'YouTube' &&
        video.type === 'Trailer' &&
        video.official
    ) ||
    videos.find(
      (video) =>
        video.site === 'YouTube' &&
        video.type === 'Trailer'
    ) ||
    videos.find(
      (video) =>
        video.site === 'YouTube' &&
        video.type === 'Teaser'
    ) ||
    videos.find(
      (video) => video.site === 'YouTube'
    ) ||
    null
  );
};

// ============================================
// TMDB SERVICE
// ============================================

export const tmdbService = {

  // ------------------------------------------
  // TRENDING
  // ------------------------------------------

  async getTrending(
    mediaType: 'all' | 'movie' | 'tv' = 'all',
    timeWindow: 'day' | 'week' = 'week'
  ): Promise<MediaItem[]> {

    const data = await fetchTMDB<{ results: MediaItem[] }>(
      `/trending/${mediaType}/${timeWindow}`
    );

    if (data?.results?.length) {
      return data.results.map((item) => ({
        ...item,
        media_type:
          item.media_type ||
          (mediaType === 'all' ? 'movie' : mediaType),
        title: item.title || item.name || 'Untitled',
      }));
    }

    return FALLBACK_MEDIA.trending;
  },

  // ------------------------------------------
  // POPULAR
  // ------------------------------------------

  async getPopular(
    mediaType: 'movie' | 'tv' = 'movie',
    page = 1
  ): Promise<MediaItem[]> {

    const data = await fetchTMDB<{ results: MediaItem[] }>(
      `/${mediaType}/popular`,
      { page: page.toString() }
    );

    if (data?.results?.length) {
      return data.results.map((item) => ({
        ...item,
        media_type: mediaType,
        title: item.title || item.name || 'Untitled',
      }));
    }

    return mediaType === 'movie'
      ? FALLBACK_MEDIA.popularMovies
      : FALLBACK_MEDIA.popularTV;
  },

  // ------------------------------------------
  // TOP RATED
  // ------------------------------------------

  async getTopRated(
    mediaType: 'movie' | 'tv' = 'movie',
    page = 1
  ): Promise<MediaItem[]> {

    const data = await fetchTMDB<{ results: MediaItem[] }>(
      `/${mediaType}/top_rated`,
      { page: page.toString() }
    );

    if (data?.results?.length) {
      return data.results.map((item) => ({
        ...item,
        media_type: mediaType,
        title: item.title || item.name || 'Untitled',
      }));
    }

    return FALLBACK_MEDIA.topRated;
  },

  // ------------------------------------------
  // UPCOMING
  // ------------------------------------------

  async getUpcoming(page = 1): Promise<MediaItem[]> {

    const data = await fetchTMDB<{ results: MediaItem[] }>(
      '/movie/upcoming',
      { page: page.toString() }
    );

    if (data?.results?.length) {
      return data.results.map((item) => ({
        ...item,
        media_type: 'movie',
        title: item.title || item.name || 'Upcoming Release',
      }));
    }

    return FALLBACK_MEDIA.upcoming;
  },

  // ------------------------------------------
  // NOW PLAYING
  // ------------------------------------------

  async getNowPlaying(page = 1): Promise<MediaItem[]> {

    const data = await fetchTMDB<{ results: MediaItem[] }>(
      '/movie/now_playing',
      { page: page.toString() }
    );

    if (data?.results?.length) {
      return data.results.map((item) => ({
        ...item,
        media_type: 'movie',
        title: item.title || item.name || 'In Theaters',
      }));
    }

    return FALLBACK_MEDIA.nowPlaying;
  },

  // ------------------------------------------
  // DISCOVER MOVIES AND TV
  // ------------------------------------------

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

    if (params.with_genres) {
      queryParams.with_genres = params.with_genres;
    }

    if (params.with_keywords) {
      queryParams.with_keywords = params.with_keywords;
    }

    if (params.with_origin_country) {
      queryParams.with_origin_country = params.with_origin_country;
    }

    if (params.with_original_language) {
      queryParams.with_original_language = params.with_original_language;
    }

    if (params.year) {
      if (mediaType === 'movie') {
        queryParams.primary_release_year = params.year;
      } else {
        queryParams.first_air_date_year = params.year;
      }
    }

    if (params['vote_average.gte']) {
      queryParams['vote_average.gte'] =
        params['vote_average.gte'];
    }

    const data = await fetchTMDB<{ results: MediaItem[] }>(
      `/discover/${mediaType}`,
      queryParams
    );

    if (data?.results?.length) {
      return data.results.map((item) => ({
        ...item,
        media_type: mediaType,
        title: item.title || item.name || 'Untitled',
      }));
    }

    if (
      params.with_original_language === 'ja' ||
      params.with_origin_country === 'JP'
    ) {
      return FALLBACK_MEDIA.anime;
    }

    if (
      params.with_original_language === 'ko' ||
      params.with_origin_country === 'KR'
    ) {
      return FALLBACK_MEDIA.kdrama;
    }

    return FALLBACK_MEDIA.hiddenGems;
  },

  // ------------------------------------------
  // ANIME
  // ------------------------------------------

  async getAnime(): Promise<MediaItem[]> {
    return this.discover({
      mediaType: 'tv',
      with_genres: '16',
      with_original_language: 'ja',
      sort_by: 'popularity.desc',
    });
  },

  // ------------------------------------------
  // K-DRAMA
  // ------------------------------------------

  async getKDramas(): Promise<MediaItem[]> {
    return this.discover({
      mediaType: 'tv',
      with_origin_country: 'KR',
      with_original_language: 'ko',
      sort_by: 'popularity.desc',
    });
  },

  // ------------------------------------------
  // HIDDEN GEMS
  // ------------------------------------------

  async getHiddenGems(): Promise<MediaItem[]> {

    const movies = await this.discover({
      mediaType: 'movie',
      'vote_average.gte': '7.5',
      sort_by: 'vote_count.desc',
      page: 2,
    });

    return movies.length
      ? movies
      : FALLBACK_MEDIA.hiddenGems;
  },

  // ------------------------------------------
  // INTERNATIONAL CINEMA
  // ------------------------------------------

  async getInternationalCinema(): Promise<MediaItem[]> {

    const movies = await this.discover({
      mediaType: 'movie',
      'vote_average.gte': '7.0',
      sort_by: 'popularity.desc',
    });

    return movies.length
      ? movies
      : FALLBACK_MEDIA.international;
  },

  // ------------------------------------------
  // MEDIA DETAILS
  // ------------------------------------------

  async getDetails(
    id: number,
    mediaType: 'movie' | 'tv' = 'movie'
  ): Promise<MediaDetail> {

    const [
      data,
      videosRes,
      creditsRes,
      providersRes,
      similarRes,
      recsRes,
    ] = await Promise.all([

      fetchTMDB<MediaItem>(`/${mediaType}/${id}`),

      fetchTMDB<{ results: Video[] }>(
        `/${mediaType}/${id}/videos`
      ),

      fetchTMDB<{
        cast: CastMember[];
        crew: CrewMember[];
      }>(`/${mediaType}/${id}/credits`),

      fetchTMDB<{
        results: Record<string, WatchProvidersResult>;
      }>(`/${mediaType}/${id}/watch/providers`),

      fetchTMDB<{ results: MediaItem[] }>(
        `/${mediaType}/${id}/similar`
      ),

      fetchTMDB<{ results: MediaItem[] }>(
        `/${mediaType}/${id}/recommendations`
      ),

    ]);

    if (data) {

      const videos = videosRes?.results || [];

      const cast = creditsRes?.cast?.slice(0, 15) || [];

      const crew = creditsRes?.crew?.slice(0, 10) || [];

      const watchProviders =
        providersRes?.results?.US ||
        providersRes?.results?.GB ||
        Object.values(providersRes?.results || {})[0] ||
        null;

      const rawSimilar = (similarRes?.results || []).map(
        (item) => ({
          ...item,
          media_type: mediaType,
          title: item.title || item.name || '',
        })
      );

      const rawRecs = (recsRes?.results || []).map(
        (item) => ({
          ...item,
          media_type: mediaType,
          title: item.title || item.name || '',
        })
      );

      const similar =
        rawSimilar.length >= 10
          ? rawSimilar
          : [
              ...rawSimilar,
              ...rawRecs,
              ...FALLBACK_MEDIA.popularMovies,
            ]
              .filter(
                (item, index, self) =>
                  item.id !== id &&
                  index === self.findIndex(
                    (other) => other.id === item.id
                  )
              )
              .slice(0, 20);

      const recommendations =
        rawRecs.length >= 10
          ? rawRecs
          : [
              ...rawRecs,
              ...FALLBACK_MEDIA.topRated,
              ...FALLBACK_MEDIA.trending,
            ]
              .filter(
                (item, index, self) =>
                  item.id !== id &&
                  index === self.findIndex(
                    (other) => other.id === item.id
                  )
              )
              .slice(0, 20);

      const trailer = findTrailer(videos);

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

    // Fallback details
    const fallbackItem =
      Object.values(FALLBACK_MEDIA)
        .flat()
        .find((item) => item.id === id) ||
      FALLBACK_MEDIA.trending[0];

    return {
      ...fallbackItem,
      media_type: mediaType,
      title: fallbackItem.title || fallbackItem.name || 'Untitled',

      cast: [
        {
          id: 101,
          name: 'Lead Performer',
          character: 'Main Role',
          profile_path: null,
        },
        {
          id: 102,
          name: 'Co-Star',
          character: 'Supporting Role',
          profile_path: null,
        },
      ],

      crew: [
        {
          id: 201,
          name: 'Renowned Director',
          job: 'Director',
          department: 'Directing',
          profile_path: null,
        },
      ],

      videos: fallbackItem.trailerKey
        ? [
            {
              id: '1',
              key: fallbackItem.trailerKey,
              name: 'Official Trailer',
              site: 'YouTube',
              type: 'Trailer',
              official: true,
              published_at: '',
              size: 1080,
            },
          ]
        : [],

      watchProviders: {
        flatrate: [
          {
            provider_id: 8,
            provider_name: 'Netflix',
            logo_path: '/pbpMk2v1mmyA8M1s2M1m.jpg',
          },
        ],
        rent: [
          {
            provider_id: 2,
            provider_name: 'Apple TV',
            logo_path: '/peA1aY9G2.jpg',
          },
        ],
      },

      similar: [
        ...FALLBACK_MEDIA.popularMovies,
        ...FALLBACK_MEDIA.trending,
      ]
        .filter((item) => item.id !== id)
        .slice(0, 18),

      recommendations: [
        ...FALLBACK_MEDIA.topRated,
        ...FALLBACK_MEDIA.hiddenGems,
      ]
        .filter((item) => item.id !== id)
        .slice(0, 18),

      trailerKey: fallbackItem.trailerKey || null,
    };
  },

  // ------------------------------------------
  // GET TRAILER
  // ------------------------------------------


async getTrailer(
  id: number,
  mediaType: 'movie' | 'tv' = 'movie'
): Promise<Video | null> {
  try {
    const data = await fetchTMDB<{ results: Video[] }>(
      `/${mediaType}/${id}/videos`
    );

    const videos = data?.results || [];

    // Prefer official YouTube trailers
    const trailer =
      videos.find(
        (video) =>
          video.site === 'YouTube' &&
          video.type === 'Trailer' &&
          video.official
      ) ||
      videos.find(
        (video) =>
          video.site === 'YouTube' &&
          video.type === 'Trailer'
      ) ||
      videos.find(
        (video) => video.site === 'YouTube'
      );

    if (trailer) return trailer;

    // Check local fallback data
    const fallback = Object.values(FALLBACK_MEDIA)
      .flat()
      .find((item) => item.id === id);

    if (fallback?.trailerKey) {
      return {
        id: `fallback-${id}`,
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
  } catch (error) {
    console.error('TMDB trailer request failed:', error);
    return null;
  }
},


  // ------------------------------------------
  // SEARCH
  // ------------------------------------------

  async search(
    query: string,
    filters: SearchFilters = {}
  ): Promise<MediaItem[]> {

    if (!query.trim()) return [];

    const mediaType =
      filters.mediaType === 'all'
        ? 'multi'
        : filters.mediaType || 'multi';

    const endpoint =
      mediaType === 'multi'
        ? '/search/multi'
        : `/search/${mediaType}`;

    const data = await fetchTMDB<{ results: MediaItem[] }>(
      endpoint,
      { query: query.trim() }
    );

    if (data?.results) {

      let results = data.results
        .filter(
          (item) =>
            item.media_type === 'movie' ||
            item.media_type === 'tv' ||
            (!item.media_type && mediaType !== 'multi')
        )
        .map((item) => ({
          ...item,
          media_type: (
            item.media_type ||
            (mediaType === 'tv' ? 'tv' : 'movie')
          ) as 'movie' | 'tv',
          title: item.title || item.name || 'Untitled',
        }));

      if (filters.genre) {
        const genreId = Number(filters.genre);

        results = results.filter(
          (item) => item.genre_ids?.includes(genreId)
        );
      }

      if (filters.minRating) {
        results = results.filter(
          (item) => item.vote_average >= filters.minRating!
        );
      }

      if (filters.year) {
        const targetYear = filters.year.toString();

        results = results.filter((item) =>
          (
            item.release_date ||
            item.first_air_date ||
            ''
          ).startsWith(targetYear)
        );
      }

      return results;
    }

    // Local fallback search
    const allFallback = Object.values(FALLBACK_MEDIA).flat();

    const searchTerm = query.toLowerCase();

    return allFallback.filter(
      (item) =>
        (item.title || item.name || '')
          .toLowerCase()
          .includes(searchTerm) ||
        (item.overview || '')
          .toLowerCase()
          .includes(searchTerm)
    );
  },

  // ------------------------------------------
  // GENRES
  // ------------------------------------------

  async getGenres(
    mediaType: 'movie' | 'tv' = 'movie'
  ): Promise<Genre[]> {

    const data = await fetchTMDB<{ genres: Genre[] }>(
      `/genre/${mediaType}/list`
    );

    if (data?.genres) {
      return data.genres;
    }

    return FALLBACK_GENRES;
  },

};
