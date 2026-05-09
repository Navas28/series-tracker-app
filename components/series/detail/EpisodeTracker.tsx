import { useMemo, useCallback } from 'react';
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

  const visibleSeasons = useMemo(() => series.seasons.filter(s => s.season_number > 0), [series.seasons]);

  const seasonEpisodeCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    visibleSeasons.forEach(s => { counts[s.season_number] = s.episode_count; });
    return counts;
  }, [visibleSeasons]);

  const handleToggleEpisode = useCallback(
    (sNum: number, epNum: number) => toggleEpisode({ seasonNum: sNum, episodeNum: epNum }),
    [toggleEpisode],
  );

  const handleMarkSeason = useCallback(
    (sNum: number, epCount: number, unwatch: boolean) =>
      markSeason({ seasonNum: sNum, episodeCount: epCount, unwatch, seasonEpisodeCounts }),
    [markSeason, seasonEpisodeCounts],
  );

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
          onToggleEpisode={handleToggleEpisode}
          onMarkSeason={handleMarkSeason}
        />
      ))}
    </View>
  );
}
