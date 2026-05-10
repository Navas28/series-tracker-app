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
  const isFullyWatched = total > 0 && watchedCount >= total;

  let bottomLineColorClass = 'bg-border';
  if (ongoing) {
    bottomLineColorClass = 'bg-watched'; // Ongoing (slate/blue)
  } else if (isFullyWatched) {
    bottomLineColorClass = 'bg-accent'; // Ended and watched completely (yellow)
  } else {
    bottomLineColorClass = 'bg-border'; // Ended and not watched completely (gray)
  }

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/series/[id]', params: { id: tracking.seriesId } })}
      activeOpacity={0.8}
    >
      <View
        className="rounded-xl overflow-hidden relative"
        style={{ aspectRatio: 2 / 3, width: '100%', backgroundColor: '#1a2d47' }}
      >
        {posterUrl ? (
          <Image source={{ uri: posterUrl }} style={{ flex: 1 }} contentFit="cover" />
        ) : null}
        
        {/* Category Line at the bottom of the poster */}
        <View className={`absolute bottom-0 left-0 right-0 h-1.5 ${bottomLineColorClass}`} />
      </View>
      <Text
        className="font-body-medium text-xs text-text mt-2 text-center"
        numberOfLines={2}
      >
        {tracking.name}
      </Text>
    </TouchableOpacity>
  );
}

export default memo(TrackedSeriesCard);
