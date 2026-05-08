import { View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import type { ShowCastMember } from '@/services/api/types';

interface Props {
  cast: ShowCastMember[];
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
        {topCast.map(member => (
          <View key={member.id} style={{ width: 72, alignItems: 'center' }}>
            <View className="w-16 h-16 rounded-full overflow-hidden bg-surface-elevated border border-border">
              {member.profile_path ? (
                <Image source={{ uri: member.profile_path }} style={{ flex: 1 }} contentFit="cover" />
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
              {member.character}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
