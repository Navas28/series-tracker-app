import { memo, useMemo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { GqlTrackedSeries } from '@/services/api/types';

interface Props {
  tracking: GqlTrackedSeries;
}

export function isOngoing(status: string): boolean {
  return status === 'Returning Series' || status === 'In Production' || status === 'To Be Determined';
}

function TrackedSeriesCard({ tracking }: Props) {
  const { series, watchedEpisodes } = tracking;
  const watchedCount = watchedEpisodes.length;
  const total = series.totalEpisodes ?? 0;
  const progress = useMemo(() => total > 0 ? watchedCount / total : 0, [watchedCount, total]);
  const ongoing = isOngoing(series.status ?? '');
  const isFullyWatched = total > 0 && watchedCount >= total;

  let bottomLineColorClass = 'bg-border';
  if (ongoing) {
    bottomLineColorClass = 'bg-watched';
  } else if (isFullyWatched) {
    bottomLineColorClass = 'bg-accent';
  }

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/series/[id]', params: { id: series.tvdbId } })}
      activeOpacity={0.8}
    >
      <View
        className="rounded-xl overflow-hidden relative"
        style={{ aspectRatio: 2 / 3, width: '100%', backgroundColor: '#1a2d47' }}
      >
        {series.posterUrl ? (
          <Image source={{ uri: series.posterUrl }} style={{ flex: 1 }} contentFit="cover" />
        ) : null}
        <View className={`absolute bottom-0 left-0 right-0 h-1.5 ${bottomLineColorClass}`} />
      </View>
      <Text
        className="font-body-medium text-xs text-text mt-2 text-center"
        numberOfLines={2}
      >
        {series.name}
      </Text>
    </TouchableOpacity>
  );
}

export default memo(TrackedSeriesCard);
