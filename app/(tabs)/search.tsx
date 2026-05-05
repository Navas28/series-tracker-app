import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useSearchSeries, useTVGenres, useDiscoverSeries } from '@/hooks/useSeries';
import SeriesCard from '@/components/series/SeriesCard';
import type { SeriesListItem } from '@/services/tmdb/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 40 - 12) / 2;

const POPULAR_PLATFORMS = [
  { id: 213, name: 'Netflix' },
  { id: 49, name: 'HBO' },
  { id: 2739, name: 'Disney+' },
  { id: 1024, name: 'Amazon' },
  { id: 2552, name: 'Apple TV+' },
];

export default function SearchScreen() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [query, setQuery] = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedNetworkId, setSelectedNetworkId] = useState<number | null>(null);

  const { data: genres } = useTVGenres();
  const { data: searchData, isLoading: searching } = useSearchSeries(query);
  const { data: discoverData, isLoading: discovering } = useDiscoverSeries({
    with_genres: selectedGenreId ? String(selectedGenreId) : undefined,
    with_networks: selectedNetworkId ?? undefined,
    sort_by: 'popularity.desc',
  });

  const isSearching = query.trim().length > 0;
  const isFiltering = !isSearching && (selectedGenreId !== null || selectedNetworkId !== null);

  let results: SeriesListItem[] = [];
  if (isSearching) {
    results = searchData?.pages.flatMap(p => p.results) ?? [];
  } else if (isFiltering) {
    results = discoverData?.pages.flatMap(p => p.results) ?? [];
  }

  const isLoading = isSearching ? searching : isFiltering ? discovering : false;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 pt-3 pb-4">
        <Text className="font-display text-2xl text-text mb-4">Discover</Text>

        <View className="flex-row items-center bg-surface border border-border rounded-xl px-3" style={{ height: 44 }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search series..."
            placeholderTextColor={colors.textMuted}
            className="flex-1 font-body text-sm text-text"
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!isSearching && (
        <View className="pb-3">
          <FlatList
            data={POPULAR_PLATFORMS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => String(p.id)}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginBottom: 8 }}
            renderItem={({ item: platform }) => {
              const active = selectedNetworkId === platform.id;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedNetworkId(active ? null : platform.id)}
                  activeOpacity={0.75}
                  className={`rounded-lg px-3 py-1.5 border ${active ? 'bg-watched border-watched' : 'bg-surface border-border'}`}
                >
                  <Text className={`font-body-bold text-[10px] ${active ? 'text-white' : 'text-text-sub'}`}>
                    {platform.name.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
          <FlatList
            data={genres}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={g => String(g.id)}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            renderItem={({ item: genre }) => {
              const active = selectedGenreId === genre.id;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedGenreId(active ? null : genre.id)}
                  activeOpacity={0.75}
                  className={`rounded-full px-4 py-2 border ${active ? 'bg-accent border-accent' : 'bg-surface border-border'}`}
                >
                  <Text className={`font-body-medium text-xs ${active ? 'text-accent-fg' : 'text-text'}`}>
                    {genre.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {!isLoading && results.length > 0 && (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}
          columnWrapperStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <SeriesCard item={item} width={CARD_WIDTH} />}
        />
      )}

      {!isLoading && results.length === 0 && !isSearching && !isFiltering && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-body text-sm text-text-sub text-center">
            Search for a series or pick a genre to explore
          </Text>
        </View>
      )}

      {!isLoading && results.length === 0 && isSearching && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-body-medium text-base text-text">No results for "{query}"</Text>
          <Text className="font-body text-sm text-text-sub text-center mt-1">
            Try a different title or check your spelling
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
