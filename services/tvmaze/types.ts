export interface TVMazeImage {
  medium: string | null;
  original: string | null;
}

export interface TVMazeRating {
  average: number | null;
}

export interface TVMazeNetwork {
  id: number;
  name: string;
  country: { code: string; name: string } | null;
}

export interface TVMazeExternals {
  tvrage: number | null;
  thetvdb: number | null;
  imdb: string | null;
}

export interface TVMazeShow {
  id: number;
  name: string;
  type: string;
  language: string | null;
  genres: string[];
  status: string;
  runtime: number | null;
  averageRuntime: number | null;
  premiered: string | null;
  ended: string | null;
  rating: TVMazeRating;
  network: TVMazeNetwork | null;
  webChannel: TVMazeNetwork | null;
  image: TVMazeImage | null;
  summary: string | null;
  url: string;
  externals: TVMazeExternals;
  _embedded?: {
    cast?: TVMazeCastEntry[];
    seasons?: TVMazeSeason[];
    images?: TVMazeImageEntry[];
  };
}

export interface TVMazeCastEntry {
  person: {
    id: number;
    name: string;
    image: TVMazeImage | null;
  };
  character: {
    id: number;
    name: string;
  };
  self: boolean;
  voice: boolean;
}

export interface TVMazeSeason {
  id: number;
  number: number;
  name: string;
  episodeOrder: number | null;
  premiereDate: string | null;
  endDate: string | null;
  image: TVMazeImage | null;
  summary: string | null;
}

export interface TVMazeEpisode {
  id: number;
  name: string;
  season: number;
  number: number | null;
  airdate: string;
  airstamp: string | null;
  runtime: number | null;
  rating: TVMazeRating;
  image: TVMazeImage | null;
  summary: string | null;
  show?: TVMazeShow;
}

export interface TVMazeImageEntry {
  id: number;
  type: string;
  main: boolean;
  resolutions: {
    original?: { url: string };
    medium?: { url: string };
  };
}

export interface TVMazeSearchResult {
  score: number;
  show: TVMazeShow;
}
