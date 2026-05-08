import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getTrendingShows,
  getPopularShows,
  getMostWatchedShows,
  getShowsByGenre,
} from '../services/trakt/series';
import {
  searchShows,
  getShowDetails,
  getSeasonEpisodes,
  getScheduleForDate,
  getStreamingScheduleForDate,
  lookupByTvdb,
  lookupByImdb,
} from '../services/tvmaze/series';
import {
  tvmazeShowToListItem,
  tvmazeShowToDetails,
  tvmazeEpisodesToSeasonDetails,
  traktShowToListItem,
  tvmazeScheduleToListItems,
} from '../services/api/mappers';
import { searchByImdb } from '../services/trakt/series';
import type { ShowListItem, ShowDetails, ShowSeasonDetails } from '../services/api/types';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateOffsetString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Limit concurrent TVMaze lookups to 4 to stay under 20 req/10s rate limit
let _activeCount = 0;
const _waitQueue: Array<() => void> = [];

async function throttled<T>(fn: () => Promise<T | null>): Promise<T | null> {
  const MAX = 4;
  if (_activeCount < MAX) {
    _activeCount++;
    return fn().finally(() => {
      _activeCount--;
      _waitQueue.shift()?.();
    });
  }
  return new Promise<T | null>((resolve, reject) => {
    _waitQueue.push(() => {
      _activeCount++;
      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          _activeCount--;
          _waitQueue.shift()?.();
        });
    });
  });
}

async function lookupTVMaze(tvdb: number | null, imdb: string | null) {
  return throttled(() => {
    if (tvdb) return lookupByTvdb(tvdb);
    if (imdb) return lookupByImdb(imdb);
    return Promise.resolve(null);
  });
}

// ─── Home screen hooks ────────────────────────────────────────

export function useTrendingSeries() {
  return useQuery({
    queryKey: ['series', 'trending'],
    queryFn: async () => {
      const traktItems = await getTrendingShows(1, 10);
      const results = await Promise.all(
        traktItems.map(async ({ show }) => {
          const tvmazeShow = await lookupTVMaze(show.ids.tvdb, show.ids.imdb);
          return traktShowToListItem(show, tvmazeShow);
        }),
      );
      return { results: results.filter((r): r is ShowListItem => r !== null) };
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function usePopularSeries() {
  return useInfiniteQuery({
    queryKey: ['series', 'popular'],
    queryFn: async ({ pageParam }) => {
      const traktItems = await getPopularShows(pageParam, 10);
      const results = await Promise.all(
        traktItems.map(async (show) => {
          const tvmazeShow = await lookupTVMaze(show.ids.tvdb, show.ids.imdb);
          return traktShowToListItem(show, tvmazeShow);
        }),
      );
      return {
        results: results.filter((r): r is ShowListItem => r !== null),
        page: pageParam,
        hasMore: traktItems.length === 10,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 60,
  });
}

export function useTopRatedSeries() {
  return useInfiniteQuery({
    queryKey: ['series', 'top_rated'],
    queryFn: async ({ pageParam }) => {
      const traktItems = await getMostWatchedShows(pageParam, 10);
      const results = await Promise.all(
        traktItems.map(async ({ show }) => {
          const tvmazeShow = await lookupTVMaze(show.ids.tvdb, show.ids.imdb);
          return traktShowToListItem(show, tvmazeShow);
        }),
      );
      return {
        results: results.filter((r): r is ShowListItem => r !== null),
        page: pageParam,
        hasMore: traktItems.length === 10,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 60,
  });
}

export function useAiringTodaySeries() {
  return useQuery({
    queryKey: ['series', 'airing_today'],
    queryFn: async () => {
      const today = todayString();
      const [broadcast, streaming] = await Promise.all([
        getScheduleForDate(today),
        getStreamingScheduleForDate(today),
      ]);
      return { results: tvmazeScheduleToListItems([...broadcast, ...streaming]) };
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useOnTheAirSeries() {
  return useQuery({
    queryKey: ['series', 'on_the_air'],
    queryFn: async () => {
      // 3 days instead of 7 to stay well under the 20 req/10s TVMaze rate limit
      const dates = Array.from({ length: 3 }, (_, i) => dateOffsetString(i + 1));
      const results = await Promise.all(
        dates.map(date =>
          Promise.all([getScheduleForDate(date), getStreamingScheduleForDate(date)])
            .then(([b, s]) => [...b, ...s]),
        ),
      );
      return { results: tvmazeScheduleToListItems(results.flat()) };
    },
    staleTime: 1000 * 60 * 30,
  });
}

// ─── Detail screen hooks ──────────────────────────────────────

export function useSeriesDetails(showId: number) {
  return useQuery({
    queryKey: ['series', 'details', showId],
    queryFn: async (): Promise<ShowDetails> => {
      const tvmazeShow = await getShowDetails(showId);
      const imdbId = tvmazeShow.externals?.imdb ?? null;

      let traktId: number | null = null;
      let rating = tvmazeShow.rating?.average ?? 0;
      let relatedItems: ShowListItem[] = [];

      try {
        traktId = imdbId ? await searchByImdb(imdbId) : null;

        if (traktId) {
          const { getShowRating, getRelatedShows: getRelated } = await import('../services/trakt/series');
          const [ratingData, relatedData] = await Promise.all([
            getShowRating(traktId).catch(() => null),
            getRelated(traktId).catch(() => []),
          ]);
          if (ratingData) rating = ratingData.rating;
          const relatedWithImages = await Promise.all(
            relatedData.slice(0, 8).map(async (show) => {
              const tvmaze = await lookupTVMaze(show.ids.tvdb, show.ids.imdb);
              return traktShowToListItem(show, tvmaze);
            }),
          );
          relatedItems = relatedWithImages.filter((r): r is ShowListItem => r !== null);
        }
      } catch {
        // Trakt enrichment failed — show still loads with TVMaze data only
      }

      return tvmazeShowToDetails(tvmazeShow, traktId, rating, relatedItems);
    },
    enabled: showId > 0,
    retry: 3,
    retryDelay: (attempt) => attempt * 1200,
  });
}

// seasonId is the TVMaze season ID (ShowSeason.id), not the season number
export function useSeasonDetails(
  showId: number,
  seasonId: number,
  seasonNumber: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['series', 'season', showId, seasonId],
    queryFn: async (): Promise<ShowSeasonDetails> => {
      const episodes = await getSeasonEpisodes(seasonId);
      const mappedSeason = {
        id: seasonId,
        name: `Season ${seasonNumber}`,
        season_number: seasonNumber,
        episode_count: episodes.length,
        air_date: episodes[0]?.airdate ?? null,
        poster_path: null,
        vote_average: 0,
      };
      return tvmazeEpisodesToSeasonDetails(mappedSeason, episodes);
    },
    enabled: (options?.enabled ?? true) && showId > 0 && seasonId > 0,
  });
}

// ─── Search & Discover hooks ──────────────────────────────────

export function useSearchSeries(query: string) {
  return useQuery({
    queryKey: ['series', 'search', query],
    queryFn: async () => {
      const results = await searchShows(query);
      return {
        results: results.map(r => tvmazeShowToListItem(r.show)),
      };
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDiscoverSeries(genre: string | null) {
  return useInfiniteQuery({
    queryKey: ['series', 'discover', genre],
    queryFn: async ({ pageParam }) => {
      if (!genre) return { results: [] as ShowListItem[], page: pageParam, hasMore: false };
      const traktItems = await getShowsByGenre(genre, pageParam, 20);
      const results = await Promise.all(
        traktItems.map(async (show) => {
          const tvmazeShow = await lookupTVMaze(show.ids.tvdb, show.ids.imdb);
          return traktShowToListItem(show, tvmazeShow);
        }),
      );
      return {
        results: results.filter((r): r is ShowListItem => r !== null),
        page: pageParam,
        hasMore: traktItems.length === 20,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
}
