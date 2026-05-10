import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useAllTracking } from '@/hooks/useTracking';
import { isOngoing } from '@/components/tracking/TrackedSeriesCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { SeriesTracking } from '@/services/firestore/tracking';

const colors = Colors.dark;

type FilterMode = 'month' | 'custom' | 'all';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function formatMonthYear(date: Date): string {
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

function getFilteredWatchedCount(
  tracking: SeriesTracking,
  from: number,
  to: number,
  allTime: boolean,
): number {
  if (allTime) return Object.keys(tracking.watched).length;
  return Object.values(tracking.watched).filter(
    ts => typeof ts === 'number' && ts >= from && ts <= to,
  ).length;
}

function formatWatchTime(totalMinutes: number): { main: string; raw: string } {
  if (totalMinutes === 0) return { main: '0m', raw: '' };
  const totalHours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const mStr = mins > 0 ? ` ${mins}m` : '';
  const rawHours = `${totalHours}h${mStr}`;
  if (totalHours < 24) return { main: rawHours, raw: '' };
  const days = Math.floor(totalHours / 24);
  const hrs = totalHours % 24;
  const hStr = hrs > 0 ? ` ${hrs}h` : '';
  return { main: `${days}d${hStr}${mStr}`, raw: rawHours };
}

interface MonthPickerModalProps {
  visible: boolean;
  title: string;
  value: Date;
  min?: Date;
  max?: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

function MonthPickerModal({ visible, title, value, min, max, onSelect, onClose }: MonthPickerModalProps) {
  const [viewing, setViewing] = useState(value);

  const canGoPrev = !min || viewing > startOfMonth(min);
  const canGoNext = !max || viewing < startOfMonth(max);

  const prevMonth = () => {
    setViewing(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewing(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const handleSelect = () => {
    onSelect(viewing);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: 'rgba(1,13,35,0.85)' }}
        onPress={onClose}
      >
        <Pressable
          className="bg-surface-elevated rounded-2xl border border-border mx-6 overflow-hidden"
          style={{ width: 300 }}
          onPress={e => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between px-5 pt-5 pb-4">
            <Text className="font-heading text-base text-text">{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between px-4 pb-5">
            <TouchableOpacity
              onPress={prevMonth}
              disabled={!canGoPrev}
              hitSlop={12}
              className="w-10 h-10 items-center justify-center rounded-xl bg-surface"
            >
              <ChevronLeft size={20} color={canGoPrev ? colors.text : colors.textMuted} />
            </TouchableOpacity>

            <Text className="font-heading text-lg text-text">{formatMonthYear(viewing)}</Text>

            <TouchableOpacity
              onPress={nextMonth}
              disabled={!canGoNext}
              hitSlop={12}
              className="w-10 h-10 items-center justify-center rounded-xl bg-surface"
            >
              <ChevronRight size={20} color={canGoNext ? colors.text : colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="mx-4 mb-5 bg-accent rounded-xl py-3 items-center"
            onPress={handleSelect}
            activeOpacity={0.8}
          >
            <Text className="font-body-semibold text-sm text-accent-fg">Select</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <View className="flex-1 bg-surface rounded-xl border border-border p-4" style={{ minWidth: 0 }}>
      <Text className="font-body text-xs text-text-muted mb-2" numberOfLines={1}>{label}</Text>
      <Text
        className={`font-mono-bold text-2xl ${accent ? 'text-accent' : 'text-text'}`}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      {!!sub && <Text className="font-body text-xs text-text-sub mt-0.5">{sub}</Text>}
    </View>
  );
}

export default function StatsScreen() {
  const { data: allTracking, isLoading, refetch } = useAllTracking();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [customFrom, setCustomFrom] = useState<Date>(() => startOfMonth(new Date()));
  const [customTo, setCustomTo] = useState<Date>(() => new Date());
  const [fromPickerOpen, setFromPickerOpen] = useState(false);
  const [toPickerOpen, setToPickerOpen] = useState(false);

  const { from, to, isAllTime } = useMemo(() => {
    if (filterMode === 'all') return { from: 0, to: 0, isAllTime: true };
    if (filterMode === 'month') {
      const now = new Date();
      return { from: startOfMonth(now).getTime(), to: Date.now(), isAllTime: false };
    }
    return {
      from: startOfMonth(customFrom).getTime(),
      to: endOfMonth(customTo).getTime(),
      isAllTime: false,
    };
  }, [filterMode, customFrom, customTo]);

  const collectionStats = useMemo(() => {
    if (!allTracking?.length) return null;
    const total = allTracking.length;
    const ongoing = allTracking.filter(t => isOngoing(t.status)).length;
    const ended = allTracking.filter(t => !isOngoing(t.status)).length;
    const completed = allTracking.filter(
      t => t.totalEpisodes > 0 && Object.keys(t.watched).length >= t.totalEpisodes,
    ).length;
    const completionRates = allTracking
      .filter(t => t.totalEpisodes > 0)
      .map(t => Object.keys(t.watched).length / t.totalEpisodes);
    const avgCompletion = completionRates.length
      ? Math.round((completionRates.reduce((s, r) => s + r, 0) / completionRates.length) * 100)
      : 0;
    return { total, ongoing, ended, completed, avgCompletion };
  }, [allTracking]);

  const activityStats = useMemo(() => {
    if (!allTracking?.length) return { episodesWatched: 0, watchTime: { main: '0m', raw: '' }, runtimeMissing: false };
    const episodesWatched = allTracking.reduce(
      (sum, t) => sum + getFilteredWatchedCount(t, from, to, isAllTime),
      0,
    );
    const seriesWithRuntime = allTracking.filter(t => (t.averageRuntime ?? 0) > 0);
    const runtimeMissing = episodesWatched > 0 && seriesWithRuntime.length === 0;
    const totalMinutes = allTracking.reduce((sum, t) => {
      const count = getFilteredWatchedCount(t, from, to, isAllTime);
      return sum + count * (t.averageRuntime ?? 0);
    }, 0);
    const watchTime = formatWatchTime(Math.round(totalMinutes));
    return { episodesWatched, watchTime, runtimeMissing };
  }, [allTracking, from, to, isAllTime]);

  const handleFromSelect = useCallback((date: Date) => {
    setCustomFrom(date);
    if (date > customTo) setCustomTo(date);
  }, [customTo]);

  const handleToSelect = useCallback((date: Date) => {
    setCustomTo(date);
    if (date < customFrom) setCustomFrom(date);
  }, [customFrom]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center px-5 pt-3 pb-5" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            className="w-9 h-9 rounded-xl bg-surface border border-border items-center justify-center"
          >
            <ChevronLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text className="font-display text-xl text-text">Watch Statistics</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
        >
          <View className="px-5" style={{ gap: 20 }}>

            {/* Collection */}
            <View style={{ gap: 10 }}>
              <Text className="font-body text-xs text-text-muted uppercase ml-1" style={{ letterSpacing: 1 }}>
                Your Collection
              </Text>

              {isLoading ? (
                <View style={{ gap: 10 }}>
                  <View className="flex-row" style={{ gap: 10 }}>
                    <Skeleton width="100%" height={88} borderRadius={12} style={{ flex: 1 }} />
                    <Skeleton width="100%" height={88} borderRadius={12} style={{ flex: 1 }} />
                    <Skeleton width="100%" height={88} borderRadius={12} style={{ flex: 1 }} />
                  </View>
                  <View className="flex-row" style={{ gap: 10 }}>
                    <Skeleton width="100%" height={88} borderRadius={12} style={{ flex: 1 }} />
                    <Skeleton width="100%" height={88} borderRadius={12} style={{ flex: 1 }} />
                  </View>
                </View>
              ) : collectionStats ? (
                <View style={{ gap: 10 }}>
                  <View className="flex-row" style={{ gap: 10 }}>
                    <StatCard label="Total Series" value={String(collectionStats.total)} />
                    <StatCard label="Ongoing" value={String(collectionStats.ongoing)} />
                    <StatCard label="Ended" value={String(collectionStats.ended)} />
                  </View>
                  <View className="flex-row" style={{ gap: 10 }}>
                    <StatCard
                      label="Completed"
                      value={String(collectionStats.completed)}
                      accent
                    />
                    <StatCard
                      label="Avg Completion"
                      value={`${collectionStats.avgCompletion}%`}
                    />
                  </View>
                </View>
              ) : (
                <View className="bg-surface rounded-xl border border-border p-6 items-center">
                  <Text className="font-body text-sm text-text-muted">No series tracked yet</Text>
                </View>
              )}
            </View>

            {/* Activity */}
            <View style={{ gap: 10 }}>
              <Text className="font-body text-xs text-text-muted uppercase ml-1" style={{ letterSpacing: 1 }}>
                Watch Activity
              </Text>

              {/* Filter chips */}
              <View className="flex-row" style={{ gap: 8 }}>
                {(['month', 'custom', 'all'] as FilterMode[]).map(mode => {
                  const label = mode === 'month' ? 'This Month' : mode === 'custom' ? 'Custom' : 'All Time';
                  const active = filterMode === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => setFilterMode(mode)}
                      activeOpacity={0.8}
                      className={`rounded-full px-4 py-2 border ${
                        active ? 'bg-accent border-accent' : 'bg-surface border-border'
                      }`}
                    >
                      <Text className={`font-body-medium text-xs ${active ? 'text-accent-fg' : 'text-text-sub'}`}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom date range pickers */}
              {filterMode === 'custom' && (
                <View className="bg-surface rounded-xl border border-border p-4" style={{ gap: 12 }}>
                  <View className="flex-row items-center" style={{ gap: 10 }}>
                    <Text className="font-body text-sm text-text-sub w-10">From</Text>
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-between bg-surface-elevated rounded-xl border border-border px-4 py-3"
                      onPress={() => setFromPickerOpen(true)}
                      activeOpacity={0.7}
                    >
                      <Text className="font-body-medium text-sm text-text">{formatMonthYear(customFrom)}</Text>
                      <ChevronRight size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center" style={{ gap: 10 }}>
                    <Text className="font-body text-sm text-text-sub w-10">To</Text>
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-between bg-surface-elevated rounded-xl border border-border px-4 py-3"
                      onPress={() => setToPickerOpen(true)}
                      activeOpacity={0.7}
                    >
                      <Text className="font-body-medium text-sm text-text">{formatMonthYear(customTo)}</Text>
                      <ChevronRight size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Activity stat cards */}
              {isLoading ? (
                <View className="flex-row" style={{ gap: 10 }}>
                  <Skeleton width="100%" height={100} borderRadius={12} style={{ flex: 1 }} />
                  <Skeleton width="100%" height={100} borderRadius={12} style={{ flex: 1 }} />
                </View>
              ) : (
                <View className="flex-row" style={{ gap: 10 }}>
                  <StatCard
                    label="Episodes Watched"
                    value={String(activityStats.episodesWatched)}
                  />
                  <View className="flex-1 bg-surface rounded-xl border border-border p-4">
                    <Text className="font-body text-xs text-text-muted mb-2">Watch Time</Text>
                    {activityStats.runtimeMissing ? (
                      <>
                        <Text className="font-mono-bold text-2xl text-text-muted">—</Text>
                        <Text className="font-body text-xs text-text-muted mt-0.5">no runtime data</Text>
                      </>
                    ) : (
                      <>
                        <Text className="font-mono-bold text-2xl text-text" adjustsFontSizeToFit numberOfLines={1}>
                          {activityStats.watchTime.main}
                        </Text>
                        {!!activityStats.watchTime.raw && (
                          <Text className="font-body text-xs text-text-sub mt-0.5">
                            {activityStats.watchTime.raw}
                          </Text>
                        )}
                      </>
                    )}
                  </View>
                </View>
              )}

              {filterMode !== 'all' && !isLoading && (
                <Text className="font-body text-xs text-text-muted text-center">
                  {filterMode === 'month'
                    ? `Episodes marked watched in ${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`
                    : `Episodes marked watched from ${formatMonthYear(customFrom)} to ${formatMonthYear(customTo)}`}
                </Text>
              )}
            </View>

          </View>
        </ScrollView>

        <MonthPickerModal
          visible={fromPickerOpen}
          title="From"
          value={customFrom}
          max={customTo}
          onSelect={handleFromSelect}
          onClose={() => setFromPickerOpen(false)}
        />
        <MonthPickerModal
          visible={toPickerOpen}
          title="To"
          value={customTo}
          min={customFrom}
          max={new Date()}
          onSelect={handleToSelect}
          onClose={() => setToPickerOpen(false)}
        />
      </SafeAreaView>
    </>
  );
}
