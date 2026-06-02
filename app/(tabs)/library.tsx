import { useState, useMemo } from "react";
import { View, Text, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bookmark } from "lucide-react-native";
import { Colors } from "@/constants/theme";
import { useAllTracking } from "@/hooks/useTracking";
import TrackedSeriesCard, { isOngoing } from "@/components/tracking/TrackedSeriesCard";
import CreatePlaylistModal from "@/components/playlists/CreatePlaylistModal";
import { Skeleton } from "@/components/ui/Skeleton";
import type { GqlTrackedSeries } from "@/services/api/types";

const colors = Colors.dark;

type SectionHeader = {
  type: 'header';
  label: string;
  count: number;
  dotClass: string;
};

type CardRow = {
  type: 'row';
  left: GqlTrackedSeries;
  right?: GqlTrackedSeries;
};

type ListItem = SectionHeader | CardRow;

function buildListData(sections: { label: string; dotClass: string; data: GqlTrackedSeries[] }[]): ListItem[] {
  const items: ListItem[] = [];
  for (const section of sections) {
    if (section.data.length === 0) continue;
    items.push({ type: 'header', label: section.label, count: section.data.length, dotClass: section.dotClass });
    for (let i = 0; i < section.data.length; i += 2) {
      items.push({ type: 'row', left: section.data[i], right: section.data[i + 1] });
    }
  }
  return items;
}

function sortByLastWatched(a: GqlTrackedSeries, b: GqlTrackedSeries): number {
  const aTime = a.lastWatchedAt ? new Date(a.lastWatchedAt).getTime() : 0;
  const bTime = b.lastWatchedAt ? new Date(b.lastWatchedAt).getTime() : 0;
  return bTime - aTime;
}

export default function MySeriesScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: allTracking, isLoading: loadingTracking, refetch } = useAllTracking();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const sections = useMemo(() => {
    const list = allTracking ?? [];
    const toFinish = list
      .filter(t => !isOngoing(t.series.status ?? '') && ((t.series.totalEpisodes ?? 0) === 0 || t.watchedEpisodes.length < (t.series.totalEpisodes ?? 0)))
      .sort(sortByLastWatched);
    const ongoing = list
      .filter(t => isOngoing(t.series.status ?? ''))
      .sort(sortByLastWatched);
    const completed = list
      .filter(t => !isOngoing(t.series.status ?? '') && (t.series.totalEpisodes ?? 0) > 0 && t.watchedEpisodes.length >= (t.series.totalEpisodes ?? 0))
      .sort(sortByLastWatched);
    return [
      { label: 'To Finish', dotClass: 'bg-border', data: toFinish },
      { label: 'Ongoing', dotClass: 'bg-watched', data: ongoing },
      { label: 'Completed', dotClass: 'bg-accent', data: completed },
    ];
  }, [allTracking]);

  const listData = useMemo(() => buildListData(sections), [sections]);
  const hasAny = (allTracking?.length ?? 0) > 0;

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return (
        <View className="flex-row items-center px-5 mb-3 mt-2" style={{ gap: 8 }}>
          <View className={`w-1.5 h-1.5 rounded-full ${item.dotClass}`} />
          <Text className="font-body text-xs text-text-muted" style={{ letterSpacing: 1 }}>
            {item.label} · {item.count}
          </Text>
        </View>
      );
    }
    return (
      <View className="flex-row px-5 mb-3" style={{ gap: 12 }}>
        <View style={{ flex: 1 }}>
          <TrackedSeriesCard tracking={item.left} />
        </View>
        {item.right ? (
          <View style={{ flex: 1 }}>
            <TrackedSeriesCard tracking={item.right} />
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-5 pt-3 pb-4">
        <Text className="font-display text-2xl text-text">My Series</Text>
        <Text className="font-body text-sm text-text-sub mt-0.5">Your tracked shows</Text>
      </View>

      {loadingTracking && (
        <View className="px-5 mt-4">
          <View className="flex-row items-center mb-3" style={{ gap: 8 }}>
            <Skeleton width={100} height={14} borderRadius={4} />
          </View>
          <View className="flex-row" style={{ gap: 12 }}>
            {[0, 1].map((i) => (
              <View key={i} style={{ flex: 1 }}>
                <Skeleton width="100%" height={240} borderRadius={12} />
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
          <Text className="font-heading text-xl text-text text-center">Nothing tracked yet</Text>
          <Text className="font-body text-sm text-text-sub text-center mt-2 leading-relaxed">
            Open any series and tap "Track Series" to start logging your progress
          </Text>
        </View>
      )}

      {!loadingTracking && hasAny && (
        <FlashList
          data={listData}
          keyExtractor={(item, index) =>
            item.type === 'header' ? `header-${item.label}` : `row-${index}`
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          getItemType={item => item.type}
        />
      )}

      <CreatePlaylistModal visible={showCreate} onClose={() => setShowCreate(false)} />
    </SafeAreaView>
  );
}
