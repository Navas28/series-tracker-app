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

export function useToggleEpisode(seriesId: number) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ seasonNum, episodeNum }: { seasonNum: number; episodeNum: number }) =>
      Tracking.toggleEpisode(user!.uid, seriesId, seasonNum, episodeNum),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracking', user?.uid, seriesId] });
      qc.invalidateQueries({ queryKey: ['tracking', user?.uid] });
    },
  });
}

export function useMarkSeason(seriesId: number) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      seasonNum,
      episodeCount,
      unwatch,
    }: {
      seasonNum: number;
      episodeCount: number;
      unwatch: boolean;
    }) =>
      unwatch
        ? Tracking.markSeasonUnwatched(user!.uid, seriesId, seasonNum)
        : Tracking.markSeasonWatched(user!.uid, seriesId, seasonNum, episodeCount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracking', user?.uid, seriesId] });
      qc.invalidateQueries({ queryKey: ['tracking', user?.uid] });
    },
  });
}
