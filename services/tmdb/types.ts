export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface Creator {
  id: number;
  name: string;
  profile_path: string | null;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
  vote_average: number;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
}

export interface SeriesListItem {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
}

export interface SeriesDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  tagline: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  status: string;
  type: string;
  in_production: boolean;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  genres: Genre[];
  networks: Network[];
  production_companies: ProductionCompany[];
  created_by: Creator[];
  seasons: Season[];
  origin_country: string[];
  original_language: string;
  languages: string[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  homepage: string;
  aggregate_credits?: AggregateCredits;
  videos?: { results: Video[] };
  images?: SeriesImages;
  recommendations?: TMDBPaginatedResponse<SeriesListItem>;
  similar?: TMDBPaginatedResponse<SeriesListItem>;
  keywords?: { results: Keyword[] };
  content_ratings?: { results: ContentRating[] };
  "watch/providers"?: { results: Record<string, WatchProvidersByCountry> };
  next_episode_to_air?: Episode | null;
  last_episode_to_air?: Episode | null;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface WatchProvidersByCountry {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  ads?: WatchProvider[];
  free?: WatchProvider[];
}

export interface CastMember {
  id: number;
  name: string;
  original_name: string;
  profile_path: string | null;
  character: string;
  order: number;
  total_episode_count: number;
  roles: { character: string; episode_count: number }[];
}

export interface CrewMember {
  id: number;
  name: string;
  original_name: string;
  profile_path: string | null;
  department: string;
  job: string;
  total_episode_count: number;
  jobs: { job: string; episode_count: number }[];
}

export interface AggregateCredits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface SeriesImage {
  file_path: string;
  width: number;
  height: number;
  vote_average: number;
  vote_count: number;
}

export interface SeriesImages {
  backdrops: SeriesImage[];
  logos: SeriesImage[];
  posters: SeriesImage[];
}

export interface SeasonDetails {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  air_date: string | null;
  poster_path: string | null;
  vote_average: number;
  episodes: Episode[];
}

export interface Keyword {
  id: number;
  name: string;
}

export interface ContentRating {
  iso_3166_1: string;
  rating: string;
  descriptors: string[];
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  popularity: number;
  known_for_department: string;
}

export type SeriesStatus = 'Returning Series' | 'Ended' | 'Canceled' | 'In Production' | 'Planned' | 'Pilot';

export type SortBy =
  | 'popularity.asc' | 'popularity.desc'
  | 'vote_average.asc' | 'vote_average.desc'
  | 'vote_count.asc' | 'vote_count.desc'
  | 'first_air_date.asc' | 'first_air_date.desc'
  | 'name.asc' | 'name.desc';

export interface DiscoverTVParams {
  page?: number;
  sort_by?: SortBy;
  with_genres?: string;
  without_genres?: string;
  first_air_date_year?: number;
  'first_air_date.gte'?: string;
  'first_air_date.lte'?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  'vote_count.gte'?: number;
  with_original_language?: string;
  with_origin_country?: string;
  with_networks?: number;
  with_status?: string;
  with_type?: string;
  'with_runtime.gte'?: number;
  'with_runtime.lte'?: number;
  include_null_first_air_dates?: boolean;
  language?: string;
}
