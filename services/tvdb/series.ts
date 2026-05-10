import client from './client';
import type {
  TVDBSeriesBaseRecord,
  TVDBSeriesExtendedRecord,
  TVDBSeasonExtended,
  TVDBSearchResult,
  TVDBEpisode,
  TVDBGenre,
} from './types';

type ApiResponse<T> = { data: T; status: string };

export async function getPopularSeries(page = 0): Promise<TVDBSeriesBaseRecord[]> {
  try {
    const res = await client.get<ApiResponse<TVDBSeriesBaseRecord[]>>('/series/filter', {
      params: { sort: 'score', sortType: 'desc', country: 'usa', lang: 'eng', page },
    });
    return res.data.data ?? [];
  } catch {
    // /series/filter requires country+lang — fall back to basic paginated list
    const res = await client.get<ApiResponse<TVDBSeriesBaseRecord[]>>('/series', {
      params: { page },
    });
    return res.data.data ?? [];
  }
}

export async function getSeriesExtended(id: number): Promise<TVDBSeriesExtendedRecord> {
  const res = await client.get<ApiResponse<TVDBSeriesExtendedRecord>>(
    `/series/${id}/extended`,
    { params: { meta: 'translations', short: false } },
  );
  return res.data.data;
}

export async function getSeasonExtended(seasonId: number): Promise<TVDBSeasonExtended> {
  const res = await client.get<ApiResponse<TVDBSeasonExtended>>(
    `/seasons/${seasonId}/extended`,
    { params: { meta: 'translations' } },
  );
  return res.data.data;
}

export async function getSeriesEpisodeCounts(
  id: number,
): Promise<{ counts: Record<number, number>; averageRuntime: number | null }> {
  const counts: Record<number, number> = {};
  let totalRuntime = 0;
  let runtimeCount = 0;
  try {
    let page = 0;
    while (true) {
      const res = await client.get<ApiResponse<{ episodes: TVDBEpisode[] | null }>>(
        `/series/${id}/episodes/official`,
        { params: { page } },
      );
      const episodes = res.data.data?.episodes ?? [];
      for (const ep of episodes) {
        if (ep.number > 0 && ep.seasonNumber > 0) {
          counts[ep.seasonNumber] = (counts[ep.seasonNumber] ?? 0) + 1;
          if (ep.runtime && ep.runtime > 0) {
            totalRuntime += ep.runtime;
            runtimeCount++;
          }
        }
      }
      if (episodes.length < 100) break;
      page++;
    }
  } catch {
    // return whatever we have so far
  }
  const averageRuntime = runtimeCount > 0 ? Math.round(totalRuntime / runtimeCount) : null;
  return { counts, averageRuntime };
}

export async function searchSeries(query: string): Promise<TVDBSearchResult[]> {
  const res = await client.get<ApiResponse<TVDBSearchResult[]>>('/search', {
    params: { q: query, type: 'series', limit: 20 },
  });
  return res.data.data ?? [];
}

export async function getGenres(): Promise<TVDBGenre[]> {
  const res = await client.get<ApiResponse<TVDBGenre[]>>('/genres');
  return res.data.data ?? [];
}

export async function discoverByGenres(genreIds: number[], page = 0): Promise<TVDBSeriesBaseRecord[]> {
  const responses = await Promise.all(
    genreIds.map(genre =>
      client
        .get<ApiResponse<TVDBSeriesBaseRecord[]>>('/series/filter', {
          params: { sort: 'score', sortType: 'desc', country: 'usa', lang: 'eng', genre, page },
        })
        .then(res => res.data.data ?? [])
        .catch(() => [] as TVDBSeriesBaseRecord[]),
    ),
  );
  const seen = new Set<number>();
  return responses.flat().filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
