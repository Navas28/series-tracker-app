import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Users, Tv2, ExternalLink } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import type { ShowDetails } from '@/services/api/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKDROP_HEIGHT = Math.round(SCREEN_WIDTH * 0.58);

const LANG_NAMES: Record<string, string> = {
  kor: 'Korean', jpn: 'Japanese', cmn: 'Chinese', zho: 'Chinese',
  hin: 'Hindi', ara: 'Arabic', spa: 'Spanish', por: 'Portuguese',
  fra: 'French', deu: 'German', ita: 'Italian', tha: 'Thai',
  tur: 'Turkish', rus: 'Russian', swe: 'Swedish', nld: 'Dutch',
  pol: 'Polish', dan: 'Danish', nor: 'Norwegian', fin: 'Finnish',
};

interface Props {
  series: ShowDetails;
}

function formatPopularity(score: number): string {
  if (score >= 1_000_000_000) return `${(score / 1_000_000_000).toFixed(1)}B`;
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
  if (score >= 1_000) return `${(score / 1_000).toFixed(1)}K`;
  return String(score);
}

export default function SeriesHero({ series }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const isEnded = series.status === 'Ended' || series.status === 'Canceled';
  const network = series.networks[0] ?? null;
  const imdbUrl = series.imdbId ? `https://www.imdb.com/title/${series.imdbId}/` : null;
  const langLabel = series.originalLanguage && series.originalLanguage !== 'eng'
    ? (LANG_NAMES[series.originalLanguage] ?? series.originalLanguage.toUpperCase())
    : null;

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
          </View>

          <View className="flex-1 pt-2">
            {series.clearLogoUrl ? (
              <Image
                source={{ uri: series.clearLogoUrl }}
                style={{ height: 44, width: '100%' }}
                contentFit="contain"
                contentPosition="left"
              />
            ) : (
              <Text className="font-heading text-xl text-text" numberOfLines={2}>
                {series.name}
              </Text>
            )}
            <Text className="font-body text-sm text-text-sub mt-0.5">
              {series.first_air_date?.slice(0, 4)}
              {series.number_of_seasons > 0 &&
                ` · ${series.number_of_seasons} season${series.number_of_seasons > 1 ? 's' : ''}`}
            </Text>

            <View className="flex-row items-center mt-2 flex-wrap" style={{ gap: 6 }}>
              <View className={`rounded px-2 py-0.5 ${isEnded ? 'bg-surface-elevated' : 'bg-watched-subtle'}`}>
                <Text className={`font-body-medium text-[10px] ${isEnded ? 'text-text-muted' : 'text-watched'}`}>
                  {series.status}
                </Text>
              </View>
              {series.contentRating ? (
                <View className="rounded px-2 py-0.5 bg-surface-elevated border border-border">
                  <Text className="font-mono text-[10px] text-text-muted">{series.contentRating}</Text>
                </View>
              ) : null}
              {series.vote_average > 0 ? (
                <View className="flex-row items-center rounded px-2 py-0.5 bg-surface-elevated border border-border" style={{ gap: 4 }}>
                  <Users size={9} color={colors.textMuted} strokeWidth={1.75} />
                  <Text className="font-mono text-[10px] text-text-muted">{formatPopularity(series.vote_average)}</Text>
                </View>
              ) : null}
              {langLabel ? (
                <View className="rounded px-2 py-0.5 bg-surface-elevated border border-border">
                  <Text className="font-mono text-[10px] text-text-muted">{langLabel}</Text>
                </View>
              ) : null}
            </View>

            {network ? (
              <View className="flex-row items-center mt-2" style={{ gap: 5 }}>
                <Tv2 size={11} color={colors.textMuted} strokeWidth={1.5} />
                <Text className="font-body text-xs text-text-muted">{network.name}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {(imdbUrl || series.homepage) && (
          <View className="flex-row items-center mt-4" style={{ gap: 8 }}>
            {imdbUrl ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(imdbUrl)}
                activeOpacity={0.7}
                className="flex-row items-center border border-border rounded-full px-4 py-2"
                style={{ gap: 5 }}
              >
                <ExternalLink size={12} color={colors.textSub} strokeWidth={1.75} />
                <Text className="font-body-medium text-sm text-text">IMDB</Text>
              </TouchableOpacity>
            ) : null}
            {series.homepage ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(series.homepage!)}
                activeOpacity={0.7}
                className="border border-border rounded-full px-4 py-2"
              >
                <Text className="font-body-medium text-sm text-text">Website</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {series.genres.length > 0 && (
          <View className="flex-row flex-wrap mt-3" style={{ gap: 6 }}>
            {series.genres.filter((g, i, arr) => arr.findIndex(x => x.id === g.id) === i).map(genre => (
              <View key={genre.id} className="bg-accent-subtle rounded-full px-3 py-1">
                <Text className="font-body-medium text-xs text-accent">{genre.name}</Text>
              </View>
            ))}
          </View>
        )}

        {series.tagline ? (
          <Text className="font-body text-xs text-text-muted italic mt-3">"{series.tagline}"</Text>
        ) : null}

        {series.overview ? (
          <Text className="font-body text-sm text-text-sub leading-5 mt-2">{series.overview}</Text>
        ) : null}
      </View>
    </View>
  );
}
