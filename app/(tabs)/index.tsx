import { useState } from "react";
import { ScrollView, View, Text, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  useTrendingSeries,
  usePopularSeries,
  useTopRatedSeries,
} from "@/hooks/useSeries";
import TrendingBanner from "@/components/series/TrendingBanner";
import SeriesRow from "@/components/series/SeriesRow";
import { Colors } from "@/constants/theme";

const colors = Colors.dark;

export default function HomeScreen() {
  const { data: trending, isLoading: loadingTrending, refetch: refetchTrending } = useTrendingSeries();
  const { data: popular, isLoading: loadingPopular, refetch: refetchPopular } = usePopularSeries();
  const { data: topRated, isLoading: loadingTopRated, refetch: refetchTopRated } = useTopRatedSeries();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTrending(), refetchPopular(), refetchTopRated()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        <View className="px-5 pt-3 pb-5">
          <Text className="font-display text-2xl text-text">
            BIN<Text className="text-accent">GE</Text>
          </Text>
          <Text className="font-body text-sm text-text-sub mt-0.5">
            Discover what to watch next
          </Text>
        </View>

        <TrendingBanner
          items={trending?.results}
          isLoading={loadingTrending}
        />

        <SeriesRow
          title="Popular Right Now"
          items={popular?.pages[0]?.results.slice(0, 10)}
          isLoading={loadingPopular}
          onSeeAll={() =>
            router.push({
              pathname: "/series/view-all",
              params: { category: "popular" },
            })
          }
        />

        <SeriesRow
          title="Top Rated"
          items={topRated?.pages[0]?.results.slice(0, 10)}
          isLoading={loadingTopRated}
          onSeeAll={() =>
            router.push({
              pathname: "/series/view-all",
              params: { category: "top_rated" },
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
