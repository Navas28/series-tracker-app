import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { Home, Search, Bookmark, ListVideo, User } from 'lucide-react-native';
const BAR_H = 64;
const ICON_SIZE = 22;
const PILL_W = 52;
const PILL_H = 40;

const ICONS = [Home, Search, Bookmark, ListVideo, User] as const;

// Per-tab accent hues for the glow — subtly different from main accent
const TAB_GLOWS = [
  'rgba(237,129,48,0.25)',  // Home — brand orange
  'rgba(95,195,200,0.20)',  // Search — teal
  'rgba(95,148,255,0.22)',  // Library — indigo
  'rgba(185,120,255,0.20)', // Playlists — mauve
  'rgba(50,200,140,0.20)',  // Profile — emerald
];

const TAB_ACCENT = [
  '#ed8130',
  '#5fc3c8',
  '#5f94ff',
  '#b978ff',
  '#32c88c',
];

function TabItem({
  icon: Icon,
  isFocused,
  onPress,
  onLongPress,
  accessibilityLabel,
  glow,
  accent,
  colors,
}: {
  icon: (typeof ICONS)[number];
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
  glow: string;
  accent: string;
  colors: typeof Colors.dark;
}) {
  const scale = useSharedValue(1);
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);
  const pillScale = useSharedValue(isFocused ? 1 : 0.7);
  const iconTranslateY = useSharedValue(isFocused ? -2 : 0);

  useEffect(() => {
    pillOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 250 });
    pillScale.value = withSpring(isFocused ? 1 : 0.7, {
      damping: 14,
      stiffness: 200,
    });
    iconTranslateY.value = withSpring(isFocused ? -2 : 0, {
      damping: 12,
      stiffness: 180,
    });
  }, [isFocused]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ scale: pillScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: iconTranslateY.value },
    ],
  }));

  // Dot indicator
  const dotOpacity = useSharedValue(isFocused ? 1 : 0);
  const dotScale = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    dotOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    dotScale.value = withSpring(isFocused ? 1 : 0, {
      damping: 12,
      stiffness: 220,
    });
  }, [isFocused]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scaleX: dotScale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scale.value = withSpring(0.82, { damping: 8, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 250 });
    });
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isFocused }}
      style={styles.tabItem}
    >
      {/* Glow pill background */}
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: glow },
          pillStyle,
        ]}
      />

      {/* Icon */}
      <Animated.View style={iconStyle}>
        <Icon
          size={ICON_SIZE}
          color={isFocused ? accent : colors.textMuted}
          strokeWidth={isFocused ? 2.2 : 1.6}
        />
      </Animated.View>

      {/* Dot indicator */}
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: accent },
          dotStyle,
        ]}
      />
    </Pressable>
  );
}

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const isDark = colorScheme === 'dark';
  const barBg = isDark ? 'rgba(15,26,46,0.92)' : 'rgba(255,255,255,0.92)';
  const borderColor = isDark ? 'rgba(34,41,60,0.8)' : 'rgba(194,206,223,0.8)';

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: barBg,
            borderColor,
            ...Shadow.lg,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const Icon = ICONS[index];
          const glow = TAB_GLOWS[index];
          const accent = isFocused ? TAB_ACCENT[index] : colors.textMuted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              icon={Icon}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? route.name}
              glow={glow}
              accent={accent}
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: BAR_H,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_H,
    gap: 4,
  },
  pill: {
    position: 'absolute',
    width: PILL_W,
    height: PILL_H,
    borderRadius: Radius.xl,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
