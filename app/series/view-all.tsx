import { useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import {
  usePopularSeries,
  useTopRatedSeries,
  useAiringTodaySeries,
  useOnTheAirSeries,
} from '@/hooks/useSeries';
import SeriesCard from '@/components/series/SeriesCard';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import type { ShowListItem } from '@/services/api/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMNS = 3;
const GAP = 10;
const H_PAD = 20;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

type Category = 'popular' | 'top_rated' | 'airing_today' | 'on_the_air';

const TITLES: Record<Category, string> = {
  popular:      'Popular Right Now',
  top_rated:    'Top Rated',
  airing_today: 'Airing Today',
  on_the_air:   'On The Air This Week',
};

export default function ViewAllScreen() {
  const { category } = useLocalSearchParams<{ category: Category }>();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const popular    = usePopularSeries();
  const topRated   = useTopRatedSeries();
  const airing     = useAiringTodaySeries();
  const onTheAir   = useOnTheAirSeries();

  let items: ShowListItem[] = [];
  let isLoading = false;
  let fetchNextPage: (() => void) | undefined;
  let hasNextPage = false;
  let isFetchingNextPage = false;

  if (category === 'popular') {
    items           = popular.data?.pages.flatMap(p => p.results) ?? [];
    isLoading       = popular.isLoading;
    fetchNextPage   = popular.fetchNextPage;
    hasNextPage     = !!popular.hasNextPage;
    isFetchingNextPage = popular.isFetchingNextPage;
  } else if (category === 'top_rated') {
    items           = topRated.data?.pages.flatMap(p => p.results) ?? [];
    isLoading       = topRated.isLoading;
    fetchNextPage   = topRated.fetchNextPage;
    hasNextPage     = !!topRated.hasNextPage;
    isFetchingNextPage = topRated.isFetchingNextPage;
  } else if (category === 'airing_today') {
    items           = airing.data?.results ?? [];
    isLoading       = airing.isLoading;
  } else if (category === 'on_the_air') {
    items           = onTheAir.data?.results ?? [];
    isLoading       = onTheAir.isLoading;
  }

  const loadMore = useCallback(() => {
    if (fetchNextPage && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback(({ item, index }: { item: ShowListItem; index: number }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 280, delay: Math.min(index % 12, 6) * 40 }}
      style={{ flex: 1, maxWidth: CARD_WIDTH }}
    >
      <SeriesCard item={item} width={CARD_WIDTH} />
    </MotiView>
  ), []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>

        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 350 }}
          className="flex-row items-center px-5 py-3"
          style={{ gap: 12 }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={22} color={colors.text} strokeWidth={1.75} />
          </TouchableOpacity>
          <Text className="font-heading text-lg text-text flex-1">
            {TITLES[category as Category] ?? 'All Series'}
          </Text>
          <Text className="font-mono text-sm text-text-muted">
            {items.length > 0 ? `${items.length}+` : ''}
          </Text>
        </MotiView>

        {/* Loading skeleton */}
        {isLoading && <SkeletonGrid count={9} cardWidth={CARD_WIDTH} />}

        {/* FlashList grid */}
        {!isLoading && (
          <FlashList
            data={items}
            numColumns={COLUMNS}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: H_PAD, paddingBottom: 32, paddingTop: 4 }}
            ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={{ paddingVertical: 16 }}>
                  <SkeletonGrid count={3} cardWidth={CARD_WIDTH} />
                </View>
              ) : null
            }
            renderItem={renderItem}
          />
        )}
      </SafeAreaView>
    </>
  );
}
