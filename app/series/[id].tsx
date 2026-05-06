import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useSeriesDetails } from '@/hooks/useSeries';
import { useSeriesTracking } from '@/hooks/useTracking';
import SeriesHero from '@/components/series/detail/SeriesHero';
import TrackButton from '@/components/series/detail/TrackButton';
import EpisodeTracker from '@/components/series/detail/EpisodeTracker';
import SeriesCastRow from '@/components/series/detail/SeriesCastRow';
import SeriesWatchProviders from '@/components/series/detail/SeriesWatchProviders';
import CompletionMilestone from '@/components/series/detail/CompletionMilestone';
import SeriesRow from '@/components/series/SeriesRow';
import { useState, useEffect } from 'react';

export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: series, isLoading, isError } = useSeriesDetails(Number(id));
  const { data: tracking } = useSeriesTracking(Number(id));
  const [showMilestone, setShowMilestone] = useState(false);
  const [wasCompleted, setWasCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (tracking && series) {
      const watchedCount = Object.keys(tracking.watched).length;
      const total = series.number_of_episodes;
      const isCurrentlyCompleted = total > 0 && watchedCount >= total;

      if (wasCompleted === false && isCurrentlyCompleted) {
        setShowMilestone(true);
      }
      setWasCompleted(isCurrentlyCompleted);
    }
  }, [tracking, series, wasCompleted]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      {isLoading && (
        <View className="flex-1 bg-background items-center justify-center">
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      )}

      {isError && (
        <View className="flex-1 bg-background items-center justify-center px-8">
          <Text className="font-heading text-lg text-text text-center">
            Couldn't load this series
          </Text>
          <Text className="font-body text-sm text-text-sub text-center mt-2">
            Check your connection and try again
          </Text>
        </View>
      )}

      {series && (
        <ScrollView
          className="flex-1 bg-background"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <SeriesHero series={series} />
          <TrackButton series={series} />
          <SeriesWatchProviders series={series} />
          <EpisodeTracker series={series} />
          <SeriesCastRow cast={series.aggregate_credits?.cast ?? []} />
          {(series.recommendations?.results?.length ?? 0) > 0 && (
            <SeriesRow title="More Like This" items={series.recommendations?.results} />
          )}
        </ScrollView>
      )}

      <CompletionMilestone
        visible={showMilestone}
        onHide={() => setShowMilestone(false)}
        seriesName={series?.name}
        totalEpisodes={series?.number_of_episodes}
        totalSeasons={series?.number_of_seasons}
      />
    </>
  );
}
