import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { X, SlidersHorizontal, Check } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useSearchSeries, useDiscoverSeries } from '@/hooks/useSeries';
import SeriesCard from '@/components/series/SeriesCard';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { TRAKT_GENRES, type ShowListItem } from '@/services/api/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 40 - 12) / 2;

export default function SearchScreen() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [query, setQuery]               = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const { data: searchData, isLoading: searching } = useSearchSeries(query);

  const {
    data: discoverData,
    isLoading: discovering,
    fetchNextPage: fetchMoreDiscover,
    hasNextPage: hasMoreDiscover,
    isFetchingNextPage: fetchingMoreDiscover,
  } = useDiscoverSeries(selectedGenre);

  const isSearching  = query.trim().length > 0;
  const isFiltering  = !isSearching && selectedGenre !== null;
  const activeFilter = selectedGenre !== null;

  let results: ShowListItem[] = [];
  if (isSearching) {
    results = searchData?.results ?? [];
  } else if (isFiltering) {
    results = discoverData?.pages.flatMap(p => p.results) ?? [];
  }

  const isLoading     = isSearching ? searching : isFiltering ? discovering : false;
  const isFetchingMore = isFiltering ? fetchingMoreDiscover : false;

  const loadMore = useCallback(() => {
    if (!isSearching && hasMoreDiscover && !fetchingMoreDiscover) {
      fetchMoreDiscover();
    }
  }, [isSearching, hasMoreDiscover, fetchingMoreDiscover, fetchMoreDiscover]);

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View style={{ paddingVertical: 16, flexDirection: 'row', gap: 12, paddingHorizontal: 20 }}>
        <View style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.5, borderRadius: 8, backgroundColor: colors.surfaceElevated, opacity: 0.6 }} />
        <View style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.5, borderRadius: 8, backgroundColor: colors.surfaceElevated, opacity: 0.6 }} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>

      {/* ── Header ───────────────────────────────────────────── */}
      <MotiView
        from={{ opacity: 0, translateY: -12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 420 }}
        className="px-5 pt-3 pb-3"
      >
        <Text className="font-display text-2xl text-text mb-4">Discover</Text>

        {/* Search bar + filter button */}
        <View className="flex-row items-center gap-2">
          <View
            className="flex-1 flex-row items-center bg-surface border border-border rounded-xl px-3"
            style={{ height: 44 }}
          >
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

          {/* Filter button */}
          <TouchableOpacity
            onPress={() => setFilterModalOpen(true)}
            activeOpacity={0.8}
            className={`rounded-xl items-center justify-center border ${
              activeFilter ? 'bg-accent border-accent' : 'bg-surface border-border'
            }`}
            style={{ width: 44, height: 44 }}
          >
            <SlidersHorizontal size={18} color={activeFilter ? colors.accentFg : colors.textSub} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </MotiView>

      {/* ── Active genre badge ───────────────────────────────── */}
      {activeFilter && !isSearching && (
        <View className="flex-row items-center px-5 pb-2">
          <View className="flex-row items-center bg-accent-subtle rounded-full px-3 py-1 border border-accent gap-1">
            <Text className="font-body-medium text-xs text-accent">
              {TRAKT_GENRES.find(g => g.id === selectedGenre)?.name}
            </Text>
            <TouchableOpacity onPress={() => setSelectedGenre(null)} hitSlop={6}>
              <X size={12} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Results ──────────────────────────────────────────── */}
      {isLoading ? (
        <SkeletonGrid count={6} cardWidth={CARD_WIDTH} />
      ) : results.length > 0 ? (
        <FlashList
          data={results}
          numColumns={2}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 320, delay: Math.min(index % 6, 3) * 60 }}
              style={{ flex: 1, paddingLeft: index % 2 === 1 ? 12 : 0 }}
            >
              <SeriesCard item={item} width={CARD_WIDTH} />
            </MotiView>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          {isSearching ? (
            <>
              <Text className="font-body-medium text-base text-text">No results for "{query}"</Text>
              <Text className="font-body text-sm text-text-sub text-center mt-1">
                Try a different title or check your spelling
              </Text>
            </>
          ) : (
            <MotiView
              from={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 18 }}
              className="items-center"
            >
              <Text className="font-body text-sm text-text-sub text-center">
                Search for a series or open filters{'\n'}to explore by genre
              </Text>
              <TouchableOpacity
                onPress={() => setFilterModalOpen(true)}
                className="mt-4 flex-row items-center bg-accent rounded-xl px-5 py-3 gap-2"
                activeOpacity={0.8}
              >
                <SlidersHorizontal size={16} color={colors.accentFg} strokeWidth={2} />
                <Text className="font-body-semibold text-sm text-accent-fg">Browse by Genre</Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </View>
      )}

      {/* ─────────────────────────────────────────────────────── */}
      {/*  Genre Filter Modal                                     */}
      {/* ─────────────────────────────────────────────────────── */}
      <Modal
        visible={filterModalOpen}
        transparent
        animationType="none"
        onRequestClose={() => setFilterModalOpen(false)}
      >
        <AnimatePresence>
          {filterModalOpen && (
            <>
              {/* Backdrop */}
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'timing', duration: 200 }}
                style={{ ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay }}
              >
                <Pressable style={{ flex: 1 }} onPress={() => setFilterModalOpen(false)} />
              </MotiView>

              {/* Sheet */}
              <MotiView
                from={{ translateY: 600 }}
                animate={{ translateY: 0 }}
                exit={{ translateY: 600 }}
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: colors.surface,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  maxHeight: '75%',
                  paddingBottom: 32,
                }}
              >
                {/* Sheet handle */}
                <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
                  <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
                </View>

                {/* Modal header */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                }}>
                  <Text style={{ fontFamily: 'Sora-SemiBold', fontSize: 18, color: colors.text }}>
                    Browse by Genre
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    {activeFilter && (
                      <TouchableOpacity onPress={() => setSelectedGenre(null)}>
                        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 13, color: colors.accent }}>
                          Clear
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => setFilterModalOpen(false)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.surfaceElevated,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={16} color={colors.textSub} />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
                >
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {TRAKT_GENRES.map(genre => {
                      const active = selectedGenre === genre.id;
                      return (
                        <TouchableOpacity
                          key={genre.id}
                          onPress={() => setSelectedGenre(active ? null : genre.id)}
                          activeOpacity={0.75}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            paddingHorizontal: 14,
                            paddingVertical: 9,
                            borderRadius: 999,
                            borderWidth: 1,
                            backgroundColor: active ? colors.accent : colors.surfaceElevated,
                            borderColor: active ? colors.accent : colors.border,
                          }}
                        >
                          {active && <Check size={12} color={colors.accentFg} strokeWidth={2.5} />}
                          <Text style={{
                            fontFamily: 'Inter-Medium',
                            fontSize: 13,
                            color: active ? colors.accentFg : colors.text,
                          }}>
                            {genre.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Apply button */}
                <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => setFilterModalOpen(false)}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: colors.accent,
                      borderRadius: 14,
                      paddingVertical: 15,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      fontFamily: 'Inter-SemiBold',
                      fontSize: 15,
                      color: colors.accentFg,
                    }}>
                      Show Results {results.length > 0 ? `(${results.length}+)` : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </MotiView>
            </>
          )}
        </AnimatePresence>
      </Modal>
    </SafeAreaView>
  );
}
