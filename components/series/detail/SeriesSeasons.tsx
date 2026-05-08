import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import type { ShowSeason } from '@/services/api/types';

interface Props {
  seriesId: number;
  seasons: ShowSeason[];
}

export default function SeriesSeasons({ seriesId, seasons }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const visibleSeasons = seasons.filter(s => s.season_number > 0);
  if (visibleSeasons.length === 0) return null;

  return (
    <View className="mb-7">
      <Text className="font-heading text-base text-text px-5 mb-3">
        Seasons ({visibleSeasons.length})
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {visibleSeasons.map(season => {
          const posterUrl = season.poster_path;
          return (
            <View key={season.id} style={{ width: 110 }}>
              <View
                className="rounded-md overflow-hidden bg-surface-elevated"
                style={{ aspectRatio: 2 / 3 }}
              >
                {posterUrl ? (
                  <Image source={{ uri: posterUrl }} style={{ flex: 1 }} contentFit="cover" />
                ) : (
                  <View className="flex-1 items-center justify-center px-2">
                    <Text className="font-body text-2xs text-text-muted text-center">
                      {season.name}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="font-body-medium text-xs text-text mt-1.5" numberOfLines={1}>
                {season.name}
              </Text>
              <Text className="font-body text-2xs text-text-sub">
                {season.episode_count} eps
                {season.air_date ? ` · ${season.air_date.slice(0, 4)}` : ''}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
