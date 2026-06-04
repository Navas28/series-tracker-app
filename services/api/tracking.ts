import { gql } from '@apollo/client';

const SERIES_FIELDS = `
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
`;

const TRACKED_SERIES_FIELDS = `
  series { ${SERIES_FIELDS} }
  addedAt
  lastWatchedAt
  watchedEpisodes { season episode watchedAt }
`;

export const TRACKED_SERIES_QUERY = gql`
  query TrackedSeries {
    trackedSeries {
      ${TRACKED_SERIES_FIELDS}
    }
  }
`;

export const SERIES_DETAIL_QUERY = gql`
  query SeriesDetail($tvdbId: Int!) {
    seriesDetail(tvdbId: $tvdbId) {
      id
      tvdbId
      name
      slug
      overview
      tagline
      status
      firstAired
      lastAired
      nextAired
      averageRuntime
      totalSeasons
      totalEpisodes
      score
      originalLanguage
      originalCountry
      contentRating
      posterUrl
      backdropUrl
      lastRefreshedAt
      genres { id tvdbId name slug }
      networks { id tvdbNetworkId name slug country imageUrl isOriginal }
      cast {
        id tvdbCharacterId characterName characterImageUrl
        personName personImageUrl peopleType sortOrder isFeatured
      }
      artworks { id tvdbId type url thumbnailUrl language score width height }
      remoteIds { sourceName externalId }
      seasons {
        id tvdbSeasonId seasonNumber name imageUrl year seasonType
        episodes {
          id tvdbEpisodeId episodeNumber seasonNumber
          name overview aired runtime imageUrl
        }
      }
      nextEpisode {
        id tvdbEpisodeId episodeNumber seasonNumber name overview aired runtime imageUrl
      }
      lastEpisode {
        id tvdbEpisodeId episodeNumber seasonNumber name overview aired runtime imageUrl
      }
    }
  }
`;

export const TRACK_SERIES_MUTATION = gql`
  mutation TrackSeries($tvdbId: Int!) {
    trackSeries(tvdbId: $tvdbId) {
      ${TRACKED_SERIES_FIELDS}
    }
  }
`;

export const REFRESH_SERIES_MUTATION = gql`
  mutation RefreshSeries($tvdbId: Int!) {
    refreshSeries(tvdbId: $tvdbId) {
      tvdbId
      lastRefreshedAt
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
