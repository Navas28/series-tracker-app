import { View } from 'react-native';
import { MotiView } from 'moti';
import type { StyleProp, ViewStyle } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A single shimmer block — the fundamental building block for all skeletons.
 * Uses the brand `surface-elevated` color with a pulsing opacity loop.
 */
export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <MotiView
      from={{ opacity: 0.35 }}
      animate={{ opacity: 0.75 }}
      transition={{ loop: true, type: 'timing', duration: 950, repeatReverse: true }}
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceElevated,
        },
        style,
      ]}
    />
  );
}

/** Two-line text + title skeleton — common card metadata pattern */
export function SkeletonCard({ width = 120 }: { width?: number }) {
  return (
    <View style={{ width }}>
      {/* Poster */}
      <Skeleton height={width * 1.5} borderRadius={8} width={width} />
      {/* Title */}
      <Skeleton height={10} borderRadius={4} width={width * 0.8} style={{ marginTop: 8 }} />
      {/* Year */}
      <Skeleton height={8} borderRadius={4} width={width * 0.45} style={{ marginTop: 5 }} />
    </View>
  );
}

/** A horizontal row of card skeletons (for SeriesRow-style lists) */
export function SkeletonCardRow({ count = 4 }: { count?: number }) {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

/** Full-width banner skeleton (for TrendingBanner) */
export function SkeletonBanner({ height }: { height: number }) {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Skeleton height={14} borderRadius={4} width="40%" style={{ marginBottom: 12 }} />
      <Skeleton height={height} borderRadius={12} />
    </View>
  );
}

/** A 2-column grid of poster skeletons (for search results) */
export function SkeletonGrid({
  count = 6,
  cardWidth,
}: {
  count?: number;
  cardWidth: number;
}) {
  const rows: number[][] = [];
  for (let i = 0; i < count; i += 2) {
    rows.push([i, i + 1]);
  }

  return (
    <View style={{ paddingHorizontal: 20, gap: 16 }}>
      {rows.map((pair, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 12 }}>
          {pair.map(i => i < count && <SkeletonCard key={i} width={cardWidth} />)}
        </View>
      ))}
    </View>
  );
}
