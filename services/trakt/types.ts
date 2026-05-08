export interface TraktIds {
  trakt: number;
  slug: string;
  tvdb: number | null;
  imdb: string | null;
  tmdb: number | null;
}

export interface TraktShowSummary {
  title: string;
  year: number | null;
  ids: TraktIds;
  // only present with extended=full
  overview?: string;
  status?: string;
  network?: string;
  genres?: string[];
  rating?: number;
  votes?: number;
  runtime?: number;
  country?: string;
  language?: string;
  aired_episodes?: number;
}

export interface TraktTrendingItem {
  watchers: number;
  show: TraktShowSummary;
}

export interface TraktWatchedItem {
  watcher_count: number;
  play_count: number;
  collected_count: number;
  show: TraktShowSummary;
}

export interface TraktRating {
  rating: number;
  votes: number;
  distribution: Record<string, number>;
}

export interface TraktUser {
  username: string;
  private: boolean;
  name: string | null;
  vip: boolean;
  ids: { slug: string };
}

export interface TraktComment {
  id: number;
  comment: string;
  spoiler: boolean;
  review: boolean;
  created_at: string;
  updated_at: string;
  replies: number;
  likes: number;
  user_stats: { rating: number | null; play_count: number } | null;
  user: TraktUser;
}
