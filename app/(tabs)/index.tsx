import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Tv2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-2 pb-4 border-b border-border">
        <Text className="font-display text-2xl text-text">Series Tracker</Text>
        <Text className="font-body text-sm text-text-sub mt-1">Your watchlist</Text>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        className="flex-1 items-center justify-center px-6"
      >
        <View className="w-20 h-20 rounded-2xl bg-surface-elevated items-center justify-center mb-5">
          <Tv2 size={36} color={colors.textMuted} strokeWidth={1.5} />
        </View>
        <Text className="font-heading text-lg text-text text-center">No series yet</Text>
        <Text className="font-body text-sm text-text-sub text-center mt-2 max-w-xs">
          Start tracking your favourite series and never lose your place.
        </Text>
      </MotiView>
    </SafeAreaView>
  );
}
