import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { getImageUrl } from '@/services/tmdb/client';
import type { SeriesListItem } from '@/services/tmdb/types';

interface Props {
  item: SeriesListItem;
  width?: number;
}

export default function SeriesCard({ item, width = 120 }: Props) {
  const imageUrl = getImageUrl(item.poster_path, 'w342');

  return (
    <TouchableOpacity
      onPress={() => router.push(`/series/${item.id}`)}
      activeOpacity={0.75}
      style={{ width }}
    >
      <View
        className="rounded-md overflow-hidden bg-surface-elevated"
        style={{ aspectRatio: 2 / 3 }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ flex: 1 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-2">
            <Text className="font-body text-2xs text-text-muted text-center">{item.name}</Text>
          </View>
        )}
        {item.vote_average > 0 && (
          <View className="absolute top-1.5 left-1.5 bg-black/60 rounded px-1.5 py-0.5">
            <Text className="font-mono-bold text-2xs text-rating">★ {item.vote_average.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <Text className="font-body-medium text-xs text-text mt-1.5" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="font-body text-2xs text-text-sub">
        {item.first_air_date?.slice(0, 4) ?? ''}
      </Text>
    </TouchableOpacity>
  );
}
