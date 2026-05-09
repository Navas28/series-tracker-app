export interface TVDBStatus {
  id: number;
  name: string;
  recordType: string;
  keepUpdated: boolean;
}

export interface TVDBSeriesBaseRecord {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  score: number;
  status: TVDBStatus;
  year: string | null;
  lastUpdated: string;
  nameTranslations: string[];
  overviewTranslations: string[];
  aliases: { language: string; name: string }[];
}

export interface TVDBTranslation {
  language: string;
  name: string;
  overview: string | null;
  tagline: string | null;
  aliases: string[];
}

// artwork type IDs: 1=banner, 2=poster, 3=background/fanart
export interface TVDBArtwork {
  id: number;
  image: string;
  thumbnail: string;
  language: string | null;
  type: number;
  score: number;
  width: number;
  height: number;
}

export interface TVDBGenre {
  id: number;
  name: string;
  slug: string;
}

export interface TVDBNetwork {
  id: number;
  name: string;
  slug: string;
  country: string;
  primaryImage: string | null;
}

export interface TVDBRemoteId {
  id: string;
  type: number;
  sourceName: string;
}

export interface TVDBCharacter {
  id: number;
  name: string | null;
  peopleId: number;
  type: number;
  sort: number;
  isFeatured: boolean;
  image: string | null;
  peopleType: string;
  personName: string;
  personImgURL: string | null;
}

export interface TVDBSeasonType {
  id: number;
  name: string;
  type: string;
  alternateName: string | null;
}

export interface TVDBSeasonBase {
  id: number;
  seriesId: number;
  type: TVDBSeasonType;
  name: string | null;
  number: number;
  image: string | null;
  imageType: number | null;
  year: string | null;
  nameTranslations: string[];
  overviewTranslations: string[];
}

export interface TVDBSeriesExtendedRecord extends TVDBSeriesBaseRecord {
  overview: string | null;
  artworks: TVDBArtwork[];
  characters: TVDBCharacter[];
  genres: TVDBGenre[];
  networks: TVDBNetwork[];
  originalNetwork: TVDBNetwork | null;
  remoteIds: TVDBRemoteId[];
  seasons: TVDBSeasonBase[];
  nextAired: string | null;
  lastAired: string | null;
  translations: {
    nameTranslations: TVDBTranslation[] | null;
    overviewTranslations: TVDBTranslation[] | null;
    alias: unknown[];
  } | null;
}

export interface TVDBEpisode {
  id: number;
  seriesId: number;
  name: string | null;
  aired: string | null;
  runtime: number | null;
  image: string | null;
  number: number;
  seasonNumber: number;
  nameTranslations: string[];
  overviewTranslations: string[];
  overview: string | null;
}

export interface TVDBSeasonExtended extends TVDBSeasonBase {
  episodes: TVDBEpisode[];
  translations: {
    nameTranslations: TVDBTranslation[] | null;
    overviewTranslations: TVDBTranslation[] | null;
  } | null;
}

export interface TVDBSearchResult {
  objectID: string;
  id: string;
  tvdb_id: string;
  type: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  poster: string | null;
  thumbnail: string | null;
  overview: string | null;
  overview_translated: string[] | null;
  genres: string[] | null;
  network: string | null;
  status: string | null;
  year: string | null;
  primary_language: string | null;
  first_air_time: string | null;
  translations: {
    nameTranslations: TVDBTranslation[] | null;
    overviewTranslations: TVDBTranslation[] | null;
  } | null;
}
