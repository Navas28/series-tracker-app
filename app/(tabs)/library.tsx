import { useState, useMemo } from "react";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bookmark } from "lucide-react-native";
import { Colors } from "@/constants/theme";
import { useAllTracking } from "@/hooks/useTracking";
import TrackedSeriesCard, {
  isOngoing,
} from "@/components/tracking/TrackedSeriesCard";
import CreatePlaylistModal from "@/components/playlists/CreatePlaylistModal";
import { Skeleton } from "@/components/ui/Skeleton";

const colors = Colors.dark;

export default function MySeriesScreen() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: allTracking, isLoading: loadingTracking } = useAllTracking();

  const ongoingSeries = useMemo(
    () => allTracking?.filter((t) => isOngoing(t.status)) ?? [],
    [allTracking],
  );
  const completedSeries = useMemo(
    () =>
      allTracking?.filter(
        (t) =>
          !isOngoing(t.status) &&
          t.totalEpisodes > 0 &&
          Object.keys(t.watched).length >= t.totalEpisodes,
      ) ?? [],
    [allTracking],
  );
  const toFinishSeries = useMemo(
    () =>
      allTracking?.filter(
        (t) =>
          !isOngoing(t.status) &&
          (t.totalEpisodes === 0 ||
            Object.keys(t.watched).length < t.totalEpisodes),
      ) ?? [],
    [allTracking],
  );
  const hasAny = (allTracking?.length ?? 0) > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-5 pt-3 pb-4">
        <Text className="font-display text-2xl text-text">My Series</Text>
        <Text className="font-body text-sm text-text-sub mt-0.5">
          Your tracked shows
        </Text>
      </View>

      {loadingTracking && (
        <View className="px-5 mt-4">
          <View className="flex-row items-center mb-3" style={{ gap: 8 }}>
            <Skeleton width={100} height={14} borderRadius={4} />
          </View>
          <View className="flex-row" style={{ gap: 16 }}>
            {[0, 1].map((i) => (
              <View key={i} style={{ width: 160 }}>
                <Skeleton width={160} height={240} borderRadius={12} />
                <View className="mt-2 items-center" style={{ gap: 4 }}>
                  <Skeleton width="90%" height={12} borderRadius={4} />
                  <Skeleton width="60%" height={12} borderRadius={4} />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {!loadingTracking && !hasAny && (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-3xl bg-accent-subtle items-center justify-center mb-5">
            <Bookmark size={32} color={colors.accent} strokeWidth={1.5} />
          </View>
          <Text className="font-heading text-xl text-text text-center">
            Nothing tracked yet
          </Text>
          <Text className="font-body text-sm text-text-sub text-center mt-2 leading-relaxed">
            Open any series and tap "Track Series" to start logging your
            progress
          </Text>
        </View>
      )}

      {!loadingTracking && hasAny && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {toFinishSeries.length > 0 && (
            <View className="mb-6">
              <View
                className="flex-row items-center px-5 mb-3"
                style={{ gap: 8 }}
              >
                <View className="w-1.5 h-1.5 rounded-full bg-border" />
                <Text
                  className="font-body text-xs text-text-muted"
                  style={{ letterSpacing: 1 }}
                >
                  To Finish · {toFinishSeries.length}
                </Text>
              </View>
              <View className="flex-row flex-wrap px-5" style={{ gap: 12 }}>
                {toFinishSeries
                  .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
                  .map((t) => (
                    <View key={t.seriesId} style={{ width: '48%' }}>
                      <TrackedSeriesCard tracking={t} />
                    </View>
                  ))}
              </View>
            </View>
          )}

          {ongoingSeries.length > 0 && (
            <View className="mb-6">
              <View
                className="flex-row items-center px-5 mb-3"
                style={{ gap: 8 }}
              >
                <View className="w-1.5 h-1.5 rounded-full bg-watched" />
                <Text
                  className="font-body text-xs text-text-muted"
                  style={{ letterSpacing: 1 }}
                >
                  Ongoing · {ongoingSeries.length}
                </Text>
              </View>
              <View className="flex-row flex-wrap px-5" style={{ gap: 12 }}>
                {ongoingSeries
                  .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
                  .map((t) => (
                    <View key={t.seriesId} style={{ width: '48%' }}>
                      <TrackedSeriesCard tracking={t} />
                    </View>
                  ))}
              </View>
            </View>
          )}

          {completedSeries.length > 0 && (
            <View className="mb-6">
              <View
                className="flex-row items-center px-5 mb-3"
                style={{ gap: 8 }}
              >
                <View className="w-1.5 h-1.5 rounded-full bg-accent" />
                <Text
                  className="font-body text-xs text-text-muted"
                  style={{ letterSpacing: 1 }}
                >
                  Completed · {completedSeries.length}
                </Text>
              </View>
              <View className="flex-row flex-wrap px-5" style={{ gap: 12 }}>
                {completedSeries
                  .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
                  .map((t) => (
                    <View key={t.seriesId} style={{ width: '48%' }}>
                      <TrackedSeriesCard tracking={t} />
                    </View>
                  ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <CreatePlaylistModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </SafeAreaView>
  );
}
