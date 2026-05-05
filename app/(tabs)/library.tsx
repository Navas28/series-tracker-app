import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Plus, Bookmark } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useAllTracking } from '@/hooks/useTracking';
import { usePlaylists } from '@/hooks/usePlaylists';
import TrackedSeriesCard, { isOngoing } from '@/components/tracking/TrackedSeriesCard';
import PlaylistCard from '@/components/playlists/PlaylistCard';
import CreatePlaylistModal from '@/components/playlists/CreatePlaylistModal';

export default function MySeriesScreen() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showCreate, setShowCreate] = useState(false);

  const { data: allTracking, isLoading: loadingTracking } = useAllTracking();
  const { data: playlists } = usePlaylists();

  const ongoingSeries = allTracking?.filter(t => isOngoing(t.tmdbStatus)) ?? [];
  const endedSeries = allTracking?.filter(t => !isOngoing(t.tmdbStatus)) ?? [];
  const hasAny = (allTracking?.length ?? 0) > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 pt-3 pb-4">
        <Text className="font-display text-2xl text-text">My Series</Text>
        <Text className="font-body text-sm text-text-sub mt-0.5">Your tracked shows</Text>
      </View>

      {loadingTracking && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {!loadingTracking && !hasAny && (
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          className="flex-1 items-center justify-center px-8"
        >
          <View className="w-16 h-16 rounded-2xl bg-surface-elevated items-center justify-center mb-4">
            <Bookmark size={28} color={colors.textMuted} strokeWidth={1.5} />
          </View>
          <Text className="font-heading text-lg text-text text-center">Nothing tracked yet</Text>
          <Text className="font-body text-sm text-text-sub text-center mt-2">
            Open any series and tap "Track Series" to start logging your progress
          </Text>
        </MotiView>
      )}

      {!loadingTracking && hasAny && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {ongoingSeries.length > 0 && (
            <View className="mb-6">
              <Text className="font-body text-xs text-text-muted uppercase px-5 mb-3" style={{ letterSpacing: 1 }}>
                Ongoing · {ongoingSeries.length}
              </Text>
              {ongoingSeries
                .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
                .map(t => (
                  <TrackedSeriesCard key={t.seriesId} tracking={t} />
                ))}
            </View>
          )}

          {endedSeries.length > 0 && (
            <View className="mb-6">
              <Text className="font-body text-xs text-text-muted uppercase px-5 mb-3" style={{ letterSpacing: 1 }}>
                Ended · {endedSeries.length}
              </Text>
              {endedSeries
                .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
                .map(t => (
                  <TrackedSeriesCard key={t.seriesId} tracking={t} />
                ))}
            </View>
          )}

          <View className="mb-4">
            <View className="flex-row items-center justify-between px-5 mb-3">
              <Text className="font-body text-xs text-text-muted uppercase" style={{ letterSpacing: 1 }}>
                Playlists
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                activeOpacity={0.7}
                className="flex-row items-center"
                style={{ gap: 4 }}
              >
                <Plus size={14} color={colors.accent} strokeWidth={2.5} />
                <Text className="font-body-medium text-sm text-accent">New</Text>
              </TouchableOpacity>
            </View>

            {playlists?.map(p => <PlaylistCard key={p.id} playlist={p} />)}

            {(!playlists || playlists.length === 0) && (
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                activeOpacity={0.8}
                className="mx-5 border border-dashed border-border rounded-xl py-4 items-center"
              >
                <Text className="font-body-medium text-sm text-accent">+ Create a playlist</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      <CreatePlaylistModal visible={showCreate} onClose={() => setShowCreate(false)} />
    </SafeAreaView>
  );
}
