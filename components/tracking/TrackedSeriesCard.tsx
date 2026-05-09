import { memo, useMemo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type SeriesTracking, getNextEpisode } from '@/services/firestore/tracking';

interface Props {
  tracking: SeriesTracking;
}

export function isOngoing(status: string): boolean {
  return status === 'Returning Series' || status === 'In Production' || status === 'To Be Determined';
}

function TrackedSeriesCard({ tracking }: Props) {
  const posterUrl = tracking.posterUrl;
  const watchedCount = useMemo(() => Object.keys(tracking.watched).length, [tracking.watched]);
  const total = tracking.totalEpisodes;
  const progress = useMemo(() => total > 0 ? watchedCount / total : 0, [watchedCount, total]);
  const ongoing = isOngoing(tracking.status);

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/series/[id]', params: { id: tracking.seriesId } })}
      activeOpacity={0.8}
      className="flex-row bg-surface rounded-xl border border-border overflow-hidden mb-3 mx-5"
    >
      <View className="bg-surface-elevated" style={{ width: 72, aspectRatio: 2 / 3 }}>
        {posterUrl ? (
          <Image source={{ uri: posterUrl }} style={{ flex: 1 }} contentFit="cover" />
        ) : null}
      </View>

      <View className="flex-1 p-3 justify-between">
        <View>
          <View className="flex-row items-start justify-between" style={{ gap: 8 }}>
            <Text className="font-heading-regular text-sm text-text flex-1" numberOfLines={2}>
              {tracking.name}
            </Text>
            <View
              className={`rounded-full px-2 py-0.5 ${ongoing ? 'bg-watched-subtle' : 'bg-surface-elevated'}`}
            >
              <Text
                className={`font-body text-2xs ${ongoing ? 'text-watched' : 'text-text-muted'}`}
              >
                {ongoing ? 'Ongoing' : 'Ended'}
              </Text>
            </View>
          </View>

          <Text className="font-body text-xs text-text-sub mt-1">
            {tracking.totalSeasons} season{tracking.totalSeasons !== 1 ? 's' : ''}
            {' · '}
            {watchedCount}/{total} eps watched
          </Text>

          {progress < 1 && (
            <View className="mt-2 bg-accent-subtle self-start px-2 py-0.5 rounded">
              <Text className="font-mono-bold text-[10px] text-accent uppercase">
                Next: {getNextEpisode(tracking.watched)}
              </Text>
            </View>
          )}
        </View>

        <View className="mt-2">
          <View className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <View
              className="h-full bg-watched rounded-full"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </View>
          <Text className="font-mono text-2xs text-text-muted mt-1">
            {Math.round(progress * 100)}% complete
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(TrackedSeriesCard);
