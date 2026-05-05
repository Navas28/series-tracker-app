import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import SeriesCard from './SeriesCard';
import type { SeriesListItem } from '@/services/tmdb/types';

interface Props {
  title: string;
  items?: SeriesListItem[];
  isLoading?: boolean;
  onSeeAll?: () => void;
}

function CardSkeleton() {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 0.8 }}
      transition={{ loop: true, type: 'timing', duration: 900 }}
      style={{ width: 120 }}
    >
      <View className="rounded-md bg-surface-elevated" style={{ aspectRatio: 2 / 3 }} />
      <View className="h-3 bg-surface-elevated rounded mt-2 w-4/5" />
      <View className="h-2.5 bg-surface-elevated rounded mt-1 w-1/2" />
    </MotiView>
  );
}

export default function SeriesRow({ title, items, isLoading, onSeeAll }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View className="mb-7">
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className="font-heading text-base text-text">{title}</Text>
        {onSeeAll && (
          <TouchableOpacity
            onPress={onSeeAll}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <Text className="font-body-medium text-sm text-accent">See all</Text>
            <ChevronRight size={14} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : items?.map(item => <SeriesCard key={item.id} item={item} />)}
      </ScrollView>
    </View>
  );
}
