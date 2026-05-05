import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getTrendingSeries,
  getPopularSeries,
  getTopRatedSeries,
  getAiringTodaySeries,
  getOnTheAirSeries,
  getSeriesDetails,
  getSeasonDetails,
  searchSeries,
  discoverSeries,
  getSeriesRecommendations,
  getSimilarSeries,
  getTVGenres,
} from '../services/tmdb/series';
import type { DiscoverTVParams } from '../services/tmdb/types';

export function useTrendingSeries(timeWindow: 'day' | 'week' = 'week') {
  return useQuery({
    queryKey: ['series', 'trending', timeWindow],
    queryFn: () => getTrendingSeries(timeWindow),
  });
}

export function usePopularSeries() {
  return useInfiniteQuery({
    queryKey: ['series', 'popular'],
    queryFn: ({ pageParam }) => getPopularSeries(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });
}

export function useTopRatedSeries() {
  return useInfiniteQuery({
    queryKey: ['series', 'top_rated'],
    queryFn: ({ pageParam }) => getTopRatedSeries(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });
}

export function useAiringTodaySeries() {
  return useQuery({
    queryKey: ['series', 'airing_today'],
    queryFn: () => getAiringTodaySeries(),
  });
}

export function useOnTheAirSeries() {
  return useQuery({
    queryKey: ['series', 'on_the_air'],
    queryFn: () => getOnTheAirSeries(),
  });
}

export function useSeriesDetails(seriesId: number) {
  return useQuery({
    queryKey: ['series', 'details', seriesId],
    queryFn: () => getSeriesDetails(seriesId),
    enabled: seriesId > 0,
  });
}

export function useSeasonDetails(
  seriesId: number,
  seasonNumber: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['series', 'season', seriesId, seasonNumber],
    queryFn: () => getSeasonDetails(seriesId, seasonNumber),
    enabled: (options?.enabled ?? true) && seriesId > 0,
  });
}

export function useSearchSeries(query: string) {
  return useInfiniteQuery({
    queryKey: ['series', 'search', query],
    queryFn: ({ pageParam }) => searchSeries(query, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: query.trim().length > 0,
  });
}

export function useDiscoverSeries(params: DiscoverTVParams) {
  return useInfiniteQuery({
    queryKey: ['series', 'discover', params],
    queryFn: ({ pageParam }) => discoverSeries({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });
}

export function useSeriesRecommendations(seriesId: number) {
  return useQuery({
    queryKey: ['series', 'recommendations', seriesId],
    queryFn: () => getSeriesRecommendations(seriesId),
    enabled: seriesId > 0,
  });
}

export function useSimilarSeries(seriesId: number) {
  return useQuery({
    queryKey: ['series', 'similar', seriesId],
    queryFn: () => getSimilarSeries(seriesId),
    enabled: seriesId > 0,
  });
}

export function useTVGenres() {
  return useQuery({
    queryKey: ['genres', 'tv'],
    queryFn: getTVGenres,
    staleTime: Infinity,
  });
}
