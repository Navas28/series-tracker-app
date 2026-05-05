import { View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { getImageUrl } from '@/services/tmdb/client';
import type { CastMember } from '@/services/tmdb/types';

interface Props {
  cast: CastMember[];
}

export default function SeriesCastRow({ cast }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const topCast = cast.slice(0, 20);

  if (topCast.length === 0) return null;

  return (
    <View className="mb-7">
      <Text className="font-heading text-base text-text px-5 mb-3">Cast</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
      >
        {topCast.map(member => {
          const photoUrl = getImageUrl(member.profile_path, 'w185');
          return (
            <View key={member.id} style={{ width: 72, alignItems: 'center' }}>
              <View className="w-16 h-16 rounded-full overflow-hidden bg-surface-elevated border border-border">
                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} style={{ flex: 1 }} contentFit="cover" />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <User size={24} color={colors.textMuted} strokeWidth={1.5} />
                  </View>
                )}
              </View>
              <Text className="font-body-medium text-2xs text-text text-center mt-1.5" numberOfLines={2}>
                {member.name}
              </Text>
              <Text className="font-body text-[10px] text-text-muted text-center" numberOfLines={2}>
                {member.roles?.[0]?.character ?? ''}
              </Text>
              <Text className="font-mono text-[9px] text-accent mt-0.5">
                {member.total_episode_count} eps
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
