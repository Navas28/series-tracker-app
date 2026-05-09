import type {
  TVDBSeriesBaseRecord,
  TVDBSeriesExtendedRecord,
  TVDBSeasonExtended,
  TVDBSearchResult,
  TVDBTranslation,
} from './types';
import type {
  ShowListItem,
  ShowDetails,
  ShowEpisode,
  ShowSeason,
  ShowSeasonDetails,
} from '../api/types';

// artwork type IDs per TVDB convention
const ARTWORK_POSTER = 2;
const ARTWORK_BACKGROUND = 3;

function engTranslation(
  translations: TVDBTranslation[] | null | undefined,
): TVDBTranslation | null {
  if (!translations?.length) return null;
  return translations.find(t => t.language === 'eng') ?? translations[0];
}

function artworkByType(
  artworks: { type: number; image: string }[] | null | undefined,
  type: number,
): string | null {
  return artworks?.find(a => a.type === type)?.image ?? null;
}

function mapStatus(name: string | undefined): string {
  switch (name) {
    case 'Continuing': return 'Returning Series';
    case 'Ended': return 'Ended';
    case 'Upcoming': return 'In Production';
    default: return name ?? 'Unknown';
  }
}

export function tvdbBaseToListItem(s: TVDBSeriesBaseRecord): ShowListItem {
  return {
    id: s.id,
    traktId: null,
    imdbId: null,
    name: s.name,
    overview: '',
    poster_path: s.image,
    backdrop_path: null,
    first_air_date: s.year ? `${s.year}-01-01` : null,
    genres: [],
    vote_average: 0,
  };
}

export function tvdbSearchToListItem(s: TVDBSearchResult): ShowListItem {
  const tvdbId = parseInt(s.tvdb_id, 10);
  if (isNaN(tvdbId) || !s.name) return null as unknown as ShowListItem;

  const engOverview = engTranslation(
    s.translations?.overviewTranslations ?? null,
  );

  return {
    id: tvdbId,
    traktId: null,
    imdbId: null,
    name: s.name,
    overview: s.overview ?? engOverview?.overview ?? '',
    poster_path: s.image_url ?? s.poster ?? s.thumbnail ?? null,
    backdrop_path: null,
    first_air_date: s.first_air_time ?? (s.year ? `${s.year}-01-01` : null),
    genres: (s.genres ?? []).map(g => ({
      id: g.toLowerCase().replace(/\s+/g, '-'),
      name: g,
    })),
    vote_average: 0,
  };
}

export function tvdbExtendedToDetails(
  s: TVDBSeriesExtendedRecord,
  episodeCounts: Record<number, number> = {},
): ShowDetails {
  const poster = artworkByType(s.artworks, ARTWORK_POSTER) ?? s.image;
  const backdrop = artworkByType(s.artworks, ARTWORK_BACKGROUND) ?? s.image;

  const imdbId =
    s.remoteIds?.find(r => r.sourceName === 'IMDB')?.id ?? null;

  const engOverview = engTranslation(
    s.translations?.overviewTranslations ?? null,
  );
  const overview = s.overview ?? engOverview?.overview ?? '';
  const tagline = engOverview?.tagline ?? '';

  const officialSeasons: ShowSeason[] = (s.seasons ?? [])
    .filter(season => season.type?.type === 'official' && season.number > 0)
    .sort((a, b) => a.number - b.number)
    .map(season => ({
      id: season.id,
      name: season.name ?? `Season ${season.number}`,
      season_number: season.number,
      episode_count: episodeCounts[season.number] ?? 0,
      air_date: season.year ? `${season.year}-01-01` : null,
      poster_path: season.image ?? null,
      vote_average: 0,
    }));

  const number_of_episodes = Object.values(episodeCounts).reduce((sum, c) => sum + c, 0);

  const cast = (s.characters ?? [])
    .filter(c => c.peopleType === 'Actor')
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 20)
    .map(c => ({
      id: c.peopleId,
      name: c.personName,
      profile_path: c.personImgURL ?? c.image ?? null,
      character: c.name ?? '',
      total_episode_count: 0,
      roles: [{ character: c.name ?? '', episode_count: 0 }],
    }));

  const network = s.originalNetwork ?? s.networks?.[0] ?? null;

  return {
    id: s.id,
    traktId: null,
    imdbId,
    name: s.name,
    overview,
    poster_path: poster,
    backdrop_path: backdrop,
    first_air_date: s.year ? `${s.year}-01-01` : null,
    genres: (s.genres ?? []).map(g => ({ id: String(g.id), name: g.name })),
    vote_average: 0,
    tagline,
    status: mapStatus(s.status?.name),
    number_of_seasons: officialSeasons.length,
    number_of_episodes,
    networks: network ? [{ id: network.id, name: network.name, logo_path: null }] : [],
    seasons: officialSeasons,
    cast,
    next_episode_to_air: s.nextAired
      ? {
          id: 0,
          name: '',
          episode_number: 0,
          season_number: 0,
          air_date: s.nextAired,
          still_path: null,
          vote_average: 0,
          vote_count: 0,
          runtime: null,
          overview: '',
        }
      : null,
    last_episode_to_air: s.lastAired
      ? {
          id: 0,
          name: '',
          episode_number: 0,
          season_number: 0,
          air_date: s.lastAired,
          still_path: null,
          vote_average: 0,
          vote_count: 0,
          runtime: null,
          overview: '',
        }
      : null,
    related: [],
    homepage: null,
  };
}

export function tvdbSeasonExtendedToDetails(
  season: TVDBSeasonExtended,
): ShowSeasonDetails {
  const episodes: ShowEpisode[] = (season.episodes ?? [])
    .filter(ep => ep.number > 0)
    .sort((a, b) => a.number - b.number)
    .map(ep => ({
      id: ep.id,
      name: ep.name ?? `Episode ${ep.number}`,
      episode_number: ep.number,
      season_number: ep.seasonNumber,
      air_date: ep.aired ?? null,
      still_path: ep.image ?? null,
      vote_average: 0,
      vote_count: 0,
      runtime: ep.runtime ?? null,
      overview: ep.overview ?? '',
    }));

  return {
    id: season.id,
    name: season.name ?? `Season ${season.number}`,
    season_number: season.number,
    air_date: season.year ? `${season.year}-01-01` : null,
    poster_path: season.image ?? null,
    vote_average: 0,
    episodes,
  };
}
