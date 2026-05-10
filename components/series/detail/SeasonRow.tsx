import { useState, useMemo, memo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronDown, ChevronUp, CheckCircle2, Circle, CheckCheck, Lock } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useSeasonDetails } from '@/hooks/useSeries';
import { countWatchedInSeason } from '@/services/firestore/tracking';
import { formatEpisodeAirDate, isReleased } from '@/utils/date';
import type { ShowSeason } from '@/services/api/types';
import type { SeriesTracking } from '@/services/firestore/tracking';

function formatRuntime(minutes: number): string {
  if (minutes <= 0) return '';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface Props {
  season: ShowSeason;
  seriesId: number;
  tracking: SeriesTracking | null;
  releasedEpisodeCount: number;
  averageRuntime?: number;
  onToggleEpisode: (seasonNum: number, episodeNum: number) => void;
  onMarkSeason: (seasonNum: number, episodeCount: number, unwatch: boolean) => void;
}

function SeasonRow({ season, seriesId, tracking, releasedEpisodeCount, averageRuntime, onToggleEpisode, onMarkSeason }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [expanded, setExpanded] = useState(false);

  const { data: details, isLoading: loadingEps } = useSeasonDetails(
    seriesId,
    season.id,
    season.season_number,
    { enabled: expanded },
  );

  const watchedCount = useMemo(
    () => (tracking ? countWatchedInSeason(tracking.watched, season.season_number) : 0),
    [tracking, season.season_number],
  );
  const total = season.episode_count;
  const allWatched = total > 0 && watchedCount >= total;
  const hasPartialProgress = watchedCount > 0 && !allWatched;
  const progress = useMemo(
    () => (total > 0 ? watchedCount / total : 0),
    [watchedCount, total],
  );
  const seasonReleased = isReleased(season.air_date);

  const seasonTotalMinutes = useMemo(() => {
    if (details?.episodes) {
      return details.episodes.reduce((sum, ep) => sum + (ep.runtime ?? 0), 0);
    }
    return averageRuntime ? Math.round(averageRuntime * season.episode_count) : 0;
  }, [details?.episodes, averageRuntime, season.episode_count]);

  const seasonWatchedMinutes = useMemo(() => {
    if (details?.episodes && tracking) {
      return details.episodes.reduce((sum, ep) => {
        const key = `S${season.season_number}E${ep.episode_number}`;
        return sum + (tracking.watched[key] ? (ep.runtime ?? 0) : 0);
      }, 0);
    }
    return averageRuntime && watchedCount > 0 ? Math.round(averageRuntime * watchedCount) : 0;
  }, [details?.episodes, tracking, season.season_number, averageRuntime, watchedCount]);

  return (
    <View
      className={`mx-4 mb-3 rounded-2xl overflow-hidden bg-surface ${
        allWatched ? 'border border-accent/30' : 'border border-border'
      }`}
    >
      <TouchableOpacity
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.75}
      >
        <View className="flex-row items-center px-3.5 pt-3.5 pb-3" style={{ gap: 12 }}>
          {/* Season badge */}
          <View
            className={`w-11 h-11 rounded-xl items-center justify-center ${
              allWatched
                ? 'bg-accent'
                : hasPartialProgress
                ? 'bg-accent-subtle'
                : 'bg-surface-elevated'
            }`}
          >
            {allWatched ? (
              <CheckCheck size={18} color={colors.background} strokeWidth={2.5} />
            ) : (
              <Text
                className={`font-mono-bold text-sm ${
                  hasPartialProgress ? 'text-accent' : 'text-text-muted'
                }`}
              >
                {season.season_number}
              </Text>
            )}
          </View>

          {/* Season info */}
          <View className="flex-1">
            <View className="flex-row items-center flex-wrap" style={{ gap: 6 }}>
              <Text className="font-heading-regular text-sm text-text" numberOfLines={1}>
                {season.name}
              </Text>
              {!seasonReleased && (
                <View className="bg-accent-subtle rounded px-1.5 py-0.5">
                  <Text className="font-body text-[9px] text-accent">UPCOMING</Text>
                </View>
              )}
            </View>
            <Text className="font-body text-xs text-text-muted mt-0.5">
              {[
                season.air_date?.slice(0, 4),
                `${total} eps`,
                seasonTotalMinutes > 0
                  ? (tracking && seasonWatchedMinutes > 0 && seasonWatchedMinutes < seasonTotalMinutes
                      ? `${formatRuntime(seasonWatchedMinutes)} / ${formatRuntime(seasonTotalMinutes)}`
                      : formatRuntime(seasonTotalMinutes))
                  : null,
              ].filter(Boolean).join(' · ')}
            </Text>
          </View>

          {/* Right controls */}
          <View className="flex-row items-center" style={{ gap: 10 }}>
            {tracking && releasedEpisodeCount > 0 && (
              <View
                className={`rounded-full px-2.5 py-1 ${
                  allWatched
                    ? 'bg-accent'
                    : hasPartialProgress
                    ? 'bg-accent-subtle'
                    : 'bg-surface-elevated'
                }`}
              >
                <Text
                  className={`font-mono text-xs ${
                    allWatched
                      ? 'text-background'
                      : hasPartialProgress
                      ? 'text-accent'
                      : 'text-text-muted'
                  }`}
                >
                  {watchedCount}/{releasedEpisodeCount}
                  {releasedEpisodeCount < total ? (
                    <Text className="text-text-muted"> of {total}</Text>
                  ) : null}
                </Text>
              </View>
            )}

            {seasonReleased && releasedEpisodeCount >= total && watchedCount < total && (
              <TouchableOpacity
                onPress={() => onMarkSeason(season.season_number, releasedEpisodeCount, false)}
                hitSlop={12}
              >
                <CheckCheck size={18} color={colors.textMuted} strokeWidth={1.75} />
              </TouchableOpacity>
            )}

            {allWatched && (
              <TouchableOpacity
                onPress={() => onMarkSeason(season.season_number, releasedEpisodeCount, true)}
                hitSlop={12}
              >
                <CheckCheck size={18} color={colors.accent} strokeWidth={2} />
              </TouchableOpacity>
            )}

            {expanded ? (
              <ChevronUp size={14} color={colors.textMuted} />
            ) : (
              <ChevronDown size={14} color={colors.textMuted} />
            )}
          </View>
        </View>

        {tracking && total > 0 && watchedCount > 0 && !allWatched && (
          <View className="h-0.5 mx-3.5 mb-3 rounded-full bg-surface-elevated overflow-hidden">
            <View
              className="h-full bg-accent rounded-full"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </View>
        )}
      </TouchableOpacity>

      {expanded && (
        <View className="border-t border-border-subtle">
          {loadingEps && (
            <View className="py-5 items-center">
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          )}

          {details?.episodes.map(ep => {
            const key = `S${season.season_number}E${ep.episode_number}`;
            const isWatched = !!tracking?.watched[key];
            const episodeReleased = isReleased(ep.air_date);
            const upcomingLabel = !episodeReleased
              ? formatEpisodeAirDate(ep.air_date) ?? 'Upcoming'
              : null;

            return (
              <View
                key={ep.id}
                className={`flex-row items-center px-4 py-3.5 border-b border-border-subtle ${
                  isWatched ? 'bg-watched-subtle' : ''
                }`}
                style={{ opacity: episodeReleased ? 1 : 0.45 }}
              >
                <Text
                  className={`font-mono text-xs w-8 ${
                    isWatched ? 'text-success' : 'text-text-muted'
                  }`}
                >
                  {String(ep.episode_number).padStart(2, '0')}
                </Text>

                <View className="flex-1 mx-3">
                  <Text
                    className={`font-body-medium text-xs ${
                      isWatched ? 'text-text-sub' : 'text-text'
                    }`}
                    numberOfLines={1}
                  >
                    {ep.name}
                  </Text>
                  <View className="flex-row items-center mt-0.5" style={{ gap: 6 }}>
                    {ep.runtime ? (
                      <Text className="font-mono text-[10px] text-text-muted">
                        {formatRuntime(ep.runtime)}
                      </Text>
                    ) : null}
                    {upcomingLabel ? (
                      <Text className="font-body text-[10px] text-accent">
                        {upcomingLabel}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    if (!episodeReleased) return;
                    onToggleEpisode(season.season_number, ep.episode_number);
                  }}
                  hitSlop={12}
                  disabled={!episodeReleased}
                >
                  {!episodeReleased ? (
                    <Lock size={15} color={colors.border} strokeWidth={1.75} />
                  ) : isWatched ? (
                    <CheckCircle2 size={21} color={colors.success} strokeWidth={1.75} />
                  ) : (
                    <Circle size={21} color={colors.textMuted} strokeWidth={1.5} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default memo(SeasonRow);
