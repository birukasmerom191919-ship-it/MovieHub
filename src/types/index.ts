export type MediaType = 'movie' | 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface MediaItem {
  id: number;
  title?: string; // Movie title or TV name
  original_title?: string;
  name?: string; // TV title
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: MediaType;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  status?: string;
  spoken_languages?: { english_name: string; iso_639_1: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  origin_country?: string[];
  popularity?: number;
  adult?: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string; // 'YouTube', etc.
  type: string; // 'Trailer', 'Teaser', 'Clip'
  official: boolean;
  published_at: string;
  size: number;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority?: number;
}

export interface WatchProvidersResult {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  ads?: WatchProvider[];
  free?: WatchProvider[];
}

export interface MediaDetail extends MediaItem {
  cast: CastMember[];
  crew: CrewMember[];
  videos: Video[];
  watchProviders: WatchProvidersResult | null;
  similar: MediaItem[];
  recommendations: MediaItem[];
  trailerKey?: string | null;
}

export interface AIRecommendationRequest {
  prompt: string;
  genreId?: number;
  mediaType?: 'movie' | 'tv' | 'all';
  mood?: string;
}

export interface AIRecommendationItem {
  title: string;
  originalTitle?: string;
  year?: string;
  mediaType?: MediaType;
  reasoning: string;
  matchedMedia?: MediaItem;
}

export interface AIRecommendationResponse {
  summary: string;
  items: AIRecommendationItem[];
}

export interface SearchFilters {
  genre?: number | string;
  year?: string | number;
  minRating?: number;
  language?: string;
  sortBy?: string;
  mediaType?: 'movie' | 'tv' | 'all';
}
