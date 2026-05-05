import { View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { getImageUrl } from '@/services/tmdb/client';
import type { SeriesDetails, WatchProvider } from '@/services/tmdb/types';

interface Props {
  series: SeriesDetails;
}

export default function SeriesWatchProviders({ series }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Defaulting to US providers for now, could be dynamic in future
  const providers = series['watch/providers']?.results?.['IN'] || series['watch/providers']?.results?.['US'];
  
  if (!providers || (!providers.flatrate && !providers.free)) return null;

  const streamProviders = [...(providers.flatrate ?? []), ...(providers.free ?? [])];
  
  // Remove duplicates based on provider_id
  const uniqueProviders = streamProviders.filter(
    (p, index, self) => index === self.findIndex((t) => t.provider_id === p.provider_id)
  );

  return (
    <View className="px-5 mb-6">
      <Text className="font-heading text-base text-text mb-3">Where to Watch</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {uniqueProviders.map(provider => (
          <View key={provider.provider_id} className="items-center" style={{ width: 60 }}>
            <View className="w-12 h-12 rounded-xl overflow-hidden bg-surface-elevated border border-border">
              {provider.logo_path ? (
                <Image
                  source={{ uri: getImageUrl(provider.logo_path, 'w154') || '' }}
                  style={{ flex: 1 }}
                />
              ) : (
                <View className="flex-1 bg-surface-elevated" />
              )}
            </View>
            <Text
              className="font-body text-[10px] text-text-sub mt-1.5 text-center"
              numberOfLines={1}
            >
              {provider.provider_name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
