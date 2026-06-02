import { gql } from '@apollo/client';

export const TRACKED_SERIES_QUERY = gql`
  query TrackedSeries {
    trackedSeries {
      series {
        id
        tvdbId
        name
        status
        totalSeasons
        totalEpisodes
        averageRuntime
        posterUrl
        backdropUrl
        overview
      }
      addedAt
      lastWatchedAt
      watchedEpisodes {
        season
        episode
        watchedAt
      }
    }
  }
`;

export const TRACK_SERIES_MUTATION = gql`
  mutation TrackSeries($input: TrackSeriesInput!) {
    trackSeries(input: $input) {
      series {
        id
        tvdbId
        name
        status
        totalSeasons
        totalEpisodes
        averageRuntime
        posterUrl
        backdropUrl
        overview
      }
      addedAt
      lastWatchedAt
      watchedEpisodes {
        season
        episode
        watchedAt
      }
    }
  }
`;

export const UNTRACK_SERIES_MUTATION = gql`
  mutation UntrackSeries($tvdbId: Int!) {
    untrackSeries(tvdbId: $tvdbId)
  }
`;

export const MARK_EPISODE_WATCHED_MUTATION = gql`
  mutation MarkEpisodeWatched($tvdbId: Int!, $season: Int!, $episode: Int!) {
    markEpisodeWatched(tvdbId: $tvdbId, season: $season, episode: $episode) {
      season
      episode
      watchedAt
    }
  }
`;

export const UNMARK_EPISODE_WATCHED_MUTATION = gql`
  mutation UnmarkEpisodeWatched($tvdbId: Int!, $season: Int!, $episode: Int!) {
    unmarkEpisodeWatched(tvdbId: $tvdbId, season: $season, episode: $episode)
  }
`;

export const MARK_SEASON_WATCHED_MUTATION = gql`
  mutation MarkSeasonWatched($tvdbId: Int!, $season: Int!, $episodeCount: Int!) {
    markSeasonWatched(tvdbId: $tvdbId, season: $season, episodeCount: $episodeCount) {
      season
      episode
      watchedAt
    }
  }
`;

export const MARK_SEASON_UNWATCHED_MUTATION = gql`
  mutation MarkSeasonUnwatched($tvdbId: Int!, $season: Int!) {
    markSeasonUnwatched(tvdbId: $tvdbId, season: $season)
  }
`;
