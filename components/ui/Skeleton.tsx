import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceElevated,
          opacity: 0.55,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ width = 120 }: { width?: number }) {
  return (
    <View style={{ width }}>
      <Skeleton height={width * 1.5} borderRadius={8} width={width} />
      <Skeleton height={10} borderRadius={4} width={width * 0.8} style={{ marginTop: 8 }} />
      <Skeleton height={8} borderRadius={4} width={width * 0.45} style={{ marginTop: 5 }} />
    </View>
  );
}

export function SkeletonCardRow({ count = 4 }: { count?: number }) {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

export function SkeletonBanner({ height }: { height: number }) {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Skeleton height={14} borderRadius={4} width="40%" style={{ marginBottom: 12 }} />
      <Skeleton height={height} borderRadius={12} />
    </View>
  );
}

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
