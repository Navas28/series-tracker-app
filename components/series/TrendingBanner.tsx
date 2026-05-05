import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { getImageUrl } from '@/services/tmdb/client';
import type { SeriesListItem } from '@/services/tmdb/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 0.56);

interface Props {
  items?: SeriesListItem[];
  isLoading?: boolean;
}

export default function TrendingBanner({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <View className="px-5 mb-7">
        <View className="h-4 bg-surface-elevated rounded w-40 mb-3" />
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.8 }}
          transition={{ loop: true, type: 'timing', duration: 900 }}
          className="rounded-xl bg-surface-elevated"
          style={{ height: CARD_HEIGHT }}
        />
      </View>
    );
  }

  const topItems = items?.slice(0, 10) ?? [];

  return (
    <View className="mb-7">
      <Text className="font-heading text-base text-text px-5 mb-3">Trending This Week</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {topItems.map((item, index) => {
          const imageUrl =
            getImageUrl(item.backdrop_path, 'w780') ??
            getImageUrl(item.poster_path, 'w500');

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/series/${item.id}`)}
              activeOpacity={0.9}
              style={{ width: CARD_WIDTH }}
            >
              <View className="rounded-xl overflow-hidden" style={{ height: CARD_HEIGHT }}>
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={{ flex: 1 }}
                    contentFit="cover"
                    transition={300}
                  />
                ) : (
                  <View className="flex-1 bg-surface-elevated" />
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.88)']}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: CARD_HEIGHT * 0.65,
                  }}
                />
                <View className="absolute bottom-0 left-0 right-0 p-4">
                  <View className="flex-row items-center mb-1.5" style={{ gap: 8 }}>
                    <View className="bg-accent rounded px-1.5 py-0.5">
                      <Text className="font-mono-bold text-2xs text-accent-fg">
                        #{index + 1} Trending
                      </Text>
                    </View>
                    {item.vote_average > 0 && (
                      <Text className="font-mono text-xs text-rating">
                        ★ {item.vote_average.toFixed(1)}
                      </Text>
                    )}
                  </View>
                  <Text className="font-heading text-lg text-white" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="font-body text-xs text-white/70 mt-0.5" numberOfLines={2}>
                    {item.overview}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
