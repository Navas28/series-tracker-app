import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SkeletonBanner } from '@/components/ui/Skeleton';
import type { ShowListItem } from '@/services/api/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 0.56);
const AUTO_SCROLL_INTERVAL = 4000;

interface Props {
  items?: ShowListItem[];
  isLoading?: boolean;
}

export default function TrendingBanner({ items, isLoading }: Props) {
  const flatListRef = useRef<FlatList<ShowListItem>>(null);
  const currentIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topItems = items?.slice(0, 20) ?? [];

  const startAutoScroll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (topItems.length === 0) return;
      const next = (currentIndexRef.current + 1) % topItems.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      currentIndexRef.current = next;
      setActiveIndex(next);
    }, AUTO_SCROLL_INTERVAL);
  }, [topItems.length]);

  useEffect(() => {
    if (topItems.length > 0) startAutoScroll();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoScroll]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      currentIndexRef.current = index;
      setActiveIndex(index);
      // Reset timer so it counts from now, not from when it last fired
      startAutoScroll();
    },
    [startAutoScroll],
  );

  if (isLoading) {
    return (
      <View className="mb-7">
        <View className="h-4 bg-surface-elevated rounded w-40 mx-5 mb-3" />
        <SkeletonBanner height={CARD_HEIGHT} />
      </View>
    );
  }

  const renderItem = ({
    item,
    index,
  }: {
    item: ShowListItem;
    index: number;
  }) => {
    const imageUrl = item.backdrop_path ?? item.poster_path;

    // Per-card scale & opacity driven by scrollX for smooth effect during swipe
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.93, 1, 0.93],
      extrapolate: 'clamp',
    });
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        onPress={() => router.push(`/series/${item.id}`)}
        activeOpacity={0.9}
        style={{ width: SCREEN_WIDTH, paddingHorizontal: 20 }}
      >
        <Animated.View
          style={{
            height: CARD_HEIGHT,
            borderRadius: 12,
            overflow: 'hidden',
            transform: [{ scale }],
            opacity,
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ flex: 1, backgroundColor: '#0a1628' }}
              contentFit="contain"
              transition={300}
            />
          ) : (
            <View className="flex-1 bg-surface-elevated" />
          )}

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.90)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: CARD_HEIGHT * 0.68,
            }}
          />

          <View className="absolute bottom-0 left-0 right-0 p-4">
            <View className="flex-row items-center mb-1.5" style={{ gap: 8 }}>
              <View className="bg-accent rounded px-1.5 py-0.5">
                <Text className="font-mono-bold text-2xs text-accent-fg">
                  #{index + 1} Trending
                </Text>
              </View>
              {item.vote_average > 0 && (
                <Text className="font-mono text-xs text-rating">
                  ★ {item.vote_average.toFixed(1)}
                </Text>
              )}
            </View>
            <Text className="font-heading text-lg text-white" numberOfLines={1}>
              {item.name}
            </Text>
            <Text
              className="font-body text-xs text-white/70 mt-0.5"
              numberOfLines={2}
            >
              {item.overview}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="mb-7">
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className="font-heading text-base text-text">
          Trending This Week
        </Text>
        <Text className="font-mono text-xs text-text-muted">
          {activeIndex + 1} / {topItems.length}
        </Text>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={topItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        removeClippedSubviews
        decelerationRate="fast"
        bounces={false}
      />

      <View className="flex-row justify-center mt-3" style={{ gap: 5 }}>
        {topItems.map((_, index) => (
          <View
            key={index}
            style={{
              width: index === activeIndex ? 20 : 6,
              height: 6,
              borderRadius: 9999,
              backgroundColor: index === activeIndex ? '#ed8130' : '#1a2d47',
              opacity: index === activeIndex ? 1 : 0.5,
            }}
          />
        ))}
      </View>
    </View>
  );
}
