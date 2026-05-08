import { stripHtml } from '../tvmaze/client';
import type { TVMazeShow, TVMazeEpisode, TVMazeSeason } from '../tvmaze/types';
import type { TraktShowSummary, TraktComment as RawTraktComment } from '../trakt/types';
import type {
  ShowListItem,
  ShowDetails,
  ShowEpisode,
  ShowSeason,
  ShowSeasonDetails,
  TraktComment,
} from './types';

function mapStatus(tvmazeStatus: string): string {
  switch (tvmazeStatus) {
    case 'Running': return 'Returning Series';
    case 'Ended': return 'Ended';
    case 'To Be Determined': return 'To Be Determined';
    default: return 'In Production';
  }
}

function mapEpisode(ep: TVMazeEpisode): ShowEpisode {
  return {
    id: ep.id,
    name: ep.name,
    episode_number: ep.number ?? 0,
    season_number: ep.season,
    air_date: ep.airdate || null,
    still_path: ep.image?.medium ?? null,
    vote_average: ep.rating?.average ?? 0,
    vote_count: 0,
    runtime: ep.runtime,
    overview: stripHtml(ep.summary),
  };
}

function mapSeason(s: TVMazeSeason, index: number): ShowSeason {
  return {
    id: s.id,
    name: s.name || `Season ${s.number}`,
    season_number: s.number,
    episode_count: s.episodeOrder ?? 0,
    air_date: s.premiereDate,
    poster_path: s.image?.medium ?? null,
    vote_average: 0,
  };
}

export function tvmazeShowToListItem(
  show: TVMazeShow,
  traktId: number | null = null,
  imdbId: string | null = null,
  rating = 0,
): ShowListItem {
  return {
    id: show.id,
    traktId,
    imdbId: imdbId ?? show.externals?.imdb ?? null,
    name: show.name,
    overview: stripHtml(show.summary),
    poster_path: show.image?.medium ?? null,
    backdrop_path: show.image?.original ?? null,
    first_air_date: show.premiered,
    genres: show.genres.map(g => ({ id: g, name: g })),
    vote_average: rating || (show.rating?.average ?? 0),
  };
}

export function tvmazeShowToDetails(
  show: TVMazeShow,
  traktId: number | null = null,
  rating = 0,
  related: ShowListItem[] = [],
): ShowDetails {
  const cast = (show._embedded?.cast ?? []).map((entry, i) => ({
    id: entry.person.id,
    name: entry.person.name,
    profile_path: entry.person.image?.medium ?? null,
    character: entry.character.name,
    total_episode_count: 0,
    roles: [{ character: entry.character.name, episode_count: 0 }],
  }));

  const seasons = (show._embedded?.seasons ?? [])
    .filter(s => s.number > 0)
    .map(mapSeason);

  const totalEpisodes = seasons.reduce((sum, s) => sum + (s.episode_count ?? 0), 0);

  const network = show.network ?? show.webChannel;

  return {
    id: show.id,
    traktId,
    imdbId: show.externals?.imdb ?? null,
    name: show.name,
    overview: stripHtml(show.summary),
    poster_path: show.image?.medium ?? null,
    backdrop_path: show.image?.original ?? null,
    first_air_date: show.premiered,
    genres: show.genres.map(g => ({ id: g, name: g })),
    vote_average: rating || (show.rating?.average ?? 0),
    tagline: '',
    status: mapStatus(show.status),
    number_of_seasons: seasons.length,
    number_of_episodes: totalEpisodes,
    networks: network ? [{ id: network.id, name: network.name, logo_path: null }] : [],
    seasons,
    cast,
    next_episode_to_air: null,
    last_episode_to_air: null,
    related,
    homepage: show.url ?? null,
  };
}

export function tvmazeEpisodesToSeasonDetails(
  season: ShowSeason,
  episodes: TVMazeEpisode[],
): ShowSeasonDetails {
  return {
    id: season.id,
    name: season.name,
    season_number: season.season_number,
    air_date: season.air_date,
    poster_path: season.poster_path,
    vote_average: 0,
    episodes: episodes.map(mapEpisode),
  };
}

export function traktShowToListItem(
  show: TraktShowSummary,
  tvmazeShow: TVMazeShow | null,
): ShowListItem | null {
  if (!tvmazeShow) return null;
  return tvmazeShowToListItem(
    tvmazeShow,
    show.ids.trakt,
    show.ids.imdb,
    show.rating ?? 0,
  );
}

export function mapTraktComment(raw: RawTraktComment): TraktComment {
  return {
    id: raw.id,
    username: raw.user.username,
    comment: raw.comment,
    likes: raw.likes,
    createdAt: raw.created_at,
    spoiler: raw.spoiler,
    userRating: raw.user_stats?.rating ?? null,
  };
}

const SERIES_TYPES = new Set(['Scripted', 'Animation']);

export function tvmazeScheduleToListItems(episodes: TVMazeEpisode[]): ShowListItem[] {
  const seen = new Set<number>();
  const items: ShowListItem[] = [];

  for (const ep of episodes) {
    if (!ep.show || seen.has(ep.show.id)) continue;
    if (!SERIES_TYPES.has(ep.show.type)) continue;
    seen.add(ep.show.id);
    items.push(tvmazeShowToListItem(ep.show));
  }

  return items;
}
