import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronDown, ChevronUp, CheckCircle2, Circle, CheckCheck, Lock } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useSeasonDetails } from '@/hooks/useSeries';
import { countWatchedInSeason } from '@/services/firestore/tracking';
import { formatEpisodeAirDate, isReleased } from '@/utils/date';
import type { Season } from '@/services/tmdb/types';
import type { SeriesTracking } from '@/services/firestore/tracking';

interface Props {
  season: Season;
  seriesId: number;
  tracking: SeriesTracking | null;
  onToggleEpisode: (seasonNum: number, episodeNum: number) => void;
  onMarkSeason: (seasonNum: number, episodeCount: number, unwatch: boolean) => void;
}

export default function SeasonRow({
  season,
  seriesId,
  tracking,
  onToggleEpisode,
  onMarkSeason,
}: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [expanded, setExpanded] = useState(false);

  const { data: details, isLoading: loadingEps } = useSeasonDetails(
    seriesId,
    season.season_number,
    { enabled: expanded },
  );

  const watchedCount = tracking ? countWatchedInSeason(tracking.watched, season.season_number) : 0;
  const total = season.episode_count;
  const allWatched = total > 0 && watchedCount >= total;
  const progress = total > 0 ? watchedCount / total : 0;

  // A season is considered released if its air_date is in the past
  const seasonReleased = isReleased(season.air_date);

  return (
    <View className="mx-5 mb-2.5 rounded-xl bg-surface border border-border overflow-hidden">
      <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.8} className="px-4 pt-3 pb-3">
        <View className="flex-row items-center">
          <View className="flex-1 mr-2">
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <Text className="font-heading-regular text-sm text-text" numberOfLines={1}>
                {season.name}
              </Text>
              {!seasonReleased && (
                <View className="bg-surface-elevated rounded-full px-2 py-0.5">
                  <Text className="font-body text-[10px] text-text-muted">Upcoming</Text>
                </View>
              )}
            </View>
            <Text className="font-body text-xs text-text-sub mt-0.5">
              {[season.air_date?.slice(0, 4), `${total} eps`].filter(Boolean).join(' · ')}
              {tracking ? ` · ${watchedCount}/${total} watched` : ''}
            </Text>
          </View>

          <View className="flex-row items-center" style={{ gap: 10 }}>
            {total > 0 && (
              <TouchableOpacity
                onPress={() => {
                  if (!seasonReleased) return;
                  onMarkSeason(season.season_number, total, allWatched);
                }}
                hitSlop={10}
                disabled={!seasonReleased}
              >
                <CheckCheck
                  size={20}
                  color={
                    !seasonReleased
                      ? colors.border
                      : allWatched
                      ? colors.watched
                      : colors.textMuted
                  }
                  strokeWidth={2}
                />
              </TouchableOpacity>
            )}
            {expanded ? (
              <ChevronUp size={16} color={colors.textMuted} />
            ) : (
              <ChevronDown size={16} color={colors.textMuted} />
            )}
          </View>
        </View>

        {tracking && total > 0 && (
          <View className="h-1 bg-surface-elevated rounded-full mt-2.5 overflow-hidden">
            <View
              className="h-full bg-watched rounded-full"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </View>
        )}
      </TouchableOpacity>

      {expanded && (
        <View className="border-t border-border-subtle">
          {loadingEps && (
            <View className="py-4 items-center">
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
              <MotiView
                key={ep.id}
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'timing', duration: 150 }}
                className="flex-row items-center px-4 py-3 border-b border-border-subtle"
                style={{ opacity: episodeReleased ? 1 : 0.5 }}
              >
                <Text className="font-mono text-xs text-text-muted w-8">
                  {ep.episode_number}
                </Text>
                <View className="flex-1 mx-3">
                  <Text className="font-body-medium text-xs text-text" numberOfLines={1}>
                    {ep.name}
                  </Text>
                  {upcomingLabel ? (
                    <Text className="font-body text-[10px] text-accent mt-0.5">
                      {upcomingLabel}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (!episodeReleased) return;
                    onToggleEpisode(season.season_number, ep.episode_number);
                  }}
                  hitSlop={10}
                  disabled={!episodeReleased}
                >
                  {!episodeReleased ? (
                    <Lock size={16} color={colors.border} strokeWidth={1.75} />
                  ) : isWatched ? (
                    <CheckCircle2 size={20} color={colors.watched} strokeWidth={1.75} />
                  ) : (
                    <Circle size={20} color={colors.textMuted} strokeWidth={1.75} />
                  )}
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>
      )}
    </View>
  );
}
