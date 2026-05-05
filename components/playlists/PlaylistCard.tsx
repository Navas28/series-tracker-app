import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { ListMusic } from 'lucide-react-native';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { getImageUrl } from '@/services/tmdb/client';
import type { Playlist } from '@/services/firestore/playlists';

interface Props {
  playlist: Playlist;
}

export default function PlaylistCard({ playlist }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const previews = playlist.series.slice(0, 4);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/playlists/${playlist.id}`)}
      activeOpacity={0.8}
      className="bg-surface rounded-xl border border-border overflow-hidden mb-3 mx-5"
    >
      <View className="flex-row" style={{ height: 72 }}>
        {previews.length > 0 ? (
          <View className="flex-row flex-wrap" style={{ width: 96 }}>
            {[0, 1, 2, 3].map(i => {
              const item = previews[i];
              const url = item ? getImageUrl(item.posterPath, 'w185') : null;
              return (
                <View key={i} className="bg-surface-elevated" style={{ width: 48, height: 36 }}>
                  {url ? (
                    <Image source={{ uri: url }} style={{ flex: 1 }} contentFit="cover" />
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <View
            className="bg-surface-elevated items-center justify-center"
            style={{ width: 96 }}
          >
            <ListMusic size={24} color={colors.textMuted} strokeWidth={1.5} />
          </View>
        )}

        <View className="flex-1 px-3 justify-center">
          <Text className="font-heading-regular text-sm text-text" numberOfLines={1}>
            {playlist.name}
          </Text>
          <Text className="font-body text-xs text-text-sub mt-0.5">
            {playlist.series.length} series
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
