import { gql } from '@apollo/client';

export const PLAYLISTS_QUERY = gql`
  query Playlists {
    playlists {
      id
      name
      createdAt
      series {
        id
        tvdbId
        name
        posterUrl
      }
    }
  }
`;

export const DELETE_PLAYLIST_MUTATION = gql`
  mutation DeletePlaylist($id: ID!) {
    deletePlaylist(id: $id)
  }
`;

export const CREATE_PLAYLIST_MUTATION = gql`
  mutation CreatePlaylist($name: String!) {
    createPlaylist(name: $name) {
      id
      name
      createdAt
      series {
        id
        tvdbId
        name
        posterUrl
      }
    }
  }
`;

export const ADD_SERIES_TO_PLAYLIST_MUTATION = gql`
  mutation AddSeriesToPlaylist($playlistId: ID!, $tvdbId: Int!) {
    addSeriesToPlaylist(playlistId: $playlistId, tvdbId: $tvdbId) {
      id
      name
      createdAt
      series {
        id
        tvdbId
        name
        posterUrl
      }
    }
  }
`;

export const REMOVE_SERIES_FROM_PLAYLIST_MUTATION = gql`
  mutation RemoveSeriesFromPlaylist($playlistId: ID!, $tvdbId: Int!) {
    removeSeriesFromPlaylist(playlistId: $playlistId, tvdbId: $tvdbId) {
      id
      name
      createdAt
      series {
        id
        tvdbId
        name
        posterUrl
      }
    }
  }
`;
