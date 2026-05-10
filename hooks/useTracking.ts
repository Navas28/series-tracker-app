import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import * as Tracking from '../services/firestore/tracking';

export function useAllTracking() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tracking', user?.uid],
    queryFn: () => Tracking.getAllTracking(user!.uid),
    enabled: !!user,
  });
}

export function useSeriesTracking(seriesId: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tracking', user?.uid, seriesId],
    queryFn: () => Tracking.getTracking(user!.uid, seriesId),
    enabled: !!user && seriesId > 0,
  });
}

export function useAddTracking() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Tracking.TrackingInput) => Tracking.addTracking(user!.uid, input),
    onSuccess: (_, input) => {
      qc.invalidateQueries({ queryKey: ['tracking', user?.uid] });
      qc.invalidateQueries({ queryKey: ['tracking', user?.uid, input.seriesId] });
    },
  });
}

export function useRemoveTracking() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (seriesId: number) => Tracking.removeTracking(user!.uid, seriesId),
    onSuccess: (_, seriesId) => {
      qc.invalidateQueries({ queryKey: ['tracking', user?.uid] });
      qc.invalidateQueries({ queryKey: ['tracking', user?.uid, seriesId] });
    },
  });
}

export function useToggleEpisode(series: Tracking.TrackingInput) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ seasonNum, episodeNum }: { seasonNum: number; episodeNum: number }) => {
      const existing = await Tracking.getTracking(user!.uid, series.seriesId);
      if (!existing) {
        await Tracking.addTracking(user!.uid, series);
      }
      return Tracking.toggleEpisode(user!.uid, series.seriesId, seasonNum, episodeNum, {
        status: series.status,
        totalEpisodes: series.totalEpisodes,
        totalSeasons: series.totalSeasons,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracking', user?.uid, series.seriesId] });
      qc.invalidateQueries({ queryKey: ['tracking', user?.uid] });
    },
  });
}

export function useMarkSeason(series: Tracking.TrackingInput) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      seasonNum,
      episodeCount,
      unwatch,
      seasonEpisodeCounts,
    }: {
      seasonNum: number;
      episodeCount: number;
      unwatch: boolean;
      seasonEpisodeCounts?: Record<number, number>;
    }) => {
      const existing = await Tracking.getTracking(user!.uid, series.seriesId);
      if (!existing) {
        await Tracking.addTracking(user!.uid, series);
      }
      return unwatch
        ? Tracking.markSeasonUnwatched(user!.uid, series.seriesId, seasonNum)
        : Tracking.markSeasonWatched(
            user!.uid,
            series.seriesId,
            seasonNum,
            episodeCount,
            seasonEpisodeCounts,
            {
              status: series.status,
              totalEpisodes: series.totalEpisodes,
              totalSeasons: series.totalSeasons,
            },
          );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracking', user?.uid, series.seriesId] });
      qc.invalidateQueries({ queryKey: ['tracking', user?.uid] });
    },
  });
}
