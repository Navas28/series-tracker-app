import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import * as Playlists from '../services/firestore/playlists';

export function usePlaylists() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['playlists', user?.uid],
    queryFn: () => Playlists.getPlaylists(user!.uid),
    enabled: !!user,
  });
}

export function useCreatePlaylist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => Playlists.createPlaylist(user!.uid, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['playlists', user?.uid] }),
  });
}

export function useDeletePlaylist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (playlistId: string) => Playlists.deletePlaylist(user!.uid, playlistId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['playlists', user?.uid] }),
  });
}

export function useAddToPlaylist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      playlistId,
      series,
    }: {
      playlistId: string;
      series: Playlists.PlaylistSeries;
    }) => Playlists.addSeriesToPlaylist(user!.uid, playlistId, series),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['playlists', user?.uid] }),
  });
}

export function useRemoveFromPlaylist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, seriesId }: { playlistId: string; seriesId: number }) =>
      Playlists.removeSeriesFromPlaylist(user!.uid, playlistId, seriesId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['playlists', user?.uid] }),
  });
}
