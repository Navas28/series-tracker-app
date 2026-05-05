import { View, Text } from 'react-native';
import { useSeriesTracking, useToggleEpisode, useMarkSeason } from '@/hooks/useTracking';
import SeasonRow from './SeasonRow';
import type { SeriesDetails } from '@/services/tmdb/types';

interface Props {
  series: SeriesDetails;
}

export default function EpisodeTracker({ series }: Props) {
  const { data: tracking } = useSeriesTracking(series.id);
  const { mutate: toggleEpisode } = useToggleEpisode(series.id);
  const { mutate: markSeason } = useMarkSeason(series.id);

  const visibleSeasons = series.seasons.filter(s => s.season_number > 0);
  if (visibleSeasons.length === 0) return null;

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
            markSeason({ seasonNum: sNum, episodeCount: epCount, unwatch })
          }
        />
      ))}
    </View>
  );
}
