import { useMemo, useCallback } from 'react';
import { View, Text } from 'react-native';
import { useSeriesTracking, useToggleEpisode, useMarkSeason } from '@/hooks/useTracking';
import SeasonRow from './SeasonRow';
import type { ShowDetails, ShowSeason } from '@/services/api/types';
import { isReleased } from '@/utils/date';

interface Props {
  series: ShowDetails;
}

export default function EpisodeTracker({ series }: Props) {
  const { data: tracking } = useSeriesTracking(series.id);
  const { mutate: toggleEpisode } = useToggleEpisode(series.id);
  const { mutate: markSeason } = useMarkSeason(series.id);

  const visibleSeasons = useMemo(
    () => series.seasons.filter(s => s.season_number > 0),
    [series.seasons],
  );

  const getReleasedEpisodeCount = useCallback((season: ShowSeason): number => {
    if (!isReleased(season.air_date)) return 0;
    const nextEp = series.next_episode_to_air;
    const lastEp = series.last_episode_to_air;
    if (nextEp?.season_number === season.season_number) {
      return Math.max(0, nextEp.episode_number - 1);
    }
    if (lastEp?.season_number === season.season_number) {
      return lastEp.episode_number;
    }
    return season.episode_count;
  }, [series.next_episode_to_air, series.last_episode_to_air]);

  const totalWatched = tracking?.watchedEpisodes.length ?? 0;
  const totalEps = series.number_of_episodes;
  const overallProgress = totalEps > 0 ? totalWatched / totalEps : 0;

  const avgRuntime = series.averageRuntime ?? 0;
  const totalMinutes = avgRuntime > 0 ? Math.round(avgRuntime * totalEps) : 0;
  const watchedMinutes = avgRuntime > 0 ? Math.round(avgRuntime * totalWatched) : 0;

  function formatRuntime(minutes: number): string {
    if (minutes <= 0) return '';
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  const handleToggleEpisode = useCallback(
    (sNum: number, epNum: number) => toggleEpisode({ seasonNum: sNum, episodeNum: epNum }),
    [toggleEpisode],
  );

  const handleMarkSeason = useCallback(
    (sNum: number, epCount: number, unwatch: boolean) =>
      markSeason({ seasonNum: sNum, episodeCount: epCount, unwatch }),
    [markSeason],
  );

  if (visibleSeasons.length === 0) return null;

  return (
    <View className="mb-8">
      <View className="px-5 mb-4">
        <Text className="font-heading text-base text-text mb-3">
          Seasons{' '}
          <Text className="font-body text-sm text-text-muted">
            ({visibleSeasons.length})
          </Text>
        </Text>

        {tracking && totalEps > 0 && (
          <View className="h-1 bg-surface-elevated rounded-full overflow-hidden mb-3">
            <View
              className="h-full bg-accent rounded-full"
              style={{ width: `${Math.round(overallProgress * 100)}%` }}
            />
          </View>
        )}

        {tracking && (
          <View className="flex-row" style={{ gap: 8 }}>
            <View className="flex-row items-center bg-surface-elevated rounded-full px-3 py-1.5" style={{ gap: 4 }}>
              <Text className="font-mono text-xs text-accent">{totalWatched}</Text>
              <Text className="font-mono text-xs text-text-muted">/ {totalEps}</Text>
              <Text className="font-body text-[10px] text-text-muted">eps</Text>
            </View>
            {totalMinutes > 0 && (
              <View className="flex-row items-center bg-surface-elevated rounded-full px-3 py-1.5" style={{ gap: 4 }}>
                {watchedMinutes > 0 && watchedMinutes < totalMinutes ? (
                  <>
                    <Text className="font-mono text-xs text-accent">{formatRuntime(watchedMinutes)}</Text>
                    <Text className="font-mono text-xs text-text-muted">/</Text>
                  </>
                ) : null}
                <Text className="font-mono text-xs text-text-muted">{formatRuntime(totalMinutes)}</Text>
                <Text className="font-body text-[10px] text-text-muted">total</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {visibleSeasons.map(season => (
        <SeasonRow
          key={season.id}
          season={season}
          seriesId={series.id}
          tracking={tracking ?? null}
          releasedEpisodeCount={getReleasedEpisodeCount(season)}
          averageRuntime={avgRuntime > 0 ? avgRuntime : undefined}
          onToggleEpisode={handleToggleEpisode}
          onMarkSeason={handleMarkSeason}
        />
      ))}
    </View>
  );
}
