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
import { X, SlidersHorizontal, ChevronDown, Check } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useSearchSeries, useTVGenres, useDiscoverSeries } from '@/hooks/useSeries';
import SeriesCard from '@/components/series/SeriesCard';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import type { SeriesListItem } from '@/services/tmdb/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 40 - 12) / 2;

/* ─── Complete streaming platforms (TMDB network IDs) ──────────── */
const ALL_PLATFORMS = [
  { id: 213,  name: 'Netflix' },
  { id: 49,   name: 'HBO' },
  { id: 2739, name: 'Disney+' },
  { id: 1024, name: 'Amazon' },
  { id: 2552, name: 'Apple TV+' },
  { id: 2087, name: 'Hulu' },
  { id: 453,  name: 'Peacock' },
  { id: 4330, name: 'Paramount+' },
  { id: 174,  name: 'AMC' },
  { id: 19,   name: 'FOX' },
  { id: 1,    name: 'Fuji TV' },
  { id: 56,   name: 'Cartoon Network' },
  { id: 316,  name: 'Crunchyroll' },
  { id: 2046, name: 'Discovery+' },
  { id: 359,  name: 'Showtime' },
  { id: 6,    name: 'NBC' },
  { id: 2,    name: 'ABC' },
  { id: 67,   name: 'Syfy' },
  { id: 77,   name: 'FX' },
  { id: 16,   name: 'Comedy Central' },
];

/* ─── Quick-pick (most popular) shown as chips under search bar ─ */
const QUICK_PLATFORMS = ALL_PLATFORMS.slice(0, 5);

export default function SearchScreen() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [query, setQuery]                     = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedNetworkId, setSelectedNetworkId] = useState<number | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const { data: genres } = useTVGenres();

  const {
    data: searchData,
    isLoading: searching,
    fetchNextPage: fetchMoreSearch,
    hasNextPage: hasMoreSearch,
    isFetchingNextPage: fetchingMoreSearch,
  } = useSearchSeries(query);

  const {
    data: discoverData,
    isLoading: discovering,
    fetchNextPage: fetchMoreDiscover,
    hasNextPage: hasMoreDiscover,
    isFetchingNextPage: fetchingMoreDiscover,
  } = useDiscoverSeries({
    with_genres:   selectedGenreId  ? String(selectedGenreId)  : undefined,
    with_networks: selectedNetworkId ?? undefined,
    sort_by:       'popularity.desc',
  });

  const isSearching  = query.trim().length > 0;
  const isFiltering  = !isSearching && (selectedGenreId !== null || selectedNetworkId !== null);
  const activeFilter = selectedGenreId !== null || selectedNetworkId !== null;

  let results: SeriesListItem[] = [];
  if (isSearching) {
    results = searchData?.pages.flatMap(p => p.results) ?? [];
  } else if (isFiltering) {
    results = discoverData?.pages.flatMap(p => p.results) ?? [];
  }

  const isLoading = isSearching ? searching : isFiltering ? discovering : false;
  const isFetchingMore = isSearching ? fetchingMoreSearch : fetchingMoreDiscover;

  const loadMore = useCallback(() => {
    if (isSearching && hasMoreSearch && !fetchingMoreSearch) {
      fetchMoreSearch();
    } else if (!isSearching && hasMoreDiscover && !fetchingMoreDiscover) {
      fetchMoreDiscover();
    }
  }, [isSearching, hasMoreSearch, hasMoreDiscover, fetchingMoreSearch, fetchingMoreDiscover, fetchMoreSearch, fetchMoreDiscover]);

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View style={{ paddingVertical: 16, flexDirection: 'row', gap: 12, paddingHorizontal: 20 }}>
        <View style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.5, borderRadius: 8, backgroundColor: colors.surfaceElevated, opacity: 0.6 }} />
        <View style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.5, borderRadius: 8, backgroundColor: colors.surfaceElevated, opacity: 0.6 }} />
      </View>
    );
  };

  /* Filter modal state helpers */
  const clearFilters = () => {
    setSelectedGenreId(null);
    setSelectedNetworkId(null);
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

      {/* ── Quick platform chips (shown only when not searching) ── */}
      {!isSearching && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 350, delay: 100 }}
          className="pb-3"
        >
          <FlashList
            data={QUICK_PLATFORMS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => String(p.id)}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
            renderItem={({ item: platform }) => {
              const active = selectedNetworkId === platform.id;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedNetworkId(active ? null : platform.id)}
                  activeOpacity={0.75}
                  className={`rounded-xl px-3 py-2 border ${
                    active ? 'bg-accent border-accent' : 'bg-surface border-border'
                  }`}
                >
                  <Text
                    className={`font-body-medium text-xs ${
                      active ? 'text-accent-fg' : 'text-text-sub'
                    }`}
                  >
                    {platform.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </MotiView>
      )}

      {/* ── Active filter badge ───────────────────────────────── */}
      {activeFilter && !isSearching && (
        <View className="flex-row items-center px-5 pb-2 gap-2 flex-wrap">
          {selectedNetworkId !== null && (
            <View className="flex-row items-center bg-accent-subtle rounded-full px-3 py-1 border border-accent gap-1">
              <Text className="font-body-medium text-xs text-accent">
                {ALL_PLATFORMS.find(p => p.id === selectedNetworkId)?.name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedNetworkId(null)} hitSlop={6}>
                <X size={12} color={colors.accent} />
              </TouchableOpacity>
            </View>
          )}
          {selectedGenreId !== null && (
            <View className="flex-row items-center bg-accent-subtle rounded-full px-3 py-1 border border-accent gap-1">
              <Text className="font-body-medium text-xs text-accent">
                {genres?.find(g => g.id === selectedGenreId)?.name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedGenreId(null)} hitSlop={6}>
                <X size={12} color={colors.accent} />
              </TouchableOpacity>
            </View>
          )}
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
                Search for a series, pick a platform,{'\n'}or open filters to explore
              </Text>
              <TouchableOpacity
                onPress={() => setFilterModalOpen(true)}
                className="mt-4 flex-row items-center bg-accent rounded-xl px-5 py-3 gap-2"
                activeOpacity={0.8}
              >
                <SlidersHorizontal size={16} color={colors.accentFg} strokeWidth={2} />
                <Text className="font-body-semibold text-sm text-accent-fg">Open Filters</Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </View>
      )}

      {/* ─────────────────────────────────────────────────────── */}
      {/*  Filter Modal                                          */}
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
                  maxHeight: '82%',
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
                    Filters
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    {activeFilter && (
                      <TouchableOpacity onPress={clearFilters}>
                        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 13, color: colors.accent }}>
                          Clear all
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
                  contentContainerStyle={{ paddingBottom: 16 }}
                >
                  {/* ── Platform section ── */}
                  <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                    <Text style={{
                      fontFamily: 'Inter-Regular',
                      fontSize: 11,
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      marginBottom: 12,
                    }}>
                      Platform
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {ALL_PLATFORMS.map(platform => {
                        const active = selectedNetworkId === platform.id;
                        return (
                          <TouchableOpacity
                            key={platform.id}
                            onPress={() => setSelectedNetworkId(active ? null : platform.id)}
                            activeOpacity={0.75}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              paddingHorizontal: 14,
                              paddingVertical: 9,
                              borderRadius: 12,
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
                              {platform.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* ── Genre section ── */}
                  <View style={{ paddingHorizontal: 20 }}>
                    <Text style={{
                      fontFamily: 'Inter-Regular',
                      fontSize: 11,
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      marginBottom: 12,
                    }}>
                      Genre
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {(genres ?? []).map(genre => {
                        const active = selectedGenreId === genre.id;
                        return (
                          <TouchableOpacity
                            key={genre.id}
                            onPress={() => setSelectedGenreId(active ? null : genre.id)}
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

