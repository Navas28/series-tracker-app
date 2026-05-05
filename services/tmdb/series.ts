import tmdbClient from './client';
import type {
  TMDBPaginatedResponse,
  SeriesListItem,
  SeriesDetails,
  SeasonDetails,
  AggregateCredits,
  Genre,
  DiscoverTVParams,
} from './types';

export async function getTrendingSeries(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBPaginatedResponse<SeriesListItem>> {
  const { data } = await tmdbClient.get(`/trending/tv/${timeWindow}`);
  return data;
}

export async function getPopularSeries(page = 1): Promise<TMDBPaginatedResponse<SeriesListItem>> {
  const { data } = await tmdbClient.get('/tv/popular', { params: { page } });
  return data;
}

export async function getTopRatedSeries(page = 1): Promise<TMDBPaginatedResponse<SeriesListItem>> {
  const { data } = await tmdbClient.get('/tv/top_rated', { params: { page } });
  return data;
}

export async function getAiringTodaySeries(page = 1): Promise<TMDBPaginatedResponse<SeriesListItem>> {
  const { data } = await tmdbClient.get('/tv/airing_today', { params: { page } });
  return data;
}

export async function getOnTheAirSeries(page = 1): Promise<TMDBPaginatedResponse<SeriesListItem>> {
  const { data } = await tmdbClient.get('/tv/on_the_air', { params: { page } });
  return data;
}

export async function getSeriesDetails(seriesId: number): Promise<SeriesDetails> {
  const { data } = await tmdbClient.get(`/tv/${seriesId}`, {
    params: {
      append_to_response: 'aggregate_credits,videos,images,recommendations,similar,keywords,content_ratings,watch/providers',
    },
  });
  return data;
}

export async function getSeriesCredits(seriesId: number): Promise<AggregateCredits> {
  const { data } = await tmdbClient.get(`/tv/${seriesId}/aggregate_credits`);
  return data;
}

export async function getSeasonDetails(seriesId: number, seasonNumber: number): Promise<SeasonDetails> {
  const { data } = await tmdbClient.get(`/tv/${seriesId}/season/${seasonNumber}`);
  return data;
}

export async function searchSeries(query: string, page = 1): Promise<TMDBPaginatedResponse<SeriesListItem>> {
  const { data } = await tmdbClient.get('/search/tv', { params: { query, page } });
  return data;
}

export async function discoverSeries(params: DiscoverTVParams): Promise<TMDBPaginatedResponse<SeriesListItem>> {
  const { data } = await tmdbClient.get('/discover/tv', { params });
  return data;
}

export async function getSeriesRecommendations(seriesId: number, page = 1): Promise<TMDBPaginatedResponse<SeriesListItem>> {
  const { data } = await tmdbClient.get(`/tv/${seriesId}/recommendations`, { params: { page } });
  return data;
}

export async function getSimilarSeries(seriesId: number, page = 1): Promise<TMDBPaginatedResponse<SeriesListItem>> {
  const { data } = await tmdbClient.get(`/tv/${seriesId}/similar`, { params: { page } });
  return data;
}

export async function getTVGenres(): Promise<Genre[]> {
  const { data } = await tmdbClient.get('/genre/tv/list');
  return data.genres;
}
