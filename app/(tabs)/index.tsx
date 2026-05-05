import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useTrendingSeries,
  usePopularSeries,
  useTopRatedSeries,
  useAiringTodaySeries,
  useOnTheAirSeries,
} from '@/hooks/useSeries';
import TrendingBanner from '@/components/series/TrendingBanner';
import SeriesRow from '@/components/series/SeriesRow';

export default function HomeScreen() {
  const { data: trending, isLoading: loadingTrending } = useTrendingSeries('week');
  const { data: popular, isLoading: loadingPopular } = usePopularSeries();
  const { data: topRated, isLoading: loadingTopRated } = useTopRatedSeries();
  const { data: airingToday, isLoading: loadingAiringToday } = useAiringTodaySeries();
  const { data: onTheAir, isLoading: loadingOnTheAir } = useOnTheAirSeries();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-5 pt-3 pb-5">
          <Text className="font-display text-2xl text-text">Series Tracker</Text>
          <Text className="font-body text-sm text-text-sub mt-0.5">
            Discover what to watch next
          </Text>
        </View>

        <TrendingBanner items={trending?.results} isLoading={loadingTrending} />

        <SeriesRow
          title="Popular Right Now"
          items={popular?.pages[0]?.results}
          isLoading={loadingPopular}
        />

        <SeriesRow
          title="Top Rated"
          items={topRated?.pages[0]?.results}
          isLoading={loadingTopRated}
        />

        <SeriesRow
          title="Airing Today"
          items={airingToday?.results}
          isLoading={loadingAiringToday}
        />

        <SeriesRow
          title="On The Air This Week"
          items={onTheAir?.results}
          isLoading={loadingOnTheAir}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
