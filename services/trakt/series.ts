import traktClient from './client';
import type {
  TraktTrendingItem,
  TraktShowSummary,
  TraktWatchedItem,
  TraktRating,
  TraktComment,
} from './types';

export async function getTrendingShows(page = 1, limit = 10): Promise<TraktTrendingItem[]> {
  const { data } = await traktClient.get<TraktTrendingItem[]>('/shows/trending', {
    params: { extended: 'full', page, limit },
  });
  return data;
}

export async function getPopularShows(page = 1, limit = 10): Promise<TraktShowSummary[]> {
  const { data } = await traktClient.get<TraktShowSummary[]>('/shows/popular', {
    params: { extended: 'full', page, limit },
  });
  return data;
}

export async function getMostWatchedShows(page = 1, limit = 10): Promise<TraktWatchedItem[]> {
  const { data } = await traktClient.get<TraktWatchedItem[]>('/shows/watched/weekly', {
    params: { extended: 'full', page, limit },
  });
  return data;
}

export async function getShowsByGenre(
  genre: string,
  page = 1,
  limit = 20,
): Promise<TraktShowSummary[]> {
  const { data } = await traktClient.get<TraktShowSummary[]>('/shows/popular', {
    params: { extended: 'full', genres: genre, page, limit },
  });
  return data;
}

export async function getRelatedShows(traktId: number): Promise<TraktShowSummary[]> {
  const { data } = await traktClient.get<TraktShowSummary[]>(`/shows/${traktId}/related`, {
    params: { extended: 'full', limit: 12 },
  });
  return data;
}

export async function getShowRating(traktId: number): Promise<TraktRating> {
  const { data } = await traktClient.get<TraktRating>(`/shows/${traktId}/ratings`);
  return data;
}

export async function getShowComments(
  traktId: number,
  page = 1,
  limit = 15,
): Promise<TraktComment[]> {
  const { data } = await traktClient.get<TraktComment[]>(`/shows/${traktId}/comments`, {
    params: { sort: 'likes', page, limit },
  });
  return data;
}

export async function searchByImdb(imdbId: string): Promise<number | null> {
  try {
    const { data } = await traktClient.get<{ score: number; show: { ids: { trakt: number } } }[]>(
      `/search/imdb/${imdbId}`,
      { params: { type: 'show' } },
    );
    return data[0]?.show?.ids?.trakt ?? null;
  } catch {
    return null;
  }
}
