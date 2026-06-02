import { useQuery, useMutation } from '@apollo/client/react';
import {
  PLAYLISTS_QUERY,
  CREATE_PLAYLIST_MUTATION,
  DELETE_PLAYLIST_MUTATION,
  ADD_SERIES_TO_PLAYLIST_MUTATION,
  REMOVE_SERIES_FROM_PLAYLIST_MUTATION,
} from '@/services/api/playlists';
import type { GqlPlaylist } from '@/services/api/types';

export function usePlaylists() {
  const { data, loading, error, refetch } = useQuery<{ playlists: GqlPlaylist[] }>(PLAYLISTS_QUERY);
  return {
    data: data?.playlists,
    isLoading: loading,
    error,
    refetch,
  };
}

export function useCreatePlaylist() {
  const [mutate, { loading }] = useMutation(CREATE_PLAYLIST_MUTATION, {
    refetchQueries: [{ query: PLAYLISTS_QUERY }],
  });
  return {
    mutate: (name: string, options?: { onSuccess?: () => void }) => {
      mutate({ variables: { name } }).then(() => options?.onSuccess?.());
    },
    isPending: loading,
  };
}

export function useDeletePlaylist() {
  const [mutate, { loading }] = useMutation(DELETE_PLAYLIST_MUTATION, {
    refetchQueries: [{ query: PLAYLISTS_QUERY }],
  });
  return {
    mutate: (id: string, options?: { onSuccess?: () => void }) => {
      mutate({ variables: { id } }).then(() => options?.onSuccess?.());
    },
    isPending: loading,
  };
}

export function useAddToPlaylist() {
  const [mutate, { loading }] = useMutation(ADD_SERIES_TO_PLAYLIST_MUTATION, {
    refetchQueries: [{ query: PLAYLISTS_QUERY }],
  });
  return {
    mutate: (
      args: { playlistId: string; tvdbId: number },
      options?: { onSuccess?: () => void },
    ) => {
      mutate({ variables: { playlistId: args.playlistId, tvdbId: args.tvdbId } }).then(
        () => options?.onSuccess?.(),
      );
    },
    isPending: loading,
  };
}

export function useRemoveFromPlaylist() {
  const [mutate, { loading }] = useMutation(REMOVE_SERIES_FROM_PLAYLIST_MUTATION, {
    refetchQueries: [{ query: PLAYLISTS_QUERY }],
  });
  return {
    mutate: (args: { playlistId: string; tvdbId: number }) => {
      mutate({ variables: { playlistId: args.playlistId, tvdbId: args.tvdbId } });
    },
    isPending: loading,
  };
}
