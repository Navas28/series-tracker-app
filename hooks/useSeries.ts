import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useQuery as useApolloQuery, useApolloClient } from '@apollo/client/react';
import {
  getPopularSeries,
  getRecentSeries,
  getSeriesExtended,
  getSeriesEpisodeCounts,
  getSeasonExtended,
  searchSeries,
  getGenres,
  discoverByGenres,
} from '../services/tvdb/series';
import {
  tvdbBaseToListItem,
  tvdbExtendedToDetails,
  tvdbSeasonExtendedToDetails,
  tvdbSearchToListItem,
} from '../services/tvdb/mappers';
import type { ShowListItem, ShowDetails, ShowSeasonDetails, ShowEpisode, ShowSeason } from '../services/api/types';
import type { TVDBGenre } from '../services/tvdb/types';
import type { GqlTrackedSeries, GqlSeriesDetail } from '../services/api/types';
import { TRACKED_SERIES_QUERY, SERIES_DETAIL_QUERY } from '../services/api/tracking';

// ─── Map DB detail response to ShowDetails ────────────────────────────────────

function gqlDetailToShowDetails(d: GqlSeriesDetail): ShowDetails {
  const imdbId = d.remoteIds.find(r => r.sourceName === 'IMDB')?.externalId ?? null;

  const seasons: ShowSeason[] = d.seasons.map(s => ({
    id: s.tvdbSeasonId,
    name: s.name ?? `Season ${s.seasonNumber}`,
    season_number: s.seasonNumber,
    episode_count: s.episodes.length,
    air_date: s.year ? `${s.year}-01-01` : null,
    poster_path: s.imageUrl ?? null,
    vote_average: 0,
    episodes: s.episodes.map(
      (ep): ShowEpisode => ({
        id: ep.tvdbEpisodeId,
        name: ep.name ?? `Episode ${ep.episodeNumber}`,
        episode_number: ep.episodeNumber,
        season_number: ep.seasonNumber,
        air_date: ep.aired ? ep.aired.slice(0, 10) : null,
        still_path: ep.imageUrl ?? null,
        vote_average: 0,
        vote_count: 0,
        runtime: ep.runtime ?? null,
        overview: ep.overview ?? '',
      }),
    ),
  }));

  const mapEpisode = (ep: GqlSeriesDetail['nextEpisode']): ShowEpisode | null => {
    if (!ep) return null;
    return {
      id: ep.tvdbEpisodeId,
      name: ep.name ?? '',
      episode_number: ep.episodeNumber,
      season_number: ep.seasonNumber,
      air_date: ep.aired ? ep.aired.slice(0, 10) : null,
      still_path: ep.imageUrl ?? null,
      vote_average: 0,
      vote_count: 0,
      runtime: ep.runtime ?? null,
      overview: ep.overview ?? '',
    };
  };

  const actors = d.cast
    .filter(c => c.peopleType === 'Actor')
    .map(c => ({
      id: c.tvdbCharacterId,
      name: c.personName,
      profile_path: c.personImageUrl ?? c.characterImageUrl ?? null,
      character: c.characterName ?? '',
      total_episode_count: 0,
      roles: [{ character: c.characterName ?? '', episode_count: 0 }],
    }));

  const crew = d.cast
    .filter(c => c.peopleType !== 'Actor')
    .map(c => ({
      id: c.tvdbCharacterId,
      name: c.personName,
      profile_path: c.personImageUrl ?? c.characterImageUrl ?? null,
      role: c.peopleType,
    }));

  const clearLogoUrl = d.artworks.find(a => a.type === 7)?.url ?? null;

  const network = d.networks.find(n => n.isOriginal) ?? d.networks[0] ?? null;

  return {
    id: d.tvdbId,
    traktId: null,
    imdbId,
    name: d.name,
    overview: d.overview ?? '',
    poster_path: d.posterUrl ?? null,
    backdrop_path: d.backdropUrl ?? null,
    first_air_date: d.firstAired ? d.firstAired.slice(0, 10) : null,
    genres: d.genres.map(g => ({ id: g.slug, name: g.name })),
    vote_average: d.score ?? 0,
    tagline: d.tagline ?? '',
    status: d.status ?? '',
    number_of_seasons: d.totalSeasons ?? seasons.length,
    number_of_episodes: d.totalEpisodes ?? seasons.reduce((n, s) => n + s.episode_count, 0),
    averageRuntime: d.averageRuntime ?? null,
    networks: network ? [{ id: network.tvdbNetworkId, name: network.name, logo_path: null }] : [],
    seasons,
    cast: actors,
    crew,
    next_episode_to_air: mapEpisode(d.nextEpisode),
    last_episode_to_air: mapEpisode(d.lastEpisode),
    related: [],
    homepage: null,
    contentRating: d.contentRating ?? null,
    clearLogoUrl,
    originalLanguage: d.originalLanguage ?? null,
    originalCountry: d.originalCountry ?? null,
  };
}

// ─── Smart useSeriesDetails: DB for tracked, TVDB for untracked ───────────────

export function useSeriesDetails(showId: number) {
  const apolloClient = useApolloClient();

  const cachedTracking = apolloClient.readQuery<{ trackedSeries: GqlTrackedSeries[] }>({
    query: TRACKED_SERIES_QUERY,
  });
  const isTracked = cachedTracking?.trackedSeries.some(ts => ts.series.tvdbId === showId) ?? false;

  // Apollo query — active only when tracked
  const {
    data: dbData,
    loading: dbLoading,
    error: dbError,
    refetch: dbRefetch,
  } = useApolloQuery<{ seriesDetail: GqlSeriesDetail | null }>(SERIES_DETAIL_QUERY, {
    variables: { tvdbId: showId },
    skip: !isTracked || showId <= 0,
  });

  // TanStack Query — active only when NOT tracked
  const tvdbQuery = useQuery({
    queryKey: ['series', 'details', showId],
    queryFn: async (): Promise<ShowDetails> => {
      const [extended, { counts: episodeCounts, averageRuntime: episodeRuntime }] = await Promise.all([
        getSeriesExtended(showId),
        getSeriesEpisodeCounts(showId),
      ]);
      const details = tvdbExtendedToDetails(extended, episodeCounts);
      return { ...details, averageRuntime: details.averageRuntime ?? episodeRuntime };
    },
    enabled: !isTracked && showId > 0,
    staleTime: 1000 * 60 * 10,
    retry: 2,
    retryDelay: attempt => attempt * 1000,
  });

  if (isTracked) {
    return {
      data: dbData?.seriesDetail ? gqlDetailToShowDetails(dbData.seriesDetail) : undefined,
      isLoading: dbLoading,
      isError: !!dbError,
      error: dbError ?? null,
      refetch: dbRefetch,
    };
  }

  return tvdbQuery;
}

// ─── Discovery hooks (always TVDB) ───────────────────────────────────────────

export function useTrendingSeries() {
  return useQuery({
    queryKey: ['series', 'recent'],
    queryFn: async (): Promise<{ results: ShowListItem[] }> => {
      const items = await getRecentSeries(0);
      return { results: items.slice(0, 10).map(tvdbBaseToListItem) };
    },
    staleTime: 1000 * 60 * 60 * 6,
  });
}

export function usePopularSeries() {
  return useInfiniteQuery({
    queryKey: ['series', 'popular'],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const items = await getPopularSeries(pageParam);
      return {
        results: items.map(tvdbBaseToListItem),
        page: pageParam,
        hasMore: items.length > 0,
      };
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 1000 * 60 * 60,
  });
}

export function useTopRatedSeries() {
  return useInfiniteQuery({
    queryKey: ['series', 'top_rated'],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const items = await getPopularSeries(pageParam + 3);
      return {
        results: items.map(tvdbBaseToListItem),
        page: pageParam,
        hasMore: items.length > 0,
      };
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 1000 * 60 * 60,
  });
}

export function useSeasonDetails(
  showId: number,
  seasonId: number,
  _seasonNumber: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['series', 'season', showId, seasonId],
    queryFn: async (): Promise<ShowSeasonDetails> => {
      const season = await getSeasonExtended(seasonId, showId);
      return tvdbSeasonExtendedToDetails(season);
    },
    enabled: (options?.enabled ?? true) && showId > 0 && seasonId > 0,
  });
}

export function useSearchSeries(query: string) {
  return useQuery({
    queryKey: ['series', 'search', query],
    queryFn: async (): Promise<{ results: ShowListItem[] }> => {
      const results = await searchSeries(query);
      return {
        results: results
          .map(tvdbSearchToListItem)
          .filter((r): r is ShowListItem => r !== null),
      };
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGenres() {
  return useQuery<TVDBGenre[]>({
    queryKey: ['genres'],
    queryFn: getGenres,
    staleTime: Infinity,
  });
}

export function useDiscoverSeries(genreIds: number[]) {
  return useInfiniteQuery({
    queryKey: ['series', 'discover', genreIds],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const items = await discoverByGenres(genreIds, pageParam);
      return {
        results: items.map(tvdbBaseToListItem),
        page: pageParam,
        hasMore: items.length > 0,
      };
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    enabled: genreIds.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}
