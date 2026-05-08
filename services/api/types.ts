// Normalized internal types — field names kept close to TMDB originals
// to minimize component changes. poster_path / backdrop_path are now full URLs.

export interface ShowGenre {
  id: string;  // TVMaze: genre name used as id. Trakt: genre slug.
  name: string;
}

export interface ShowListItem {
  id: number;                   // TVMaze ID (primary key)
  traktId: number | null;
  imdbId: string | null;
  name: string;
  overview: string;
  poster_path: string | null;   // Full URL (no getImageUrl() call needed)
  backdrop_path: string | null; // Full URL (no getImageUrl() call needed)
  first_air_date: string | null;
  genres: ShowGenre[];
  vote_average: number;         // 0–10 scale from Trakt rating
}

export interface ShowCastMember {
  id: number;
  name: string;
  profile_path: string | null;  // Full URL
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
  poster_path: string | null;   // Full URL
  vote_average: number;
}

export interface ShowEpisode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null;   // Full URL
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
  status: string;               // "Returning Series" | "Ended" | "In Production" | "To Be Determined"
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

export interface TraktComment {
  id: number;
  username: string;
  comment: string;
  likes: number;
  createdAt: string;
  spoiler: boolean;
  userRating: number | null;
}

export interface TraktRating {
  rating: number;
  votes: number;
}

// Hardcoded Trakt genre list — stable, no fetch needed
export const TRAKT_GENRES: ShowGenre[] = [
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
