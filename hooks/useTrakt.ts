import { useQuery } from '@tanstack/react-query';
import { getShowRating, getShowComments } from '../services/trakt/series';
import { mapTraktComment } from '../services/api/mappers';
import type { TraktRating, TraktComment } from '../services/api/types';

export function useTraktRating(traktId: number | null) {
  return useQuery<TraktRating | null>({
    queryKey: ['trakt', 'rating', traktId],
    queryFn: async () => {
      if (!traktId) return null;
      const data = await getShowRating(traktId);
      return { rating: data.rating, votes: data.votes };
    },
    enabled: traktId !== null && traktId > 0,
    staleTime: 1000 * 60 * 60,
  });
}

export function useTraktComments(traktId: number | null) {
  return useQuery<TraktComment[]>({
    queryKey: ['trakt', 'comments', traktId],
    queryFn: async () => {
      if (!traktId) return [];
      const data = await getShowComments(traktId);
      return data.map(mapTraktComment);
    },
    enabled: traktId !== null && traktId > 0,
    staleTime: 1000 * 60 * 15,
  });
}
