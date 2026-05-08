import tvmazeClient from './client';
import type { TVMazeShow, TVMazeSearchResult, TVMazeEpisode, TVMazeSeason } from './types';

export async function searchShows(query: string): Promise<TVMazeSearchResult[]> {
  const { data } = await tvmazeClient.get<TVMazeSearchResult[]>('/search/shows', {
    params: { q: query },
  });
  return data;
}

export async function getShowDetails(showId: number): Promise<TVMazeShow> {
  const url = `https://api.tvmaze.com/shows/${showId}?embed[]=cast&embed[]=seasons&embed[]=images`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TVMaze ${res.status}: ${url}`);
  return res.json() as Promise<TVMazeShow>;
}

export async function getSeasonEpisodes(seasonId: number): Promise<TVMazeEpisode[]> {
  const { data } = await tvmazeClient.get<TVMazeEpisode[]>(`/seasons/${seasonId}/episodes`);
  return data;
}

export async function getShowSeasons(showId: number): Promise<TVMazeSeason[]> {
  const { data } = await tvmazeClient.get<TVMazeSeason[]>(`/shows/${showId}/seasons`);
  return data;
}

export async function getScheduleForDate(date: string): Promise<TVMazeEpisode[]> {
  const { data } = await tvmazeClient.get<TVMazeEpisode[]>('/schedule', {
    params: { date },
  });
  return data;
}

export async function getStreamingScheduleForDate(date: string): Promise<TVMazeEpisode[]> {
  const { data } = await tvmazeClient.get<TVMazeEpisode[]>('/schedule/web', {
    params: { date },
  });
  return data;
}

export async function lookupByTvdb(tvdbId: number): Promise<TVMazeShow | null> {
  try {
    const { data } = await tvmazeClient.get<TVMazeShow>('/lookup/shows', {
      params: { thetvdb: tvdbId },
    });
    return data;
  } catch {
    return null;
  }
}

export async function lookupByImdb(imdbId: string): Promise<TVMazeShow | null> {
  try {
    const { data } = await tvmazeClient.get<TVMazeShow>('/lookup/shows', {
      params: { imdb: imdbId },
    });
    return data;
  } catch {
    return null;
  }
}
