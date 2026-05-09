import { memo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ShowListItem } from '@/services/api/types';

interface Props {
  item: ShowListItem;
  width?: number;
}

function SeriesCard({ item, width = 120 }: Props) {
  const imageUrl = item.poster_path;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/series/${item.id}`)}
      activeOpacity={0.75}
      style={{ width }}
    >
      {/* Poster */}
      <View
        className="rounded-xl overflow-hidden bg-surface-elevated"
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
            <Text className="font-body text-2xs text-text-muted text-center">
              {item.name}
            </Text>
          </View>
        )}

        {/* Rating badge — inside poster, top-left */}
        {item.vote_average > 0 && (
          <View
            className="absolute top-2 left-2 rounded-md px-1.5 py-0.5"
            style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}
          >
            <Text className="font-mono-bold text-2xs text-rating">
              ★ {item.vote_average.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Metadata */}
      <Text className="font-body-medium text-xs text-text mt-1.5" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="font-body text-2xs text-text-sub">
        {item.first_air_date?.slice(0, 4) ?? ''}
      </Text>
    </TouchableOpacity>
  );
}

export default memo(SeriesCard);
