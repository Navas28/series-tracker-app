import { useQuery, useMutation } from '@apollo/client/react';
import {
  TRACKED_SERIES_QUERY,
  TRACK_SERIES_MUTATION,
  UNTRACK_SERIES_MUTATION,
  MARK_EPISODE_WATCHED_MUTATION,
  UNMARK_EPISODE_WATCHED_MUTATION,
  MARK_SEASON_WATCHED_MUTATION,
  MARK_SEASON_UNWATCHED_MUTATION,
} from '@/services/api/tracking';
import type { GqlTrackedSeries } from '@/services/api/types';

export type TrackSeriesInput = {
  tvdbId: number;
  name: string;
  status?: string | null;
  totalSeasons?: number | null;
  totalEpisodes?: number | null;
  averageRuntime?: number | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  overview?: string | null;
};

export function useAllTracking() {
  const { data, loading, error, refetch } = useQuery<{ trackedSeries: GqlTrackedSeries[] }>(TRACKED_SERIES_QUERY);
  return {
    data: data?.trackedSeries,
    isLoading: loading,
    error,
    refetch,
  };
}

export function useSeriesTracking(tvdbId: number) {
  const { data, loading, error, refetch } = useQuery<{ trackedSeries: GqlTrackedSeries[] }>(TRACKED_SERIES_QUERY);
  const tracked = data?.trackedSeries.find((ts) => ts.series.tvdbId === tvdbId) ?? null;
  return { data: tracked, loading, error, refetch };
}

export function useAddTracking() {
  const [mutate, { loading }] = useMutation(TRACK_SERIES_MUTATION, {
    refetchQueries: [{ query: TRACKED_SERIES_QUERY }],
  });
  return {
    mutate: (input: TrackSeriesInput) => mutate({ variables: { input } }),
    isPending: loading,
  };
}

export function useRemoveTracking() {
  const [mutate, { loading }] = useMutation(UNTRACK_SERIES_MUTATION, {
    refetchQueries: [{ query: TRACKED_SERIES_QUERY }],
  });
  return {
    mutate: (tvdbId: number) => mutate({ variables: { tvdbId } }),
    isPending: loading,
  };
}

export function useToggleEpisode(tvdbId: number) {
  const { data } = useQuery<{ trackedSeries: GqlTrackedSeries[] }>(TRACKED_SERIES_QUERY);
  const tracked = data?.trackedSeries.find((ts) => ts.series.tvdbId === tvdbId);

  const [markWatched, { loading: marking }] = useMutation(MARK_EPISODE_WATCHED_MUTATION, {
    refetchQueries: [{ query: TRACKED_SERIES_QUERY }],
  });
  const [unmarkWatched, { loading: unmarking }] = useMutation(UNMARK_EPISODE_WATCHED_MUTATION, {
    refetchQueries: [{ query: TRACKED_SERIES_QUERY }],
  });

  return {
    mutate: async ({ seasonNum, episodeNum }: { seasonNum: number; episodeNum: number }) => {
      const isWatched = tracked?.watchedEpisodes.some(
        (ep) => ep.season === seasonNum && ep.episode === episodeNum,
      );
      if (isWatched) {
        await unmarkWatched({ variables: { tvdbId, season: seasonNum, episode: episodeNum } });
      } else {
        await markWatched({ variables: { tvdbId, season: seasonNum, episode: episodeNum } });
      }
    },
    isPending: marking || unmarking,
  };
}

export function useMarkSeason(tvdbId: number) {
  const [markWatched, { loading: marking }] = useMutation(MARK_SEASON_WATCHED_MUTATION, {
    refetchQueries: [{ query: TRACKED_SERIES_QUERY }],
  });
  const [markUnwatched, { loading: unmarking }] = useMutation(MARK_SEASON_UNWATCHED_MUTATION, {
    refetchQueries: [{ query: TRACKED_SERIES_QUERY }],
  });

  return {
    mutate: ({
      seasonNum,
      episodeCount,
      unwatch,
    }: {
      seasonNum: number;
      episodeCount: number;
      unwatch: boolean;
    }) => {
      if (unwatch) {
        return markUnwatched({ variables: { tvdbId, season: seasonNum } });
      }
      return markWatched({ variables: { tvdbId, season: seasonNum, episodeCount } });
    },
    isPending: marking || unmarking,
  };
}
