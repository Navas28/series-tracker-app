import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Plus, Bookmark, ListVideo } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useAllTracking } from '@/hooks/useTracking';
import TrackedSeriesCard, { isOngoing } from '@/components/tracking/TrackedSeriesCard';
import CreatePlaylistModal from '@/components/playlists/CreatePlaylistModal';
import { Skeleton } from '@/components/ui/Skeleton';

export default function MySeriesScreen() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [showCreate, setShowCreate] = useState(false);

  const { data: allTracking, isLoading: loadingTracking } = useAllTracking();

  const ongoingSeries = allTracking?.filter(t => isOngoing(t.status)) ?? [];
  const endedSeries   = allTracking?.filter(t => !isOngoing(t.status)) ?? [];
  const hasAny        = (allTracking?.length ?? 0) > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <MotiView
        from={{ opacity: 0, translateY: -14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 420 }}
        className="px-5 pt-3 pb-4"
      >
        <Text className="font-display text-2xl text-text">My Series</Text>
        <Text className="font-body text-sm text-text-sub mt-0.5">Your tracked shows</Text>
      </MotiView>

      {/* ── Loading skeleton ──────────────────────────────────── */}
      {loadingTracking && (
        <View className="px-5" style={{ gap: 12 }}>
          {[0, 1, 2].map(i => (
            <MotiView
              key={i}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300, delay: i * 80 }}
              className="flex-row bg-surface rounded-xl border border-border overflow-hidden"
              style={{ height: 108 }}
            >
              <Skeleton width={72} height={108} borderRadius={0} />
              <View className="flex-1 p-3" style={{ gap: 8 }}>
                <Skeleton width="70%" height={12} />
                <Skeleton width="45%" height={10} />
                <Skeleton width="55%" height={10} />
                <Skeleton width="100%" height={6} borderRadius={3} style={{ marginTop: 8 }} />
              </View>
            </MotiView>
          ))}
        </View>
      )}

      {/* ── Empty state ───────────────────────────────────────── */}
      {!loadingTracking && !hasAny && (
        <MotiView
          from={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 120, delay: 100 }}
          className="flex-1 items-center justify-center px-8"
        >
          <MotiView
            from={{ rotate: '-8deg' }}
            animate={{ rotate: ['8deg', '-8deg', '0deg'] }}
            transition={{ type: 'timing', duration: 600, delay: 300 }}
            className="w-20 h-20 rounded-3xl bg-accent-subtle items-center justify-center mb-5"
          >
            <Bookmark size={32} color={colors.accent} strokeWidth={1.5} />
          </MotiView>
          <Text className="font-heading text-xl text-text text-center">Nothing tracked yet</Text>
          <Text className="font-body text-sm text-text-sub text-center mt-2 leading-relaxed">
            Open any series and tap "Track Series" to start logging your progress
          </Text>
        </MotiView>
      )}

      {/* ── Content ───────────────────────────────────────────── */}
      {!loadingTracking && hasAny && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Ongoing section */}
          {ongoingSeries.length > 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 380, delay: 80 }}
              className="mb-6"
            >
              <View className="flex-row items-center px-5 mb-3" style={{ gap: 8 }}>
                <View className="w-1.5 h-1.5 rounded-full bg-watched" />
                <Text
                  className="font-body text-xs text-text-muted uppercase"
                  style={{ letterSpacing: 1 }}
                >
                  Ongoing · {ongoingSeries.length}
                </Text>
              </View>
              {ongoingSeries
                .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
                .map((t, index) => (
                  <MotiView
                    key={t.seriesId}
                    from={{ opacity: 0, translateX: -12 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 300, delay: index * 60 }}
                  >
                    <TrackedSeriesCard tracking={t} />
                  </MotiView>
                ))}
            </MotiView>
          )}

          {/* Ended section */}
          {endedSeries.length > 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 380, delay: 160 }}
              className="mb-6"
            >
              <View className="flex-row items-center px-5 mb-3" style={{ gap: 8 }}>
                <View className="w-1.5 h-1.5 rounded-full bg-border" />
                <Text
                  className="font-body text-xs text-text-muted uppercase"
                  style={{ letterSpacing: 1 }}
                >
                  Ended · {endedSeries.length}
                </Text>
              </View>
              {endedSeries
                .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
                .map((t, index) => (
                  <MotiView
                    key={t.seriesId}
                    from={{ opacity: 0, translateX: -12 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 300, delay: index * 60 }}
                  >
                    <TrackedSeriesCard tracking={t} />
                  </MotiView>
                ))}
            </MotiView>
          )}
        </ScrollView>
      )}

      <CreatePlaylistModal visible={showCreate} onClose={() => setShowCreate(false)} />
    </SafeAreaView>
  );
}
