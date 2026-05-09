export interface ShowGenre {
  id: string;
  name: string;
}

export interface ShowListItem {
  id: number;
  traktId: number | null;
  imdbId: string | null;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string | null;
  genres: ShowGenre[];
  vote_average: number;
}

export interface ShowCastMember {
  id: number;
  name: string;
  profile_path: string | null;
  character: string;
  total_episode_count: number;
  roles: { character: string; episode_count: number }[];
}

export interface ShowSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
  vote_average: number;
}

export interface ShowEpisode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  overview: string;
}

export interface ShowNetwork {
  id: number;
  name: string;
  logo_path: string | null;
}

export interface ShowDetails extends ShowListItem {
  tagline: string;
  status: string;
  number_of_seasons: number;
  number_of_episodes: number;
  networks: ShowNetwork[];
  seasons: ShowSeason[];
  cast: ShowCastMember[];
  next_episode_to_air: ShowEpisode | null;
  last_episode_to_air: ShowEpisode | null;
  related: ShowListItem[];
  homepage: string | null;
}

export interface ShowSeasonDetails {
  id: number;
  name: string;
  season_number: number;
  air_date: string | null;
  poster_path: string | null;
  vote_average: number;
  episodes: ShowEpisode[];
}

export const SHOW_GENRES: ShowGenre[] = [
  { id: 'action', name: 'Action' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'animation', name: 'Animation' },
  { id: 'anime', name: 'Anime' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'crime', name: 'Crime' },
  { id: 'documentary', name: 'Documentary' },
  { id: 'drama', name: 'Drama' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'history', name: 'History' },
  { id: 'horror', name: 'Horror' },
  { id: 'music', name: 'Music' },
  { id: 'mystery', name: 'Mystery' },
  { id: 'romance', name: 'Romance' },
  { id: 'science-fiction', name: 'Science Fiction' },
  { id: 'sport', name: 'Sport' },
  { id: 'thriller', name: 'Thriller' },
  { id: 'western', name: 'Western' },
];
