import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { router } from "expo-router";
import {
  useTrendingSeries,
  usePopularSeries,
  useTopRatedSeries,
  useAiringTodaySeries,
  useOnTheAirSeries,
} from "@/hooks/useSeries";
import TrendingBanner from "@/components/series/TrendingBanner";
import SeriesRow from "@/components/series/SeriesRow";

export default function HomeScreen() {
  const { data: trending, isLoading: loadingTrending } = useTrendingSeries();
  const { data: popular, isLoading: loadingPopular } = usePopularSeries();
  const { data: topRated, isLoading: loadingTopRated } = useTopRatedSeries();
  const { data: airingToday, isLoading: loadingAiringToday } =
    useAiringTodaySeries();
  const { data: onTheAir, isLoading: loadingOnTheAir } = useOnTheAirSeries();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header — slides in from top */}
        <MotiView
          from={{ opacity: 0, translateY: -16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 420 }}
          className="px-5 pt-3 pb-5"
        >
          <Text className="font-display text-2xl text-text">
            BIN<Text className="text-accent">GE</Text>
          </Text>
          <Text className="font-body text-sm text-text-sub mt-0.5">
            Discover what to watch next
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 80 }}
        >
          <TrendingBanner
            items={trending?.results}
            isLoading={loadingTrending}
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 160 }}
        >
          <SeriesRow
            title="Popular Right Now"
            items={popular?.pages[0]?.results}
            isLoading={loadingPopular}
            onSeeAll={() =>
              router.push({
                pathname: "/series/view-all",
                params: { category: "popular" },
              })
            }
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 230 }}
        >
          <SeriesRow
            title="Top Rated"
            items={topRated?.pages[0]?.results}
            isLoading={loadingTopRated}
            onSeeAll={() =>
              router.push({
                pathname: "/series/view-all",
                params: { category: "top_rated" },
              })
            }
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 300 }}
        >
          <SeriesRow
            title="Airing Today"
            items={airingToday?.results}
            isLoading={loadingAiringToday}
            onSeeAll={() =>
              router.push({
                pathname: "/series/view-all",
                params: { category: "airing_today" },
              })
            }
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 370 }}
        >
          <SeriesRow
            title="On The Air This Week"
            items={onTheAir?.results}
            isLoading={loadingOnTheAir}
            onSeeAll={() =>
              router.push({
                pathname: "/series/view-all",
                params: { category: "on_the_air" },
              })
            }
          />
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
