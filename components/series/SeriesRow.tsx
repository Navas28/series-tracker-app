import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import SeriesCard from './SeriesCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { ShowListItem } from '@/services/api/types';

interface Props {
  title: string;
  items?: ShowListItem[];
  isLoading?: boolean;
  onSeeAll?: () => void;
}

export default function SeriesRow({ title, items, isLoading, onSeeAll }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

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
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : items?.map((item, index) => (
              <MotiView
                key={item.id}
                from={{ opacity: 0, translateX: 12 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 320, delay: Math.min(index, 5) * 50 }}
              >
                <SeriesCard item={item} />
              </MotiView>
            ))}
      </ScrollView>
    </View>
  );
}
