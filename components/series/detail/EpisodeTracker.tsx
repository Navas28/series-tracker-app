import { View, Text } from 'react-native';
import { useSeriesTracking, useToggleEpisode, useMarkSeason } from '@/hooks/useTracking';
import SeasonRow from './SeasonRow';
import type { ShowDetails } from '@/services/api/types';

interface Props {
  series: ShowDetails;
}

export default function EpisodeTracker({ series }: Props) {
  const { data: tracking } = useSeriesTracking(series.id);
  const trackingInput = {
    seriesId: series.id,
    name: series.name,
    posterUrl: series.poster_path,
    backdropUrl: series.backdrop_path,
    status: series.status,
    totalSeasons: series.number_of_seasons,
    totalEpisodes: series.number_of_episodes,
  };
  const { mutate: toggleEpisode } = useToggleEpisode(trackingInput);
  const { mutate: markSeason } = useMarkSeason(trackingInput);

  const visibleSeasons = series.seasons.filter(s => s.season_number > 0);
  if (visibleSeasons.length === 0) return null;

  // Build a map of seasonNum → episodeCount for all visible seasons
  const seasonEpisodeCounts: Record<number, number> = {};
  visibleSeasons.forEach(s => {
    seasonEpisodeCounts[s.season_number] = s.episode_count;
  });

  return (
    <View className="mb-7">
      <Text className="font-heading text-base text-text px-5 mb-3">
        Seasons ({visibleSeasons.length})
      </Text>
      {visibleSeasons.map(season => (
        <SeasonRow
          key={season.id}
          season={season}
          seriesId={series.id}
          tracking={tracking ?? null}
          onToggleEpisode={(sNum, epNum) =>
            toggleEpisode({ seasonNum: sNum, episodeNum: epNum })
          }
          onMarkSeason={(sNum, epCount, unwatch) =>
            markSeason({ seasonNum: sNum, episodeCount: epCount, unwatch, seasonEpisodeCounts })
          }
        />
      ))}
    </View>
  );
}
