import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getPopularSeries,
  getSeriesExtended,
  getSeriesEpisodeCounts,
  getSeasonExtended,
  searchSeries,
} from '../services/tvdb/series';
import {
  tvdbBaseToListItem,
  tvdbExtendedToDetails,
  tvdbSeasonExtendedToDetails,
  tvdbSearchToListItem,
} from '../services/tvdb/mappers';
import type { ShowListItem, ShowDetails, ShowSeasonDetails } from '../services/api/types';

export function useTrendingSeries() {
  return useQuery({
    queryKey: ['series', 'trending'],
    queryFn: async (): Promise<{ results: ShowListItem[] }> => {
      const items = await getPopularSeries(0);
      return { results: items.slice(0, 10).map(tvdbBaseToListItem) };
    },
    staleTime: 1000 * 60 * 60,
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
      // Offset by 3 pages to show different series from Popular
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

export function useSeriesDetails(showId: number) {
  return useQuery({
    queryKey: ['series', 'details', showId],
    queryFn: async (): Promise<ShowDetails> => {
      const [extended, episodeCounts] = await Promise.all([
        getSeriesExtended(showId),
        getSeriesEpisodeCounts(showId),
      ]);
      return tvdbExtendedToDetails(extended, episodeCounts);
    },
    enabled: showId > 0,
    staleTime: 1000 * 60 * 10,
    retry: 2,
    retryDelay: attempt => attempt * 1000,
  });
}

export function useSeasonDetails(
  showId: number,
  seasonId: number,
  seasonNumber: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['series', 'season', showId, seasonId],
    queryFn: async (): Promise<ShowSeasonDetails> => {
      const season = await getSeasonExtended(seasonId);
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

export function useDiscoverSeries(genre: string | null) {
  return useInfiniteQuery({
    queryKey: ['series', 'discover', genre],
    queryFn: async ({ pageParam }: { pageParam: number }) => ({
      results: [] as ShowListItem[],
      page: pageParam,
      hasMore: false,
    }),
    initialPageParam: 0,
    getNextPageParam: () => undefined,
    enabled: false,
  });
}
