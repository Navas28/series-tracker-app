import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Star, Tv2, Calendar } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import type { ShowDetails } from '@/services/api/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKDROP_HEIGHT = Math.round(SCREEN_WIDTH * 0.58);

interface Props {
  series: ShowDetails;
}

export default function SeriesHero({ series }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const isEnded = series.status === 'Ended' || series.status === 'Canceled';

  return (
    <View>
      <View style={{ height: BACKDROP_HEIGHT }}>
        {series.backdrop_path ? (
          <Image source={{ uri: series.backdrop_path }} style={{ flex: 1 }} contentFit="cover" />
        ) : (
          <View className="flex-1 bg-surface-elevated" />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.7)']}
          locations={[0, 0.4, 1]}
          style={{ position: 'absolute', inset: 0 }}
        />
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-14 left-4 w-9 h-9 rounded-full bg-black/50 items-center justify-center"
        >
          <ArrowLeft size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View className="px-5 pb-4" style={{ marginTop: -32 }}>
        <View className="flex-row" style={{ gap: 14 }}>
          <View
            className="rounded-lg overflow-hidden bg-surface-elevated border border-border"
            style={{ width: 90, aspectRatio: 2 / 3, marginTop: -44 }}
          >
            {series.poster_path ? (
              <Image source={{ uri: series.poster_path }} style={{ flex: 1 }} contentFit="cover" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Tv2 size={24} color={colors.textMuted} strokeWidth={1.5} />
              </View>
            )}
            {series.vote_average > 0 && (
              <View
                className="absolute bottom-1 right-1 bg-black/80 rounded-md px-1.5 py-0.5 flex-row items-center"
                style={{ gap: 3 }}
              >
                <Star size={10} color={colors.rating} fill={colors.rating} />
                <Text className="font-mono-bold text-[10px] text-white">
                  {series.vote_average.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1 pt-2">
            <Text className="font-heading text-xl text-text" numberOfLines={2}>
              {series.name}
            </Text>
            <Text className="font-body text-sm text-text-sub mt-0.5">
              {series.first_air_date?.slice(0, 4)}
              {series.number_of_seasons > 0 &&
                ` · ${series.number_of_seasons} season${series.number_of_seasons > 1 ? 's' : ''}`}
            </Text>
            <View className="flex-row items-center mt-2 flex-wrap" style={{ gap: 8 }}>
              <View className={`rounded px-2 py-0.5 ${isEnded ? 'bg-surface-elevated' : 'bg-watched-subtle'}`}>
                <Text className={`font-body-medium text-[10px] ${isEnded ? 'text-text-muted' : 'text-watched'}`}>
                  {series.status.toUpperCase()}
                </Text>
              </View>

              {series.next_episode_to_air && (
                <View className="flex-row items-center bg-accent-subtle rounded px-2 py-0.5" style={{ gap: 4 }}>
                  <Calendar size={10} color={colors.accent} />
                  <Text className="font-body-medium text-[10px] text-accent">
                    NEXT: {series.next_episode_to_air.air_date}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {series.homepage && (
          <View className="flex-row items-center mt-4">
            <TouchableOpacity
              onPress={() => Linking.openURL(series.homepage!)}
              activeOpacity={0.7}
              className="border border-border rounded-full px-4 py-2"
            >
              <Text className="font-body-medium text-sm text-text">Website</Text>
            </TouchableOpacity>
          </View>
        )}

        {series.genres.length > 0 && (
          <View className="flex-row flex-wrap mt-3" style={{ gap: 6 }}>
            {series.genres.map(genre => (
              <View key={genre.id} className="bg-accent-subtle rounded-full px-3 py-1">
                <Text className="font-body-medium text-xs text-accent">{genre.name}</Text>
              </View>
            ))}
          </View>
        )}

        {series.overview ? (
          <Text className="font-body text-sm text-text-sub leading-5 mt-3">{series.overview}</Text>
        ) : null}
      </View>
    </View>
  );
}
